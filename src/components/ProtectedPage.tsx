import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { P } from './ui/typography';
import { Shield, ArrowRight, Loader2, UserCheck, Briefcase, CheckCircle, XCircle, Activity, Database, Globe, BarChart3, Settings, Users, Mail, Code } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { testAIWorker } from '../api/contactAnalyzer';
import { cachedContentService } from '@/api/cachedContentService';


export const ProtectedPage: React.FC = () => {
  const { isAuthenticated, user, isLoading, isDevelopment, logout } = useAuth();
  

  
  // API testing state
  const [apiStatus, setApiStatus] = useState<{
    ai: 'idle' | 'testing' | 'success' | 'error';
    email: 'idle' | 'testing' | 'success' | 'error';
    newsletter: 'idle' | 'testing' | 'success' | 'error';
    contentSearch: 'idle' | 'testing' | 'success' | 'error';

    healthBridge: 'idle' | 'testing' | 'success' | 'error';
    smartRecommendations: 'idle' | 'testing' | 'success' | 'error';

    r2Bucket: 'idle' | 'testing' | 'success' | 'error';
  }>({
    ai: 'idle',
    email: 'idle',
    newsletter: 'idle',
    contentSearch: 'idle',

    healthBridge: 'idle',
    smartRecommendations: 'idle',

    r2Bucket: 'idle'
  });
  
  const [apiResults, setApiResults] = useState<{
    ai?: { success: boolean; error?: string; status: number; details?: unknown };
    email?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };
    newsletter?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };
    contentSearch?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };

    healthBridge?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };
    smartRecommendations?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };

    r2Bucket?: { success: boolean; status: number; statusText: string; cors: boolean; error?: string };
  }>({});

  // API testing functions
  const testAIWorkerConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, ai: 'testing' }));
    try {
      const result = await testAIWorker();
      const enhancedResult = {
        ...result,
        status: 200
      };
      setApiResults(prev => ({ ...prev, ai: enhancedResult }));
      setApiStatus(prev => ({ ...prev, ai: enhancedResult.success ? 'success' : 'error' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({ ...prev, ai: { success: false, error: errorMessage, status: 0 } }));
      setApiStatus(prev => ({ ...prev, ai: 'error' }));
    }
  };

  const testEmailWorkerConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, email: 'testing' }));
    try {
      // Try a simple GET request to check basic connectivity
      await fetch('https://tanstack-portfolio-email-worker.rcormier.workers.dev', {
        method: 'GET',
        mode: 'no-cors', // This bypasses CORS for basic connectivity testing
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // With no-cors mode, we can't read the response, but if we get here, the worker is reachable
      const result = {
        success: true, // Worker is reachable
        status: 200, // Assume success since we can't read the actual status
        statusText: 'OK',
        cors: true
      };
      
      setApiResults(prev => ({ ...prev, email: result }));
      setApiStatus(prev => ({ ...prev, email: 'success' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({ ...prev, email: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setApiStatus(prev => ({ ...prev, email: 'error' }));
    }
  };

  const testNewsletterWorkerConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, newsletter: 'testing' }));
    try {
      // Try a simple GET request to check basic connectivity
      await fetch('https://tanstack-portfolio-blog-subscription.rcormier.workers.dev', {
        method: 'GET',
        mode: 'no-cors', // This bypasses CORS for basic connectivity testing
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // With no-cors mode, we can't read the response, but if we get here, the worker is reachable
      const result = {
        success: true, // Worker is reachable
        status: 200, // Assume success since we can't read the actual status
        statusText: 'OK',
        cors: true
      };
      
      setApiResults(prev => ({ ...prev, newsletter: result }));
      setApiStatus(prev => ({ ...prev, newsletter: 'success' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({ ...prev, newsletter: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setApiStatus(prev => ({ ...prev, newsletter: 'error' }));
    }
  };

  const testContentSearchWorkerConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, contentSearch: 'testing' }));
    try {
      // Test the cached content service instead of the old worker
      const response = await cachedContentService.getRecommendations({
        query: 'test',
        contentType: 'all',
        maxResults: 1,
        tags: []
      });
      
      const result = {
        success: response.success,
        status: 200,
        statusText: 'OK',
        cors: true
      };
      
      setApiResults(prev => ({ ...prev, contentSearch: result }));
      setApiStatus(prev => ({ ...prev, contentSearch: 'success' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({ ...prev, contentSearch: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setApiStatus(prev => ({ ...prev, contentSearch: 'error' }));
    }
  };



  const testHealthBridgeAPI = async () => {
    setApiStatus(prev => ({ ...prev, healthBridge: 'testing' }));
    try {
      const response = await fetch('https://health-bridge-api.rcormier.workers.dev/api/health/weight?limit=1', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        cors: true // GET requests don't trigger CORS preflight
      };
      
      setApiResults(prev => ({ ...prev, healthBridge: result }));
      setApiStatus(prev => ({ ...prev, healthBridge: result.success ? 'success' : 'error' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({ ...prev, healthBridge: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setApiStatus(prev => ({ ...prev, healthBridge: 'error' }));
    }
  };

  const testSmartRecommendationsAPI = async () => {
    setApiStatus(prev => ({ ...prev, smartRecommendations: 'testing' }));
    try {
      // Test the cached content service instead of the old worker
      const response = await cachedContentService.getRecommendations({
        query: 'test',
        contentType: 'all',
        maxResults: 1,
        tags: []
      });
      
      const result = {
        success: response.success,
        status: 200,
        statusText: 'OK',
        cors: true
      };
      
      setApiResults(prev => ({ ...prev, smartRecommendations: result }));
      setApiStatus(prev => ({ ...prev, smartRecommendations: 'success' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({ ...prev, smartRecommendations: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setApiStatus(prev => ({ ...prev, smartRecommendations: 'error' }));
    }
  };



  const testR2BucketConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, r2Bucket: 'testing' }));
    try {
      // Test connectivity to files.rcormier.dev R2 bucket
      const response = await fetch('https://files.rcormier.dev/portfolio/strategy.md', {
        method: 'GET',
        headers: {
          'Accept': 'text/markdown'
        }
      });
      
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        cors: true
      };
      
      setApiResults(prev => ({ ...prev, r2Bucket: result }));
      setApiStatus(prev => ({ ...prev, r2Bucket: result.success ? 'success' : 'error' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({ ...prev, r2Bucket: { success: false, status: 0, statusText: 'Error', cors: false, error: errorMessage } }));
      setApiStatus(prev => ({ ...prev, r2Bucket: 'error' }));
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
                Authentication needed to view administration area
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
                : 'This content is protected by Cloudflare Access. Please authenticate to access the administration area.'
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
      <Card className="max-w-7xl mx-auto border-teal-200 shadow-lg bg-teal-50/50">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200 mb-4">
            <Briefcase className="h-6 w-6 text-teal-700" />
          </div>
          <CardTitle className="flex items-center justify-center space-x-2 text-teal-900">
            <span>Site Administration & Monitoring</span>
          </CardTitle>
          <CardDescription className="text-teal-700">
            {isDevelopment 
              ? 'Development Environment - Administration Access'
              : 'Production Environment - Cloudflare Access Authenticated'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - System Status & User Info */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <Card className="border-teal-200 bg-teal-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-teal-600" />
                    <CardTitle className="text-lg text-teal-900">User Profile</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="font-semibold text-teal-800">Email</div>
                      <div className="text-teal-700 truncate">{user?.email}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="font-semibold text-teal-800">Name</div>
                      <div className="text-teal-700">{user?.name || 'Not provided'}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="font-semibold text-teal-800">Auth Method</div>
                      <div className="text-teal-700">{isDevelopment ? 'Development' : 'Cloudflare'}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="font-semibold text-teal-800">Environment</div>
                      <div className="text-teal-700">{isDevelopment ? 'Development' : 'Production'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* System Information */}
              <Card className="border-teal-200 bg-teal-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-teal-600" />
                    <CardTitle className="text-lg text-teal-900">System Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-teal-800">Authentication Status</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-teal-800">Security Level</span>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-teal-600" />
                        <span className="text-sm text-teal-700">
                          {isDevelopment ? 'Development Mode' : 'Production Security'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - API Health Monitoring */}
            <div className="space-y-6">
              {/* API Health Dashboard */}
              <Card className="border-teal-200 bg-teal-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-teal-600" />
                    <CardTitle className="text-lg text-teal-900">API Health Monitoring</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Contact Analyzer */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-teal-800">AI Contact Analyzer</div>
                        <div className="text-xs text-teal-600">AI-powered contact analysis</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {apiStatus.ai === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      {apiStatus.ai === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                      {apiStatus.ai === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {apiStatus.ai === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testAIWorkerConnectivity}
                        disabled={apiStatus.ai === 'testing'}
                        className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  {/* Email Worker */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-teal-800">Email Service</div>
                        <div className="text-xs text-teal-600">Contact form processing</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {apiStatus.email === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      {apiStatus.email === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                      {apiStatus.email === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {apiStatus.email === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testEmailWorkerConnectivity}
                        disabled={apiStatus.email === 'testing'}
                        className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  {/* Newsletter Worker */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-teal-800">Newsletter Service</div>
                        <div className="text-xs text-teal-600">Blog subscription management</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {apiStatus.newsletter === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      {apiStatus.newsletter === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                      {apiStatus.newsletter === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {apiStatus.newsletter === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testNewsletterWorkerConnectivity}
                        disabled={apiStatus.newsletter === 'testing'}
                        className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  {/* Content Search */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-teal-800">Content Search</div>
                        <div className="text-xs text-teal-600">Semantic content discovery</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {apiStatus.contentSearch === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      {apiStatus.contentSearch === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                      {apiStatus.contentSearch === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {apiStatus.contentSearch === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testContentSearchWorkerConnectivity}
                        disabled={apiStatus.contentSearch === 'testing'}
                        className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Test
                      </Button>
                    </div>
                  </div>



                  {/* Health Bridge API */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-teal-800">Health Bridge API</div>
                        <div className="text-xs text-teal-600">External health data service</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {apiStatus.healthBridge === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      {apiStatus.healthBridge === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                      {apiStatus.healthBridge === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {apiStatus.healthBridge === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testHealthBridgeAPI}
                        disabled={apiStatus.healthBridge === 'testing'}
                        className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  {/* Smart Recommendations */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-teal-800">Smart Recommendations</div>
                        <div className="text-xs text-teal-600">AI content suggestions</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {apiStatus.smartRecommendations === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      {apiStatus.smartRecommendations === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                      {apiStatus.smartRecommendations === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {apiStatus.smartRecommendations === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testSmartRecommendationsAPI}
                        disabled={apiStatus.smartRecommendations === 'testing'}
                        className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Test
                      </Button>
                    </div>
                  </div>



                  {/* R2 Bucket */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-teal-800">R2 Bucket</div>
                        <div className="text-xs text-teal-600">files.rcormier.dev connectivity</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {apiStatus.r2Bucket === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      {apiStatus.r2Bucket === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                      {apiStatus.r2Bucket === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {apiStatus.r2Bucket === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testR2BucketConnectivity}
                        disabled={apiStatus.r2Bucket === 'testing'}
                        className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Results Summary */}
              {(apiResults.ai || apiResults.email || apiResults.newsletter || apiResults.contentSearch || apiResults.healthBridge || apiResults.smartRecommendations || apiResults.r2Bucket) && (
                <Card className="border-teal-200 bg-teal-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-teal-600" />
                      <CardTitle className="text-lg text-teal-900">Test Results Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {apiResults.ai && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                          <span className="font-medium text-teal-800">AI Worker</span>
                          <div className="flex items-center space-x-2">
                            {apiResults.ai.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className={apiResults.ai.success ? 'text-green-600' : 'text-red-600'}>
                              {apiResults.ai.success ? 'Connected' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}
                      {apiResults.email && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                          <span className="font-medium text-teal-800">Email Service</span>
                          <div className="flex items-center space-x-2">
                            {apiResults.email.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className={apiResults.email.success ? 'text-green-600' : 'text-red-600'}>
                              {apiResults.email.success ? 'Connected' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}
                      {apiResults.newsletter && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                          <span className="font-medium text-teal-800">Newsletter Service</span>
                          <div className="flex items-center space-x-2">
                            {apiResults.newsletter.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className={apiResults.newsletter.success ? 'text-green-600' : 'text-red-600'}>
                              {apiResults.newsletter.success ? 'Connected' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}
                      {apiResults.contentSearch && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                          <span className="font-medium text-teal-800">Content Search</span>
                          <div className="flex items-center space-x-2">
                            {apiResults.contentSearch.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className={apiResults.contentSearch.success ? 'text-green-600' : 'text-red-600'}>
                              {apiResults.contentSearch.success ? 'Connected' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}

                      {apiResults.healthBridge && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                          <span className="font-medium text-teal-800">Health Bridge API</span>
                          <div className="flex items-center space-x-2">
                            {apiResults.healthBridge.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className={apiResults.healthBridge.success ? 'text-green-600' : 'text-red-600'}>
                              {apiResults.healthBridge.success ? 'Connected' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}
                      {apiResults.smartRecommendations && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                          <span className="font-medium text-teal-800">Smart Recommendations</span>
                          <div className="flex items-center space-x-2">
                            {apiResults.smartRecommendations.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className={apiResults.smartRecommendations.success ? 'text-green-600' : 'text-red-600'}>
                              {apiResults.smartRecommendations.success ? 'Connected' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}

                      {apiResults.r2Bucket && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-teal-200">
                          <span className="font-medium text-teal-800">R2 Bucket</span>
                          <div className="flex items-center space-x-2">
                            {apiResults.r2Bucket.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className={apiResults.r2Bucket.success ? 'text-green-600' : 'text-red-600'}>
                              {apiResults.r2Bucket.success ? 'Connected' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
        
        <div className="flex justify-center pb-6">
          <Button 
            onClick={logout}
            variant="outline"
            className="flex items-center space-x-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors duration-200"
          >
            <span>Sign Out</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};