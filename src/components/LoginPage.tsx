import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const handleCloudflareLogin = () => {
    // Close the modal first
    onClose();
    
    // Redirect to a protected route that will trigger Cloudflare Access OTP
    // Cloudflare Access will automatically show the OTP login form
    window.location.href = '/protected';
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
              <span>OTP will be sent to your email</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Click below to start the Cloudflare Access authentication flow. 
              You'll receive a One-Time PIN via email to securely access your portfolio.
            </p>
            <Button 
              onClick={handleCloudflareLogin} 
              className="w-full bg-teal-600 hover:bg-teal-700"
              size="lg"
            >
              <span>Continue to Cloudflare Access</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={onClose}
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