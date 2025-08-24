import { useState, useEffect, useCallback } from 'react';
import { environment } from '../config/environment';
import { CloudflareUser } from '../utils/cloudflareAuth';

// Simple Cloudflare Access authentication
const cloudflareAuth = {
  // Check if user is authenticated by calling Cloudflare Access identity endpoint
  async checkAuthentication(): Promise<{ isAuthenticated: boolean; user: CloudflareUser | null }> {
    try {
      const response = await fetch('/cdn-cgi/access/get-identity', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const identity = await response.json();
        if (identity.email) {
          const user: CloudflareUser = {
            email: identity.email,
            name: identity.name || identity.given_name || identity.family_name || 'Authenticated User',
            sub: identity.sub || identity.user_uuid,
          };
          return { isAuthenticated: true, user };
        }
      }
      
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.debug('Cloudflare Access identity check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  },

  // Redirect to Cloudflare Access login
  login(): void {
    if (environment.isDevelopment()) {
      // In development, simulate authentication
      localStorage.setItem('dev_auth', 'true');
      localStorage.setItem('dev_user', JSON.stringify(environment.mockAuth.defaultUser));
      window.dispatchEvent(new StorageEvent('storage', { key: 'dev_auth', newValue: 'true' }));
    } else {
      // In production, redirect to protected route to trigger Cloudflare Access
      window.location.href = '/protected';
    }
  },

  // Logout
  logout(): void {
    if (environment.isDevelopment()) {
      localStorage.removeItem('dev_auth');
      localStorage.removeItem('dev_user');
      window.dispatchEvent(new StorageEvent('storage', { key: 'dev_auth', newValue: null }));
    } else {
      // Clear any stored data and redirect to Cloudflare Access logout with redirect to home page
      localStorage.removeItem('cf_user');
      const homePageUrl = encodeURIComponent(window.location.origin + environment.homePageUrl);
      window.location.href = `/cdn-cgi/access/logout?redirect=${homePageUrl}`;
    }
  },

  // Get mock user for development
  getMockUser(): CloudflareUser | null {
    if (!environment.isDevelopment()) return null;
    
    const isAuth = localStorage.getItem('dev_auth') === 'true';
    if (!isAuth) return null;
    
    const userData = localStorage.getItem('dev_user');
    return userData ? JSON.parse(userData) : environment.mockAuth.defaultUser;
  },

  // Check mock authentication for development
  isMockAuthenticated(): boolean {
    if (!environment.isDevelopment()) return false;
    return localStorage.getItem('dev_auth') === 'true';
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<CloudflareUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      if (environment.isDevelopment()) {
        // Development mode - use mock authentication
        const isAuth = cloudflareAuth.isMockAuthenticated();
        const mockUser = cloudflareAuth.getMockUser();
        
        setIsAuthenticated(isAuth);
        setUser(mockUser);
        setIsLoading(false);
      } else {
        // Production mode - check Cloudflare Access
        const { isAuthenticated: isAuth, user: userInfo } = await cloudflareAuth.checkAuthentication();
        
        setIsAuthenticated(isAuth);
        setUser(userInfo);
        setIsLoading(false);
        
        // Store user info if authenticated
        if (isAuth && userInfo) {
          localStorage.setItem('cf_user', JSON.stringify(userInfo));
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial auth check
    checkAuth();
    
    // Set up periodic auth checks for production
    if (environment.isProduction()) {
      const interval = setInterval(checkAuth, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [checkAuth]);

  useEffect(() => {
    // Listen for storage changes (development mode)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dev_auth' && environment.isDevelopment()) {
        checkAuth();
      }
    };

    // Listen for visibility changes (user returns from Cloudflare Access)
    const handleVisibilityChange = () => {
      if (!document.hidden && environment.isProduction()) {
        // Check authentication when page becomes visible
        setTimeout(checkAuth, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth]);

  const login = () => {
    cloudflareAuth.login();
  };

  const logout = () => {
    cloudflareAuth.logout();
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
    isProduction: environment.isProduction(),
  };
};
