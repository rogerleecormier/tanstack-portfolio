import { useState, useEffect } from 'react';
import { 
  isAuthenticated as checkIsAuthenticated, 
  getUserInfo, 
  setUserInfo, 
  clearUserInfo, 
  login as cloudflareLogin, 
  logout as cloudflareLogout 
} from '../utils/cloudflareAuth';

export const useAuth = () => {
  const [user, setUser] = useState(getUserInfo());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    const authenticated = checkIsAuthenticated();
    const userInfo = getUserInfo();
    
    setIsAuthenticated(authenticated);
    setUser(userInfo);
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Listen for storage changes (e.g., logout from another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = () => {
    cloudflareLogin();
  };

  const logout = () => {
    clearUserInfo(); // Use the imported function to clear user data
    cloudflareLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user info in both state and localStorage
  const updateUser = (userInfo: any) => {
    setUser(userInfo);
    if (userInfo) {
      setUserInfo(userInfo); // Use the imported function to store user data
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser
  };
};
