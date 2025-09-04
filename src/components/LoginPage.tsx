import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { P } from './ui/typography';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth, isDevelopment } from '../hooks/useAuth';

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
          <div className="mx-auto relative">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg p-3">
              <img 
                src="/header-logo.svg" 
                alt="RCormier Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Failed to load login logo:', e);
                  // Fallback to Target icon if logo fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              {/* Fallback Target icon (hidden by default) */}
              <Target className="w-8 h-8 text-white hidden" />
            </div>
            {/* Targeting indicator dots */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Roger Lee Cormier
          </CardTitle>
          <CardDescription className="text-teal-700">
            Access your portfolio administration area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <P className="text-sm text-teal-700 leading-relaxed">
              Authenticate to access your portfolio administration area and private projects.
            </P>
            
            {/* Authentication Notice */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="text-sm text-teal-800">
                <strong className="font-semibold">🔒 Secure Access:</strong> {isDevMode ? 'Development mode authentication' : 'Enterprise-grade Cloudflare Access protection'}
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
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
          
          {/* Simplified Information */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <P className="text-xs text-teal-800">
              <strong className="font-semibold">What happens next:</strong> {isDevMode ? 'You\'ll be authenticated and redirected to the administration area.' : 'You\'ll be redirected to Cloudflare Access to authenticate with Google or email PIN.'}
            </P>
          </div>
          
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