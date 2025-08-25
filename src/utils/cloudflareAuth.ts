// Cloudflare Access Authentication Utility
// Simplified version that trusts Cloudflare Access completely

import { isEmailAllowed } from '../config/accessControl';

export interface CloudflareUser {
  email: string;
  name?: string;
  picture?: string;
  sub?: string; // Subject identifier
}

// Check if we're in development mode
export const isDevelopment = (): boolean => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost');
};

// Check if user is authenticated via Cloudflare Access
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

// Get user information from Cloudflare Access
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

// Store user information locally
export const setUserInfo = (user: CloudflareUser): void => {
  localStorage.setItem('cf_user', JSON.stringify(user));
};

// Clear user information
export const clearUserInfo = (): void => {
  localStorage.removeItem('cf_user');
  localStorage.removeItem('cf_access_token');
  localStorage.removeItem('dev_auth');
  localStorage.removeItem('dev_user');
};

// Redirect to Cloudflare Access login
export const login = (): void => {
  if (isDevelopment()) {
    // In development, redirect to protected route to trigger simulated authentication
    window.location.href = '/protected';
  } else {
    // In production, redirect to protected route to trigger Cloudflare Access
    // Cloudflare will automatically intercept this and redirect to authentication
    
    // Check if we're on a mobile browser
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isEdge = /Edge/i.test(navigator.userAgent);
    
    console.log('Login redirect:', {
      isMobile,
      isEdge,
      userAgent: navigator.userAgent,
      currentUrl: window.location.href
    });
    
    // For mobile Edge, we might need to handle the redirect differently
    if (isMobile && isEdge) {
      console.log('Mobile Edge detected - using alternative redirect method');
      
      // Try multiple redirect methods for mobile Edge
      try {
        // Method 1: Try window.location.replace first
        window.location.replace('/protected');
        
        // Method 2: Fallback to window.location.href after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/protected') {
            console.log('Fallback redirect for mobile Edge');
            window.location.href = '/protected';
          }
        }, 100);
        
        // Method 3: Final fallback with a different approach
        setTimeout(() => {
          if (window.location.pathname !== '/protected') {
            console.log('Final fallback for mobile Edge - using location.assign');
            window.location.assign('/protected');
          }
        }, 500);
      } catch (error) {
        console.error('Mobile Edge redirect failed:', error);
        // Fallback to protected route
        window.location.href = '/protected';
      }
    } else {
      // Standard redirect for other browsers
      window.location.href = '/protected';
    }
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
export const hasAccess = async (): Promise<boolean> => {
  const user = await getUserInfo();
  if (!user) return false;
  
  // Use the centralized access control configuration
  return isEmailAllowed(user.email);
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
