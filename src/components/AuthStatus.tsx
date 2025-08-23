import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, UserCheck, UserX } from 'lucide-react';
import { Badge } from './ui/badge';

export const AuthStatus: React.FC = () => {
  const { isAuthenticated, isDevelopment, user } = useAuth();

  return (
    <div className="flex items-center space-x-2">
      {/* Environment Badge */}
      <Badge 
        variant={isDevelopment ? "secondary" : "default"}
        className={isDevelopment ? "bg-teal-100 text-teal-800 border-teal-200" : "bg-teal-600 text-white"}
      >
        {isDevelopment ? "DEV" : "PROD"}
      </Badge>
      
      {/* Authentication Status */}
      <div className="flex items-center space-x-1">
        {isAuthenticated ? (
          <>
            <UserCheck className="h-4 w-4 text-teal-600" />
            <span className="text-sm text-teal-700 font-medium">Authenticated</span>
          </>
        ) : (
          <>
            <UserX className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700 font-medium">Not Authenticated</span>
          </>
        )}
      </div>
      
      {/* User Info (if authenticated) */}
      {isAuthenticated && user && (
        <div className="flex items-center space-x-1 text-xs text-teal-600">
          <User className="h-3 w-3" />
          <span className="font-medium">{user.email}</span>
        </div>
      )}
      
      {/* Protection Method */}
      <div className="flex items-center space-x-1 text-xs text-teal-500">
        <Shield className="h-3 w-3" />
        <span className="font-medium">
          {isDevelopment ? "Mock Auth" : "Cloudflare Access"}
        </span>
      </div>
    </div>
  );
};
