import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Mail, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { handleOTPFlow, isDevelopment } from '../utils/cloudflareAuth';

interface LoginPageProps {
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isDev = isDevelopment();

  const handleCloudflareLogin = async () => {
    setIsLoading(true);
    
    try {
      // Close the modal first
      onClose();
      
      // Use the improved OTP flow handler
      handleOTPFlow();
    } catch (error) {
      console.error('Error initiating OTP flow:', error);
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
          <CardTitle className="text-xl">Cloudflare Access</CardTitle>
          <CardDescription>
            Secure One-Time PIN Authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
              <Mail className="h-4 w-4" />
              <span>Enter any email to receive OTP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {isDev 
                ? 'Click below to simulate authentication and access protected content for testing.'
                : 'Click below to access the Cloudflare Access login page. You can enter any email address, but only @rcormier.dev emails will receive a PIN.'
              }
            </p>
            <Button 
              onClick={handleCloudflareLogin}
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>{isDev ? 'Authenticating...' : 'Opening Login Page...'}</span>
                </>
              ) : (
                <>
                  <span>{isDev ? 'Simulate Authentication' : 'Open Cloudflare Access Login'}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          
          {isDev && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Development Mode</span>
              </div>
              <p className="text-xs text-green-700">
                You're running in development mode. Click the button below to simulate authentication and access protected content for testing.
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>What happens next:</strong> You'll be taken to Cloudflare's login page where you can enter any email address. Only @rcormier.dev emails will receive a PIN code to complete authentication.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-700">
              <strong>Note:</strong> If you see "Access Denied" instead of the login form, your Cloudflare Access policies may need to be updated. Check the CLOUDFLARE_SETUP.md file for configuration instructions.
            </p>
          </div>
          
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