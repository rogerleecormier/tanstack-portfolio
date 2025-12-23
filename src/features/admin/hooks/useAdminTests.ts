/**
 * useAdminTests Hook
 *
 * Provides API connectivity testing functionality for the admin dashboard.
 * Extracted from SiteAdminPage.tsx for better modularity.
 */

import { useState } from 'react';
import { cachedContentService } from '@/api/cachedContentService';
import { testAIWorker } from '@/api/contactAnalyzer';

// Status types
export type TestStatus = 'idle' | 'testing' | 'success' | 'error';

// Result types
export interface APITestResult {
  success: boolean;
  status: number;
  statusText?: string;
  cors?: boolean;
  error?: string;
  details?: unknown;
}

export interface CloudflareAccessResult extends APITestResult {
  identity?: Record<string, unknown>;
  cookies?: string[];
  headers?: Record<string, string>;
}

export interface AdminTestStatus {
  ai: TestStatus;
  email: TestStatus;
  newsletter: TestStatus;
  contentSearch: TestStatus;
  healthBridge: TestStatus;
  smartRecommendations: TestStatus;
  r2Bucket: TestStatus;
  cloudflareAccess: TestStatus;
}

export interface AdminTestResults {
  ai?: APITestResult;
  email?: APITestResult;
  newsletter?: APITestResult;
  contentSearch?: APITestResult;
  healthBridge?: APITestResult;
  smartRecommendations?: APITestResult;
  r2Bucket?: APITestResult;
  cloudflareAccess?: CloudflareAccessResult;
}

export function useAdminTests(isDevelopment: boolean) {
  const [apiStatus, setApiStatus] = useState<AdminTestStatus>({
    ai: 'idle',
    email: 'idle',
    newsletter: 'idle',
    contentSearch: 'idle',
    healthBridge: 'idle',
    smartRecommendations: 'idle',
    r2Bucket: 'idle',
    cloudflareAccess: 'idle',
  });

  const [apiResults, setApiResults] = useState<AdminTestResults>({});

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
      await fetch(
        'https://tanstack-portfolio-email-worker.rcormier.workers.dev',
        {
          method: 'GET',
          mode: 'no-cors',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const result = {
        success: true,
        status: 200,
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
      await fetch(
        'https://tanstack-portfolio-blog-subscription.rcormier.workers.dev',
        {
          method: 'GET',
          mode: 'no-cors',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const result = {
        success: true,
        status: 200,
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
        cors: true,
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
      const allCookies = document.cookie.split(';').map(c => c.trim());
      const cfCookies = allCookies.filter(
        cookie => cookie.startsWith('CF_') || cookie.startsWith('cf_')
      );

      let identity = null as Record<string, unknown> | null;
      let status = 0;
      let statusText = '';

      if (isDevelopment) {
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
        const response = await fetch('/cdn-cgi/access/get-identity', {
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

      const result: CloudflareAccessResult = {
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

  return {
    apiStatus,
    apiResults,
    testAIWorkerConnectivity,
    testEmailWorkerConnectivity,
    testNewsletterWorkerConnectivity,
    testContentSearchWorkerConnectivity,
    testHealthBridgeAPI,
    testSmartRecommendationsAPI,
    testR2BucketConnectivity,
    testCloudflareAccess,
  };
}
