import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { UserCheck, UserX, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const DevAuthToggle: React.FC = () => {
  const { isAuthenticated, isDevelopment, login, logout, user } = useAuth();

  // Only show in development mode
  if (!isDevelopment) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Development Authentication</span>
        </CardTitle>
        <CardDescription>
          Toggle authentication state for development testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Info className="h-4 w-4" />
            <span>Current Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
          </div>
          {isAuthenticated && user && (
            <div className="mt-2 text-xs text-blue-600">
              <div>Email: {user.email}</div>
              <div>Name: {user.name}</div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {!isAuthenticated ? (
            <Button 
              onClick={login}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Simulate Login</span>
            </Button>
          ) : (
            <Button 
              onClick={logout}
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <UserX className="h-4 w-4" />
              <span>Simulate Logout</span>
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          This component only appears in development mode.
          In production, authentication is handled by Cloudflare Access.
        </div>
      </CardContent>
    </Card>
  );
};
