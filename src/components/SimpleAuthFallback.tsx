import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Shield, AlertCircle } from 'lucide-react';

interface SimpleAuthFallbackProps {
  onSuccess: (email: string) => void;
  onCancel: () => void;
}

export const SimpleAuthFallback: React.FC<SimpleAuthFallbackProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Check if email is from allowed domain
    const allowedDomains = ['rcormier.dev'];
    const userDomain = email.split('@')[1];
    
    if (!allowedDomains.includes(userDomain)) {
      setError('Only rcormier.dev email addresses are allowed');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - call the callback
      onSuccess(email);
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
          <Shield className="h-8 w-8 text-yellow-600" />
        </div>
        <CardTitle className="text-xl">Alternative Authentication</CardTitle>
        <CardDescription>
          Cloudflare Access is not available. Use alternative authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Limited Authentication</span>
          </div>
          <p className="text-xs text-yellow-600">
            This is a fallback authentication method. For full security, configure Cloudflare Access in your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@rcormier.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Only rcormier.dev email addresses are allowed
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> This authentication method provides limited security. 
            For production use, please configure Cloudflare Access in your Cloudflare dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
