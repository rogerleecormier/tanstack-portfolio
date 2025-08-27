import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { P, H3 } from './ui/typography';
import { Shield, ArrowRight, Loader2, UserCheck, Briefcase, Wifi, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { testAIWorker } from '../api/contactAnalyzer';

export const ProtectedPage: React.FC = () => {
  const { isAuthenticated, user, isLoading, isDevelopment, logout } = useAuth();
  
  // Worker testing state
  const [workerStatus, setWorkerStatus] = useState<{
    ai: 'idle' | 'testing' | 'success' | 'error';
    email: 'idle' | 'testing' | 'success' | 'error';
    newsletter: 'idle' | 'testing' | 'success' | 'error';
  }>({
    ai: 'idle',
    email: 'idle',
    newsletter: 'idle'
  });
  
  const [workerResults, setWorkerResults] = useState<{
    ai?: { success: boolean; error?: string; status: number; details?: unknown };
    email?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };
    newsletter?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };
  }>({});

  // Worker testing functions
  const testAIWorkerConnectivity = async () => {
    setWorkerStatus(prev => ({ ...prev, ai: 'testing' }));
    try {
      const result = await testAIWorker();
      // Add status code to AI worker result for consistency
      const enhancedResult = {
        ...result,
        status: 200 // AI worker test returns success with 200 status
      };
      setWorkerResults(prev => ({ ...prev, ai: enhancedResult }));
      setWorkerStatus(prev => ({ ...prev, ai: enhancedResult.success ? 'success' : 'error' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setWorkerResults(prev => ({ ...prev, ai: { success: false, error: errorMessage, status: 0 } }));
      setWorkerStatus(prev => ({ ...prev, ai: 'error' }));
    }
  };

  const testEmailWorkerConnectivity = async () => {
    setWorkerStatus(prev => ({ ...prev, email: 'testing' }));
    try {
      const response = await fetch('https://tanstack-portfolio-email-worker.rcormier.workers.dev', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        cors: response.headers.get('Access-Control-Allow-Origin') === '*'
      };
      
      setWorkerResults(prev => ({ ...prev, email: result }));
      setWorkerStatus(prev => ({ ...prev, email: result.success ? 'success' : 'error' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setWorkerResults(prev => ({ ...prev, email: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setWorkerStatus(prev => ({ ...prev, email: 'error' }));
    }
  };

  const testNewsletterWorkerConnectivity = async () => {
    setWorkerStatus(prev => ({ ...prev, newsletter: 'testing' }));
    try {
      const response = await fetch('https://tanstack-portfolio-blog-subscription.rcormier.workers.dev', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        cors: response.headers.get('Access-Control-Allow-Origin') === '*'
      };
      
      setWorkerResults(prev => ({ ...prev, newsletter: result }));
      setWorkerStatus(prev => ({ ...prev, newsletter: result.success ? 'success' : 'error' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setWorkerResults(prev => ({ ...prev, newsletter: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setWorkerStatus(prev => ({ ...prev, newsletter: 'error' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <P className="text-teal-600">
            {isDevelopment ? 'Verifying development authentication...' : 'Authenticating with Cloudflare Access...'}
          </P>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-teal-200 shadow-xl bg-teal-50/50">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200">
                <Shield className="h-8 w-8 text-teal-700" />
              </div>
              <CardTitle className="text-2xl font-bold text-teal-900">Portfolio Access Required</CardTitle>
              <CardDescription className="text-teal-700">
                Authentication needed to view protected portfolio content
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-teal-100 border border-teal-200 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  {isDevelopment ? (
                    <>
                      <UserCheck className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold text-teal-800">Development Environment</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold text-teal-800">Production Security</span>
                    </>
                  )}
                </div>
                <P className="text-sm text-teal-700">
                  {isDevelopment 
                    ? 'This content is protected in development mode. Use the development authentication system to simulate authentication.'
                    : 'This content is protected by Cloudflare Access. Please authenticate to access your portfolio.'
                  }
                </P>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Return to Portfolio</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto border-teal-200 shadow-lg bg-teal-50/50">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200 mb-4">
            <Briefcase className="h-6 w-6 text-teal-700" />
          </div>
          <CardTitle className="flex items-center justify-center space-x-2 text-teal-900">
            <span>Protected Portfolio Content</span>
          </CardTitle>
          <CardDescription className="text-teal-700">
            {isDevelopment 
              ? 'Welcome! You have successfully simulated authentication in development mode.'
              : 'Welcome! You have successfully authenticated with Cloudflare Access.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <span className="font-semibold text-teal-800">
                {isDevelopment ? 'Development Authentication Active' : 'Portfolio Access Granted'}
              </span>
            </div>
            <P className="text-sm text-teal-700 mt-2">
              {isDevelopment 
                ? 'You are now viewing protected portfolio content using simulated authentication.'
                : 'You are now viewing protected portfolio content that requires Cloudflare Access authentication.'
              }
            </P>
          </div>
          
          <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
            <H3 className="font-semibold text-teal-800 mb-2">User Profile</H3>
            <div className="space-y-2 text-sm text-teal-700">
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Name:</strong> {user?.name || 'Not provided'}</div>
              <div><strong>Authentication Method:</strong> 
                {isDevelopment ? 'Development Simulation' : 'Cloudflare Access'}
              </div>
              <div><strong>Environment:</strong> 
                {isDevelopment ? 'Development' : 'Production'}
              </div>
            </div>
          </div>
          
          <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
            <H3 className="font-semibold text-teal-800 mb-2">
              {isDevelopment ? 'Development Mode Information' : 'Security Information'}
            </H3>
            <P className="text-sm text-teal-700">
              {isDevelopment 
                ? 'This content is protected in development mode using simulated authentication. In production, this would be protected by Cloudflare Access.'
                : 'This content is protected by Cloudflare Access. You authenticated using your credentials to verify your identity and access this portfolio content.'
              }
            </P>
          </div>
          
          {/* Worker Connectivity Testing */}
          <div className="bg-teal-100 border border-teal-200 rounded-lg p-4">
            <H3 className="font-semibold text-teal-800 mb-4 flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span>Worker Connectivity Testing</span>
            </H3>
            
            <div className="space-y-3">
              {/* AI Worker Test */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-teal-800">AI Contact Analyzer</span>
                  <span className="text-xs text-teal-600">tanstack-portfolio-ai-contact-analyzer</span>
                </div>
                <div className="flex items-center space-x-2">
                  {workerStatus.ai === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                  {workerStatus.ai === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                  {workerStatus.ai === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {workerStatus.ai === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testAIWorkerConnectivity}
                    disabled={workerStatus.ai === 'testing'}
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>

              {/* Email Worker Test */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-teal-800">Email Worker</span>
                  <span className="text-xs text-teal-600">tanstack-portfolio-email-worker</span>
                </div>
                <div className="flex items-center space-x-2">
                  {workerStatus.email === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                  {workerStatus.email === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                  {workerStatus.email === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {workerStatus.email === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testEmailWorkerConnectivity}
                    disabled={workerStatus.email === 'testing'}
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>

              {/* Newsletter Worker Test */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-teal-800">Newsletter Worker</span>
                  <span className="text-xs text-teal-600">tanstack-portfolio-blog-subscription</span>
                </div>
                <div className="flex items-center space-x-2">
                  {workerStatus.newsletter === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                  {workerStatus.newsletter === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                  {workerStatus.newsletter === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {workerStatus.newsletter === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testNewsletterWorkerConnectivity}
                    disabled={workerStatus.newsletter === 'testing'}
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Results Display */}
            {(workerResults.ai || workerResults.email || workerResults.newsletter) && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-teal-200">
                <H3 className="font-semibold text-teal-800 mb-2 text-sm">Test Results</H3>
                <div className="space-y-2 text-xs">
                  {workerResults.ai && (
                    <div>
                      <strong>AI Worker:</strong> {workerResults.ai.success ? '✅ Connected' : '❌ Failed'} 
                      {workerResults.ai.status && ` (${workerResults.ai.status})`}
                      {workerResults.ai.error && ` - ${workerResults.ai.error}`}
                    </div>
                  )}
                  {workerResults.email && (
                    <div>
                      <strong>Email Worker:</strong> {workerResults.email.success ? '✅ Connected' : '❌ Failed'} 
                      {workerResults.email.status && ` (${workerResults.email.status})`}
                      {workerResults.email.cors && ' - CORS Enabled'}
                    </div>
                  )}
                  {workerResults.newsletter && (
                    <div>
                      <strong>Newsletter Worker:</strong> {workerResults.newsletter.success ? '✅ Connected' : '❌ Failed'} 
                      {workerResults.newsletter.status && ` (${workerResults.newsletter.status})`}
                      {workerResults.newsletter.cors && ' - CORS Enabled'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors duration-200"
            >
              <span>Sign Out</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};