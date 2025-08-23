import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { Shield, ArrowRight, Loader2, Lock, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback: FallbackComponent 
}) => {
  const { isAuthenticated, isLoading, isDevelopment, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isDevelopment ? 'Checking development authentication...' : 'Verifying Cloudflare Access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              {isDevelopment 
                ? 'This content requires development authentication'
                : 'This content requires Cloudflare Access authentication'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-center space-x-2 mb-2">
                {isDevelopment ? (
                  <>
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Development Mode</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Production Mode</span>
                  </>
                )}
              </div>
              <p className="text-sm text-blue-700">
                {isDevelopment 
                  ? 'You are running in development mode. Click the button below to simulate authentication and access protected content.'
                  : 'This page is protected by Cloudflare Access. You\'ll need to authenticate using your credentials.'
                }
              </p>
            </div>
            
            <Button 
              onClick={login}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>
                {isDevelopment ? 'Simulate Login' : 'Go to Login'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            {isDevelopment && (
              <p className="text-xs text-gray-500">
                This simulates authentication for development purposes only.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
