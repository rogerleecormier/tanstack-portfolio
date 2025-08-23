import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { login, isDevelopment } from '../utils/cloudflareAuth';

interface LoginPageProps {
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isDevMode = isDevelopment();

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Close the modal first
      onClose();
      
      // Use the authentication system
      login();
    } catch (error) {
      console.error('Error initiating login:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-teal-600" />
          </div>
          <CardTitle className="text-xl">Protected Content Access</CardTitle>
          <CardDescription>
            Authenticate to access protected projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
              <Shield className="h-4 w-4" />
              <span>Access protected projects</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Click below to authenticate and access protected content including HealthBridge Analysis and other private projects.
            </p>
            
            {/* Development Mode Notice */}
            {isDevMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-700">
                  <strong>Development Mode:</strong> Using simulated authentication for testing.
                </div>
              </div>
            )}

            {/* Production Mode Notice */}
            {!isDevMode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-700 mb-2">
                  <strong>🔒 Cloudflare Access Protected:</strong> This site uses enterprise-grade authentication.
                </div>
                <div className="text-xs text-green-600">
                  You can sign in with Google or receive a one-time PIN via email.
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full disabled:opacity-50 ${
                isDevMode 
                  ? 'bg-teal-600 hover:bg-teal-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {isDevMode ? 'Access Protected Content' : 'Sign In with Cloudflare Access'}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          
          {isDevMode ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>What happens next:</strong> You'll be authenticated and redirected to the protected content. Protected projects will then appear in your navigation menu.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700">
                  <strong>Protected Content:</strong> HealthBridge Analysis and other private projects will be accessible after authentication.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>What happens next:</strong> You'll be redirected to Cloudflare Access to authenticate. Choose Google sign-in or request an email PIN code.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700">
                  <strong>Protected Content:</strong> HealthBridge Analysis and other private projects will be accessible after authentication.
                </p>
              </div>
            </>
          )}
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isLoading}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};