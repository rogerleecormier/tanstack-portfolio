import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DebugInfo {
  url: string;
  cookies: string[];
  cfHeaders: Record<string, string>;
  identityResponse: Record<string, unknown> | null;
  accessResponse: Record<string, unknown> | null;
  error?: string;
}

export const CloudflareAccessDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugChecks = async () => {
    setIsLoading(true);
    const info: DebugInfo = {
      url: window.location.href,
      cookies: [],
      cfHeaders: {},
      identityResponse: null,
      accessResponse: null,
    };

    try {
      // Check cookies
      info.cookies = document.cookie.split(';').map(c => c.trim());

      // Check Cloudflare headers
      const cfHeaders = [
        'CF-Connecting-IP',
        'CF-Ray',
        'CF-Visitor',
        'CF-IPCountry',
        'CF-Device-Type',
        'CF-Bot-Score',
        'CF-Request-ID'
      ];

             cfHeaders.forEach(header => {
         const metaValue = document.querySelector(`meta[name="${header}"]`)?.getAttribute('content');
         const windowValue = (window as unknown as Record<string, unknown>)[header];
         const value = metaValue || (typeof windowValue === 'string' ? windowValue : 'Not found');
         info.cfHeaders[header] = value;
       });

      // Test Cloudflare Access identity endpoint
      try {
        const identityResponse = await fetch('/cdn-cgi/access/get-identity', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        info.identityResponse = {
          status: identityResponse.status,
          statusText: identityResponse.statusText,
          ok: identityResponse.ok,
          headers: Object.fromEntries(identityResponse.headers.entries()),
          body: identityResponse.ok ? await identityResponse.json() : null,
        };
      } catch (error) {
        info.identityResponse = {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      // Test direct access to protected route
      try {
        const accessResponse = await fetch('/protected', {
          credentials: 'include',
          redirect: 'manual', // Don't follow redirects
        });
        
        info.accessResponse = {
          status: accessResponse.status,
          statusText: accessResponse.statusText,
          ok: accessResponse.ok,
          headers: Object.fromEntries(accessResponse.headers.entries()),
          redirected: accessResponse.redirected,
          type: accessResponse.type,
        };
      } catch (error) {
        info.accessResponse = {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

    } catch (error) {
      info.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  useEffect(() => {
    runDebugChecks();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const hasCfCookies = debugInfo?.cookies.some(cookie => 
    cookie.includes('CF_') || cookie.includes('cf_')
  );

  const isIdentityWorking = debugInfo?.identityResponse?.ok;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            <CardTitle>Cloudflare Access Debugger</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(!!hasCfCookies)}
              <div>
                <div className="font-medium">Cloudflare Cookies</div>
                <div className="text-sm text-gray-600">
                  {hasCfCookies ? 'Found' : 'Not found'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(!!isIdentityWorking)}
              <div>
                <div className="font-medium">Identity Endpoint</div>
                <div className="text-sm text-gray-600">
                  {isIdentityWorking ? 'Working' : 'Failed'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="font-medium">Environment</div>
                <div className="text-sm text-gray-600">
                  {window.location.hostname.includes('localhost') ? 'Development' : 'Production'}
                </div>
              </div>
            </div>
          </div>

          {/* Debug Button */}
          <div className="flex justify-center">
            <Button 
              onClick={runDebugChecks} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {isLoading ? 'Running Checks...' : 'Run Debug Checks'}
            </Button>
          </div>

          {/* Detailed Debug Info */}
          {debugInfo && (
            <div className="space-y-4">
              {/* URL Info */}
              <div>
                <h3 className="font-semibold mb-2">Current URL</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  {debugInfo.url}
                </div>
              </div>

              {/* Cookies */}
              <div>
                <h3 className="font-semibold mb-2">Cookies</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  {debugInfo.cookies.length > 0 ? (
                    debugInfo.cookies.map((cookie, index) => (
                      <div key={index} className="mb-1">
                        <span className={cookie.includes('CF_') ? 'text-blue-600 font-medium' : ''}>
                          {cookie}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No cookies found</div>
                  )}
                </div>
              </div>

              {/* Cloudflare Headers */}
              <div>
                <h3 className="font-semibold mb-2">Cloudflare Headers</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  {Object.entries(debugInfo.cfHeaders).map(([header, value]) => (
                    <div key={header} className="mb-1">
                      <span className="font-medium">{header}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Identity Response */}
              <div>
                <h3 className="font-semibold mb-2">Identity Endpoint Response</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(debugInfo.identityResponse, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Access Response */}
              <div>
                <h3 className="font-semibold mb-2">Protected Route Response</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(debugInfo.accessResponse, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Error Info */}
              {debugInfo.error && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Error</h3>
                  <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                    {debugInfo.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
