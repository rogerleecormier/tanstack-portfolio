import { useState, useEffect, useCallback } from 'react';
import { environment } from '../config/environment';
import { CloudflareUser } from '../utils/cloudflareAuth';
import { logger } from '@/utils/logger';

// Simplified authentication without complex classes that could cause hanging
const simpleAuth = {
  // Check if user is authenticated in development mode
  isMockAuthenticated(): boolean {
    try {
      logger.info('simpleAuth: isMockAuthenticated called');
      if (!environment.isDevelopment()) {
        logger.info('simpleAuth: Not in development mode, returning false');
        return false;
      }
      
      const isAuth = localStorage.getItem('dev_auth') === 'true';
      const sessionStart = localStorage.getItem('session_start');
      
      logger.info('simpleAuth: localStorage check', { isAuth, sessionStart });
      
      if (!isAuth || !sessionStart) {
        logger.info('simpleAuth: Missing auth data, returning false');
        return false;
      }
      
      // Check if session is still valid (30 minutes)
      const now = Date.now();
      const elapsed = now - parseInt(sessionStart, 10);
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      
      logger.info('simpleAuth: Session timeout check', { now, sessionStart: parseInt(sessionStart, 10), elapsed, sessionTimeout });
      
      if (elapsed > sessionTimeout) {
        // Session expired, clear it
        logger.info('simpleAuth: Session expired, clearing auth');
        this.clearMockAuth();
        return false;
      }
      
      logger.info('simpleAuth: User is authenticated');
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
      logger.info('simpleAuth: startMockSession called');
      if (!environment.isDevelopment()) {
        logger.info('simpleAuth: Not in development mode, returning early');
        return;
      }
      
      logger.info('simpleAuth: Setting localStorage items');
      localStorage.setItem('dev_auth', 'true');
      localStorage.setItem('session_start', Date.now().toString());
      localStorage.setItem('dev_user', JSON.stringify({
        email: 'dev@rcormier.dev',
        name: 'Development User',
        sub: 'dev-user-123'
      }));
      
      logger.info('simpleAuth: Dispatching authStateChanged event');
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: true, user: this.getMockUser() } 
      }));
      
      logger.info('simpleAuth: Mock session started successfully');
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
      // First check if we're in a browser environment
      if (typeof window === 'undefined') {
        logger.debug('Not in browser environment, skipping Cloudflare auth check');
        return { isAuthenticated: false, user: null };
      }

      // Check if Cloudflare Access cookies exist - look for any CF_ cookies
      const allCookies = document.cookie.split(';').map(c => c.trim());
      const cfCookies = allCookies.filter(cookie => 
        cookie.startsWith('CF_') || cookie.startsWith('cf_')
      );
      const hasCfCookies = cfCookies.length > 0;

      logger.debug('Cookie check:', { 
        allCookies: allCookies.length, 
        cfCookies, 
        hasCfCookies,
        fullCookieString: document.cookie
      });

      // Even if we don't see CF_ cookies, try the identity endpoint
      // as it might be working (as shown in your debugger)
      logger.debug('Proceeding to check identity endpoint regardless of cookies');

      logger.debug('Making identity endpoint request...');
      const response = await fetch('/cdn-cgi/access/get-identity', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      logger.debug('Identity endpoint response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (response.ok) {
        try {
          const identity = await response.json();
          logger.debug('Identity response data:', identity);
          
          if (identity.email) {
            const user: CloudflareUser = {
              email: identity.email,
              name: identity.name || identity.given_name || identity.family_name || 'Authenticated User',
              sub: identity.sub || identity.user_uuid,
            };
            logger.debug('Cloudflare Access authentication successful', { user });
            return { isAuthenticated: true, user };
          } else {
            logger.warn('Identity response missing email field:', identity);
          }
        } catch (parseError) {
          logger.error('Failed to parse identity response as JSON:', parseError);
        }
      }
      
      // Handle specific error cases
      if (response.status === 400) {
        logger.warn('Cloudflare Access configuration issue - endpoint returned 400');
        // This might indicate a configuration issue, but don't block the app
        return { isAuthenticated: false, user: null };
      }
      
      if (response.status === 403) {
        logger.debug('Cloudflare Access forbidden - user not authenticated');
        return { isAuthenticated: false, user: null };
      }
      
      if (response.status === 404) {
        logger.warn('Cloudflare Access endpoint not found - service may not be configured');
        // If the endpoint doesn't exist, Cloudflare Access might not be set up
        return { isAuthenticated: false, user: null };
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
  },

  // Enhanced development authentication that simulates Cloudflare Access
  async checkDevCloudflareAuth(): Promise<{ isAuthenticated: boolean; user: CloudflareUser | null }> {
    try {
      // Simulate the same flow as production but with mock data
      const allCookies = document.cookie.split(';').map(c => c.trim());
      const cfCookies = allCookies.filter(cookie => 
        cookie.startsWith('CF_') || cookie.startsWith('cf_')
      );

      // Simulate a successful response like Cloudflare Access would return
      const mockIdentity = {
        email: 'dev@rcormier.dev',
        name: 'Development User',
        id: 'dev-user-123',
        user_uuid: 'dev-uuid-456',
        given_name: 'Development',
        family_name: 'User'
      };

      // Simulate the same user object structure
      const user: CloudflareUser = {
        email: mockIdentity.email,
        name: mockIdentity.name,
        sub: mockIdentity.id,
      };

      logger.debug('Development Cloudflare Access simulation successful', { user, cfCookies });
      return { isAuthenticated: true, user };
    } catch (error) {
      logger.debug('Development Cloudflare Access simulation failed:', error);
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
      logger.info('useAuth: checkAuth called');
      
      if (environment.isDevelopment()) {
        logger.info('useAuth: Development mode detected, checking mock auth');
        // Development mode - use simple mock authentication
        const isAuth = simpleAuth.isMockAuthenticated();
        const mockUser = simpleAuth.getMockUser();
        
        logger.info('useAuth: Development auth check result', { isAuth, mockUser });
        
        setIsAuthenticated(isAuth);
        setUser(mockUser);
        setError(null);
      } else {
        logger.info('useAuth: Production mode detected, checking Cloudflare Access');
        // Production mode - check Cloudflare Access
        const { isAuthenticated: isAuth, user: userInfo } = await simpleAuth.checkCloudflareAuth();
        
        logger.info('useAuth: Cloudflare Access check result', { isAuth, userInfo });
        
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
          
                     // The router will handle redirecting from /protected to home page
           logger.info('useAuth: Authentication successful, router will handle redirect');
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
    
    // Additional auth check after a delay to catch cookies that might be set after page load
    const delayedAuthCheck = setTimeout(() => {
      logger.info('useAuth: Running delayed auth check to catch late-set cookies');
      checkAuth();
    }, 2000);
    
    return () => clearTimeout(delayedAuthCheck);
    
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
    
    // Check if we're returning from Cloudflare Access login
    const isLoginRedirect = document.referrer.includes('cloudflareaccess.com') || 
                           document.referrer.includes('rcormier.cloudflareaccess.com');
    
    if (isLoginRedirect && window.location.pathname.startsWith('/protected')) {
      logger.info('useAuth: Detected login redirect from Cloudflare Access, will check auth state');
      // Force an additional auth check after a short delay to ensure cookies are set
      setTimeout(() => {
        logger.info('useAuth: Running delayed auth check after Cloudflare Access redirect');
        checkAuth();
      }, 1000);
    }
  }, [checkAuth]);

  // Removed automatic auth checks on focus/visibility change to prevent unwanted Cloudflare calls
  // Auth is now only checked on initial load and when explicitly requested

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
          logger.info('useAuth: Starting development mock session');
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
        
                 // Get the current page to return to after authentication
         const currentPage = encodeURIComponent(window.location.href);
         const protectedUrl = `/protected?returnTo=${currentPage}`;
         
         // For mobile Edge, we might need to handle the redirect differently
         if (isMobile && isEdge) {
           logger.info('useAuth: Mobile Edge detected - using alternative redirect method');
           // Try using window.location.replace for mobile Edge
           window.location.replace(protectedUrl);
         } else {
           // Standard redirect for other browsers
           window.location.href = protectedUrl;
         }
      }
    } catch (error) {
      logger.error('Login failed:', error);
      setError('Login failed');
    }
  };

  const logout = (customRedirectUrl?: string) => {
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
        
        // Redirect to Cloudflare Access logout with redirect back to site
        const redirectUrl = encodeURIComponent(customRedirectUrl || window.location.origin);
        const logoutUrl = `/cdn-cgi/access/logout?returnTo=${redirectUrl}`;
        window.location.href = logoutUrl;
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
