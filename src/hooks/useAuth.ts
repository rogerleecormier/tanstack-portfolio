import { useState, useEffect } from 'react';
import { isAuthenticated as checkAuthenticated } from '../utils/oauth';
// import getOAuthTokens if it exists, otherwise remove or replace with correct function

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await checkAuthenticated();
      if (authenticated) {
        const userData = await getOAuthTokens();
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async () => {
    const userData = await getOAuthTokens();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Add any additional logout logic here, such as clearing tokens
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
};

export default useAuth;

const allowedEmail = 'rogerleecormier@gmail.com';

function getOAuthTokens(): any {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (userInfo.email !== allowedEmail) {
        return null; // Deny access
    }
    return userInfo;
}
