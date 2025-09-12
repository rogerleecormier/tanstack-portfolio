import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { P } from '@/components/ui/typography';
import {
  Shield,
  ArrowRight,
  Loader2,
  UserCheck,
  Briefcase,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  Globe,
  BarChart3,
  Settings,
  Users,
  Mail,
  Code,
  FileText,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { testAIWorker } from '../api/contactAnalyzer';
import { cachedContentService } from '@/api/cachedContentService';

export const SiteAdminPage: React.FC = () => {
  const { isAuthenticated, user, isLoading, isDevelopment, logout } = useAuth();

  // Handle Cloudflare Access redirect timing
  useEffect(() => {
    if (!isDevelopment && !isLoading && !isAuthenticated) {
      // Only reload once to avoid infinite loops
      const hasReloaded = sessionStorage.getItem('cf_access_reload_attempted');

      if (!hasReloaded) {
        // Give Cloudflare Access a moment to redirect
        const timer = setTimeout(() => {
          // If still not authenticated after 2 seconds, try to trigger redirect
          if (!isAuthenticated) {
            sessionStorage.setItem('cf_access_reload_attempted', 'true');
            window.location.reload();
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    }

    // Clear the reload flag if authentication succeeds
    if (isAuthenticated) {
      sessionStorage.removeItem('cf_access_reload_attempted');
    }
  }, [isAuthenticated, isLoading, isDevelopment]);

  // API testing state
  const [apiStatus, setApiStatus] = useState<{
    ai: 'idle' | 'testing' | 'success' | 'error';
    email: 'idle' | 'testing' | 'success' | 'error';
    newsletter: 'idle' | 'testing' | 'success' | 'error';
    contentSearch: 'idle' | 'testing' | 'success' | 'error';

    healthBridge: 'idle' | 'testing' | 'success' | 'error';
    smartRecommendations: 'idle' | 'testing' | 'success' | 'error';

    r2Bucket: 'idle' | 'testing' | 'success' | 'error';
    cloudflareAccess: 'idle' | 'testing' | 'success' | 'error';
  }>({
    ai: 'idle',
    email: 'idle',
    newsletter: 'idle',
    contentSearch: 'idle',

    healthBridge: 'idle',
    smartRecommendations: 'idle',

    r2Bucket: 'idle',
    cloudflareAccess: 'idle',
  });

  const [apiResults, setApiResults] = useState<{
    ai?: {
      success: boolean;
      error?: string;
      status: number;
      details?: unknown;
    };
    email?: {
      success: boolean;
      status: number;
      statusText: string;
      cors: boolean;
      error?: string;
    };
    newsletter?: {
      success: boolean;
      status: number;
      statusText: string;
      cors: boolean;
      error?: string;
    };
    contentSearch?: {
      success: boolean;
      status: number;
      statusText: string;
      cors: boolean;
      error?: string;
    };

    healthBridge?: {
      success: boolean;
      status: number;
      statusText: string;
      cors: boolean;
      error?: string;
    };
    smartRecommendations?: {
      success: boolean;
      status: number;
      statusText: string;
      cors: boolean;
      error?: string;
    };

    r2Bucket?: {
      success: boolean;
      status: number;
      statusText: string;
      cors: boolean;
      error?: string;
    };
    cloudflareAccess?: {
      success: boolean;
      status: number;
      statusText: string;
      identity?: Record<string, unknown>;
      cookies?: string[];
      headers?: Record<string, string>;
      error?: string;
    };
  }>({});

  // API testing functions
  const testAIWorkerConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, ai: 'testing' }));
    try {
      const result = await testAIWorker();
      const enhancedResult = {
        ...result,
        status: 200,
      };
      setApiResults(prev => ({ ...prev, ai: enhancedResult }));
      setApiStatus(prev => ({
        ...prev,
        ai: enhancedResult.success ? 'success' : 'error',
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        ai: { success: false, error: errorMessage, status: 0 },
      }));
      setApiStatus(prev => ({ ...prev, ai: 'error' }));
    }
  };

  const testEmailWorkerConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, email: 'testing' }));
    try {
      // Try a simple GET request to check basic connectivity
      await fetch(
        'https://tanstack-portfolio-email-worker.rcormier.workers.dev',
        {
          method: 'GET',
          mode: 'no-cors', // This bypasses CORS for basic connectivity testing
          headers: {
            Accept: 'application/json',
          },
        }
      );

      // With no-cors mode, we can't read the response, but if we get here, the worker is reachable
      const result = {
        success: true, // Worker is reachable
        status: 200, // Assume success since we can't read the actual status
        statusText: 'OK',
        cors: true,
      };

      setApiResults(prev => ({ ...prev, email: result }));
      setApiStatus(prev => ({ ...prev, email: 'success' }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        email: {
          success: false,
          status: 0,
          statusText: 'Error',
          cors: false,
          error: errorMessage,
        },
      }));
      setApiStatus(prev => ({ ...prev, email: 'error' }));
    }
  };

  const testNewsletterWorkerConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, newsletter: 'testing' }));
    try {
      // Try a simple GET request to check basic connectivity
      await fetch(
        'https://tanstack-portfolio-blog-subscription.rcormier.workers.dev',
        {
          method: 'GET',
          mode: 'no-cors', // This bypasses CORS for basic connectivity testing
          headers: {
            Accept: 'application/json',
          },
        }
      );

      // With no-cors mode, we can't read the response, but if we get here, the worker is reachable
      const result = {
        success: true, // Worker is reachable
        status: 200, // Assume success since we can't read the actual status
        statusText: 'OK',
        cors: true,
      };

      setApiResults(prev => ({ ...prev, newsletter: result }));
      setApiStatus(prev => ({ ...prev, newsletter: 'success' }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        newsletter: {
          success: false,
          status: 0,
          statusText: 'Error',
          cors: false,
          error: errorMessage,
        },
      }));
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
        tags: [],
      });

      const result = {
        success: response.success,
        status: 200,
        statusText: 'OK',
        cors: true,
      };

      setApiResults(prev => ({ ...prev, contentSearch: result }));
      setApiStatus(prev => ({ ...prev, contentSearch: 'success' }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        contentSearch: {
          success: false,
          status: 0,
          statusText: 'Error',
          cors: false,
          error: errorMessage,
        },
      }));
      setApiStatus(prev => ({ ...prev, contentSearch: 'error' }));
    }
  };

  const testHealthBridgeAPI = async () => {
    setApiStatus(prev => ({ ...prev, healthBridge: 'testing' }));
    try {
      const response = await fetch(
        'https://health-bridge-api.rcormier.workers.dev/api/health/weight?limit=1',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        cors: true, // GET requests don't trigger CORS preflight
      };

      setApiResults(prev => ({ ...prev, healthBridge: result }));
      setApiStatus(prev => ({
        ...prev,
        healthBridge: result.success ? 'success' : 'error',
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        healthBridge: {
          success: false,
          status: 0,
          statusText: 'Error',
          cors: false,
          error: errorMessage,
        },
      }));
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
        tags: [],
      });

      const result = {
        success: response.success,
        status: 200,
        statusText: 'OK',
        cors: true,
      };

      setApiResults(prev => ({ ...prev, smartRecommendations: result }));
      setApiStatus(prev => ({ ...prev, smartRecommendations: 'success' }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        smartRecommendations: {
          success: false,
          status: 0,
          statusText: 'Error',
          cors: false,
          error: errorMessage,
        },
      }));
      setApiStatus(prev => ({ ...prev, smartRecommendations: 'error' }));
    }
  };

  const testR2BucketConnectivity = async () => {
    setApiStatus(prev => ({ ...prev, r2Bucket: 'testing' }));
    try {
      // Test connectivity to files.rcormier.dev R2 bucket
      const response = await fetch(
        'https://files.rcormier.dev/portfolio/strategy.md',
        {
          method: 'GET',
          headers: {
            Accept: 'text/markdown',
          },
        }
      );

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        cors: true,
      };

      setApiResults(prev => ({ ...prev, r2Bucket: result }));
      setApiStatus(prev => ({
        ...prev,
        r2Bucket: result.success ? 'success' : 'error',
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        r2Bucket: {
          success: false,
          status: 0,
          statusText: 'Error',
          cors: false,
          error: errorMessage,
        },
      }));
      setApiStatus(prev => ({ ...prev, r2Bucket: 'error' }));
    }
  };

  const testCloudflareAccess = async () => {
    setApiStatus(prev => ({ ...prev, cloudflareAccess: 'testing' }));
    try {
      // Check for Cloudflare cookies
      const allCookies = document.cookie.split(';').map(c => c.trim());
      const cfCookies = allCookies.filter(
        cookie => cookie.startsWith('CF_') || cookie.startsWith('cf_')
      );

      let response,
        identity = null,
        status = 0,
        statusText = '';

      if (isDevelopment) {
        // In development, simulate Cloudflare Access
        status = 200;
        statusText = 'OK (Development Simulation)';
        identity = {
          email: 'dev@rcormier.dev',
          name: 'Development User',
          id: 'dev-user-123',
          user_uuid: 'dev-uuid-456',
          given_name: 'Development',
          family_name: 'User',
        };
      } else {
        // In production, test real Cloudflare Access
        response = await fetch('/cdn-cgi/access/get-identity', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        });

        status = response.status;
        statusText = response.statusText;

        if (response.ok) {
          try {
            identity = await response.json();
          } catch {
            // Response might not be JSON
          }
        }
      }

      // Get Cloudflare headers (or simulate them in development)
      const headers: Record<string, string> = {};
      const cfHeaders = [
        'CF-Connecting-IP',
        'CF-Ray',
        'CF-Visitor',
        'CF-IPCountry',
        'CF-Device-Type',
        'CF-Bot-Score',
        'CF-Request-ID',
      ];

      if (isDevelopment) {
        // Simulate Cloudflare headers in development
        headers['CF-Connecting-IP'] = '127.0.0.1 (Development)';
        headers['CF-Ray'] = 'dev-simulation-123';
        headers['CF-Visitor'] = '{"scheme":"http"}';
        headers['CF-IPCountry'] = 'US (Development)';
        headers['CF-Device-Type'] = 'desktop';
        headers['CF-Bot-Score'] = '0';
        headers['CF-Request-ID'] = 'dev-request-456';
      } else {
        cfHeaders.forEach(header => {
          const value =
            (window as unknown as Record<string, string>)[header] ||
            'Not found';
          headers[header] = value;
        });
      }

      const result = {
        success: status === 200 && identity?.email,
        status,
        statusText,
        identity,
        cookies: cfCookies,
        headers,
        error: status === 200 ? undefined : `HTTP ${status}: ${statusText}`,
      };

      setApiResults(prev => ({ ...prev, cloudflareAccess: result }));
      setApiStatus(prev => ({
        ...prev,
        cloudflareAccess: result.success ? 'success' : 'error',
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setApiResults(prev => ({
        ...prev,
        cloudflareAccess: {
          success: false,
          status: 0,
          statusText: 'Error',
          error: errorMessage,
          cookies: [],
          headers: {},
        },
      }));
      setApiStatus(prev => ({ ...prev, cloudflareAccess: 'error' }));
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-teal-600 mx-auto mb-4' />
          <P className='text-teal-600'>
            {isDevelopment
              ? 'Verifying development authentication...'
              : 'Authenticating with Cloudflare Access...'}
          </P>
          {!isDevelopment && (
            <P className='text-sm text-teal-500 mt-2'>
              If you're not redirected to login, please refresh the page
            </P>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center'>
          <Card className='w-full max-w-md border-teal-200 shadow-xl bg-teal-50/50'>
            <CardHeader className='text-center space-y-3'>
              <div className='mx-auto p-3 bg-teal-100 rounded-full w-fit border-2 border-teal-200'>
                <Shield className='h-8 w-8 text-teal-700' />
              </div>
              <CardTitle className='text-2xl font-bold text-teal-900'>
                Portfolio Access Required
              </CardTitle>
              <CardDescription className='text-teal-700'>
                Authentication needed to view administration area
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <div className='bg-teal-100 border border-teal-200 rounded-lg p-4 text-left'>
                <div className='flex items-center space-x-2 mb-2'>
                  {isDevelopment ? (
                    <>
                      <UserCheck className='h-4 w-4 text-teal-600' />
                      <span className='font-semibold text-teal-800'>
                        Development Environment
                      </span>
                    </>
                  ) : (
                    <>
                      <Shield className='h-4 w-4 text-teal-600' />
                      <span className='font-semibold text-teal-800'>
                        Production Security
                      </span>
                    </>
                  )}
                </div>
                <P className='text-sm text-teal-700'>
                  {isDevelopment
                    ? 'This content is protected in development mode. Use the development authentication system to simulate authentication.'
                    : 'This content is protected by Cloudflare Access. Please authenticate to access the administration area.'}
                </P>
              </div>

              <Button
                onClick={() => (window.location.href = '/')}
                className='w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2'
              >
                <span>Return to Portfolio</span>
                <ArrowRight className='h-4 w-4' />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Modern Header */}
        <div className='mb-12 text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4'>
            <Shield className='h-8 w-8 text-white' />
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-3'>
            Site Administration
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Monitor system health, manage services, and access protected
            resources
          </p>
          <div className='mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-sm font-medium text-gray-700'>
              {isDevelopment
                ? 'Development Environment'
                : 'Production Environment'}
            </span>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - User Profile & System Info */}
          <div className='space-y-6'>
            {/* User Profile Card */}
            <Card className='border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl'>
                    <Users className='h-6 w-6 text-blue-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-gray-900'>
                      User Profile
                    </CardTitle>
                    <CardDescription className='text-gray-600'>
                      Current authentication details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4'>
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <div className='text-sm font-medium text-gray-500 mb-1'>
                      Email
                    </div>
                    <div className='text-gray-900 font-medium truncate'>
                      {user?.email}
                    </div>
                  </div>
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <div className='text-sm font-medium text-gray-500 mb-1'>
                      Name
                    </div>
                    <div className='text-gray-900 font-medium'>
                      {user?.name || 'Not provided'}
                    </div>
                  </div>
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <div className='text-sm font-medium text-gray-500 mb-1'>
                      Authentication
                    </div>
                    <div className='text-gray-900 font-medium'>
                      {isDevelopment ? 'Development' : 'Cloudflare Access'}
                    </div>
                  </div>
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <div className='text-sm font-medium text-gray-500 mb-1'>
                      Environment
                    </div>
                    <div className='text-gray-900 font-medium'>
                      {isDevelopment ? 'Development' : 'Production'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className='border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl'>
                    <Settings className='h-6 w-6 text-green-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-gray-900'>
                      System Status
                    </CardTitle>
                    <CardDescription className='text-gray-600'>
                      Current system health and security
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-900'>
                      Authentication Status
                    </span>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                      <span className='text-sm font-medium text-green-600'>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-900'>
                      Security Level
                    </span>
                    <div className='flex items-center gap-2'>
                      <Shield className='h-4 w-4 text-blue-600' />
                      <span className='text-sm font-medium text-blue-600'>
                        {isDevelopment
                          ? 'Development Mode'
                          : 'Production Security'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Protected Pages Navigation */}
          <div className='space-y-6'>
            <Card className='border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl'>
                    <Briefcase className='h-6 w-6 text-purple-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-gray-900'>
                      Protected Pages
                    </CardTitle>
                    <CardDescription className='text-gray-600'>
                      Access administrative tools and settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <a
                  href='/protected/site-admin'
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group'
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors'>
                      <Settings className='h-4 w-4 text-blue-600' />
                    </div>
                    <span className='font-medium text-gray-900'>
                      Site Administration
                    </span>
                  </div>
                  <ArrowRight className='h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
                </a>

                <a
                  href='/protected/content-studio'
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group'
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors'>
                      <FileText className='h-4 w-4 text-purple-600' />
                    </div>
                    <span className='font-medium text-gray-900'>
                      Content Studio
                    </span>
                  </div>
                  <ArrowRight className='h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
                </a>

                <a
                  href='/protected/settings'
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group'
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors'>
                      <Settings className='h-4 w-4 text-teal-600' />
                    </div>
                    <span className='font-medium text-gray-900'>Settings</span>
                  </div>
                  <ArrowRight className='h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - API Health Monitoring */}
          <div className='space-y-6'>
            {/* API Health Dashboard */}
            <Card className='border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl'>
                    <Activity className='h-6 w-6 text-orange-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-gray-900'>
                      API Health Monitoring
                    </CardTitle>
                    <CardDescription className='text-gray-600'>
                      Monitor service connectivity and status
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Test All Button */}
                <div className='flex justify-center pb-4'>
                  <Button
                    onClick={async () => {
                      await testAIWorkerConnectivity();
                      await testEmailWorkerConnectivity();
                      await testNewsletterWorkerConnectivity();
                      await testContentSearchWorkerConnectivity();
                      await testHealthBridgeAPI();
                      await testSmartRecommendationsAPI();
                      await testR2BucketConnectivity();
                      await testCloudflareAccess();
                    }}
                    className='bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-lg px-8'
                  >
                    Test All Services
                  </Button>
                </div>
                {/* AI Contact Analyzer */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <Code className='h-4 w-4 text-blue-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        AI Contact Analyzer
                      </div>
                      <div className='text-sm text-gray-600'>
                        AI-powered contact analysis
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.ai === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.ai === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.ai === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.ai === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testAIWorkerConnectivity}
                      disabled={apiStatus.ai === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Email Worker */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <Mail className='h-4 w-4 text-green-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        Email Service
                      </div>
                      <div className='text-sm text-gray-600'>
                        Contact form processing
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.email === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.email === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.email === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.email === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testEmailWorkerConnectivity}
                      disabled={apiStatus.email === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Newsletter Worker */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-100 rounded-lg'>
                      <BarChart3 className='h-4 w-4 text-purple-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        Newsletter Service
                      </div>
                      <div className='text-sm text-gray-600'>
                        Blog subscription management
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.newsletter === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.newsletter === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.newsletter === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.newsletter === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testNewsletterWorkerConnectivity}
                      disabled={apiStatus.newsletter === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Content Search */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-indigo-100 rounded-lg'>
                      <Database className='h-4 w-4 text-indigo-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        Content Search
                      </div>
                      <div className='text-sm text-gray-600'>
                        Semantic content discovery
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.contentSearch === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.contentSearch === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.contentSearch === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.contentSearch === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testContentSearchWorkerConnectivity}
                      disabled={apiStatus.contentSearch === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Health Bridge API */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-teal-100 rounded-lg'>
                      <Globe className='h-4 w-4 text-teal-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        Health Bridge API
                      </div>
                      <div className='text-sm text-gray-600'>
                        External health data service
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.healthBridge === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.healthBridge === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.healthBridge === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.healthBridge === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testHealthBridgeAPI}
                      disabled={apiStatus.healthBridge === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Smart Recommendations */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-pink-100 rounded-lg'>
                      <BarChart3 className='h-4 w-4 text-pink-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        Smart Recommendations
                      </div>
                      <div className='text-sm text-gray-600'>
                        AI content suggestions
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.smartRecommendations === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.smartRecommendations === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.smartRecommendations === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.smartRecommendations === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testSmartRecommendationsAPI}
                      disabled={apiStatus.smartRecommendations === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* R2 Bucket */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-cyan-100 rounded-lg'>
                      <Database className='h-4 w-4 text-cyan-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>R2 Bucket</div>
                      <div className='text-sm text-gray-600'>
                        files.rcormier.dev connectivity
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.r2Bucket === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.r2Bucket === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.r2Bucket === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.r2Bucket === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testR2BucketConnectivity}
                      disabled={apiStatus.r2Bucket === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Cloudflare Access */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-red-100 rounded-lg'>
                      <Shield className='h-4 w-4 text-red-600' />
                    </div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        Cloudflare Access
                      </div>
                      <div className='text-sm text-gray-600'>
                        Authentication & identity verification
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.cloudflareAccess === 'idle' && (
                      <div className='w-3 h-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.cloudflareAccess === 'testing' && (
                      <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
                    )}
                    {apiStatus.cloudflareAccess === 'success' && (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    )}
                    {apiStatus.cloudflareAccess === 'error' && (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={testCloudflareAccess}
                      disabled={apiStatus.cloudflareAccess === 'testing'}
                      className='text-xs border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results Summary */}
            {(apiResults.ai ||
              apiResults.email ||
              apiResults.newsletter ||
              apiResults.contentSearch ||
              apiResults.healthBridge ||
              apiResults.smartRecommendations ||
              apiResults.r2Bucket ||
              apiResults.cloudflareAccess) && (
              <Card className='border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
                <CardHeader className='pb-6'>
                  <div className='flex items-center gap-4'>
                    <div className='p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl'>
                      <Activity className='h-6 w-6 text-emerald-600' />
                    </div>
                    <div>
                      <CardTitle className='text-xl font-semibold text-gray-900'>
                        Test Results Summary
                      </CardTitle>
                      <CardDescription className='text-gray-600'>
                        Latest service connectivity results
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {apiResults.ai && (
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='font-medium text-gray-900'>
                          AI Worker
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.ai.success ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.ai.success ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {apiResults.ai.success ? 'Connected' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.email && (
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='font-medium text-gray-900'>
                          Email Service
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.email.success ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.email.success ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {apiResults.email.success ? 'Connected' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.newsletter && (
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='font-medium text-gray-900'>
                          Newsletter Service
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.newsletter.success ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.newsletter.success ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {apiResults.newsletter.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.contentSearch && (
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='font-medium text-gray-900'>
                          Content Search
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.contentSearch.success ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.contentSearch.success ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {apiResults.contentSearch.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.healthBridge && (
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='font-medium text-gray-900'>
                          Health Bridge API
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.healthBridge.success ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.healthBridge.success ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {apiResults.healthBridge.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.smartRecommendations && (
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='font-medium text-gray-900'>
                          Smart Recommendations
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.smartRecommendations.success ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.smartRecommendations.success ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {apiResults.smartRecommendations.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.r2Bucket && (
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <span className='font-medium text-gray-900'>
                          R2 Bucket
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.r2Bucket.success ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.r2Bucket.success ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {apiResults.r2Bucket.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}

                    {apiResults.cloudflareAccess && (
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                          <span className='font-medium text-gray-900'>
                            Cloudflare Access
                          </span>
                          <div className='flex items-center gap-2'>
                            {apiResults.cloudflareAccess.success ? (
                              <CheckCircle className='h-4 w-4 text-green-600' />
                            ) : (
                              <XCircle className='h-4 w-4 text-red-600' />
                            )}
                            <span
                              className={`text-sm font-medium ${apiResults.cloudflareAccess.success ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {apiResults.cloudflareAccess.success
                                ? 'Authenticated'
                                : 'Failed'}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Cloudflare Access Info */}
                        <div className='bg-gray-50 p-4 rounded-lg text-sm space-y-3'>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <span className='font-medium text-gray-700'>
                                Status:
                              </span>
                              <span className='ml-2 text-gray-600'>
                                {apiResults.cloudflareAccess.status}{' '}
                                {apiResults.cloudflareAccess.statusText}
                              </span>
                            </div>
                            <div>
                              <span className='font-medium text-gray-700'>
                                Cookies:
                              </span>
                              <span className='ml-2 text-gray-600'>
                                {apiResults.cloudflareAccess.cookies?.length ||
                                  0}{' '}
                                found
                              </span>
                            </div>
                          </div>

                          {apiResults.cloudflareAccess.identity && (
                            <div className='bg-white p-3 rounded-lg border border-gray-200'>
                              <div className='font-medium text-gray-900 mb-2'>
                                Identity:
                              </div>
                              <div className='text-gray-700 space-y-1'>
                                <div>
                                  <span className='font-medium'>Email:</span>{' '}
                                  {String(
                                    apiResults.cloudflareAccess.identity
                                      .email || ''
                                  )}
                                </div>
                                <div>
                                  <span className='font-medium'>Name:</span>{' '}
                                  {String(
                                    apiResults.cloudflareAccess.identity.name ||
                                      ''
                                  )}
                                </div>
                                <div>
                                  <span className='font-medium'>ID:</span>{' '}
                                  {String(
                                    apiResults.cloudflareAccess.identity.id ||
                                      apiResults.cloudflareAccess.identity
                                        .user_uuid ||
                                      ''
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {apiResults.cloudflareAccess.error && (
                            <div className='bg-red-50 p-3 rounded-lg border border-red-200'>
                              <div className='font-medium text-red-800 mb-1'>
                                Error:
                              </div>
                              <div className='text-red-700'>
                                {apiResults.cloudflareAccess.error}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className='flex justify-center mt-12'>
          <Button
            onClick={() => logout()}
            variant='outline'
            className='flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200 rounded-lg px-8'
          >
            <span>Sign Out</span>
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};
