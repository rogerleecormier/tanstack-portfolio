import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import {
  Shield,
  ArrowRight,
  Loader2,
  Lock,
  UserCheck,
  AlertTriangle,
  Clock,
  Info,
} from 'lucide-react';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback: FallbackComponent,
}) => {
  const {
    isAuthenticated,
    isLoading,
    isDevelopment,
    login,
    error,
    remainingAttempts,
    isLockedOut,
    sessionTimeRemaining,
  } = useAuth();

  // Debug: Log when component mounts to test console
  React.useEffect(() => {
    logger.debug('ProtectedRoute: Component mounted', {
      isAuthenticated,
      isLoading,
      isDevelopment,
      userAgent: navigator.userAgent,
    });
  }, [isAuthenticated, isLoading, isDevelopment]);

  // Log access attempts for observability
  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        logger.info('ProtectedRoute: Authorized access granted', {
          isDevelopment,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.warn('ProtectedRoute: Unauthorized access attempt', {
          isDevelopment,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [isAuthenticated, isLoading, isDevelopment]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='mx-auto mb-4 size-12 animate-spin text-strategy-gold' />
          <p className='text-strategy-gold'>
            {isDevelopment
              ? 'Verifying development authentication...'
              : 'Authenticating with Cloudflare Access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md border-border-subtle bg-surface-elevated/50 shadow-lg'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 w-fit rounded-full border-2 border-border-subtle bg-surface-elevated p-3'>
              <Shield className='size-8 text-strategy-gold-dark' />
            </div>
            <CardTitle className='text-xl text-surface-deep'>
              Portfolio Access Required
            </CardTitle>
            <CardDescription className='text-slate-600'>
              {isDevelopment
                ? 'This content requires development authentication'
                : 'This content requires Cloudflare Access authentication'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-center'>
            {/* Security Status Display */}
            {isDevelopment && (
              <div className='rounded-lg border border-border-subtle bg-surface-elevated p-4 text-left'>
                <div className='mb-2 flex items-center space-x-2'>
                  <Shield className='size-4 text-strategy-gold' />
                  <span className='font-medium text-precision-charcoal-light'>
                    Security Status
                  </span>
                </div>

                {/* Rate Limiting Status */}
                {isLockedOut && (
                  <div className='mb-2 flex items-center space-x-2 text-red-600'>
                    <AlertTriangle className='size-4' />
                    <span className='text-sm font-medium'>
                      Account Temporarily Locked
                    </span>
                  </div>
                )}

                {/* Remaining Attempts */}
                <div className='mb-2 text-sm text-strategy-gold-dark'>
                  <span className='font-medium'>Login Attempts Remaining:</span>{' '}
                  {remainingAttempts}
                </div>

                {/* Session Timeout Info */}
                {sessionTimeRemaining > 0 && (
                  <div className='flex items-center space-x-2 text-sm text-strategy-gold'>
                    <Clock className='size-4' />
                    <span>
                      Session Timeout: {Math.ceil(sessionTimeRemaining / 60000)}{' '}
                      minutes
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-left'>
                <div className='mb-2 flex items-center space-x-2'>
                  <AlertTriangle className='size-4 text-red-600' />
                  <span className='font-medium text-red-800'>
                    Authentication Error
                  </span>
                </div>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            )}

            <div className='rounded-lg border border-border-subtle bg-surface-elevated p-4 text-left'>
              <div className='mb-2 flex items-center space-x-2'>
                {isDevelopment ? (
                  <>
                    <UserCheck className='size-4 text-strategy-gold' />
                    <span className='font-medium text-precision-charcoal-light'>
                      Development Environment
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className='size-4 text-strategy-gold' />
                    <span className='font-medium text-precision-charcoal-light'>
                      Production Security
                    </span>
                  </>
                )}
              </div>
              <p className='text-sm text-strategy-gold-dark'>
                {isDevelopment
                  ? 'You are running in development mode. Click the button below to simulate authentication and access the administration area.'
                  : "This page is protected by Cloudflare Access. You'll need to authenticate using your Google SSO credentials to access the administration area."}
              </p>

              {/* Mobile Edge specific instructions */}
              {!isDevelopment &&
                (() => {
                  const isMobile =
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                      navigator.userAgent
                    );
                  const isEdge = /Edge/i.test(navigator.userAgent);

                  if (isMobile && isEdge) {
                    return (
                      <div className='mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3'>
                        <div className='mb-2 flex items-center space-x-2'>
                          <Info className='size-4 text-slate-600' />
                          <span className='font-medium text-slate-800'>
                            Mobile Edge Browser
                          </span>
                        </div>
                        <p className='text-xs text-slate-700'>
                          If the authentication doesn't work, try:
                        </p>
                        <ul className='mt-1 list-inside list-disc space-y-1 text-xs text-slate-700'>
                          <li>Allow popups for this site</li>
                          <li>Try refreshing the page</li>
                          <li>Check if you're already logged into Google</li>
                          <li>Use a different browser if available</li>
                        </ul>
                      </div>
                    );
                  }
                  return null;
                })()}
            </div>

            <Button
              onClick={login}
              disabled={isLockedOut}
              className='flex w-full items-center justify-center space-x-2 bg-strategy-gold hover:bg-strategy-gold-dark focus:ring-2 focus:ring-surface-elevated0 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <span>
                {isDevelopment
                  ? isLockedOut
                    ? 'Account Locked'
                    : 'Simulate Authentication'
                  : 'Authenticate with Google'}
              </span>
              {!isLockedOut && <ArrowRight className='size-4' />}
            </Button>

            {isDevelopment && (
              <div className='text-xs text-strategy-gold'>
                {isLockedOut
                  ? 'Too many failed attempts. Please wait before trying again.'
                  : 'This simulates authentication for development purposes only.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
