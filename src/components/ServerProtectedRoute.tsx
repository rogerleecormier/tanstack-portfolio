import React from 'react';
import { useServerAuth } from '../hooks/useServerAuth';
import { Loader2 } from 'lucide-react';

interface ServerProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ServerProtectedRoute: React.FC<ServerProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading, user } = useServerAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show fallback or children (no automatic redirect)
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Return children even if not authenticated - let the parent component handle auth
    return <>{children}</>;
  }

  return (
    <div>
      {/* Optional: Show user info */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              Authenticated as <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
};
