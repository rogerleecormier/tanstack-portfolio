import React from 'react';
import { usePassiveAuth } from '../hooks/usePassiveAuth';
import { ServerLoginPage } from './ServerLoginPage';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LogOut, User, Shield, RefreshCw } from 'lucide-react';

interface PassiveAuthWrapperProps {
  children: React.ReactNode;
  showLogin?: boolean;
  onToggleLogin?: () => void;
}

export const PassiveAuthWrapper: React.FC<PassiveAuthWrapperProps> = ({ 
  children, 
  showLogin = false,
  onToggleLogin 
}) => {
  const { user, isAuthenticated, logout, checkAuth, isLoading } = usePassiveAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleCheckAuth = async () => {
    await checkAuth();
  };

  // If explicitly showing login, show the login page
  if (showLogin) {
    return (
      <div className="min-h-screen bg-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-900 mb-4">
              Portfolio Authentication Required
            </h1>
            <p className="text-lg text-teal-700">
              Please sign in to access protected portfolio content
            </p>
            {onToggleLogin && (
              <Button 
                variant="outline" 
                onClick={onToggleLogin}
                className="mt-4 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
              >
                Skip Login
              </Button>
            )}
          </div>
          <ServerLoginPage />
        </div>
      </div>
    );
  }

  // Always show content first, with authentication status bar
  return (
    <div className="min-h-screen bg-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Authentication Status Bar - Always Visible */}
        <Card className="mb-6 border-teal-200 bg-teal-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                <span className="text-teal-900">Authentication Status</span>
              </div>
              <div className="flex gap-2">
                {isAuthenticated && user && (
                  <Badge variant="default" className="bg-teal-600 hover:bg-teal-700">
                    {user.role}
                  </Badge>
                )}
                {!isAuthenticated && (
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200">
                    Not Authenticated
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center border border-teal-200">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  {isAuthenticated && user ? (
                    <>
                      <p className="font-medium text-teal-900">{user.name}</p>
                      <p className="text-sm text-teal-600">{user.email}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-teal-800">Guest User</p>
                      <p className="text-sm text-teal-600">Not signed in</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {/* Manual Check Auth Button */}
                <Button 
                  variant="outline" 
                  onClick={handleCheckAuth}
                  disabled={isLoading}
                  className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Check Auth
                </Button>

                {/* Login/Logout Toggle */}
                {onToggleLogin && (
                  <Button 
                    variant="outline" 
                    onClick={onToggleLogin}
                    className="border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                  >
                    {isAuthenticated ? 'Switch Account' : 'Sign In'}
                  </Button>
                )}

                {/* Logout Button - Only if authenticated */}
                {isAuthenticated && (
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Always Visible */}
        {children}
      </div>
    </div>
  );
};
