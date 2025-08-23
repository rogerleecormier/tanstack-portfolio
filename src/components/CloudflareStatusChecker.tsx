import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { P, H3, H4 } from './ui/typography';
import { AlertTriangle, CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';
import { isDevelopment } from '../utils/cloudflareAuth';

export const CloudflareStatusChecker: React.FC = () => {
  const [endpointStatus, setEndpointStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkEndpoint = async () => {
    setIsChecking(true);
    try {
      // Check if Cloudflare Access login endpoint is available
      await fetch('/cdn-cgi/access/login', { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      });
      // If we get here, the endpoint exists
      setEndpointStatus(true);
    } catch (error) {
      console.error('Error checking endpoint:', error);
      setEndpointStatus(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!isDevelopment()) {
      checkEndpoint();
    }
  }, []);

  const getStatusIcon = () => {
    if (isDevelopment()) return <CheckCircle className="h-6 w-6 text-teal-600" />;
    if (endpointStatus === true) return <CheckCircle className="h-6 w-6 text-teal-600" />;
    if (endpointStatus === false) return <XCircle className="h-6 w-6 text-red-600" />;
    return <AlertTriangle className="h-6 w-6 text-amber-600" />;
  };

  const getStatusColor = () => {
    if (isDevelopment()) return 'text-teal-800';
    if (endpointStatus === true) return 'text-teal-800';
    if (endpointStatus === false) return 'text-red-800';
    return 'text-amber-800';
  };

  const getStatusBg = () => {
    if (isDevelopment()) return 'bg-teal-50 border-teal-200';
    if (endpointStatus === true) return 'bg-teal-50 border-teal-200';
    if (endpointStatus === false) return 'bg-red-50 border-red-200';
    return 'bg-amber-50 border-amber-200';
  };

  const getStatusMessage = () => {
    if (isDevelopment()) return 'Development mode - using simulated authentication';
    if (endpointStatus === true) return 'Cloudflare Access is properly configured and available';
    if (endpointStatus === false) return 'Cloudflare Access endpoint not responding - needs configuration';
    return 'Checking Cloudflare Access status...';
  };

  const getStatusTitle = () => {
    if (isDevelopment()) return 'Development Mode';
    if (endpointStatus === true) return 'Fully Configured';
    if (endpointStatus === false) return 'Not Configured';
    return 'Checking Status';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-teal-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-teal-900">
          <Info className="h-6 w-6 text-teal-600" />
          <span>Authentication System Status</span>
        </CardTitle>
        <CardDescription className="text-teal-700">
          Current authentication system status and configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className={`p-4 rounded-lg border ${getStatusBg()}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <H3 className={`font-medium ${getStatusColor()}`}>
                {getStatusTitle()}
              </H3>
              <P className={`text-sm ${getStatusColor()}`}>
                {getStatusMessage()}
              </P>
            </div>
          </div>
        </div>

        {/* Detailed Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <H4 className="font-medium text-teal-900">Environment</H4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-teal-700">Current Domain:</span>
                <span className="font-mono text-teal-900">{window.location.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700">Environment:</span>
                <span className={isDevelopment() ? 'text-teal-600' : 'text-teal-600'}>
                  {isDevelopment() ? 'Development' : 'Production'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700">Authentication:</span>
                <span className={isDevelopment() ? 'text-teal-600' : 'text-teal-600'}>
                  {isDevelopment() ? 'Simulated' : 'Cloudflare Access'}
                </span>
              </div>
            </div>
          </div>

          {!isDevelopment() && (
            <div className="space-y-2">
              <H4 className="font-medium text-teal-900">Cloudflare Access Status</H4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-teal-700">Login Endpoint:</span>
                  <span className="font-mono text-teal-900">/cdn-cgi/access/login</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-700">Status:</span>
                  <span className={endpointStatus === null ? 'text-teal-500' : 
                                 endpointStatus ? 'text-teal-600' : 'text-red-600'}>
                    {endpointStatus === null ? 'Checking...' : 
                     endpointStatus ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          {!isDevelopment() && (
            <Button 
              onClick={checkEndpoint} 
              disabled={isChecking}
              variant="outline"
              className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors duration-200"
            >
              {isChecking ? 'Checking...' : 'Recheck Status'}
            </Button>
          )}
          
          <Button 
            asChild 
            className="flex-1 bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
          >
            <a 
              href="https://dash.cloudflare.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2"
            >
              <span>Cloudflare Dashboard</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Setup Instructions */}
        {!isDevelopment() && endpointStatus === false && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <H4 className="font-medium text-teal-800 mb-2">Next Steps</H4>
            <ol className="text-sm text-teal-700 space-y-1 list-decimal list-inside">
              <li>Enable Cloudflare Zero Trust in your dashboard</li>
              <li>Configure One-Time PIN identity provider</li>
              <li>Create Zero Trust application for rcormier.dev</li>
              <li>Set up access policies (Bypass for public, Allow for protected)</li>
              <li>Test the configuration</li>
            </ol>
            <div className="mt-3">
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="text-teal-700 border-teal-300 hover:bg-teal-100 transition-colors duration-200"
              >
                <a href="/CLOUDFLARE_SETUP.md" target="_blank">
                  View Detailed Setup Guide
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Development Mode Info */}
        {isDevelopment() && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <H4 className="font-medium text-teal-800 mb-2">Development Mode</H4>
            <P className="text-sm text-teal-700 mb-2">
              You're currently running in development mode. Authentication is simulated for testing purposes.
            </P>
            <P className="text-sm text-teal-700">
              To test production authentication, deploy to rcormier.dev and configure Cloudflare Access.
            </P>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
