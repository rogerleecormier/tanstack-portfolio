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
                         document.cookie.includes('CF_Access_Email') ||
                         document.cookie.includes('CF_Access_User_Email');
    
    // Also check for URL parameters that indicate successful authentication
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('__cf_access_message') || 
                         urlParams.has('__cf_access_redirect') ||
                         urlParams.has('access_token') ||
                         urlParams.has('user_email');
    
    // Check if we're on a protected route and have auth indicators
    const isOnProtectedRoute = window.location.pathname === '/protected' || 
                              window.location.pathname === '/healthbridge-analysis';
    
    return hasAuthCookie || hasAuthParams || isOnProtectedRoute;
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
      
      // Check for stored user data
      const storedUser = localStorage.getItem('cf_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      // Try to get user from Cloudflare Access cookies
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('CF_Authorization='));
      
      if (authCookie) {
        try {
          const token = authCookie.split('=')[1];
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user = {
            email: payload.email,
            name: payload.name || 'Authenticated User',
            sub: payload.sub
          };
          localStorage.setItem('cf_user', JSON.stringify(user));
          return user;
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }
      
      // Check for email cookie
      const emailCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('CF_Access_Email='));
      
      if (emailCookie) {
        const email = emailCookie.split('=')[1];
        const user = {
          email: decodeURIComponent(email),
          name: 'Authenticated User'
        };
        localStorage.setItem('cf_user', JSON.stringify(user));
        return user;
      }
      
      // If we're on a protected route and have any auth indicators, create a default user
      if (window.location.pathname === '/protected' || window.location.pathname === '/healthbridge-analysis') {
        const user = {
          email: 'authenticated@rcormier.dev',
          name: 'Authenticated User'
        };
        localStorage.setItem('cf_user', JSON.stringify(user));
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting production user info:', error);
      return null;
    }
  },

  login: (): void => {
    if (environment.isDevelopment()) return;
    
    // Redirect to protected page and let Cloudflare Access handle the login
    window.location.href = '/protected';
  },

  logout: (): void => {
    if (environment.isDevelopment()) return;
    
    // Clear stored user data
    localStorage.removeItem('cf_user');
    localStorage.removeItem('cf_access_token');
    
    // Redirect to Cloudflare Access logout
    window.location.href = environment.cloudflareAccess.logoutUrl;
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
        // Small delay to ensure cookies are set
        setTimeout(checkAuth, 1000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleUrlChange);
    
    // Also check when the page becomes visible (user returns from Cloudflare Access)
    const handleVisibilityChange = () => {
      if (environment.isProduction() && !document.hidden) {
        setTimeout(checkAuth, 500);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleUrlChange);
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
