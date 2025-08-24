// Environment configuration for development vs production
// Enhanced security with proper environment validation

// Safe environment detection that won't cause hanging
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

// Security configuration
export const securityConfig = {
  // Content Security Policy
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
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  },
  
  // Rate limiting configuration
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again later.'
  }
};

export const environment = {
  // Check if we're in development mode
  isDevelopment: isDevelopmentMode,

  // Check if we're in production mode
  isProduction: isProductionMode,

  // Home page URL
  homePageUrl: '/',

  // Mock authentication settings for development (SECURED)
  mockAuth: {
    enabled: isDevelopmentMode(),
    defaultUser: {
      email: 'dev@rcormier.dev',
      name: 'Development User',
      picture: undefined,
      sub: 'dev-user-123'
    },
    // Add session timeout for development
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 3,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  },

  // Cloudflare Access settings
  cloudflareAccess: {
    enabled: isProductionMode(),
    loginUrl: '/cdn-cgi/access/login',
    logoutUrl: '/cdn-cgi/access/logout',
    identityUrl: '/cdn-cgi/access/get-identity',
    // Cloudflare Access parameter names as per official documentation
    loginRedirectParam: 'redirect_url', // for /login: restricted to relative paths
    logoutRedirectParam: 'returnTo',    // for /logout: restricted to authdomain, cloudflare.com subdomains, and org apps
    cliRedirectParam: 'redirect_url'    // for /cli: restricted to org apps
  },

  // API configuration with security
  api: {
    baseUrl: isDevelopmentMode() ? 'http://localhost:3001/api' : '/api',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    // Secure endpoints that require authentication
    protectedEndpoints: ['/auth/verify', '/auth/me', '/auth/logout']
  }
};

export default environment;
