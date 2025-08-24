import { useState, useEffect, useCallback } from 'react';
import { environment } from '../config/environment';

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  message: string;
  user: ServerUser;
  token: string;
  expiresIn: string;
}

interface UseServerAuthReturn {
  user: ServerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const API_BASE_URL = environment.isDevelopment() 
  ? 'http://localhost:3001/api' 
  : '/api';

export const useServerAuth = (): UseServerAuthReturn => {
  const [user, setUser] = useState<ServerUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get stored token
  const getStoredToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  // Store token
  const storeToken = (token: string): void => {
    localStorage.setItem('auth_token', token);
  };

  // Remove stored token
  const removeStoredToken = (): void => {
    localStorage.removeItem('auth_token');
  };

  // Set auth headers for API requests
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }, []);

  // Verify token with server
  const verifyToken = useCallback(async (): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        // Token is invalid, remove it
        removeStoredToken();
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      removeStoredToken();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const isValid = await verifyToken();
      if (!isValid) {
        // Try to get current user from server
        const token = getStoredToken();
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders()
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            removeStoredToken();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [verifyToken, getAuthHeaders]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        storeToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      removeStoredToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<void> => {
    await checkAuth();
  }, [checkAuth]);

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Initial auth check - only if there's a stored token
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [checkAuth]);

  // Set up periodic token refresh (every 23 hours since token expires in 24 hours)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        refreshAuth();
      }
    }, 23 * 60 * 60 * 1000); // 23 hours

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    error,
    clearError
  };
};
