# Security Guide

Comprehensive guide to the security features and implementation throughout the TanStack Portfolio site, including authentication, access control, and security best practices.

## 🛡️ Overview

The portfolio site implements comprehensive security measures to protect user data, prevent unauthorized access, and ensure secure operation across all environments. Security is built into every layer of the application with defense-in-depth principles.

## 🔐 Authentication System

### Cloudflare Access Integration

The site uses Cloudflare Access for production authentication:

```typescript
// src/utils/cloudflareAuth.ts
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch('/cdn-cgi/access/get-identity', {
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.debug('Cloudflare Access identity check failed:', error);
    return false;
  }
};

export const getUserInfo = async (): Promise<CloudflareUser | null> => {
  try {
    const response = await fetch('/cdn-cgi/access/get-identity', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const identity = await response.json();
      if (identity.email) {
        return {
          email: identity.email,
          name: identity.name || identity.given_name || identity.family_name || 'Authenticated User',
          sub: identity.sub || identity.user_uuid,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};
```

### Development Authentication

Mock authentication system for local development:

```typescript
// src/hooks/useAuth.ts
const simpleAuth = {
  isMockAuthenticated(): boolean {
    try {
      if (!environment.isDevelopment()) return false;
      const isAuth = localStorage.getItem('dev_auth') === 'true';
      const sessionStart = localStorage.getItem('session_start');
      
      if (!isAuth || !sessionStart) return false;
      
      // Check if session is still valid (30 minutes)
      const now = Date.now();
      const elapsed = now - parseInt(sessionStart, 10);
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      
      if (elapsed > sessionTimeout) {
        this.clearMockAuth();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking mock authentication:', error);
      return false;
    }
  },

  startMockSession(): void {
    try {
      if (!environment.isDevelopment()) return;
      
      localStorage.setItem('dev_auth', 'true');
      localStorage.setItem('session_start', Date.now().toString());
      localStorage.setItem('dev_user', JSON.stringify({
        email: 'dev@rcormier.dev',
        name: 'Development User',
        sub: 'dev-user-123'
      }));
      
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: true, user: this.getMockUser() } 
      }));
    } catch (error) {
      console.error('Error starting mock session:', error);
    }
  }
};
```

### Authentication Hooks

Custom React hooks for authentication management:

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CloudflareUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (environment.isDevelopment()) {
        const isAuth = simpleAuth.isMockAuthenticated();
        const mockUser = simpleAuth.getMockUser();
        
        setIsAuthenticated(isAuth);
        setUser(mockUser);
        
        if (isAuth) {
          startSessionTimer();
        }
      } else {
        const { isAuthenticated: cfAuth, user: cfUser } = await simpleAuth.checkCloudflareAuth();
        setIsAuthenticated(cfAuth);
        setUser(cfUser);
      }
    } catch (error) {
      setError('Authentication check failed');
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    try {
      if (environment.isDevelopment()) {
        simpleAuth.startMockSession();
        setIsAuthenticated(true);
        setUser(simpleAuth.getMockUser());
        startSessionTimer();
      } else {
        // Redirect to protected route to trigger Cloudflare Access
        window.location.href = '/protected';
      }
    } catch (error) {
      setError('Login failed');
      console.error('Login error:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (environment.isDevelopment()) {
        simpleAuth.clearMockAuth();
      } else {
        // Redirect to Cloudflare Access logout
        window.location.href = '/cdn-cgi/access/logout';
      }
      
      setIsAuthenticated(false);
      setUser(null);
      stopSessionTimer();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    remainingAttempts,
    isLockedOut,
    sessionTimeRemaining,
    login,
    logout,
    checkAuth
  };
};
```

## 🚪 Protected Routes

### Route Protection Component

Protected routes require authentication:

```typescript
// src/components/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback: FallbackComponent 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isDevelopment, 
    login, 
    error,
    remainingAttempts,
    isLockedOut,
    sessionTimeRemaining
  } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-teal-600">
            {isDevelopment ? 'Verifying development authentication...' : 'Authenticating with Cloudflare Access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-teal-200 bg-teal-50/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200">
              <Shield className="h-8 w-8 text-teal-700" />
            </div>
            <CardTitle className="text-xl text-teal-900">Portfolio Access Required</CardTitle>
            <CardDescription className="text-teal-700">
              {isDevelopment 
                ? 'This content requires development authentication'
                : 'This content requires Cloudflare Access authentication'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isDevelopment && (
              <div className="bg-teal-100 border border-teal-200 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  <span className="font-medium text-teal-800">Security Status</span>
                </div>
                
                {isLockedOut && (
                  <div className="flex items-center space-x-2 mb-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Account Temporarily Locked</span>
                  </div>
                )}
                
                <div className="text-sm text-teal-700 mb-2">
                  <span className="font-medium">Login Attempts Remaining:</span> {remainingAttempts}
                </div>
                
                {sessionTimeRemaining > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-teal-600">
                    <Clock className="h-4 w-4" />
                    <span>Session Timeout: {Math.ceil(sessionTimeRemaining / 60000)} minutes</span>
                  </div>
                )}
              </div>
            )}
            
            <Button onClick={login} className="w-full">
              {isDevelopment ? 'Login (Development)' : 'Login with Cloudflare Access'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
```

### Route Configuration

Protected routes in the router:

```typescript
// src/router.tsx
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected',
  component: () => (
    <ProtectedRoute>
      <ProtectedPage />
    </ProtectedRoute>
  ),
});
```

## 🔒 Security Headers

### Content Security Policy

Comprehensive CSP configuration:

```typescript
// src/config/environment.ts
export const securityConfig = {
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https://health-bridge-api.rcormier.workers.dev"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': true
  },
  
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  },
  
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again later.'
  }
};
```

### Security Headers Implementation

Security headers are applied throughout the application:

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://health-bridge-api.rcormier.workers.dev;
               frame-src 'none';
               object-src 'none';
               base-uri 'self';
               form-action 'self';
               upgrade-insecure-requests">

<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

## 🚫 Rate Limiting

### Request Throttling

Rate limiting for API endpoints and forms:

```typescript
// src/utils/rateLimiter.ts
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }
    
    const userRequests = this.requests.get(identifier)!;
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier)!;
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}
```

### AI Worker Rate Limiting

Rate limiting in Cloudflare AI Workers:

```javascript
// functions/ai-contact-analyzer.js
const RATE_LIMITS = {
  requestsPerMinute: 5,
  requestsPerHour: 20,
  burstLimit: 3
};

// Rate limiting implementation
function checkRateLimit(request) {
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  
  // Check minute limit
  const minuteKey = `minute:${clientIP}:${Math.floor(now / 60000)}`;
  const minuteCount = parseInt(await RATE_LIMITS.get(minuteKey)) || 0;
  
  if (minuteCount >= RATE_LIMITS.requestsPerMinute) {
    return { allowed: false, reason: 'Minute limit exceeded' };
  }
  
  // Check hour limit
  const hourKey = `hour:${clientIP}:${Math.floor(now / 3600000)}`;
  const hourCount = parseInt(await RATE_LIMITS.get(hourKey)) || 0;
  
  if (hourCount >= RATE_LIMITS.requestsPerHour) {
    return { allowed: false, reason: 'Hour limit exceeded' };
  }
  
  // Update counters
  await RATE_LIMITS.put(minuteKey, (minuteCount + 1).toString(), { expirationTtl: 60 });
  await RATE_LIMITS.put(hourKey, (hourCount + 1).toString(), { expirationTtl: 3600 });
  
  return { allowed: true };
}
```

## 🛡️ Input Validation

### Form Validation

Comprehensive form input validation:

```typescript
// src/utils/validation.ts
export const validateContactForm = (data: ContactFormData): ValidationResult => {
  const errors: string[] = [];
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Subject validation
  if (!data.subject || data.subject.trim().length < 5) {
    errors.push('Subject must be at least 5 characters long');
  }
  
  if (data.subject && data.subject.length > 200) {
    errors.push('Subject must be less than 200 characters');
  }
  
  // Message validation
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }
  
  if (data.message && data.message.length > 5000) {
    errors.push('Message must be less than 5000 characters');
  }
  
  // Consent validation
  if (!data.consent) {
    errors.push('You must consent to data processing');
  }
  
  // Honeypot validation
  if (data.honeypot && data.honeypot.trim() !== '') {
    errors.push('Invalid form submission');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### XSS Prevention

XSS protection through content sanitization:

```typescript
// src/utils/sanitization.ts
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/&/g, '&amp;');
};

export const sanitizeHtml = (html: string): string => {
  // Use DOMPurify or similar library for HTML sanitization
  // This is a simplified example
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};
```

## 🔍 Security Monitoring

### Security Logging

Comprehensive security event logging:

```typescript
// src/utils/logger.ts
export class SecurityLogger {
  private static instance: SecurityLogger;
  
  private constructor() {}
  
  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }
  
  logSecurityEvent(event: SecurityEvent): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event.type,
      details: event.details,
      userAgent: navigator.userAgent,
      ip: 'client-ip', // Would be set by server
      userId: event.userId || 'anonymous'
    };
    
    if (environment.isDevelopment()) {
      console.log('🔒 Security Event:', logEntry);
    }
    
    if (environment.isProduction()) {
      // Send to security monitoring service
      this.sendToSecurityService(logEntry);
    }
  }
  
  logAuthenticationAttempt(userId: string, success: boolean, details?: string): void {
    this.logSecurityEvent({
      type: 'authentication_attempt',
      details: {
        userId,
        success,
        details,
        timestamp: Date.now()
      }
    });
  }
  
  logAccessAttempt(resource: string, userId: string, success: boolean): void {
    this.logSecurityEvent({
      type: 'access_attempt',
      details: {
        resource,
        userId,
        success,
        timestamp: Date.now()
      }
    });
  }
  
  logSecurityViolation(violation: string, details: any): void {
    this.logSecurityEvent({
      type: 'security_violation',
      details: {
        violation,
        details,
        timestamp: Date.now()
      }
    });
  }
  
  private sendToSecurityService(logEntry: any): void {
    // Implementation for sending to external security service
    fetch('/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(error => {
      console.error('Failed to send security log:', error);
    });
  }
}
```

### Security Event Types

```typescript
// src/types/security.ts
export interface SecurityEvent {
  type: 'authentication_attempt' | 'access_attempt' | 'security_violation' | 'rate_limit_exceeded';
  details: {
    userId?: string;
    success?: boolean;
    resource?: string;
    violation?: string;
    details?: any;
    timestamp: number;
  };
}

export interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  authenticationFailures: number;
  rateLimitViolations: number;
  securityViolations: number;
  lastUpdated: Date;
}
```

## 🚨 Security Alerts

### Security Alert System

Automated security alerting:

```typescript
// src/utils/securityAlerts.ts
export class SecurityAlertSystem {
  private static instance: SecurityAlertSystem;
  private alertThresholds: Map<string, number> = new Map();
  private alertCounts: Map<string, number> = new Map();
  
  static getInstance(): SecurityAlertSystem {
    if (!SecurityAlertSystem.instance) {
      SecurityAlertSystem.instance = new SecurityAlertSystem();
    }
    return SecurityAlertSystem.instance;
  }
  
  checkAlert(alertType: string, threshold: number = 5): boolean {
    const currentCount = this.alertCounts.get(alertType) || 0;
    const newCount = currentCount + 1;
    
    this.alertCounts.set(alertType, newCount);
    
    if (newCount >= threshold) {
      this.triggerAlert(alertType, newCount);
      this.alertCounts.set(alertType, 0); // Reset counter
      return true;
    }
    
    return false;
  }
  
  private triggerAlert(alertType: string, count: number): void {
    const alert = {
      type: alertType,
      count,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(alertType),
      message: this.getAlertMessage(alertType, count)
    };
    
    if (environment.isDevelopment()) {
      console.warn('🚨 Security Alert:', alert);
    }
    
    if (environment.isProduction()) {
      this.sendSecurityAlert(alert);
    }
  }
  
  private getAlertSeverity(alertType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'authentication_failure': 'medium',
      'rate_limit_exceeded': 'low',
      'security_violation': 'high',
      'suspicious_activity': 'high',
      'data_breach_attempt': 'critical'
    };
    
    return severityMap[alertType] || 'medium';
  }
  
  private getAlertMessage(alertType: string, count: number): string {
    const messages: Record<string, string> = {
      'authentication_failure': `${count} authentication failures detected`,
      'rate_limit_exceeded': `Rate limit exceeded ${count} times`,
      'security_violation': `${count} security violations detected`,
      'suspicious_activity': `Suspicious activity detected ${count} times`,
      'data_breach_attempt': `${count} data breach attempts detected`
    };
    
    return messages[alertType] || `Security alert: ${alertType}`;
  }
  
  private sendSecurityAlert(alert: any): void {
    // Implementation for sending security alerts
    // Could include email, Slack, or other notification methods
    fetch('/api/security/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    }).catch(error => {
      console.error('Failed to send security alert:', error);
    });
  }
}
```

## 🔐 Environment Security

### Environment Configuration

Secure environment configuration:

```typescript
// src/config/environment.ts
const isDevelopmentMode = (): boolean => {
  // Only trust Vite's built-in environment variables
  if (import.meta.env.DEV) {
    return true;
  }
  
  // In production, never return true for development mode
  return false;
};

const isProductionMode = (): boolean => {
  return import.meta.env.PROD && !isDevelopmentMode();
};

export const environment = {
  isDevelopment: isDevelopmentMode,
  isProduction: isProductionMode,
  
  // Mock authentication settings for development (SECURED)
  mockAuth: {
    enabled: isDevelopmentMode(),
    defaultUser: {
      email: 'dev@rcormier.dev',
      name: 'Development User',
      picture: undefined,
      sub: 'dev-user-123'
    },
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 3,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  },
  
  // Cloudflare Access settings
  cloudflareAccess: {
    enabled: isProductionMode(),
    loginUrl: '/cdn-cgi/access/login',
    logoutUrl: '/cdn-cgi/access/logout',
    identityUrl: '/cdn-cgi/access/get-identity'
  }
};
```

### Secure Development Practices

Development security safeguards:

```typescript
// src/utils/developmentSecurity.ts
export const validateDevelopmentEnvironment = (): boolean => {
  // Ensure we're actually in development
  if (!environment.isDevelopment()) {
    return false;
  }
  
  // Check for development-specific security measures
  const devChecks = [
    () => window.location.hostname === 'localhost',
    () => window.location.hostname === '127.0.0.1',
    () => import.meta.env.DEV === true,
    () => !import.meta.env.PROD
  ];
  
  return devChecks.every(check => check());
};

export const secureDevelopmentMode = (): void => {
  if (!validateDevelopmentEnvironment()) {
    throw new Error('Invalid development environment');
  }
  
  // Set development security headers
  document.head.innerHTML += `
    <meta name="development-mode" content="true">
    <meta name="security-level" content="development">
  `;
  
  // Log development security status
  console.log('🔒 Development mode security enabled');
};
```

## 🚀 Security Best Practices

### Implementation Guidelines

1. **Input Validation**: Always validate and sanitize user input
2. **Authentication**: Use secure authentication methods
3. **Authorization**: Implement proper access control
4. **Data Protection**: Encrypt sensitive data
5. **Logging**: Log all security events
6. **Monitoring**: Monitor for security violations
7. **Updates**: Keep dependencies updated
8. **Testing**: Regular security testing

### Security Checklist

- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection configured
- [ ] Rate limiting implemented
- [ ] Security headers set
- [ ] Authentication secured
- [ ] Authorization configured
- [ ] Logging enabled
- [ ] Monitoring active
- [ ] Dependencies updated

## 📚 Security Resources

### Security Documentation
- [OWASP Security Guidelines](https://owasp.org/)
- [Cloudflare Security](https://developers.cloudflare.com/security/)
- [Web Security Fundamentals](https://web.dev/security/)

### Security Tools
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Checklist](https://securitychecklist.org/)

### Best Practices
- [Security Best Practices](https://owasp.org/www-project-cheat-sheets/)
- [Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)

---

**This security guide provides comprehensive documentation of all security features, ensuring the portfolio site operates securely across all environments and protects user data effectively.**
