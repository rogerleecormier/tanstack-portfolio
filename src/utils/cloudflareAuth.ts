// Cloudflare Access Authentication Utility
// This handles authentication through Cloudflare Access with One-Time PIN (OTP)

export interface CloudflareUser {
  email: string;
  name?: string;
  picture?: string;
  sub?: string; // Subject identifier
}

// Debug function to log authentication state
export const debugAuthState = (): void => {
  console.log('=== Cloudflare Auth Debug ===');
  console.log('Development mode:', isDevelopment());
  console.log('Dev auth:', localStorage.getItem('dev_auth'));
  console.log('Dev user:', localStorage.getItem('dev_user'));
  console.log('Cookies:', document.cookie);
  console.log('LocalStorage cf_user:', localStorage.getItem('cf_user'));
  console.log('LocalStorage cf_access_token:', localStorage.getItem('cf_access_token'));
  console.log('URL params:', new URLSearchParams(window.location.search).toString());
  console.log('Is authenticated:', isAuthenticated());
  console.log('User info:', getUserInfo());
  console.log('===========================');
};

// Check if we're in development mode
export const isDevelopment = (): boolean => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost');
};

// Check if user is authenticated via Cloudflare Access
export const isAuthenticated = (): boolean => {
  // Development mode bypass for testing
  if (isDevelopment()) {
    const devAuth = localStorage.getItem('dev_auth');
    if (devAuth === 'true') {
      return true;
    }
  }
  
  // Check for Cloudflare Access authentication cookies (updated for Pages Access)
  const hasAuthCookie = document.cookie.includes('CF_Authorization') || 
                       document.cookie.includes('CF_Access_JWT') ||
                       document.cookie.includes('CF_Access_Email') ||
                       document.cookie.includes('CF_Access_Identity') ||
                       document.cookie.includes('CF_Access_User');
  
  // Check for stored user data
  const hasStoredUser = localStorage.getItem('cf_user') !== null;
  
  // Check for fallback authentication
  const hasFallbackAuth = localStorage.getItem('fallback_auth') === 'true';
  
  // Check for access token in URL (returning from OTP flow)
  const urlParams = new URLSearchParams(window.location.search);
  const hasAccessToken = urlParams.get('access_token') !== null;
  
  // Check for Cloudflare Access identity endpoint response
  const hasAccessIdentity = document.cookie.includes('CF_Access_Identity');
  
  return hasAuthCookie || hasStoredUser || hasAccessToken || hasAccessIdentity || hasFallbackAuth;
};

// Get user information from Cloudflare Access
export const getUserInfo = (): CloudflareUser | null => {
  try {
    // Development mode bypass for testing
    if (isDevelopment()) {
      const devAuth = localStorage.getItem('dev_auth');
      if (devAuth === 'true') {
        const devUser = localStorage.getItem('dev_user');
        if (devUser) {
          return JSON.parse(devUser);
        }
        // Return default dev user if none stored
        return {
          email: 'dev@rcormier.dev',
          name: 'Development User'
        };
      }
    }
    
    // First check for stored user data
    const userData = localStorage.getItem('cf_user');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Check for access token in URL (returning from OTP flow)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const userEmail = urlParams.get('user_email');
    
    if (accessToken && userEmail) {
      const user = {
        email: decodeURIComponent(userEmail),
        name: 'Authenticated User'
      };
      // Store the user info and clean up URL
      setUserInfo(user);
      localStorage.setItem('cf_access_token', accessToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      return user;
    }
    
    // Try to get from Cloudflare Access cookies
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('CF_Authorization='));
    
    if (authCookie) {
      const token = authCookie.split('=')[1];
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          email: payload.email,
          name: payload.name || 'Authenticated User',
          sub: payload.sub
        };
        setUserInfo(user);
        return user;
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
    }
    
    // Check for OTP authentication email cookie
    const emailCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('CF_Access_Email='));
    
    if (emailCookie) {
      const email = emailCookie.split('=')[1];
      const user = {
        email: decodeURIComponent(email),
        name: 'Authenticated User'
      };
      setUserInfo(user);
      return user;
    }
    
    // Check for Cloudflare Access Identity cookie (Pages Access)
    const identityCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('CF_Access_Identity='));
    
    if (identityCookie) {
      try {
        const identity = identityCookie.split('=')[1];
        const user = {
          email: identity,
          name: 'Authenticated User'
        };
        setUserInfo(user);
        return user;
      } catch (error) {
        console.error('Error reading identity cookie:', error);
      }
    }
    
    // Check for fallback authentication
    const fallbackUser = localStorage.getItem('fallback_user');
    if (fallbackUser) {
      try {
        return JSON.parse(fallbackUser);
      } catch (error) {
        console.error('Error parsing fallback user data:', error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Store user information locally
export const setUserInfo = (user: CloudflareUser): void => {
  localStorage.setItem('cf_user', JSON.stringify(user));
};

// Clear user information
export const clearUserInfo = (): void => {
  localStorage.removeItem('cf_user');
  localStorage.removeItem('cf_access_token');
  // Clear development auth data
  localStorage.removeItem('dev_auth');
  localStorage.removeItem('dev_user');
  // Clear fallback authentication data
  localStorage.removeItem('fallback_auth');
  localStorage.removeItem('fallback_user');
  // Clear any other auth-related data
  document.cookie = 'CF_Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'CF_Access_JWT=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'CF_Access_Email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Redirect to Cloudflare Access login (OTP)
export const login = (): void => {
  if (isDevelopment()) {
    // In development, redirect to protected route to trigger OTP flow
    console.log('Development mode: Redirecting to protected route');
    window.location.href = '/protected';
  } else {
    // In production, try Cloudflare Access login first
    console.log('Production mode: Attempting Cloudflare Access login');
    
    // Try to redirect to Cloudflare Access login
    const loginUrl = '/cdn-cgi/access/login?redirect_url=%2Fprotected';
    
    // Check if the endpoint exists before redirecting
    fetch(loginUrl, { 
      method: 'HEAD',
      mode: 'no-cors' // Avoid CORS issues
    }).then(() => {
      // If we get here, the endpoint exists, so redirect
      window.location.href = loginUrl;
    }).catch((error) => {
      console.error('Cloudflare Access login endpoint not available:', error);
      // Fallback: redirect to protected route directly
      // This will either work if Access is configured, or show an error
      window.location.href = '/protected';
    });
  }
};

// Logout (redirect to Cloudflare Access logout)
export const logout = (): void => {
  clearUserInfo();
  if (isDevelopment()) {
    // In development, just redirect to home
    window.location.href = '/';
  } else {
    // In production, use Cloudflare Access logout endpoint
    window.location.href = '/cdn-cgi/access/logout';
  }
};

// Check if user has access to specific resources
export const hasAccess = (): boolean => {
  const user = getUserInfo();
  if (!user) return false;
  
  // Check access for rcormier.dev domain emails
  const allowedEmails = ['roger@rcormier.dev'];
  const allowedDomains = ['rcormier.dev'];
  
  // Check exact email match
  if (allowedEmails.includes(user.email)) {
    return true;
  }
  
  // Check domain match (for additional rcormier.dev emails)
  const userDomain = user.email.split('@')[1];
  if (allowedDomains.includes(userDomain)) {
    return true;
  }
  
  return false;
};

// Initialize authentication state
export const initAuth = (): void => {
  // Check if we're returning from a Cloudflare Access redirect
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const userEmail = urlParams.get('user_email');
  
  if (accessToken && userEmail) {
    // Store the authentication data
    const user = {
      email: decodeURIComponent(userEmail),
      name: 'Authenticated User'
    };
    setUserInfo(user);
    localStorage.setItem('cf_access_token', accessToken);
    
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  // Clean up Cloudflare Access URL parameters
  if (urlParams.has('__cf_access_message') || urlParams.has('__cf_access_redirect')) {
    // Remove Cloudflare Access specific parameters
    urlParams.delete('__cf_access_message');
    urlParams.delete('__cf_access_redirect');
    
    // Create clean URL
    const cleanUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, document.title, cleanUrl);
  }
  
  // Check Cloudflare Access identity if we're on a protected route
  if (isProtectedRoute()) {
    checkCloudflareAccessIdentity();
  }
};

// Check Cloudflare Access identity via API endpoint
export const checkCloudflareAccessIdentity = async (): Promise<void> => {
  try {
    const response = await fetch('/cdn-cgi/access/get-identity');
    if (response.ok) {
      const data = await response.json();
      if (data.email) {
        const user = {
          email: data.email,
          name: data.name || 'Authenticated User'
        };
        setUserInfo(user);
      }
    }
  } catch (error) {
    console.log('Cloudflare Access identity check failed:', error);
  }
};

// Check if we're currently on a protected route
export const isProtectedRoute = (): boolean => {
  const protectedRoutes = ['/protected', '/healthbridge-analysis'];
  return protectedRoutes.some(route => window.location.pathname === route);
};

// Get list of protected routes for navigation
export const getProtectedRoutes = (): string[] => {
  return ['/protected', '/healthbridge-analysis'];
};

// Check if a specific route requires authentication
export const isRouteProtected = (path: string): boolean => {
  const protectedRoutes = getProtectedRoutes();
  return protectedRoutes.includes(path);
};

// Check if Cloudflare Access is available on this domain
export const isCloudflareAccessAvailable = async (): Promise<boolean> => {
  if (isDevelopment()) {
    return false; // Always false in development
  }
  
  try {
    // Try to fetch the Cloudflare Access login endpoint
    await fetch('/cdn-cgi/access/login', { 
      method: 'HEAD',
      mode: 'no-cors' // Avoid CORS issues
    });
    
    // If we get a response (even an error), the endpoint exists
    // We can't check the status code due to CORS, but if we get here, the endpoint exists
    return true;
  } catch (error) {
    console.log('Cloudflare Access not available:', error);
    
    // Try alternative endpoints that might exist
    try {
      await fetch('/cdn-cgi/access/get-identity', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (identityError) {
      console.log('Cloudflare Access identity endpoint also not available:', identityError);
      return false;
    }
  }
};

// Get Cloudflare Access status for the current domain
export const getCloudflareAccessStatus = (): {
  isAvailable: boolean;
  isConfigured: boolean;
  message: string;
} => {
  const hostname = window.location.hostname;
  
  if (isDevelopment()) {
    return {
      isAvailable: false,
      isConfigured: false,
      message: 'Development mode - using mock authentication'
    };
  }
  
  if (hostname === 'rcormier.dev') {
    return {
      isAvailable: false, // Will be checked dynamically
      isConfigured: true,
      message: 'Domain configured for Cloudflare Access but endpoint not responding'
    };
  }
  
  return {
    isAvailable: false,
    isConfigured: false,
    message: 'Domain not configured for Cloudflare Access'
  };
};

// Handle OTP authentication flow
export const handleOTPFlow = (): void => {
  console.log('Starting OTP flow...');
  debugAuthState();
  
  // If user is already authenticated, redirect to protected content
  if (isAuthenticated()) {
    console.log('User already authenticated, redirecting to protected content');
    window.location.href = '/protected';
    return;
  }
  
  // Simple client-side authentication - no Cloudflare Access needed
  console.log('Using client-side authentication');
  const user = {
    email: 'user@rcormier.dev',
    name: 'Authenticated User'
  };
  localStorage.setItem('dev_auth', 'true');
  localStorage.setItem('dev_user', JSON.stringify(user));
  
  // Redirect to protected content
  window.location.href = '/protected';
};
