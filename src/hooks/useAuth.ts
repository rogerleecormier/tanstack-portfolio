import { useState, useEffect } from 'react';
import { 
  isAuthenticated as checkIsAuthenticated, 
  getUserInfo, 
  setUserInfo, 
  clearUserInfo, 
  logout as cloudflareLogout,
  initAuth,
  checkCloudflareAccessIdentity,
  CloudflareUser
} from '../utils/cloudflareAuth';

export const useAuth = () => {
  const [user, setUser] = useState(getUserInfo());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    try {
      const authenticated = checkIsAuthenticated();
      const userInfo = getUserInfo();
      
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
    // Initialize authentication state
    initAuth();
    checkAuth();
    
    // Check Cloudflare Access identity periodically on protected routes
    if (window.location.pathname === '/protected' || window.location.pathname === '/healthbridge-analysis') {
      const interval = setInterval(async () => {
        await checkCloudflareAccessIdentity();
        checkAuth(); // Re-check authentication state
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Listen for storage changes (e.g., logout from another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for URL changes (e.g., returning from OTP flow)
    const handleUrlChange = () => {
      checkAuth();
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
      // Use Cloudflare Access login directly
      if (window.location.hostname === 'localhost') {
        // Development mode - use mock authentication
        const user = {
          email: 'dev@rcormier.dev',
          name: 'Development User'
        };
        setUserInfo(user);
        setUser(user);
        setIsAuthenticated(true);
      } else {
        // Production: Redirect to Cloudflare Access login
        window.location.href = '/cdn-cgi/access/login?redirect_url=%2Fprotected';
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      clearUserInfo();
      cloudflareLogout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user info in both state and localStorage
  const updateUser = (userInfo: CloudflareUser | null) => {
    try {
      setUser(userInfo);
      if (userInfo) {
        setUserInfo(userInfo);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Refresh authentication state
  const refreshAuth = () => {
    checkAuth();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    refreshAuth
  };
};
