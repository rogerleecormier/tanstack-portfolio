import React from 'react';
import { ServerProtectedRoute } from '../components/ServerProtectedRoute';
import { useServerAuth } from '../hooks/useServerAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { LogOut, User, Shield, Key } from 'lucide-react';

export const ServerProtectedDemo: React.FC = () => {
  const { user, logout } = useServerAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ServerProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Server-Side Authentication Demo
            </h1>
            <p className="text-xl text-gray-600">
              This page is protected by server-side JWT authentication
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
                  <span>{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Role:</span>
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <span className="font-mono text-sm">{user?.id}</span>
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
                  <Badge variant="default" className="bg-green-600">
                    Authenticated
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Method:</span>
                  <span>JWT Token</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Storage:</span>
                  <span>LocalStorage</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Backend:</span>
                  <span>Express + JWT</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                Available server-side authentication endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-2">POST /api/auth/login</h4>
                    <p className="text-sm text-gray-600">Authenticate user with email/password</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 mb-2">POST /api/auth/verify</h4>
                    <p className="text-sm text-gray-600">Verify JWT token validity</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-700 mb-2">GET /api/auth/me</h4>
                    <p className="text-sm text-gray-600">Get current user information</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-700 mb-2">POST /api/auth/logout</h4>
                    <p className="text-sm text-gray-600">Logout and invalidate session</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Separator className="my-6" />
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This will clear your JWT token and redirect you to the login page
            </p>
          </div>
        </div>
      </div>
    </ServerProtectedRoute>
  );
};
