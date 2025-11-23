import { cachedContentService } from '@/api/cachedContentService';
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
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle,
  Code,
  Database,
  FileText,
  Globe,
  Loader2,
  Mail,
  Settings,
  Shield,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { testAIWorker } from '../api/contactAnalyzer';
import { useAuth } from '../hooks/useAuth';

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
    return undefined;
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

  const testContentSearchWorkerConnectivity = () => {
    setApiStatus(prev => ({ ...prev, contentSearch: 'testing' }));
    try {
      // Test the cached content service instead of the old worker
      const response = cachedContentService.getRecommendations({
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

  const testSmartRecommendationsAPI = () => {
    setApiStatus(prev => ({ ...prev, smartRecommendations: 'testing' }));
    try {
      // Test the cached content service instead of the old worker
      const response = cachedContentService.getRecommendations({
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
            identity = (await response.json()) as Record<string, unknown>;
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
            (window as unknown as Record<string, string>)[header] ??
            'Not found';
          headers[header] = value;
        });
      }

      const result = {
        success: Boolean(
          status === 200 && (identity as Record<string, unknown>)?.email
        ),
        status,
        statusText,
        ...(identity && { identity }),
        cookies: cfCookies,
        headers,
        ...(status !== 200 && { error: `HTTP ${status}: ${statusText}` }),
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
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='mx-auto mb-4 size-12 animate-spin text-gold-600' />
          <P className='text-gold-600'>
            {isDevelopment
              ? 'Verifying development authentication...'
              : 'Authenticating with Cloudflare Access...'}
          </P>
          {!isDevelopment && (
            <P className='mt-2 text-sm text-slate-500'>
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
          <Card className='w-full max-w-md border-slate-200 bg-slate-50/50 shadow-xl'>
            <CardHeader className='space-y-3 text-center'>
              <div className='mx-auto w-fit rounded-full border-2 border-slate-200 bg-slate-100 p-3'>
                <Shield className='size-8 text-hunter-700' />
              </div>
              <CardTitle className='text-2xl font-bold text-hunter-900'>
                Portfolio Access Required
              </CardTitle>
              <CardDescription className='text-slate-700'>
                Authentication needed to view administration area
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-center'>
              <div className='rounded-lg border border-slate-200 bg-slate-100 p-4 text-left'>
                <div className='mb-2 flex items-center space-x-2'>
                  {isDevelopment ? (
                    <>
                      <UserCheck className='size-4 text-hunter-600' />
                      <span className='font-semibold text-hunter-800'>
                        Development Environment
                      </span>
                    </>
                  ) : (
                    <>
                      <Shield className='size-4 text-hunter-600' />
                      <span className='font-semibold text-hunter-800'>
                        Production Security
                      </span>
                    </>
                  )}
                </div>
                <P className='text-sm text-slate-700'>
                  {isDevelopment
                    ? 'This content is protected in development mode. Use the development authentication system to simulate authentication.'
                    : 'This content is protected by Cloudflare Access. Please authenticate to access the administration area.'}
                </P>
              </div>

              <Button
                onClick={() => (window.location.href = '/')}
                className='flex w-full items-center justify-center space-x-2 bg-gold-600 transition-all duration-200 hover:bg-gold-700 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2'
              >
                <span>Return to Portfolio</span>
                <ArrowRight className='size-4' />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-hunter-950 via-slate-950 to-hunter-950 dark:from-hunter-950 dark:via-slate-950 dark:to-hunter-950'>
      {/* Header with Administrative Theme - System Management Focused */}
      <div className='relative overflow-hidden border-b border-slate-200 dark:border-slate-800'>
        <div className='from-gold-600/3 via-gold-600/3 to-gold-600/3 dark:from-gold-400/8 dark:via-gold-400/8 dark:to-gold-400/8 absolute inset-0 bg-gradient-to-r'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Administrative Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-slate-600 shadow-lg'>
                  <Shield className='size-7 text-white' />
                </div>
                {/* Admin indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-gold-600'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-slate-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-slate-100 dark:text-white sm:text-5xl lg:text-6xl'>
                  <span className='bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent dark:from-gold-400 dark:to-red-300'>
                    Site Administration
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-gold-500 to-slate-500'></div>
              </div>
            </div>

            {/* Description with Admin Language */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-grey-300 dark:text-grey-300'>
              Monitor system health, manage services, and oversee
              <span className='font-medium text-gold-600 dark:text-gold-400'>
                {' '}
                \n protected resources{' '}
              </span>
              with comprehensive administration controls.
            </p>

            {/* Environment Badge */}
            <div className='mt-6'>
              <div className='inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50/50 px-4 py-2 backdrop-blur-sm dark:border-gold-900/50 dark:bg-gold-950/30'>
                <div
                  className={`size-2 rounded-full ${isDevelopment ? 'bg-yellow-500' : 'bg-green-500'}`}
                ></div>
                <span className='text-sm font-medium text-gold-900 dark:text-gold-200'>
                  {isDevelopment
                    ? 'Development Environment'
                    : 'Production Environment'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='container mx-auto max-w-7xl px-4 py-8'>
        {/* Main Content Grid */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Left Column - User Profile & System Info */}
          <div className='space-y-6'>
            {/* User Profile Card */}
            <Card className='border border-gold-600/30 bg-hunter-900/60 shadow-lg backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='rounded-xl bg-gradient-to-r from-gold-100 to-gold-100 p-3'>
                    <Users className='size-6 text-gold-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-grey-100'>
                      User Profile
                    </CardTitle>
                    <CardDescription className='text-grey-300'>
                      Current authentication details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4'>
                  <div className='rounded-lg bg-hunter-800 p-4'>
                    <div className='mb-1 text-sm font-medium text-grey-400'>
                      Email
                    </div>
                    <div className='truncate font-medium text-grey-100'>
                      {user?.email}
                    </div>
                  </div>
                  <div className='rounded-lg bg-hunter-800 p-4'>
                    <div className='mb-1 text-sm font-medium text-grey-400'>
                      Name
                    </div>
                    <div className='font-medium text-grey-100'>
                      {user?.name ?? 'Not provided'}
                    </div>
                  </div>
                  <div className='rounded-lg bg-hunter-800 p-4'>
                    <div className='mb-1 text-sm font-medium text-grey-400'>
                      Authentication
                    </div>
                    <div className='font-medium text-grey-100'>
                      {isDevelopment ? 'Development' : 'Cloudflare Access'}
                    </div>
                  </div>
                  <div className='rounded-lg bg-hunter-800 p-4'>
                    <div className='mb-1 text-sm font-medium text-grey-400'>
                      Environment
                    </div>
                    <div className='font-medium text-grey-100'>
                      {isDevelopment ? 'Development' : 'Production'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className='border border-gold-600/30 bg-hunter-900/60 shadow-lg backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='rounded-xl bg-gradient-to-r from-gold-100 to-gold-100 p-3'>
                    <Settings className='size-6 text-gold-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-grey-100'>
                      System Status
                    </CardTitle>
                    <CardDescription className='text-grey-300'>
                      Current system health and security
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg bg-hunter-800 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-grey-100'>
                      Authentication Status
                    </span>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='size-4 text-gold-600' />
                      <span className='text-sm font-medium text-gold-600'>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-slate-100'>
                      Security Level
                    </span>
                    <div className='flex items-center gap-2'>
                      <Shield className='size-4 text-slate-600' />
                      <span className='text-sm font-medium text-slate-600'>
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
            <Card className='border border-gold-600/30 bg-hunter-900/60 shadow-lg backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='rounded-xl bg-gradient-to-r from-gold-100 to-gold-100 p-3'>
                    <Briefcase className='size-6 text-gold-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-slate-100'>
                      Protected Pages
                    </CardTitle>
                    <CardDescription className='text-slate-300'>
                      Access administrative tools and settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <a
                  href='/protected/site-admin'
                  className='group flex items-center justify-between rounded-lg bg-slate-800 p-4 transition-colors duration-200 hover:bg-slate-800'
                >
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-slate-100 p-2 transition-colors group-hover:bg-slate-200'>
                      <Settings className='size-4 text-slate-600' />
                    </div>
                    <span className='font-medium text-slate-100'>
                      Site Administration
                    </span>
                  </div>
                  <ArrowRight className='size-4 text-gray-400 transition-colors group-hover:text-slate-300' />
                </a>

                <a
                  href='/protected/content-studio'
                  className='group flex items-center justify-between rounded-lg bg-slate-800 p-4 transition-colors duration-200 hover:bg-slate-800'
                >
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-purple-100 p-2 transition-colors group-hover:bg-purple-200'>
                      <FileText className='size-4 text-gold-600' />
                    </div>
                    <span className='font-medium text-slate-100'>
                      Content Studio
                    </span>
                  </div>
                  <ArrowRight className='size-4 text-gray-400 transition-colors group-hover:text-slate-300' />
                </a>

                <a
                  href='/protected/settings'
                  className='group flex items-center justify-between rounded-lg bg-slate-800 p-4 transition-colors duration-200 hover:bg-slate-800'
                >
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-slate-100 p-2 transition-colors group-hover:bg-slate-200'>
                      <Settings className='size-4 text-slate-600' />
                    </div>
                    <span className='font-medium text-slate-100'>Settings</span>
                  </div>
                  <ArrowRight className='size-4 text-gray-400 transition-colors group-hover:text-slate-300' />
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - API Health Monitoring */}
          <div className='space-y-6'>
            {/* API Health Dashboard */}
            <Card className='border border-gold-600/30 bg-hunter-900/60 shadow-lg backdrop-blur-sm'>
              <CardHeader className='pb-6'>
                <div className='flex items-center gap-4'>
                  <div className='rounded-xl bg-gradient-to-r from-gold-100 to-gold-100 p-3'>
                    <Activity className='size-6 text-gold-600' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-semibold text-slate-100'>
                      API Health Monitoring
                    </CardTitle>
                    <CardDescription className='text-slate-300'>
                      Monitor service connectivity and status
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Test All Button */}
                <div className='flex justify-center pb-4'>
                  <Button
                    onClick={() =>
                      void (async () => {
                        await testAIWorkerConnectivity();
                        await testEmailWorkerConnectivity();
                        await testNewsletterWorkerConnectivity();
                        testContentSearchWorkerConnectivity();
                        await testHealthBridgeAPI();
                        testSmartRecommendationsAPI();
                        await testR2BucketConnectivity();
                        await testCloudflareAccess();
                      })()
                    }
                    className='rounded-lg border-0 bg-orange-600 px-8 text-white hover:bg-orange-700'
                  >
                    Test All Services
                  </Button>
                </div>
                {/* AI Contact Analyzer */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-slate-100 p-2'>
                      <Code className='size-4 text-slate-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        AI Contact Analyzer
                      </div>
                      <div className='text-sm text-slate-300'>
                        AI-powered contact analysis
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.ai === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.ai === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.ai === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.ai === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testAIWorkerConnectivity()}
                      disabled={apiStatus.ai === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Email Worker */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-green-100 p-2'>
                      <Mail className='size-4 text-gold-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        Email Service
                      </div>
                      <div className='text-sm text-slate-300'>
                        Contact form processing
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.email === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.email === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.email === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.email === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testEmailWorkerConnectivity()}
                      disabled={apiStatus.email === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Newsletter Worker */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-purple-100 p-2'>
                      <BarChart3 className='size-4 text-gold-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        Newsletter Service
                      </div>
                      <div className='text-sm text-slate-300'>
                        Blog subscription management
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.newsletter === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.newsletter === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.newsletter === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.newsletter === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testNewsletterWorkerConnectivity()}
                      disabled={apiStatus.newsletter === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Content Search */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-indigo-100 p-2'>
                      <Database className='size-4 text-indigo-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        Content Search
                      </div>
                      <div className='text-sm text-slate-300'>
                        Semantic content discovery
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.contentSearch === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.contentSearch === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.contentSearch === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.contentSearch === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testContentSearchWorkerConnectivity()}
                      disabled={apiStatus.contentSearch === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Health Bridge API */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-slate-100 p-2'>
                      <Globe className='size-4 text-hunter-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        Health Bridge API
                      </div>
                      <div className='text-sm text-slate-300'>
                        External health data service
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.healthBridge === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.healthBridge === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.healthBridge === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.healthBridge === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testHealthBridgeAPI()}
                      disabled={apiStatus.healthBridge === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Smart Recommendations */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-pink-100 p-2'>
                      <BarChart3 className='size-4 text-pink-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        Smart Recommendations
                      </div>
                      <div className='text-sm text-slate-300'>
                        AI content suggestions
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.smartRecommendations === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.smartRecommendations === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.smartRecommendations === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.smartRecommendations === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testSmartRecommendationsAPI()}
                      disabled={apiStatus.smartRecommendations === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* R2 Bucket */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-cyan-100 p-2'>
                      <Database className='size-4 text-cyan-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        R2 Bucket
                      </div>
                      <div className='text-sm text-slate-300'>
                        files.rcormier.dev connectivity
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.r2Bucket === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.r2Bucket === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.r2Bucket === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.r2Bucket === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testR2BucketConnectivity()}
                      disabled={apiStatus.r2Bucket === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {/* Cloudflare Access */}
                <div className='flex items-center justify-between rounded-lg bg-slate-800 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-gold-100 p-2'>
                      <Shield className='size-4 text-gold-600' />
                    </div>
                    <div>
                      <div className='font-medium text-slate-100'>
                        Cloudflare Access
                      </div>
                      <div className='text-sm text-slate-300'>
                        Authentication & identity verification
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {apiStatus.cloudflareAccess === 'idle' && (
                      <div className='size-3 rounded-full bg-gray-300' />
                    )}
                    {apiStatus.cloudflareAccess === 'testing' && (
                      <Loader2 className='size-4 animate-spin text-gold-600' />
                    )}
                    {apiStatus.cloudflareAccess === 'success' && (
                      <CheckCircle className='size-4 text-gold-600' />
                    )}
                    {apiStatus.cloudflareAccess === 'error' && (
                      <XCircle className='size-4 text-gold-600' />
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => void testCloudflareAccess()}
                      disabled={apiStatus.cloudflareAccess === 'testing'}
                      className='rounded-lg border-gray-300 text-xs text-gray-700 hover:bg-slate-800'
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results Summary */}
            {(apiResults.ai ??
              apiResults.email ??
              apiResults.newsletter ??
              apiResults.contentSearch ??
              apiResults.healthBridge ??
              apiResults.smartRecommendations ??
              apiResults.r2Bucket ??
              apiResults.cloudflareAccess) && (
              <Card className='border border-gold-600/30 bg-hunter-900/60 shadow-lg backdrop-blur-sm'>
                <CardHeader className='pb-6'>
                  <div className='flex items-center gap-4'>
                    <div className='rounded-xl bg-gradient-to-r from-gold-100 to-gold-100 p-3'>
                      <Activity className='size-6 text-emerald-600' />
                    </div>
                    <div>
                      <CardTitle className='text-xl font-semibold text-slate-100'>
                        Test Results Summary
                      </CardTitle>
                      <CardDescription className='text-slate-300'>
                        Latest service connectivity results
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {apiResults.ai && (
                      <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                        <span className='font-medium text-slate-100'>
                          AI Worker
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.ai.success ? (
                            <CheckCircle className='size-4 text-gold-600' />
                          ) : (
                            <XCircle className='size-4 text-gold-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.ai.success ? 'text-gold-600' : 'text-gold-600'}`}
                          >
                            {apiResults.ai.success ? 'Connected' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.email && (
                      <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                        <span className='font-medium text-slate-100'>
                          Email Service
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.email.success ? (
                            <CheckCircle className='size-4 text-gold-600' />
                          ) : (
                            <XCircle className='size-4 text-gold-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.email.success ? 'text-gold-600' : 'text-gold-600'}`}
                          >
                            {apiResults.email.success ? 'Connected' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.newsletter && (
                      <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                        <span className='font-medium text-slate-100'>
                          Newsletter Service
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.newsletter.success ? (
                            <CheckCircle className='size-4 text-gold-600' />
                          ) : (
                            <XCircle className='size-4 text-gold-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.newsletter.success ? 'text-gold-600' : 'text-gold-600'}`}
                          >
                            {apiResults.newsletter.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.contentSearch && (
                      <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                        <span className='font-medium text-slate-100'>
                          Content Search
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.contentSearch.success ? (
                            <CheckCircle className='size-4 text-gold-600' />
                          ) : (
                            <XCircle className='size-4 text-gold-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.contentSearch.success ? 'text-gold-600' : 'text-gold-600'}`}
                          >
                            {apiResults.contentSearch.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.healthBridge && (
                      <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                        <span className='font-medium text-slate-100'>
                          Health Bridge API
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.healthBridge.success ? (
                            <CheckCircle className='size-4 text-gold-600' />
                          ) : (
                            <XCircle className='size-4 text-gold-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.healthBridge.success ? 'text-gold-600' : 'text-gold-600'}`}
                          >
                            {apiResults.healthBridge.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.smartRecommendations && (
                      <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                        <span className='font-medium text-slate-100'>
                          Smart Recommendations
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.smartRecommendations.success ? (
                            <CheckCircle className='size-4 text-gold-600' />
                          ) : (
                            <XCircle className='size-4 text-gold-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.smartRecommendations.success ? 'text-gold-600' : 'text-gold-600'}`}
                          >
                            {apiResults.smartRecommendations.success
                              ? 'Connected'
                              : 'Failed'}
                          </span>
                        </div>
                      </div>
                    )}
                    {apiResults.r2Bucket && (
                      <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                        <span className='font-medium text-slate-100'>
                          R2 Bucket
                        </span>
                        <div className='flex items-center gap-2'>
                          {apiResults.r2Bucket.success ? (
                            <CheckCircle className='size-4 text-gold-600' />
                          ) : (
                            <XCircle className='size-4 text-gold-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${apiResults.r2Bucket.success ? 'text-gold-600' : 'text-gold-600'}`}
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
                        <div className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                          <span className='font-medium text-slate-100'>
                            Cloudflare Access
                          </span>
                          <div className='flex items-center gap-2'>
                            {apiResults.cloudflareAccess.success ? (
                              <CheckCircle className='size-4 text-gold-600' />
                            ) : (
                              <XCircle className='size-4 text-gold-600' />
                            )}
                            <span
                              className={`text-sm font-medium ${apiResults.cloudflareAccess.success ? 'text-gold-600' : 'text-gold-600'}`}
                            >
                              {apiResults.cloudflareAccess.success
                                ? 'Authenticated'
                                : 'Failed'}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Cloudflare Access Info */}
                        <div className='space-y-3 rounded-lg bg-slate-800 p-4 text-sm'>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <span className='font-medium text-gray-700'>
                                Status:
                              </span>
                              <span className='ml-2 text-slate-300'>
                                {apiResults.cloudflareAccess.status}{' '}
                                {apiResults.cloudflareAccess.statusText}
                              </span>
                            </div>
                            <div>
                              <span className='font-medium text-gray-700'>
                                Cookies:
                              </span>
                              <span className='ml-2 text-slate-300'>
                                {apiResults.cloudflareAccess.cookies?.length ??
                                  0}{' '}
                                found
                              </span>
                            </div>
                          </div>

                          {apiResults.cloudflareAccess.identity && (
                            <div className='rounded-lg border border-gray-200 bg-white p-3'>
                              <div className='mb-2 font-medium text-slate-100'>
                                Identity:
                              </div>
                              <div className='space-y-1 text-gray-700'>
                                <div>
                                  <span className='font-medium'>Email:</span>{' '}
                                  {typeof apiResults.cloudflareAccess.identity
                                    .email === 'string'
                                    ? apiResults.cloudflareAccess.identity.email
                                    : ''}
                                </div>
                                <div>
                                  <span className='font-medium'>Name:</span>{' '}
                                  {typeof apiResults.cloudflareAccess.identity
                                    .name === 'string'
                                    ? apiResults.cloudflareAccess.identity.name
                                    : ''}
                                </div>
                                <div>
                                  <span className='font-medium'>ID:</span>{' '}
                                  {typeof apiResults.cloudflareAccess.identity
                                    .id === 'string'
                                    ? apiResults.cloudflareAccess.identity.id
                                    : typeof apiResults.cloudflareAccess
                                          .identity.user_uuid === 'string'
                                      ? apiResults.cloudflareAccess.identity
                                          .user_uuid
                                      : ''}
                                </div>
                              </div>
                            </div>
                          )}

                          {apiResults.cloudflareAccess.error && (
                            <div className='rounded-lg border border-gold-200 bg-gold-50 p-3'>
                              <div className='mb-1 font-medium text-red-800'>
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
        <div className='mt-12 flex justify-center'>
          <Button
            onClick={() => logout()}
            variant='outline'
            className='flex items-center gap-2 rounded-lg border-gray-300 px-8 text-gray-700 transition-colors duration-200 hover:bg-slate-800 hover:text-gray-800'
          >
            <span>Sign Out</span>
            <ArrowRight className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};
