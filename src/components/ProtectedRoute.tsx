import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { Shield, ArrowRight, Loader2, Lock, UserCheck, AlertTriangle, Clock, Info } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback: FallbackComponent 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isDevelopment, 
    login, 
    error,
    remainingAttempts,
    isLockedOut,
    sessionTimeRemaining
  } = useAuth();
  
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
            {/* Security Status Display */}
            {isDevelopment && (
              <div className="bg-teal-100 border border-teal-200 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  <span className="font-medium text-teal-800">Security Status</span>
                </div>
                
                {/* Rate Limiting Status */}
                {isLockedOut && (
                  <div className="flex items-center space-x-2 mb-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Account Temporarily Locked</span>
                  </div>
                )}
                
                {/* Remaining Attempts */}
                <div className="text-sm text-teal-700 mb-2">
                  <span className="font-medium">Login Attempts Remaining:</span> {remainingAttempts}
                </div>
                
                {/* Session Timeout Info */}
                {sessionTimeRemaining > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-teal-600">
                    <Clock className="h-4 w-4" />
                    <span>Session Timeout: {Math.ceil(sessionTimeRemaining / 60000)} minutes</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Authentication Error</span>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

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
              
              {/* Mobile Edge specific instructions */}
              {!isDevelopment && (() => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const isEdge = /Edge/i.test(navigator.userAgent);
                
                if (isMobile && isEdge) {
                  return (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Mobile Edge Browser</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        If the authentication doesn't work, try:
                      </p>
                      <ul className="text-xs text-blue-700 mt-1 list-disc list-inside space-y-1">
                        <li>Allow popups for this site</li>
                        <li>Try refreshing the page</li>
                        <li>Use a different browser if available</li>
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            
            <Button 
              onClick={login}
              disabled={isLockedOut}
              className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isDevelopment 
                  ? (isLockedOut ? 'Account Locked' : 'Simulate Authentication')
                  : 'Authenticate with Google'
                }
              </span>
              {!isLockedOut && <ArrowRight className="h-4 w-4" />}
            </Button>
            
            {isDevelopment && (
              <div className="text-xs text-teal-600">
                {isLockedOut 
                  ? 'Too many failed attempts. Please wait before trying again.'
                  : 'This simulates authentication for development purposes only.'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
