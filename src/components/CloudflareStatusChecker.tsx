import {
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { environment } from '../config/environment';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { H3, P } from './ui/typography';

interface StatusDetails {
  cookies: {
    all: string;
    cfAuth: boolean;
    cfAccessJWT: boolean;
    cfAccessEmail: boolean;
    cfAccessIdentity: boolean;
    cfAccessUser: boolean;
    cfAccessUserEmail: boolean;
    cfAccessUserName: boolean;
    cfAccessUserUUID: boolean;
    cfAccessUserPattern: boolean;
    cfAccessIdentityPattern: boolean;
  };
  localStorage: {
    storedUser: string | null;
    accessToken: string | null;
  };
  urlParams: {
    cfAccessMessage: boolean;
    cfAccessRedirect: boolean;
    accessToken: boolean;
    userEmail: boolean;
  };
  identityEndpoint: {
    success: boolean;
    data?: Record<string, unknown>;
    status?: number;
    statusText?: string;
    error?: string;
  } | null;
  timestamp: string;
  message?: string;
  error?: string;
}

export const CloudflareStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<
    'checking' | 'connected' | 'disconnected' | 'error'
  >('checking');
  const [details, setDetails] = useState<StatusDetails | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const checkStatus = async () => {
    setStatus('checking');
    try {
      // Check if we're in production
      if (!environment.isProduction()) {
        setStatus('disconnected');
        setDetails({
          cookies: {
            all: '',
            cfAuth: false,
            cfAccessJWT: false,
            cfAccessEmail: false,
            cfAccessIdentity: false,
            cfAccessUser: false,
            cfAccessUserEmail: false,
            cfAccessUserName: false,
            cfAccessUserUUID: false,
            cfAccessUserPattern: false,
            cfAccessIdentityPattern: false,
          },
          localStorage: { storedUser: null, accessToken: null },
          urlParams: {
            cfAccessMessage: false,
            cfAccessRedirect: false,
            accessToken: false,
            userEmail: false,
          },
          identityEndpoint: null,
          timestamp: new Date().toISOString(),
          message: 'Not in production mode',
        });
        return;
      }

      // Check for Cloudflare Access cookies
      const cookies = document.cookie;
      const cookieDetails = {
        all: cookies,
        cfAuth: cookies.includes('CF_Authorization'),
        cfAccessJWT: cookies.includes('CF_Access_JWT'),
        cfAccessEmail: cookies.includes('CF_Access_Email'),
        cfAccessIdentity: cookies.includes('CF_Access_Identity'),
        cfAccessUser: cookies.includes('CF_Access_User'),
        cfAccessUserEmail: cookies.includes('CF_Access_User_Email'),
        cfAccessUserName: cookies.includes('CF_Access_User_Name'),
        cfAccessUserUUID: cookies.includes('CF_Access_User_UUID'),
        cfAccessUserPattern: cookies.includes('CF_Access_User_'),
        cfAccessIdentityPattern: cookies.includes('CF_Access_Identity_'),
      };

      // Check for stored user data
      const storedUser = localStorage.getItem('cf_user');
      const accessToken = localStorage.getItem('cf_access_token');

      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlDetails = {
        cfAccessMessage: urlParams.has('__cf_access_message'),
        cfAccessRedirect: urlParams.has('__cf_access_redirect'),
        accessToken: urlParams.has('access_token'),
        userEmail: urlParams.has('user_email'),
      };

      // Try to fetch from identity endpoint
      let identityEndpoint = null;
      try {
        const response = await fetch('/cdn-cgi/access/get-identity', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = (await response.json()) as Record<string, unknown>;
          identityEndpoint = { success: true, data };
        } else {
          identityEndpoint = {
            success: false,
            status: response.status,
            statusText: response.statusText,
          };
        }
      } catch (error) {
        identityEndpoint = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      const allDetails = {
        cookies: cookieDetails,
        localStorage: { storedUser, accessToken },
        urlParams: urlDetails,
        identityEndpoint,
        timestamp: new Date().toISOString(),
      };

      setDetails(allDetails);

      // Determine status based on evidence
      const hasAuthEvidence =
        cookieDetails.cfAuth ||
        cookieDetails.cfAccessJWT ||
        cookieDetails.cfAccessEmail ||
        cookieDetails.cfAccessIdentity ||
        cookieDetails.cfAccessUser ||
        cookieDetails.cfAccessUserEmail ||
        cookieDetails.cfAccessUserName ||
        cookieDetails.cfAccessUserUUID ||
        (storedUser ?? false) ||
        urlDetails.accessToken ||
        urlDetails.userEmail;

      if (hasAuthEvidence) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('error');
      setDetails({
        cookies: {
          all: '',
          cfAuth: false,
          cfAccessJWT: false,
          cfAccessEmail: false,
          cfAccessIdentity: false,
          cfAccessUser: false,
          cfAccessUserEmail: false,
          cfAccessUserName: false,
          cfAccessUserUUID: false,
          cfAccessUserPattern: false,
          cfAccessIdentityPattern: false,
        },
        localStorage: { storedUser: null, accessToken: null },
        urlParams: {
          cfAccessMessage: false,
          cfAccessRedirect: false,
          accessToken: false,
          userEmail: false,
        },
        identityEndpoint: null,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className='size-6 text-green-600' />;
      case 'disconnected':
        return <XCircle className='size-6 text-red-600' />;
      case 'error':
        return <AlertTriangle className='size-6 text-yellow-600' />;
      default:
        return <RefreshCw className='size-6 animate-spin text-hunter-600' />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Cloudflare Access Connected';
      case 'disconnected':
        return 'Cloudflare Access Disconnected';
      case 'error':
        return 'Error Checking Status';
      default:
        return 'Checking Status...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'error':
        return 'text-yellow-600';
      default:
        return 'text-hunter-600';
    }
  };

  if (!environment.isProduction()) {
    return null;
  }

  return (
    <Card className='mx-auto w-full max-w-4xl border-hunter-200 shadow-lg'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Shield className='size-6 text-hunter-600' />
          <CardTitle className='text-xl font-bold text-hunter-900'>
            System Status & Security
          </CardTitle>
        </div>
        <CardDescription className='text-slate-600'>
          Monitor your Cloudflare Access authentication status
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Status Display */}
        <div className='flex items-center justify-center space-x-3 rounded-lg border border-hunter-200 bg-hunter-50 p-4'>
          {getStatusIcon()}
          <span className={`text-lg font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center space-x-3'>
          <Button
            onClick={() => void checkStatus()}
            disabled={status === 'checking'}
            className='bg-hunter-600 hover:bg-hunter-700 focus:ring-2 focus:ring-hunter-500 focus:ring-offset-2'
          >
            <RefreshCw
              className={`mr-2 size-4 ${status === 'checking' ? 'animate-spin' : ''}`}
            />
            Refresh Status
          </Button>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant='outline'
            className='border-hunter-300 text-hunter-700 hover:bg-hunter-50'
          >
            <Info className='mr-2 size-4' />
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        {/* Detailed Information */}
        {isExpanded && details && (
          <div className='space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <H3 className='font-semibold text-gray-800'>
              Detailed Status Information
            </H3>

            {/* Cookies Section */}
            <div className='space-y-2'>
              <P className='font-semibold text-gray-700'>
                Authentication Cookies:
              </P>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div className='flex items-center space-x-2'>
                  <span
                    className={`size-3 rounded-full ${details.cookies?.cfAuth ? 'bg-green-500' : 'bg-red-500'}`}
                  ></span>
                  <span>
                    CF_Authorization: {details.cookies?.cfAuth ? '✅' : '❌'}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span
                    className={`size-3 rounded-full ${details.cookies?.cfAccessUserEmail ? 'bg-green-500' : 'bg-red-500'}`}
                  ></span>
                  <span>
                    CF_Access_User_Email:{' '}
                    {details.cookies?.cfAccessUserEmail ? '✅' : '❌'}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span
                    className={`size-3 rounded-full ${details.cookies?.cfAccessIdentity ? 'bg-green-500' : 'bg-red-500'}`}
                  ></span>
                  <span>
                    CF_Access_Identity:{' '}
                    {details.cookies?.cfAccessIdentity ? '✅' : '❌'}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span
                    className={`size-3 rounded-full ${details.cookies?.cfAccessUser ? 'bg-green-500' : 'bg-red-500'}`}
                  ></span>
                  <span>
                    CF_Access_User:{' '}
                    {details.cookies?.cfAccessUser ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* Local Storage Section */}
            <div className='space-y-2'>
              <P className='font-semibold text-gray-700'>Local Storage:</P>
              <div className='space-y-1 text-sm'>
                <div>
                  Stored User: {details.localStorage?.storedUser ? '✅' : '❌'}
                </div>
                <div>
                  Access Token:{' '}
                  {details.localStorage?.accessToken ? '✅' : '❌'}
                </div>
              </div>
            </div>

            {/* URL Parameters Section */}
            <div className='space-y-2'>
              <P className='font-semibold text-gray-700'>URL Parameters:</P>
              <div className='space-y-1 text-sm'>
                <div>
                  CF Access Message:{' '}
                  {details.urlParams?.cfAccessMessage ? '✅' : '❌'}
                </div>
                <div>
                  CF Access Redirect:{' '}
                  {details.urlParams?.cfAccessRedirect ? '✅' : '❌'}
                </div>
                <div>
                  Access Token: {details.urlParams?.accessToken ? '✅' : '❌'}
                </div>
                <div>
                  User Email: {details.urlParams?.userEmail ? '✅' : '❌'}
                </div>
              </div>
            </div>

            {/* Identity Endpoint Section */}
            <div className='space-y-2'>
              <P className='font-semibold text-gray-700'>Identity Endpoint:</P>
              <div className='text-sm'>
                {details.identityEndpoint?.success ? (
                  <div className='text-green-700'>
                    ✅ Success:{' '}
                    {JSON.stringify(details.identityEndpoint.data, null, 2)}
                  </div>
                ) : (
                  <div className='text-red-700'>
                    ❌ Failed:{' '}
                    {JSON.stringify(details.identityEndpoint, null, 2)}
                  </div>
                )}
              </div>
            </div>

            {/* Raw Cookie Data */}
            <div className='space-y-2'>
              <P className='font-semibold text-gray-700'>All Cookies:</P>
              <div className='overflow-x-auto rounded border border-gray-300 bg-white p-2 font-mono text-xs'>
                {details.cookies?.all || 'No cookies found'}
              </div>
            </div>

            {/* Timestamp */}
            <div className='text-center text-xs text-gray-500'>
              Last checked: {details.timestamp}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
