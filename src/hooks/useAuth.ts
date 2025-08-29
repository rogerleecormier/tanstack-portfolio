import { useState, useEffect, useCallback } from 'react';
import { environment } from '../config/environment';
import { CloudflareUser } from '../utils/cloudflareAuth';
import { logger } from '@/utils/logger';

// Simplified authentication without complex classes that could cause hanging
const simpleAuth = {
  // Check if user is authenticated in development mode
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
        // Session expired, clear it
        this.clearMockAuth();
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error checking mock authentication:', error);
      return false;
    }
  },

  // Get mock user for development
  getMockUser(): CloudflareUser | null {
    try {
      if (!environment.isDevelopment()) return null;
      if (!this.isMockAuthenticated()) return null;
      
      const userData = localStorage.getItem('dev_user');
      if (userData) {
        return JSON.parse(userData);
      }
      
      // Return default user if no stored data
      return {
        email: 'dev@rcormier.dev',
        name: 'Development User',
        sub: 'dev-user-123'
      };
    } catch (error) {
      logger.error('Error getting mock user:', error);
      return null;
    }
  },

  // Start mock authentication session
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
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: true, user: this.getMockUser() } 
      }));
    } catch (error) {
      logger.error('Error starting mock session:', error);
    }
  },

  // Clear mock authentication
  clearMockAuth(): void {
    try {
      localStorage.removeItem('dev_auth');
      localStorage.removeItem('dev_user');
      localStorage.removeItem('session_start');
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: false, user: null } 
      }));
    } catch (error) {
      logger.error('Error clearing mock auth:', error);
    }
  },

  // Check Cloudflare Access authentication (production)
  async checkCloudflareAuth(): Promise<{ isAuthenticated: boolean; user: CloudflareUser | null }> {
    try {
      const response = await fetch('/cdn-cgi/access/get-identity', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
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
      
      // If we get here, user is not authenticated
      // Clear any stored user data to ensure consistency
      try {
        localStorage.removeItem('cf_user');
      } catch {
        logger.warn('Could not clear localStorage during auth check');
      }
      
      return { isAuthenticated: false, user: null };
    } catch (error) {
      logger.debug('Cloudflare Access identity check failed:', error);
      
      // On error, assume not authenticated and clear stored data
      try {
        localStorage.removeItem('cf_user');
      } catch {
        logger.warn('Could not clear localStorage during auth check error');
      }
      
      return { isAuthenticated: false, user: null };
    }
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<CloudflareUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (environment.isDevelopment()) {
        // Development mode - use simple mock authentication
        const isAuth = simpleAuth.isMockAuthenticated();
        const mockUser = simpleAuth.getMockUser();
        
        logger.info('useAuth: Development auth check', { isAuth, mockUser });
        
        setIsAuthenticated(isAuth);
        setUser(mockUser);
        setError(null);
      } else {
        // Production mode - check Cloudflare Access
        const { isAuthenticated: isAuth, user: userInfo } = await simpleAuth.checkCloudflareAuth();
        
        setIsAuthenticated(isAuth);
        setUser(userInfo);
        setError(null);
        
        // Store user info if authenticated
        if (isAuth && userInfo) {
          try {
            localStorage.setItem('cf_user', JSON.stringify(userInfo));
          } catch {
            logger.warn('Could not store user info in localStorage');
          }
        }
      }
    } catch (error) {
      logger.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
      setError('Authentication check failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial auth check - only run once
  useEffect(() => {
    checkAuth();
    
    // Check if we're returning from a logout redirect (common on mobile)
    const urlParams = new URLSearchParams(window.location.search);
    const isLogoutRedirect = urlParams.get('logout') === 'true' || 
                           window.location.pathname.includes('logout') ||
                           document.referrer.includes('logout');
    
          if (isLogoutRedirect) {
        logger.info('useAuth: Detected logout redirect, clearing auth state');
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      
      // Clean up the URL
      if (urlParams.get('logout') === 'true') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('logout');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [checkAuth]);

  // Additional auth check when page becomes visible (for mobile logout redirects)
  useEffect(() => {
          const handleVisibilityChange = () => {
        if (!document.hidden) {
          logger.info('useAuth: Page became visible, checking auth status');
          checkAuth();
        }
      };

      const handleFocus = () => {
        logger.info('useAuth: Window focused, checking auth status');
        checkAuth();
      };

    // Listen for visibility changes (when user returns to tab)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for window focus (when user returns to browser)
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuth]);

  // Listen for auth state changes from other components
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      logger.info('useAuth: Received auth state change event', event.detail);
      const { isAuthenticated: newAuthState, user: newUser } = event.detail;
      setIsAuthenticated(newAuthState);
      setUser(newUser);
    };

    window.addEventListener('authStateChanged', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
    };
  }, []);

  const login = () => {
    try {
      logger.info('useAuth: Login called');
      if (environment.isDevelopment()) {
        simpleAuth.startMockSession();
        // Update state immediately
        setIsAuthenticated(true);
        setUser(simpleAuth.getMockUser());
        setError(null);
        logger.info('useAuth: Development login successful');
      } else {
        // In production, redirect to protected route to trigger Cloudflare Access
        // Cloudflare will automatically intercept this and redirect to authentication
        
        // Check if we're on a mobile browser
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isEdge = /Edge/i.test(navigator.userAgent);
        
        logger.info('useAuth: Login redirect:', {
          isMobile,
          isEdge,
          userAgent: navigator.userAgent,
          currentUrl: window.location.href
        });
        
        // For mobile Edge, we might need to handle the redirect differently
        if (isMobile && isEdge) {
          logger.info('useAuth: Mobile Edge detected - using alternative redirect method');
          // Try using window.location.replace for mobile Edge
          window.location.replace('/protected');
        } else {
          // Standard redirect for other browsers
          window.location.href = '/protected';
        }
      }
    } catch (error) {
      logger.error('Login failed:', error);
      setError('Login failed');
    }
  };

  const logout = () => {
    try {
      logger.info('useAuth: Logout called');
      if (environment.isDevelopment()) {
        simpleAuth.clearMockAuth();
        // Update state immediately
        setIsAuthenticated(false);
        setUser(null);
        setError(null);
        logger.info('useAuth: Development logout successful');
      } else {
        // Clear any stored data and redirect to Cloudflare Access logout
        try {
          localStorage.removeItem('cf_user');
        } catch {
          logger.warn('Could not clear localStorage');
        }
        
        // Check if we're on a mobile browser
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          logger.info('useAuth: Mobile logout detected, clearing state immediately');
          // For mobile, clear the state immediately before redirect
          setIsAuthenticated(false);
          setUser(null);
          setError(null);
        }
        
        // Redirect to Cloudflare Access logout
        window.location.href = '/cdn-cgi/access/logout';
      }
    } catch (error) {
      logger.error('Logout failed:', error);
      setError('Logout failed');
    }
  };

  const refreshAuth = () => {
    logger.info('useAuth: Refresh auth called');
    checkAuth();
  };

  const clearError = () => {
    setError(null);
  };

  // Debug logging for state changes
  useEffect(() => {
    logger.info('useAuth: State changed', { isAuthenticated, user, isLoading, error });
  }, [isAuthenticated, user, isLoading, error]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    isDevelopment: environment.isDevelopment(),
    isProduction: environment.isProduction(),
    error,
    clearError,
    // Simplified security info for development
    remainingAttempts: 3,
    isLockedOut: false,
    sessionTimeRemaining: 0
  };
};
