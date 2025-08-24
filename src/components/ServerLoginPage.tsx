import React, { useState } from 'react';
import { useServerAuth } from '../hooks/useServerAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, AlertCircle, Briefcase } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200 mb-4">
            <Briefcase className="h-8 w-8 text-teal-700" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-900">
            Portfolio Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-teal-700">
            Sign in to access protected portfolio content
          </p>
        </div>
        
        <Card className="border-teal-200 bg-teal-50/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-teal-900">Secure Access</CardTitle>
            <CardDescription className="text-teal-700">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-teal-800">
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
                  className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-teal-800">
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
                  className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2"
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
                  className="w-full border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                >
                  Demo Login (dev@rcormier.dev)
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-teal-600">
                Demo credentials: dev@rcormier.dev / password
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
