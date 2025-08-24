import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { P, H3 } from './ui/typography';
import { Shield, ArrowRight, Loader2, Lock, UserCheck, Info, User, Key, Server, Briefcase } from 'lucide-react';
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
      <Card className="mb-6 border-teal-200 bg-teal-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <Server className="h-5 w-5 text-teal-600" />
            Authentication System Selection
          </CardTitle>
          <CardDescription className="text-teal-700">
            Choose between Cloudflare Access and the new passive server-side authentication system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={!useNewAuth ? "default" : "outline"}
              onClick={() => setUseNewAuth(false)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 border-teal-600"
            >
              <Shield className="h-4 w-4" />
              Cloudflare Access
            </Button>
            <Button
              variant={useNewAuth ? "default" : "outline"}
              onClick={() => setUseNewAuth(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 border-teal-600"
            >
              <Key className="h-4 w-4" />
              Passive Server Auth
            </Button>
          </div>
          <div className="mt-4 p-3 bg-teal-100 border border-teal-200 rounded-lg">
            <p className="text-sm text-teal-800">
              <strong>Current System:</strong> {useNewAuth ? 'Passive Server Authentication' : 'Cloudflare Access'}
            </p>
            <p className="text-sm text-teal-700 mt-1">
              {useNewAuth 
                ? 'Streamlined authentication with instant content loading'
                : 'Enterprise-grade authentication with automatic session management'
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
            {isDevelopment ? 'Verifying development authentication...' : 'Authenticating with Cloudflare Access...'}
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
                <div className="mx-auto p-4 bg-teal-100 rounded-full w-fit border-2 border-teal-200 mb-4">
                  <Briefcase className="h-8 w-8 text-teal-700" />
                </div>
                <h1 className="text-4xl font-bold text-teal-900 mb-4">
                  Protected Portfolio Content
                </h1>
                <p className="text-xl text-teal-700">
                  Advanced authentication system for secure project access
                </p>
                <p className="text-lg text-teal-600 mt-2">
                  Seamless, instant loading with enterprise-grade security
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-teal-200 bg-teal-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-900">
                      <User className="h-5 w-5 text-teal-600" />
                      User Profile
                    </CardTitle>
                    <CardDescription className="text-teal-700">
                      Your authenticated portfolio access details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-teal-800">Name:</span>
                      <span className="text-teal-700">{passiveUser?.name || 'Not authenticated'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-teal-800">Email:</span>
                      <span className="text-teal-700">{passiveUser?.email || 'Not authenticated'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-teal-800">Access Level:</span>
                      <span className="text-teal-700">{passiveUser?.role || 'Not authenticated'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-teal-200 bg-teal-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-900">
                      <Shield className="h-5 w-5 text-teal-600" />
                      Security Status
                    </CardTitle>
                    <CardDescription className="text-teal-700">
                      Current authentication and access status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-teal-800">Status:</span>
                      <span className={passiveIsAuthenticated ? 'text-teal-600 font-semibold' : 'text-teal-500'}>
                        {passiveIsAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-teal-800">System:</span>
                      <span className="text-teal-700">Passive Server Authentication</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-teal-800">Performance:</span>
                      <span className="text-teal-700">Instant Loading</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8 border-teal-200 bg-teal-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-900">
                    <Key className="h-5 w-5 text-teal-600" />
                    System Overview
                  </CardTitle>
                  <CardDescription className="text-teal-700">
                    Advanced authentication technology for professional portfolio access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-teal-200 rounded-lg p-4 bg-teal-100/50">
                      <h4 className="font-semibold text-teal-800 mb-2">✅ Performance Benefits</h4>
                      <ul className="text-sm text-teal-700 space-y-1">
                        <li>• Instant page loading</li>
                        <li>• No authentication delays</li>
                        <li>• Seamless user experience</li>
                        <li>• Professional-grade performance</li>
                      </ul>
                    </div>
                    <div className="border border-teal-200 rounded-lg p-4 bg-teal-100/50">
                      <h4 className="font-semibold text-teal-800 mb-2">🔧 User Controls</h4>
                      <ul className="text-sm text-teal-700 space-y-1">
                        <li>• Manual authentication checks</li>
                        <li>• Optional login forms</li>
                        <li>• User-controlled security</li>
                        <li>• Flexible access management</li>
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
                      <Lock className="h-4 w-4 text-teal-600" />
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
              
              {/* Debug Information for Production */}
              {isProduction && (
                <div className="bg-teal-100 border border-teal-200 rounded-lg p-4 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-teal-600" />
                    <span className="font-semibold text-teal-800">Technical Information</span>
                  </div>
                  <div className="text-xs text-teal-700 space-y-1">
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
                    className="mt-2 text-teal-700 border-teal-300 hover:bg-teal-100"
                  >
                    Clear Cached Data & Reload
                  </Button>
                </div>
              )}
              
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
          
          {/* Show refresh button if user email is the fallback */}
          {user?.email === 'authenticated@rcormier.dev' && isProduction && (
            <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-teal-600" />
                <span className="font-semibold text-teal-800">Authentication Data Issue</span>
              </div>
              <P className="text-sm text-teal-700 mb-3">
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
                className="text-teal-700 border-teal-300 hover:bg-teal-100"
              >
                Refresh Authentication Data
              </Button>
            </div>
          )}
          
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