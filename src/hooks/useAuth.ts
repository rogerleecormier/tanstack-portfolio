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

  const login = async (provider: string) => {
    const userData = await getOAuthTokens(provider);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Add any additional logout logic here, such as clearing tokens
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
};

export default useAuth;

function getOAuthTokens(provider?: string): any {
    // Replace this with actual logic to fetch user data from OAuth provider
    return Promise.resolve({ name: 'Demo User', provider });
}
