import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';
import { getCloudflareAccessStatus, isCloudflareAccessAvailable } from '../utils/cloudflareAuth';

export const CloudflareStatusChecker: React.FC = () => {
  const [status, setStatus] = useState(getCloudflareAccessStatus());
  const [isChecking, setIsChecking] = useState(false);
  const [endpointStatus, setEndpointStatus] = useState<boolean | null>(null);

  const checkEndpoint = async () => {
    setIsChecking(true);
    try {
      const available = await isCloudflareAccessAvailable();
      setEndpointStatus(available);
      setStatus(getCloudflareAccessStatus());
    } catch (error) {
      console.error('Error checking endpoint:', error);
      setEndpointStatus(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkEndpoint();
  }, []);

  const getStatusIcon = () => {
    if (status.isAvailable) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (status.isConfigured) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  const getStatusColor = () => {
    if (status.isAvailable) return 'text-green-800';
    if (status.isConfigured) return 'text-yellow-800';
    return 'text-red-800';
  };

  const getStatusBg = () => {
    if (status.isAvailable) return 'bg-green-50 border-green-200';
    if (status.isConfigured) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="h-6 w-6" />
          <span>Cloudflare Access Status</span>
        </CardTitle>
        <CardDescription>
          Current authentication system status and configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className={`p-4 rounded-lg border ${getStatusBg()}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className={`font-medium ${getStatusColor()}`}>
                {status.isAvailable ? 'Fully Configured' : 
                 status.isConfigured ? 'Partially Configured' : 'Not Configured'}
              </h3>
              <p className={`text-sm ${getStatusColor()}`}>
                {status.message}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Domain Configuration</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Current Domain:</span>
                <span className="font-mono">{window.location.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Domain:</span>
                <span className="font-mono">rcormier.dev</span>
              </div>
              <div className="flex justify-between">
                <span>Is Configured:</span>
                <span className={status.isConfigured ? 'text-green-600' : 'text-red-600'}>
                  {status.isConfigured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Endpoint Status</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Login Endpoint:</span>
                <span className="font-mono">/cdn-cgi/access/login</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={endpointStatus === null ? 'text-gray-500' : 
                               endpointStatus ? 'text-green-600' : 'text-red-600'}>
                  {endpointStatus === null ? 'Checking...' : 
                   endpointStatus ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button 
            onClick={checkEndpoint} 
            disabled={isChecking}
            variant="outline"
            className="flex-1"
          >
            {isChecking ? 'Checking...' : 'Recheck Status'}
          </Button>
          
          <Button 
            asChild 
            className="flex-1"
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
        {!status.isAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
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
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <a href="/CLOUDFLARE_SETUP.md" target="_blank">
                  View Detailed Setup Guide
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
