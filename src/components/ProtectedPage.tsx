import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, ArrowRight, Loader2, Lock, UserCheck } from 'lucide-react';
import { DevAuthToggle } from './DevAuthToggle';

export const ProtectedPage: React.FC = () => {
  const { isAuthenticated, user, isLoading, isDevelopment, logout } = useAuth();

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
    return (
      <div className="container mx-auto px-4 py-8">
        <DevAuthToggle />
        
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
              <CardDescription>
                You need to authenticate to view this content
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
                    ? 'This page is protected in development mode. Use the toggle above to simulate authentication.'
                    : 'This page is protected by Cloudflare Access. You\'ll need to authenticate using your credentials.'
                  }
                </p>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center space-x-2"
              >
                <span>Go to Home</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DevAuthToggle />
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <span>Protected Content</span>
          </CardTitle>
          <CardDescription>
            {isDevelopment 
              ? 'Welcome! You have successfully simulated authentication in development mode.'
              : 'Welcome! You have successfully authenticated with Cloudflare Access.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                {isDevelopment ? 'Development Authentication Successful' : 'Authentication Successful'}
              </span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              {isDevelopment 
                ? 'You are now viewing protected content using simulated authentication.'
                : 'You are now viewing protected content that requires Cloudflare Access authentication.'
              }
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">User Information</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Name:</strong> {user?.name || 'Not provided'}</div>
              <div><strong>Authentication Method:</strong> 
                {isDevelopment ? 'Development Simulation' : 'Cloudflare Access'}
              </div>
              <div><strong>Environment:</strong> 
                {isDevelopment ? 'Development' : 'Production'}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">
              {isDevelopment ? 'About Development Mode' : 'About This Protection'}
            </h3>
            <p className="text-sm text-gray-700">
              {isDevelopment 
                ? 'This content is protected in development mode using simulated authentication. In production, this would be protected by Cloudflare Access.'
                : 'This content is protected by Cloudflare Access. You authenticated using your credentials to verify your identity and access this page.'
              }
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>Logout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};