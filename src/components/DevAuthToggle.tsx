import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { P } from './ui/typography';
import { UserCheck, UserX, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const DevAuthToggle: React.FC = () => {
  const { isAuthenticated, isDevelopment, login, logout, user } = useAuth();

  // Only show in development mode
  if (!isDevelopment) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-6 border-teal-200 shadow-lg">
      <CardHeader className="pb-3 text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-lg text-teal-900">
          <Shield className="h-5 w-5 text-teal-600" />
          <span>Development Authentication</span>
        </CardTitle>
        <CardDescription className="text-teal-700">
          Toggle authentication state for development testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-teal-700 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-medium">Current Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
          </div>
          {isAuthenticated && user && (
            <div className="mt-2 text-xs text-teal-600 space-y-1">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.name}</div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {!isAuthenticated ? (
            <Button 
              onClick={login}
              className="flex-1 flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
            >
              <UserCheck className="h-4 w-4" />
              <span>Simulate Login</span>
            </Button>
          ) : (
            <Button 
              onClick={logout}
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors duration-200"
            >
              <UserX className="h-4 w-4" />
              <span>Simulate Logout</span>
            </Button>
          )}
        </div>

        <P className="text-xs text-teal-500 text-center leading-relaxed">
          This component only appears in development mode.
          In production, authentication is handled by Cloudflare Access.
        </P>
      </CardContent>
    </Card>
  );
};
