import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { P, H3 } from './ui/typography';
import { Shield, ArrowRight, Loader2, UserCheck, Briefcase } from 'lucide-react';
import { DevAuthToggle } from './DevAuthToggle';
import { useAuth } from '../hooks/useAuth';

export const ProtectedPage: React.FC = () => {
  const { isAuthenticated, user, isLoading, isDevelopment, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <P className="text-teal-600">
            {isDevelopment ? 'Verifying development authentication...' : 'Authenticating with Cloudflare Access...'}
          </P>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DevAuthToggle />
        
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-teal-200 shadow-xl bg-teal-50/50">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200">
                <Shield className="h-8 w-8 text-teal-700" />
              </div>
              <CardTitle className="text-2xl font-bold text-teal-900">Portfolio Access Required</CardTitle>
              <CardDescription className="text-teal-700">
                Authentication needed to view protected portfolio content
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-teal-100 border border-teal-200 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  {isDevelopment ? (
                    <>
                      <UserCheck className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold text-teal-800">Development Environment</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold text-teal-800">Production Security</span>
                    </>
                  )}
                </div>
                <P className="text-sm text-teal-700">
                  {isDevelopment 
                    ? 'This content is protected in development mode. Use the toggle above to simulate authentication.'
                    : 'This content is protected by Cloudflare Access. Please authenticate to access your portfolio.'
                  }
                </P>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Return to Portfolio</span>
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
      
      <Card className="max-w-2xl mx-auto border-teal-200 shadow-lg bg-teal-50/50">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200 mb-4">
            <Briefcase className="h-6 w-6 text-teal-700" />
          </div>
          <CardTitle className="flex items-center justify-center space-x-2 text-teal-900">
            <span>Protected Portfolio Content</span>
          </CardTitle>
          <CardDescription className="text-teal-700">
            {isDevelopment 
              ? 'Welcome! You have successfully simulated authentication in development mode.'
              : 'Welcome! You have successfully authenticated with Cloudflare Access.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <span className="font-semibold text-teal-800">
                {isDevelopment ? 'Development Authentication Active' : 'Portfolio Access Granted'}
              </span>
            </div>
            <P className="text-sm text-teal-700 mt-2">
              {isDevelopment 
                ? 'You are now viewing protected portfolio content using simulated authentication.'
                : 'You are now viewing protected portfolio content that requires Cloudflare Access authentication.'
              }
            </P>
          </div>
          
          <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
            <H3 className="font-semibold text-teal-800 mb-2">User Profile</H3>
            <div className="space-y-2 text-sm text-teal-700">
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
          
          <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
            <H3 className="font-semibold text-teal-800 mb-2">
              {isDevelopment ? 'Development Mode Information' : 'Security Information'}
            </H3>
            <P className="text-sm text-teal-700">
              {isDevelopment 
                ? 'This content is protected in development mode using simulated authentication. In production, this would be protected by Cloudflare Access.'
                : 'This content is protected by Cloudflare Access. You authenticated using your credentials to verify your identity and access this portfolio content.'
              }
            </P>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors duration-200"
            >
              <span>Sign Out</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};