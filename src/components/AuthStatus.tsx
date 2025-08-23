import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, UserCheck, UserX } from 'lucide-react';
import { Badge } from './ui/badge';

export const AuthStatus: React.FC = () => {
  const { isAuthenticated, isDevelopment, user } = useAuth();

  return (
    <div className="flex items-center space-x-2">
      {/* Environment Badge */}
      <Badge variant={isDevelopment ? "secondary" : "default"}>
        {isDevelopment ? "DEV" : "PROD"}
      </Badge>
      
      {/* Authentication Status */}
      <div className="flex items-center space-x-1">
        {isAuthenticated ? (
          <>
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Authenticated</span>
          </>
        ) : (
          <>
            <UserX className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">Not Authenticated</span>
          </>
        )}
      </div>
      
      {/* User Info (if authenticated) */}
      {isAuthenticated && user && (
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <User className="h-3 w-3" />
          <span>{user.email}</span>
        </div>
      )}
      
      {/* Protection Method */}
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <Shield className="h-3 w-3" />
        <span>
          {isDevelopment ? "Mock Auth" : "Cloudflare Access"}
        </span>
      </div>
    </div>
  );
};
