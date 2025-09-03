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
  const [authState, setAuthState] = useState<any>(null);

  useEffect(() => {
    // Get current cookies on page load
    const allCookies = document.cookie.split(';').map(c => c.trim());
    const cfCookies = allCookies.filter(cookie => 
      cookie.startsWith('CF_') || cookie.startsWith('cf_')
    );
    
    console.log('🔍 Cookie Debug Info:', {
      rawCookieString: document.cookie,
      allCookies: allCookies,
      cfCookies: cfCookies,
      documentDomain: document.domain,
      currentUrl: window.location.href,
      hasCookies: !!document.cookie
    });
    
    setCookies(cfCookies);
    
    // Also check auth state on page load
    checkAuthState();
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

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking authentication state...');
      
      // Test the identity endpoint to see if user is already authenticated
      const response = await fetch('/cdn-cgi/access/get-identity', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      const authInfo: any = {
        status: response.status,
        statusText: response.statusText,
        isAuthenticated: response.ok,
        timestamp: new Date().toISOString(),
        cookies: document.cookie.split(';').map(c => c.trim()).filter(cookie => 
          cookie.startsWith('CF_') || cookie.startsWith('cf_')
        ),
        allCookies: document.cookie.split(';').map(c => c.trim())
      };

      if (response.ok) {
        try {
          const identity = await response.json();
          authInfo.identity = identity;
          console.log('✅ User is authenticated:', identity);
        } catch (parseError) {
          console.log('⚠️ Response OK but not JSON:', parseError);
          authInfo.parseError = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        }
      } else {
        console.log('❌ User not authenticated:', response.status, response.statusText);
      }

      setAuthState(authInfo);
      console.log('🔍 Auth state check complete:', authInfo);
      
    } catch (error) {
      const errorInfo = {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        cookies: document.cookie.split(';').map(c => c.trim()).filter(cookie => 
          cookie.startsWith('CF_') || cookie.startsWith('cf_')
        ),
        allCookies: document.cookie.split(';').map(c => c.trim())
      };
      setAuthState(errorInfo);
      console.log('❌ Auth state check failed:', errorInfo);
    }
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
            <h3 className="text-lg font-semibold mb-2">Cookie Analysis</h3>
            
            {/* All Cookies */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">All Cookies ({document.cookie.split(';').length})</h4>
              {document.cookie ? (
                <div className="space-y-2">
                  {document.cookie.split(';').map((cookie, index) => (
                    <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded border">
                      {cookie.trim()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No cookies found</div>
              )}
            </div>

            {/* Cloudflare Cookies */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Cloudflare Cookies ({cookies.length})</h4>
              {cookies.length > 0 ? (
                <div className="space-y-2">
                  {cookies.map((cookie, index) => (
                    <div key={index} className="text-sm font-mono bg-blue-50 p-2 rounded border border-blue-200">
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

            {/* Cookie Debug Info */}
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div><strong>Raw cookie string:</strong> <code className="bg-white px-1 rounded">{document.cookie || 'empty'}</code></div>
              <div><strong>Cookie count:</strong> {document.cookie.split(';').filter(c => c.trim()).length}</div>
              <div><strong>Has cookies:</strong> {document.cookie ? 'Yes' : 'No'}</div>
              <div><strong>Document domain:</strong> {document.domain}</div>
              <div><strong>Current URL:</strong> {window.location.href}</div>
            </div>

            {/* Storage Debug */}
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Storage Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local Storage */}
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium mb-2">Local Storage</div>
                  {Object.keys(localStorage).length > 0 ? (
                    <div className="space-y-1">
                      {Object.keys(localStorage).map(key => (
                        <div key={key} className="text-xs">
                          <strong>{key}:</strong> {localStorage.getItem(key)?.substring(0, 50)}...
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Empty</div>
                  )}
                </div>

                {/* Session Storage */}
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium mb-2">Session Storage</div>
                  {Object.keys(sessionStorage).length > 0 ? (
                    <div className="space-y-1">
                      {Object.keys(sessionStorage).map(key => (
                        <div key={key} className="text-xs">
                          <strong>{key}:</strong> {sessionStorage.getItem(key)?.substring(0, 50)}...
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Empty</div>
                  )}
                </div>
              </div>
            </div>
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
                         <Button 
               variant="outline" 
               onClick={() => {
                 const allCookies = document.cookie.split(';').map(c => c.trim());
                 const cfCookies = allCookies.filter(cookie => 
                   cookie.startsWith('CF_') || cookie.startsWith('cf_')
                 );
                 setCookies(cfCookies);
                 console.log('🔄 Refreshed cookies:', { allCookies, cfCookies });
               }}
             >
               🔄 Refresh Cookies
             </Button>
             <Button 
               variant="outline" 
               onClick={checkAuthState}
             >
               🔐 Check Auth State
             </Button>
             <Button 
               variant="outline" 
               onClick={() => {
                 console.log('🔄 Testing login redirect...');
                 window.location.href = '/cdn-cgi/access/login?redirect_url=' + encodeURIComponent(window.location.href);
               }}
             >
               🔑 Test Login Redirect
             </Button>
             <Button 
               variant="outline" 
               onClick={() => {
                 console.log('🔄 Testing logout redirect...');
                 window.location.href = '/cdn-cgi/access/logout?returnTo=' + encodeURIComponent(window.location.href);
               }}
             >
               🚪 Test Logout Redirect
             </Button>
          </div>

          {/* Authentication State */}
          {authState && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Authentication State</h3>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Current Auth Status</CardTitle>
                    <div className="flex items-center gap-2">
                      {authState.isAuthenticated ? (
                        <Badge variant="default">✅ Authenticated</Badge>
                      ) : authState.error ? (
                        <Badge variant="destructive">❌ Error</Badge>
                      ) : (
                        <Badge variant="secondary">❌ Not Authenticated</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(authState.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Status:</strong> {authState.status} {authState.statusText}
                    </div>
                    
                    {authState.identity && (
                      <div className="text-sm">
                        <strong>User Identity:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(authState.identity, null, 2)}
                        </pre>
                      </div>
                    )}

                    {authState.error && (
                      <div className="text-sm text-red-600">
                        <strong>Error:</strong> {authState.error}
                      </div>
                    )}

                    {authState.parseError && (
                      <div className="text-sm text-orange-600">
                        <strong>Parse Error:</strong> {authState.parseError}
                      </div>
                    )}

                    <div className="text-sm">
                      <strong>Cloudflare Cookies:</strong> {authState.cookies?.length || 0}
                      {authState.cookies?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {authState.cookies.map((cookie: string, index: number) => (
                            <div key={index} className="font-mono bg-blue-50 p-1 rounded text-xs">
                              {cookie}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <strong>All Cookies:</strong> {authState.allCookies?.length || 0}
                      {authState.allCookies?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {authState.allCookies.map((cookie: string, index: number) => (
                            <div key={index} className="font-mono bg-gray-50 p-1 rounded text-xs">
                              {cookie}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
