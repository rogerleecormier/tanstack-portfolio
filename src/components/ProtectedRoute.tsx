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
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-teal-600">
            {isDevelopment ? 'Verifying development authentication...' : 'Authenticating with Cloudflare Access...'}
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
        <Card className="w-full max-w-md border-teal-200 bg-teal-50/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200">
              <Shield className="h-8 w-8 text-teal-700" />
            </div>
            <CardTitle className="text-xl text-teal-900">Portfolio Access Required</CardTitle>
            <CardDescription className="text-teal-700">
              {isDevelopment 
                ? 'This content requires development authentication'
                : 'This content requires Cloudflare Access authentication'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-teal-100 border border-teal-200 rounded-lg p-4 text-left">
              <div className="flex items-center space-x-2 mb-2">
                {isDevelopment ? (
                  <>
                    <UserCheck className="h-4 w-4 text-teal-600" />
                    <span className="font-medium text-teal-800">Development Environment</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-teal-600" />
                    <span className="font-medium text-teal-800">Production Security</span>
                  </>
                )}
              </div>
              <p className="text-sm text-teal-700">
                {isDevelopment 
                  ? 'You are running in development mode. Click the button below to simulate authentication and access protected portfolio content.'
                  : 'This page is protected by Cloudflare Access. You\'ll need to authenticate using your Google SSO credentials to access your portfolio.'
                }
              </p>
            </div>
            
            <Button 
              onClick={login}
              className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2"
            >
              <span>
                {isDevelopment ? 'Simulate Authentication' : 'Authenticate with Google'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            {isDevelopment && (
              <p className="text-xs text-teal-600">
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
