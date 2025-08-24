import React from 'react';
import { useServerAuth } from '../hooks/useServerAuth';
import { ServerLoginPage } from './ServerLoginPage';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LogOut, User, Shield } from 'lucide-react';

interface ControlledAuthWrapperProps {
  children: React.ReactNode;
  showLogin?: boolean;
  onToggleLogin?: () => void;
}

export const ControlledAuthWrapper: React.FC<ControlledAuthWrapperProps> = ({ 
  children, 
  showLogin = false,
  onToggleLogin 
}) => {
  const { user, isAuthenticated, logout } = useServerAuth();

  const handleLogout = async () => {
    await logout();
  };

  // If explicitly showing login, show the login page
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-lg text-gray-600">
              Please sign in to access this content
            </p>
            {onToggleLogin && (
              <Button 
                variant="outline" 
                onClick={onToggleLogin}
                className="mt-4"
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

  // If authenticated, show content with user info
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* User Status Bar */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Authenticated</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  {user.role}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {onToggleLogin && (
                    <Button 
                      variant="outline" 
                      onClick={onToggleLogin}
                    >
                      Show Login
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {children}
        </div>
      </div>
    );
  }

  // If not authenticated, show content with option to login
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Login Prompt */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <span>Not Authenticated</span>
            </CardTitle>
            <CardDescription>
              You can view this content without logging in, or sign in for additional features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {onToggleLogin && (
                <Button 
                  onClick={onToggleLogin}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};
