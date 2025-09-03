import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CloudflareIdentity {
  email?: string;
  name?: string;
  sub?: string;
  user_uuid?: string;
  given_name?: string;
  family_name?: string;
}

interface DebugResult {
  endpoint: string;
  status: number;
  statusText: string;
  response?: CloudflareIdentity;
  error?: string;
  cookies: string[];
  timestamp: Date;
}

export default function CloudflareDebugPage() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cookies, setCookies] = useState<string[]>([]);

  useEffect(() => {
    // Get current cookies on page load
    const allCookies = document.cookie.split(';').map(c => c.trim());
    const cfCookies = allCookies.filter(cookie => 
      cookie.startsWith('CF_') || cookie.startsWith('cf_')
    );
    setCookies(cfCookies);
  }, []);

  const testEndpoint = async (endpoint: string): Promise<DebugResult> => {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const result: DebugResult = {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        cookies: document.cookie.split(';').map(c => c.trim()).filter(cookie => 
          cookie.startsWith('CF_') || cookie.startsWith('cf_')
        ),
        timestamp: new Date()
      };

      if (response.ok) {
        try {
          const data = await response.json();
          result.response = data;
        } catch (parseError) {
          result.error = `Failed to parse JSON: ${parseError}`;
        }
      } else {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      return result;
    } catch (error) {
      return {
        endpoint,
        status: 0,
        statusText: 'Network Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        cookies: document.cookie.split(';').map(c => c.trim()).filter(cookie => 
          cookie.startsWith('CF_') || cookie.startsWith('cf_')
        ),
        timestamp: new Date()
      };
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    const newResults: DebugResult[] = [];

    // Test Cloudflare Access endpoints
    const endpoints = [
      '/cdn-cgi/access/get-identity',
      '/cdn-cgi/access/login',
      '/cdn-cgi/access/logout'
    ];

    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      newResults.push(result);
      setResults([...newResults]); // Update UI progressively
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusBadge = (status: number) => {
    if (status === 0) return <Badge variant="destructive">Network Error</Badge>;
    if (status >= 200 && status < 300) return <Badge variant="default">Success</Badge>;
    if (status >= 400 && status < 500) return <Badge variant="destructive">Client Error</Badge>;
    if (status >= 500) return <Badge variant="destructive">Server Error</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Cloudflare Access Debug
          </CardTitle>
          <CardDescription>
            Diagnostic tool for Cloudflare Access configuration issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Cookies */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Cloudflare Cookies</h3>
            {cookies.length > 0 ? (
              <div className="space-y-2">
                {cookies.map((cookie, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {cookie}
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No Cloudflare cookies found. This may indicate that Cloudflare Access is not properly configured.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={isLoading}>
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-mono">{result.endpoint}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        <span className="text-sm text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Status:</strong> {result.status} {result.statusText}
                      </div>
                      
                      {result.error && (
                        <div className="text-sm text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}

                      {result.response && (
                        <div className="text-sm">
                          <strong>Response:</strong>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </div>
                      )}

                      {result.cookies.length > 0 && (
                        <div className="text-sm">
                          <strong>Cookies after request:</strong>
                          <div className="mt-1 space-y-1">
                            {result.cookies.map((cookie, cookieIndex) => (
                              <div key={cookieIndex} className="font-mono bg-gray-100 p-1 rounded text-xs">
                                {cookie}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Troubleshooting Guide */}
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Troubleshooting Guide</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>400 Bad Request:</strong> Usually means the domain is not configured in Cloudflare Access or Access policies are missing.
              </div>
              <div>
                <strong>403 Forbidden:</strong> Domain is configured but user is not authenticated or policy blocks access.
              </div>
              <div>
                <strong>404 Not Found:</strong> Cloudflare Access is not enabled for this domain.
              </div>
              <div>
                <strong>No Cookies:</strong> Check if your domain is properly proxied through Cloudflare (orange cloud icon).
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
