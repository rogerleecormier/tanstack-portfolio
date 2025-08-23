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
    
    // Check for Cloudflare Access cookies
    const hasAuthCookie = document.cookie.includes('CF_Authorization') || 
                         document.cookie.includes('CF_Access_JWT') ||
                         document.cookie.includes('CF_Access_Email') ||
                         document.cookie.includes('CF_Access_Identity');
    
    // Check for fallback authentication
    const hasFallbackAuth = localStorage.getItem('fallback_auth') === 'true';
    
    return hasAuthCookie || hasFallbackAuth;
  },

  getUser: (): CloudflareUser | null => {
    if (environment.isDevelopment()) return null;
    
    try {
      // Try to get user from Cloudflare Access cookies
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('CF_Authorization='));
      
      if (authCookie) {
        const token = authCookie.split('=')[1];
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          email: payload.email,
          name: payload.name || 'Authenticated User',
          sub: payload.sub
        };
      }
      
      // Check for email cookie
      const emailCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('CF_Access_Email='));
      
      if (emailCookie) {
        const email = emailCookie.split('=')[1];
        return {
          email: decodeURIComponent(email),
          name: 'Authenticated User'
        };
      }
      
      // Check for fallback authentication
      const fallbackUser = localStorage.getItem('fallback_user');
      if (fallbackUser) {
        return JSON.parse(fallbackUser);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting production user info:', error);
      return null;
    }
  },

  login: (): void => {
    if (environment.isDevelopment()) return;
    
    const redirectUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `${environment.cloudflareAccess.loginUrl}?redirect_url=${redirectUrl}`;
  },

  logout: (): void => {
    if (environment.isDevelopment()) return;
    
    // Clear fallback authentication
    localStorage.removeItem('fallback_auth');
    localStorage.removeItem('fallback_user');
    
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
      const interval = setInterval(checkAuth, 30000); // Check every 30 seconds
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
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleUrlChange);
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
