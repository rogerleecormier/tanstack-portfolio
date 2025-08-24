import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { P, H3 } from './ui/typography';
import { Shield, ArrowRight, Loader2, Lock, UserCheck, Info, User, Key, Server } from 'lucide-react';
import { DevAuthToggle } from './DevAuthToggle';
import { useAuth } from '../hooks/useAuth';
import { PassiveAuthWrapper } from './PassiveAuthWrapper';
import { usePassiveAuth } from '../hooks/usePassiveAuth';

export const ProtectedPage: React.FC = () => {
  const [useNewAuth, setUseNewAuth] = React.useState(false);
  const { isAuthenticated, user, isLoading, isDevelopment, logout, isProduction } = useAuth();
  const { user: passiveUser, isAuthenticated: passiveIsAuthenticated } = usePassiveAuth();

  // Add authentication system toggle at the top
  const authToggle = (
    <div className="container mx-auto px-4 py-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Authentication System Toggle
          </CardTitle>
          <CardDescription>
            Choose between the old Cloudflare Access system and the new passive server-side system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={!useNewAuth ? "default" : "outline"}
              onClick={() => setUseNewAuth(false)}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Cloudflare Access (Old)
            </Button>
            <Button
              variant={useNewAuth ? "default" : "outline"}
              onClick={() => setUseNewAuth(true)}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Passive Server Auth (New)
            </Button>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current System:</strong> {useNewAuth ? 'Passive Server Auth' : 'Cloudflare Access'}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {useNewAuth 
                ? 'No automatic checks, no refreshing, content loads instantly'
                : 'Traditional cookie-based authentication with automatic checks'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <P className="text-teal-600">
            {isDevelopment ? 'Checking development authentication...' : 'Verifying Cloudflare Access...'}
          </P>
        </div>
      </div>
    );
  }

  // Show the appropriate authentication system
  if (useNewAuth) {
    // New Passive Authentication System
    return (
      <div>
        {authToggle}
        <PassiveAuthWrapper showLogin={false}>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Protected Content (New System)
                </h1>
                <p className="text-xl text-gray-600">
                  This page uses the new passive authentication system
                </p>
                <p className="text-lg text-gray-500 mt-2">
                  No automatic checks, no refreshing, content loads instantly!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      User Information
                    </CardTitle>
                    <CardDescription>
                      Your authenticated user details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{passiveUser?.name || 'Not authenticated'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{passiveUser?.email || 'Not authenticated'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Role:</span>
                      <span>{passiveUser?.role || 'Not authenticated'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Authentication Status
                    </CardTitle>
                    <CardDescription>
                      Current authentication state
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className={passiveIsAuthenticated ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        {passiveIsAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">System:</span>
                      <span>Passive Server Auth</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Behavior:</span>
                      <span>No Automatic Checks</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    How This Works
                  </CardTitle>
                  <CardDescription>
                    This page demonstrates completely passive authentication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-green-700 mb-2">✅ What Happens</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Page loads instantly</li>
                        <li>• No authentication checks</li>
                        <li>• No automatic redirects</li>
                        <li>• Content always visible</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-blue-700 mb-2">🔧 Manual Controls</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Click "Check Auth" to verify token</li>
                        <li>• Click "Sign In" to show login form</li>
                        <li>• Authentication is completely optional</li>
                        <li>• You control when auth happens</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </PassiveAuthWrapper>
      </div>
    );
  }

  // Old Cloudflare Access System
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        {authToggle}
        <DevAuthToggle />
        
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-teal-200 shadow-xl">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200">
                <Shield className="h-8 w-8 text-teal-700" />
              </div>
              <CardTitle className="text-2xl font-bold text-teal-900">Access Required</CardTitle>
              <CardDescription className="text-teal-700">
                You need to authenticate to view this content
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  {isDevelopment ? (
                    <>
                      <UserCheck className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold text-teal-800">Development Mode</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold text-teal-800">Production Mode</span>
                    </>
                  )}
                </div>
                <P className="text-sm text-teal-700">
                  {isDevelopment 
                    ? 'This page is protected in development mode. Use the toggle above to simulate authentication.'
                    : 'This page is protected by Cloudflare Access. You\'ll need to authenticate using your credentials.'
                  }
                </P>
              </div>
              
              {/* Debug Information for Production */}
              {isProduction && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-800">Debug Information</span>
                  </div>
                  <div className="text-xs text-amber-700 space-y-1">
                    <div><strong>Cookies:</strong> {document.cookie || 'None'}</div>
                    <div><strong>URL:</strong> {window.location.href}</div>
                    <div><strong>Path:</strong> {window.location.pathname}</div>
                    <div><strong>Search:</strong> {window.location.search || 'None'}</div>
                  </div>
                  <Button
                    onClick={() => {
                      localStorage.removeItem('cf_user');
                      localStorage.removeItem('cf_access_token');
                      window.location.reload();
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                  >
                    Clear Cached Data & Reload
                  </Button>
                </div>
              )}
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
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
      
      <Card className="max-w-2xl mx-auto border-teal-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-teal-900">
            <User className="h-6 w-6 text-teal-600" />
            <span>Protected Content</span>
          </CardTitle>
          <CardDescription className="text-teal-700">
            {isDevelopment 
              ? 'Welcome! You have successfully simulated authentication in development mode.'
              : 'Welcome! You have successfully authenticated with Cloudflare Access.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <span className="font-semibold text-teal-800">
                {isDevelopment ? 'Development Authentication Successful' : 'Authentication Successful'}
              </span>
            </div>
            <P className="text-sm text-teal-700 mt-2">
              {isDevelopment 
                ? 'You are now viewing protected content using simulated authentication.'
                : 'You are now viewing protected content that requires Cloudflare Access authentication.'
              }
            </P>
          </div>
          
          <div className="bg-teal-100 border border-teal-300 rounded-lg p-4">
            <H3 className="font-semibold text-teal-800 mb-2">User Information</H3>
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
          
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <H3 className="font-semibold text-teal-800 mb-2">
              {isDevelopment ? 'About Development Mode' : 'About This Protection'}
            </H3>
            <P className="text-sm text-teal-700">
              {isDevelopment 
                ? 'This content is protected in development mode using simulated authentication. In production, this would be protected by Cloudflare Access.'
                : 'This content is protected by Cloudflare Access. You authenticated using your credentials to verify your identity and access this page.'
              }
            </P>
          </div>
          
          {/* Show refresh button if user email is the fallback */}
          {user?.email === 'authenticated@rcormier.dev' && isProduction && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-amber-800">Email Detection Issue</span>
              </div>
              <P className="text-sm text-amber-700 mb-3">
                Your actual email wasn't detected from Cloudflare Access. This is likely a caching issue.
              </P>
              <Button
                onClick={() => {
                  localStorage.removeItem('cf_user');
                  localStorage.removeItem('cf_access_token');
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                Refresh User Data
              </Button>
            </div>
          )}
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors duration-200"
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