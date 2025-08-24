import React, { useState } from 'react';
import { useServerAuth } from '../hooks/useServerAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export const ServerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useServerAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email || !password) {
      return;
    }

    const success = await login(email, password);
    if (success) {
      // Redirect or update UI as needed
      console.log('Login successful!');
    }
  };

  const handleDemoLogin = async () => {
    setEmail('dev@rcormier.dev');
    setPassword('password');
    // Small delay to show the form being populated
    setTimeout(async () => {
      await login('dev@rcormier.dev', 'password');
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your credentials to access protected content
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Enter your email and password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  Demo Login (dev@rcormier.dev)
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Demo credentials: dev@rcormier.dev / password
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
