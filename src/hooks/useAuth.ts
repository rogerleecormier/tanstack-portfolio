import { useState, useEffect } from 'react';
import { environment } from '../config/environment';
import { CloudflareUser } from '../utils/cloudflareAuth';

// Mock authentication for development
const mockAuth = {
  isAuthenticated: (): boolean => {
    if (!environment.isDevelopment()) return false;
    return localStorage.getItem('dev_auth') === 'true';
  },

  getUser: (): CloudflareUser | null => {
    if (!environment.isDevelopment()) return null;
    const userData = localStorage.getItem('dev_user');
    return userData ? JSON.parse(userData) : null;
  },

  login: (): void => {
    if (!environment.isDevelopment()) return;
    
    const user = environment.mockAuth.defaultUser;
    localStorage.setItem('dev_auth', 'true');
    localStorage.setItem('dev_user', JSON.stringify(user));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dev_auth',
      newValue: 'true'
    }));
  },

  logout: (): void => {
    if (!environment.isDevelopment()) return;
    
    localStorage.removeItem('dev_auth');
    localStorage.removeItem('dev_user');
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'dev_auth',
      newValue: null
    }));
  }
};

// Production Cloudflare Access authentication
const productionAuth = {
  isAuthenticated: (): boolean => {
    if (environment.isDevelopment()) return false;
    
    // Check for Cloudflare Access cookies (multiple possible names)
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
    
    // Also check for URL parameters that indicate successful authentication
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('__cf_access_message') || 
                         urlParams.has('__cf_access_redirect') ||
                         urlParams.has('access_token') ||
                         urlParams.has('user_email') ||
                         urlParams.has('CF_Access_Message') ||
                         urlParams.has('CF_Access_Redirect');
    
    // Check for stored user data
    const hasStoredUser = localStorage.getItem('cf_user') !== null;
    
    // Debug logging
    console.log('=== Production Auth Debug ===');
    console.log('All cookies:', document.cookie);
    console.log('Has auth cookie:', hasAuthCookie);
    console.log('Has auth params:', hasAuthParams);
    console.log('Has stored user:', hasStoredUser);
    console.log('URL params:', urlParams.toString());
    console.log('===========================');
    
    // If we have Cloudflare Access URL parameters, we're likely authenticated
    if (hasAuthParams) {
      return true;
    }
    
    // Only return true if we actually have authentication evidence
    return hasAuthCookie || hasStoredUser;
  },

  getUser: (): CloudflareUser | null => {
    if (environment.isDevelopment()) return null;
    
    try {
      // First check for URL parameters (returning from auth flow)
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const userEmail = urlParams.get('user_email');
      
      if (accessToken && userEmail) {
        const user = {
          email: decodeURIComponent(userEmail),
          name: 'Authenticated User'
        };
        // Store the user info and clean up URL
        localStorage.setItem('cf_user', JSON.stringify(user));
        localStorage.setItem('cf_access_token', accessToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        return user;
      }
      
      // Check for stored user data (but validate it's not the fallback)
      const storedUser = localStorage.getItem('cf_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Don't return fallback users, force re-detection
        if (user.email !== 'authenticated@rcormier.dev') {
          return user;
        }
      }
      
      // Try to get user info from Cloudflare Access identity endpoint
      productionAuth.fetchUserFromIdentityEndpoint();
      
      // Try to get user from Cloudflare Access JWT token
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('CF_Authorization='));
      
      if (authCookie) {
        try {
          const token = authCookie.split('=')[1];
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.email) {
            const user = {
              email: payload.email,
              name: payload.name || payload.given_name || payload.family_name || 'Authenticated User',
              sub: payload.sub
            };
            localStorage.setItem('cf_user', JSON.stringify(user));
            return user;
          }
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }
      
      // Check for various email cookies
      const emailCookiePatterns = [
        'CF_Access_Email=',
        'CF_Access_User=', 
        'CF_Access_Identity=',
        'CF_Authorization_Email='
      ];
      
      for (const pattern of emailCookiePatterns) {
        const emailCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(pattern));
        
        if (emailCookie) {
          const email = emailCookie.split('=')[1];
          if (email && email !== '') {
            const user = {
              email: decodeURIComponent(email),
              name: 'Authenticated User'
            };
            localStorage.setItem('cf_user', JSON.stringify(user));
            return user;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting production user info:', error);
      return null;
    }
  },

  fetchUserFromIdentityEndpoint: async (): Promise<void> => {
    try {
      const response = await fetch('/cdn-cgi/access/get-identity', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const identity = await response.json();
        if (identity.email) {
          const user = {
            email: identity.email,
            name: identity.name || identity.given_name || identity.family_name || 'Authenticated User',
            sub: identity.sub || identity.user_uuid
          };
          localStorage.setItem('cf_user', JSON.stringify(user));
        }
      }
    } catch (error) {
      // Silent fail - this is a fallback method
      console.debug('Could not fetch from identity endpoint:', error);
    }
  },

  login: (): void => {
    if (environment.isDevelopment()) return;
    
    // Normal production mode - redirect to protected route
    console.log('Production login: Redirecting to /protected - Cloudflare Access should intercept');
    console.log('Current cookies:', document.cookie);
    console.log('Current URL:', window.location.href);
    
    // Try to force a fresh request to trigger Cloudflare Access
    window.location.replace('/protected');
  },

  logout: (): void => {
    if (environment.isDevelopment()) return;
    
    // Clear stored user data
    localStorage.removeItem('cf_user');
    localStorage.removeItem('cf_access_token');
    
    // Redirect to Cloudflare Access logout
    window.location.href = environment.cloudflareAccess.logoutUrl;
  },

  clearCachedUser: (): void => {
    localStorage.removeItem('cf_user');
    localStorage.removeItem('cf_access_token');
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<CloudflareUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    try {
      let authenticated = false;
      let userInfo: CloudflareUser | null = null;

      if (environment.isDevelopment()) {
        authenticated = mockAuth.isAuthenticated();
        userInfo = mockAuth.getUser();
      } else {
        authenticated = productionAuth.isAuthenticated();
        userInfo = productionAuth.getUser();
      }

      setIsAuthenticated(authenticated);
      setUser(userInfo);
      setIsLoading(false);
      
      // Debug logging for production
      if (environment.isProduction()) {
        console.log('Auth check result:', { authenticated, userInfo, cookies: document.cookie });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial auth check
    checkAuth();
    
    // InPrivate mode handling removed to prevent unwanted behavior in production
    
    // Set up periodic auth checks for production
    if (environment.isProduction()) {
      const interval = setInterval(checkAuth, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Listen for storage changes (development mode)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dev_auth' && environment.isDevelopment()) {
        checkAuth();
      }
    };

    // Listen for URL changes (production mode - returning from auth flow)
    const handleUrlChange = () => {
      if (environment.isProduction()) {
        // Check for Cloudflare Access parameters that indicate successful authentication
        const urlParams = new URLSearchParams(window.location.search);
        const hasCfAccessParams = urlParams.has('__cf_access_message') || 
                                 urlParams.has('__cf_access_redirect') ||
                                 urlParams.has('CF_Access_Message') ||
                                 urlParams.has('CF_Access_Redirect');
        
        if (hasCfAccessParams) {
          // Immediate authentication check for Cloudflare Access return
          checkAuth();
        } else {
          // Normal delay for other URL changes
          setTimeout(checkAuth, 1000);
        }
      }
    };
    
    // Listen for custom Cloudflare Access authentication update events
    const handleCloudflareAuthUpdate = (event: CustomEvent) => {
      if (environment.isProduction() && event.detail?.hasCfAccessParams) {
        // Immediate authentication check for Cloudflare Access return
        checkAuth();
        
        // Also schedule additional checks to ensure we get user info
        setTimeout(checkAuth, 50);
        setTimeout(checkAuth, 150);
        setTimeout(checkAuth, 300);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('cloudflare-auth-update', handleCloudflareAuthUpdate as EventListener);
    
    // Also check when the page becomes visible (user returns from Cloudflare Access)
    const handleVisibilityChange = () => {
      if (environment.isProduction() && !document.hidden) {
        // Check for Cloudflare Access parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hasCfAccessParams = urlParams.has('__cf_access_message') || 
                                 urlParams.has('__cf_access_redirect') ||
                                 urlParams.has('CF_Access_Message') ||
                                 urlParams.has('CF_Access_Redirect');
        
        if (hasCfAccessParams) {
          // Immediate check for Cloudflare Access return
          checkAuth();
        } else {
          // Normal delay for other visibility changes
          setTimeout(checkAuth, 500);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('cloudflare-auth-update', handleCloudflareAuthUpdate as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      
      if (environment.isDevelopment()) {
        mockAuth.login();
        checkAuth();
      } else {
        productionAuth.login();
      }
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      if (environment.isDevelopment()) {
        mockAuth.logout();
        checkAuth();
      } else {
        productionAuth.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshAuth = () => {
    checkAuth();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    isDevelopment: environment.isDevelopment(),
    isProduction: environment.isProduction()
  };
};
