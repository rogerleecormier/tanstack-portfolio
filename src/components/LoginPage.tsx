import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { P } from './ui/typography';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth, isDevelopment } from '../hooks/useAuth';

interface LoginPageProps {
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const isDevMode = isDevelopment();

  const handleLogin = () => {
    setIsLoading(true);

    try {
      // Close the modal first
      onClose();

      // Use the authentication system
      login();
    } catch (error) {
      console.error('Error initiating login:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex w-full justify-center'>
      <Card className='w-full max-w-md border-hunter-200 shadow-xl'>
        <CardHeader className='space-y-3 text-center'>
          <div className='relative mx-auto'>
            <div className='flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-hunter-600 to-hunter-800 p-3 shadow-lg'>
              <img
                src='/header-logo.svg'
                alt='RCormier Logo'
                className='size-full object-contain'
                onError={e => {
                  console.error('Failed to load login logo:', e);
                  // Fallback to Target icon if logo fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              {/* Fallback Target icon (hidden by default) */}
              <Target className='hidden size-8 text-white' />
            </div>
            {/* Targeting indicator dots */}
            <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600'>
              <div className='size-2 rounded-full bg-white'></div>
            </div>
            <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-hunter-400 to-hunter-600'>
              <div className='size-1.5 rounded-full bg-white'></div>
            </div>
          </div>
          <CardTitle className='bg-gradient-to-r from-hunter-600 to-hunter-700 dark:from-hunter-500 dark:to-hunter-600 bg-clip-text text-2xl font-semibold text-transparent'>
            Roger Lee Cormier
          </CardTitle>
          <CardDescription className='text-slate-700 dark:text-slate-300'>
            Access your portfolio administration area
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4 text-center'>
            <P className='text-sm leading-relaxed text-slate-700 dark:text-slate-300'>
              Authenticate to access your portfolio administration area and
              private projects.
            </P>

            {/* Authentication Notice */}
            <div className='rounded-lg border border-hunter-300 bg-hunter-50 p-4 dark:border-hunter-700 dark:bg-hunter-950/50'>
              <div className='text-sm text-hunter-800 dark:text-hunter-100'>
                <strong className='font-semibold'>🔒 Secure Access:</strong>{' '}
                {isDevMode
                  ? 'Development mode authentication'
                  : 'Enterprise-grade Cloudflare Access protection'}
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className='w-full bg-hunter-600 text-white shadow-lg transition-all duration-200 hover:bg-hunter-700 hover:shadow-xl focus:ring-2 focus:ring-hunter-500 focus:ring-offset-2 disabled:opacity-50'
              size='lg'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {isDevMode
                      ? 'Access Administration'
                      : 'Sign In with Cloudflare Access'}
                  </span>
                  <ArrowRight className='ml-2 size-4' />
                </>
              )}
            </Button>
          </div>

          {/* Simplified Information */}
          <div className='rounded-lg border border-hunter-300 bg-hunter-50 p-4 dark:border-hunter-700 dark:bg-hunter-950/50'>
            <P className='text-xs text-hunter-800 dark:text-hunter-100'>
              <strong className='font-semibold'>What happens next:</strong>{' '}
              {isDevMode
                ? "You'll be authenticated and redirected to the administration area."
                : "You'll be redirected to Cloudflare Access to authenticate with Google or email PIN."}
            </P>
          </div>

          <div className='pt-2 text-center'>
            <Button
              variant='ghost'
              onClick={onClose}
              disabled={isLoading}
              className='text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
