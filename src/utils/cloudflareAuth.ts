// Cloudflare Access Authentication Utility
// This handles authentication through Cloudflare Access with One-Time PIN (OTP)

import { isEmailAllowed } from '../config/accessControl';

export interface CloudflareUser {
  email: string;
  name?: string;
  picture?: string;
  sub?: string; // Subject identifier
}

// InPrivate mode functions removed to prevent unwanted behavior in production

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
  
  // Check for Cloudflare Access authentication cookies (updated for Pages Access + IDP)
  const hasAuthCookie = document.cookie.includes('CF_Authorization') || 
                       document.cookie.includes('CF_Access_JWT') ||
                       document.cookie.includes('CF_Access_Email') ||
                       document.cookie.includes('CF_Access_Identity') ||
                       document.cookie.includes('CF_Access_User') ||
                       // Google Auth (IDP) specific cookies
                       document.cookie.includes('CF_Access_User_Email') ||
                       document.cookie.includes('CF_Access_User_Name') ||
                       document.cookie.includes('CF_Access_User_UUID') ||
                       // Additional IDP cookie patterns
                       document.cookie.includes('CF_Access_User_') ||
                       document.cookie.includes('CF_Access_Identity_') ||
                       // Check for any cookie that starts with CF_Access (catch-all for IDP)
                       document.cookie.includes('CF_Access_');
  
  // Check for stored user data
  const hasStoredUser = localStorage.getItem('cf_user') !== null;
  
  // Check for access token in URL (returning from OTP flow)
  const urlParams = new URLSearchParams(window.location.search);
  const hasAccessToken = urlParams.get('access_token') !== null;
  
  // Check for Cloudflare Access identity endpoint response
  const hasAccessIdentity = document.cookie.includes('CF_Access_Identity');
  
  // Check for Cloudflare Access URL parameters that indicate successful auth
  const hasCfAccessParams = urlParams.has('__cf_access_message') || 
                           urlParams.has('__cf_access_redirect') ||
                           urlParams.has('CF_Access_Message') ||
                           urlParams.has('CF_Access_Redirect');
  
  // Debug logging for production
  if (!isDevelopment()) {
    console.log('=== Cloudflare Auth Debug ===');
    console.log('All cookies:', document.cookie);
    console.log('Has auth cookie:', hasAuthCookie);
    console.log('Has stored user:', hasStoredUser);
    console.log('Has access token:', hasAccessToken);
    console.log('Has access identity:', hasAccessIdentity);
    console.log('Has CF Access params:', hasCfAccessParams);
    console.log('URL params:', urlParams.toString());
    console.log('===========================');
  }
  
  // If we have Cloudflare Access parameters OR cookies, we're authenticated
  // This is the key change - trust Cloudflare Access completely
  if (hasCfAccessParams || hasAuthCookie) {
    return true;
  }
  
  return hasStoredUser || hasAccessToken || hasAccessIdentity;
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
    
    // Check for Cloudflare Access URL parameters that indicate successful auth
    const hasCfAccessParams = urlParams.has('__cf_access_message') || 
                             urlParams.has('__cf_access_redirect') ||
                             urlParams.has('CF_Access_Message') ||
                             urlParams.has('CF_Access_Redirect');
    
    // If we have Cloudflare Access parameters, we're definitely authenticated
    // Return user info immediately without waiting for cookies
    if (hasCfAccessParams) {
      // Try to get user info from cookies immediately
      const cookiePatterns = [
        'CF_Authorization=',
        'CF_Access_User_Email=',
        'CF_Access_Email=',
        'CF_Access_Identity=',
        'CF_Access_User='
      ];
      
      for (const pattern of cookiePatterns) {
        const cookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(pattern));
        
        if (cookie) {
          const value = cookie.split('=')[1];
          
          // Handle JWT token (CF_Authorization)
          if (pattern === 'CF_Authorization=') {
            try {
              const payload = JSON.parse(atob(value.split('.')[1]));
              if (payload.email) {
                const user = {
                  email: payload.email,
                  name: payload.name || payload.given_name || payload.family_name || 'Authenticated User',
                  sub: payload.sub
                };
                setUserInfo(user);
                return user;
              }
            } catch (error) {
              console.error('Error decoding JWT token:', error);
            }
          }
          
          // Handle email cookies directly
          if (pattern === 'CF_Access_User_Email=' || pattern === 'CF_Access_Email=') {
            if (value && value !== '') {
              const user = {
                email: decodeURIComponent(value),
                name: 'Authenticated User'
              };
              setUserInfo(user);
              return user;
            }
          }
          
          // Handle identity cookies
          if (pattern === 'CF_Access_Identity=') {
            if (value && value !== '') {
              const user = {
                email: decodeURIComponent(value),
                name: 'Authenticated User'
              };
              setUserInfo(user);
              return user;
            }
          }
        }
      }
      
      // If no cookies found yet but we have Cloudflare Access params,
      // return an authenticated user immediately and fetch real info in background
      if (!isDevelopment()) {
        // Trigger background fetch of user info
        setTimeout(() => {
          checkCloudflareAccessIdentity();
        }, 50);
      }
      
      // Return an authenticated user immediately to prevent "Access Required" state
      // This is the key change - we trust Cloudflare Access completely
      return {
        email: 'authenticated@cloudflare.access',
        name: 'Authenticated User'
      };
    }
    
    // Try to get from Cloudflare Access cookies - check multiple patterns
    const cookiePatterns = [
      'CF_Authorization=',
      'CF_Access_User_Email=',
      'CF_Access_Email=',
      'CF_Access_Identity=',
      'CF_Access_User='
    ];
    
    for (const pattern of cookiePatterns) {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(pattern));
      
      if (cookie) {
        const value = cookie.split('=')[1];
        
        // Handle JWT token (CF_Authorization)
        if (pattern === 'CF_Authorization=') {
          try {
            const payload = JSON.parse(atob(value.split('.')[1]));
            if (payload.email) {
              const user = {
                email: payload.email,
                name: payload.name || payload.given_name || payload.family_name || 'Authenticated User',
                sub: payload.sub
              };
              setUserInfo(user);
              return user;
            }
          } catch (error) {
            console.error('Error decoding JWT token:', error);
          }
        }
        
        // Handle email cookies directly
        if (pattern === 'CF_Access_User_Email=' || pattern === 'CF_Access_Email=') {
          if (value && value !== '') {
            const user = {
              email: decodeURIComponent(value),
              name: 'Authenticated User'
            };
            setUserInfo(user);
            return user;
          }
        }
        
        // Handle identity cookies
        if (pattern === 'CF_Access_Identity=') {
          if (value && value !== '') {
            const user = {
              email: decodeURIComponent(value),
              name: 'Authenticated User'
            };
            setUserInfo(user);
            return user;
          }
        }
      }
    }
    
    // Try to get user info from Cloudflare Access identity endpoint
    if (!isDevelopment()) {
      checkCloudflareAccessIdentity();
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
  // Clear any other auth-related data
  document.cookie = 'CF_Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'CF_Access_JWT=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'CF_Access_Email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Redirect to Cloudflare Access login (OTP)
export const login = (): void => {
  if (isDevelopment()) {
    // In development, redirect to protected route to trigger simulated authentication
    console.log('Development mode: Redirecting to protected route for simulated authentication');
    window.location.href = '/protected';
  } else {
    // Normal production mode - redirect to protected route
    console.log('Production mode: Redirecting to protected route - Cloudflare Access will intercept');
    window.location.href = '/protected';
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
  
  // Use the centralized access control configuration
  return isEmailAllowed(user.email);
};

// Initialize authentication state
export const initAuth = (): void => {
  // Check if we're returning from a Cloudflare Access redirect
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const userEmail = urlParams.get('user_email');
  
  // Check for Cloudflare Access specific parameters that indicate successful authentication
  const hasCfAccessParams = urlParams.has('__cf_access_message') || 
                           urlParams.has('__cf_access_redirect') ||
                           urlParams.has('CF_Access_Message') ||
                           urlParams.has('CF_Access_Redirect');
  
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
  
  // If we have Cloudflare Access parameters, clean up URL and trigger auth update
  if (hasCfAccessParams) {
    // Clean up URL parameters immediately
    const currentUrlParams = new URLSearchParams(window.location.search);
    if (currentUrlParams.has('__cf_access_message') || currentUrlParams.has('__cf_access_redirect')) {
      currentUrlParams.delete('__cf_access_message');
      currentUrlParams.delete('__cf_access_redirect');
      
      // Create clean URL
      const cleanUrl = window.location.pathname + (currentUrlParams.toString() ? '?' + currentUrlParams.toString() : '');
      window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Immediately try to get user info from cookies
    checkCloudflareAccessIdentity();
    
    // Dispatch event to trigger authentication update IMMEDIATELY
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('cloudflare-auth-update', {
        detail: { source: 'initAuth', hasCfAccessParams: true }
      }));
    }
    
    // Also trigger multiple authentication checks to ensure we get user info
    setTimeout(() => {
      checkCloudflareAccessIdentity();
    }, 10);
    
    setTimeout(() => {
      checkCloudflareAccessIdentity();
    }, 100);
    
    setTimeout(() => {
      checkCloudflareAccessIdentity();
    }, 500);
    
    return;
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
