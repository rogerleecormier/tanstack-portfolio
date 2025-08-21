import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, ArrowRight } from 'lucide-react';

export const ProtectedPage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
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
            <p className="text-sm text-gray-600">
              This page is protected and requires One-Time PIN (OTP) authentication through Cloudflare Access.
            </p>
            <Button asChild className="w-full">
              <a href="/" className="flex items-center justify-center space-x-2">
                <span>Go to Login</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <span>Protected Content</span>
          </CardTitle>
          <CardDescription>
            Welcome! You have successfully authenticated with One-Time PIN (OTP).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Authentication Successful</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              You are now viewing protected content that requires OTP authentication.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">User Information</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Name:</strong> {user?.name || 'Not provided'}</div>
              <div><strong>Authentication Method:</strong> One-Time PIN (OTP)</div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">About This Protection</h3>
            <p className="text-sm text-gray-700">
              This content is protected by Cloudflare Access using One-Time PIN authentication. 
              You received a secure PIN via email to verify your identity and access this page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};