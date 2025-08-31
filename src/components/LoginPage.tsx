import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { P } from './ui/typography';
import { Shield, ArrowRight, Loader2, Lock } from 'lucide-react';
import { isDevelopment } from '../utils/cloudflareAuth';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-md border-teal-200 shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200">
            <Shield className="h-8 w-8 text-teal-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-teal-900">
            Administration Access
          </CardTitle>
          <CardDescription className="text-teal-700">
            Authenticate to access administration area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-teal-600 mb-4">
              <Lock className="h-4 w-4" />
              <span>Access administration area</span>
            </div>
            <P className="text-sm text-teal-700 leading-relaxed">
              Click below to authenticate and access the administration area including HealthBridge Analysis and other private projects.
            </P>
            
            {/* Development Mode Notice */}
            {isDevMode && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="text-sm text-teal-800">
                  <strong className="font-semibold">Development Mode:</strong> Using simulated authentication for testing.
                </div>
              </div>
            )}

            {/* Production Mode Notice */}
            {!isDevMode && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="text-sm text-teal-800 mb-2">
                  <strong className="font-semibold">🔒 Cloudflare Access Protected:</strong> This site uses enterprise-grade authentication.
                </div>
                <div className="text-xs text-teal-700">
                  You can sign in with Google or receive a one-time PIN via email.
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    {isDevMode ? 'Access Administration' : 'Sign In with Cloudflare Access'}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          
          {isDevMode ? (
            <>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <P className="text-xs text-teal-800">
                  <strong className="font-semibold">What happens next:</strong> You'll be authenticated and redirected to the administration area. Administration will then appear in your navigation menu.
                </P>
              </div>
              
              <div className="bg-teal-100 border border-teal-300 rounded-lg p-4">
                <P className="text-xs text-teal-900">
                  <strong className="font-semibold">Administration Area:</strong> HealthBridge Analysis and other private projects will be accessible after authentication.
                </P>
              </div>
            </>
          ) : (
            <>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <P className="text-xs text-teal-800">
                  <strong className="font-semibold">What happens next:</strong> You'll be redirected to Cloudflare Access to authenticate. Choose Google sign-in or request an email PIN code.
                </P>
              </div>
              
              <div className="bg-teal-100 border border-teal-300 rounded-lg p-4">
                <P className="text-xs text-teal-900">
                  <strong className="font-semibold">Administration Area:</strong> HealthBridge Analysis and other private projects will be accessible after authentication.
                </P>
              </div>
            </>
          )}
          
          <div className="text-center pt-2">
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isLoading}
              className="text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-colors duration-200"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};