import {
  AlertTriangle,
  CheckCircle,
  Mail,
  Settings,
  UserCheck,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import {
  useScrollToTopOnMount,
  useScrollToTopOnSuccess,
} from '../hooks/useScrollToTop';

// No props needed for this component

interface SubscriptionStatus {
  isActive: boolean;
  subscribedAt?: string;
  preferences?: {
    weeklyDigest: boolean;
    newPosts: boolean;
    specialOffers: boolean;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  subscription?: SubscriptionStatus;
}

const NewsletterPreferencesPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    success: boolean;
    subscription?: SubscriptionStatus;
  } | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [preferences, setPreferences] = useState({
    weeklyDigest: true,
    newPosts: true,
    specialOffers: false,
  });

  // Scroll to top when component mounts
  useScrollToTopOnMount();

  // Scroll to top after successful form submissions
  useScrollToTopOnSuccess(result?.success ?? false);

  const API_URL =
    'https://tanstack-portfolio-blog-subscription.rcormier.workers.dev';

  const makeRequest = async (
    action: string,
    data: Record<string, unknown> = {}
  ) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          email,
          ...data,
        }),
      });

      const result = (await response.json()) as ApiResponse;

      if (result.success) {
        setResult({
          message: result.message,
          success: true,
          ...(result.subscription && { subscription: result.subscription }),
        });

        if (action === 'check_status' && result.subscription) {
          setSubscriptionStatus(result.subscription);
          if (result.subscription.preferences) {
            setPreferences(result.subscription.preferences);
          }
        }

        if (action === 'update_preferences' && result.subscription) {
          setSubscriptionStatus(result.subscription);
          if (result.subscription.preferences) {
            setPreferences(result.subscription.preferences);
          }
        }

        if (action === 'subscribe' && result.subscription) {
          setSubscriptionStatus(result.subscription);
          if (result.subscription.preferences) {
            setPreferences(result.subscription.preferences);
          }
        }

        if (action === 'unsubscribe' && result.subscription) {
          setSubscriptionStatus(result.subscription);
          if (result.subscription.preferences) {
            setPreferences(result.subscription.preferences);
          }
        }
      } else {
        setResult({
          message: result.message,
          success: false,
        });
      }
    } catch (error) {
      setResult({
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = () => {
    if (!email) {
      setResult({
        message: 'Please enter your email address.',
        success: false,
      });
      return;
    }
    void makeRequest('check_status');
  };

  const handleUpdatePreferences = () => {
    if (!email) {
      setResult({
        message: 'Please enter your email address.',
        success: false,
      });
      return;
    }
    void makeRequest('update_preferences', { preferences });
  };

  const handleUnsubscribe = () => {
    if (!email) {
      setResult({
        message: 'Please enter your email address.',
        success: false,
      });
      return;
    }

    if (
      window.confirm(
        'Are you sure you want to unsubscribe from the newsletter?'
      )
    ) {
      void makeRequest('unsubscribe');
    }
  };

  const handleResubscribe = () => {
    if (!email) {
      setResult({
        message: 'Please enter your email address.',
        success: false,
      });
      return;
    }
    void makeRequest('subscribe', { name: '', preferences });
  };

  // Auto-fill email from URL parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-amber-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'>
      {/* Header with Administrative Theme - Newsletter Focused */}
      <div className='relative overflow-hidden border-b border-slate-200 dark:border-slate-800'>
        <div className='from-amber-600/3 via-slate-600/3 to-amber-600/3 dark:from-amber-400/8 dark:via-slate-400/8 dark:to-amber-400/8 absolute inset-0 bg-gradient-to-r'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Administrative Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-slate-600 shadow-lg'>
                  <Mail className='size-7 text-white' />
                </div>
                {/* Newsletter indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-amber-600'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-slate-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl'>
                  <span className='bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-400 dark:to-amber-300'>
                    Newsletter Preferences
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-amber-500 to-slate-500'></div>
              </div>
            </div>

            {/* Description with Preferences Language */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-gray-600 dark:text-slate-300'>
              Manage your subscription, update communication preferences, and
              control what content you receive
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-4xl'>
          {/* Main Content - Two Column Layout */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Left Column - Manage Subscription */}
            <Card className='h-full border-hunter-600/20 bg-slate-900/40 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-hunter-300'>
                  <Settings className='size-5' />
                  Manage Subscription
                </CardTitle>
                <CardDescription className='text-slate-400'>
                  Enter your email address to check your current status and
                  manage preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label
                    htmlFor='email'
                    className='mb-2 block text-sm font-medium text-slate-300'
                  >
                    Email Address
                  </label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email address'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='border-hunter-600/30 bg-slate-800 text-white placeholder-slate-500 focus:border-hunter-600/60 focus:ring-hunter-600/30'
                  />
                </div>

                {/* Preferences Section - Only show if subscribed or if no status checked yet */}
                {subscriptionStatus?.isActive && (
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium text-slate-300'>
                      Newsletter Preferences:
                    </h4>
                    <div className='space-y-2'>
                      <label className='flex cursor-pointer items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={preferences.weeklyDigest}
                          onChange={e =>
                            setPreferences(prev => ({
                              ...prev,
                              weeklyDigest: e.target.checked,
                            }))
                          }
                          className='rounded border-hunter-600/30 bg-slate-800 text-hunter-600 accent-hunter-600'
                        />
                        <span className='text-sm text-slate-300'>
                          Weekly Digest
                        </span>
                      </label>
                      <label className='flex cursor-pointer items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={preferences.newPosts}
                          onChange={e =>
                            setPreferences(prev => ({
                              ...prev,
                              newPosts: e.target.checked,
                            }))
                          }
                          className='rounded border-hunter-600/30 bg-slate-800 text-hunter-600 accent-hunter-600'
                        />
                        <span className='text-sm text-slate-300'>
                          New Blog Posts
                        </span>
                      </label>
                      <label className='flex cursor-pointer items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={preferences.specialOffers}
                          onChange={e =>
                            setPreferences(prev => ({
                              ...prev,
                              specialOffers: e.target.checked,
                            }))
                          }
                          className='rounded border-hunter-600/30 bg-slate-800 text-hunter-600 accent-hunter-600'
                        />
                        <span className='text-sm text-slate-300'>
                          Special Offers
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                <div className='flex flex-wrap gap-2'>
                  <Button
                    onClick={handleCheckStatus}
                    disabled={loading || !email}
                    className='min-w-[120px] flex-1 border-hunter-600/40 bg-transparent text-hunter-400 hover:border-hunter-600/60 hover:bg-hunter-600/10'
                  >
                    <UserCheck className='mr-2 size-4' />
                    Check Status
                  </Button>
                  {subscriptionStatus?.isActive && (
                    <Button
                      onClick={handleUpdatePreferences}
                      disabled={loading || !email}
                      className='min-w-[120px] flex-1 border-hunter-600/40 bg-transparent text-hunter-400 hover:border-hunter-600/60 hover:bg-hunter-600/10'
                    >
                      <Settings className='mr-2 size-4' />
                      Update Preferences
                    </Button>
                  )}
                </div>

                <Separator className='bg-hunter-600/20' />

                <div className='space-y-2'>
                  {/* Show Unsubscribe button only if subscribed */}
                  {subscriptionStatus?.isActive && (
                    <Button
                      onClick={handleUnsubscribe}
                      disabled={loading || !email}
                      className='w-full border-red-600/40 bg-transparent text-red-400 hover:border-red-600/60 hover:bg-red-600/10'
                    >
                      <XCircle className='mr-2 size-4' />
                      Unsubscribe
                    </Button>
                  )}

                  {/* Show Resubscribe button only if unsubscribed */}
                  {subscriptionStatus && !subscriptionStatus.isActive && (
                    <Button
                      onClick={handleResubscribe}
                      disabled={loading || !email}
                      className='w-full bg-gradient-to-r from-hunter-600 to-hunter-500 text-white hover:from-hunter-500 hover:to-hunter-400'
                    >
                      <CheckCircle className='mr-2 size-4' />
                      Resubscribe
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - About Our Newsletter */}
            <Card className='h-full border-hunter-600/20 bg-slate-900/40 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-hunter-300'>
                  <Mail className='size-5' />
                  About Our Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <h4 className='font-medium text-white'>
                    What You'll Receive:
                  </h4>
                  <ul className='space-y-2 text-sm text-slate-300'>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-hunter-500'></div>
                      <span>Weekly insights on technology leadership</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-hunter-500'></div>
                      <span>Notifications for new blog posts</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-hunter-500'></div>
                      <span>Practical DevOps and strategy tips</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-hunter-500'></div>
                      <span>Industry trends and analysis</span>
                    </li>
                  </ul>
                </div>

                <Separator className='bg-hunter-600/20' />

                <div className='rounded-lg bg-hunter-600/10 p-3 text-sm text-slate-300'>
                  <p>
                    You can manage your preferences anytime or unsubscribe at
                    any time. We respect your inbox and only send valuable,
                    relevant content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Status - Full Width Below, Only Shows After Interaction */}
          {subscriptionStatus && (
            <div className='mt-6'>
              <Card className='border-hunter-600/20 bg-slate-900/40 backdrop-blur-sm'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-hunter-300'>
                    <UserCheck className='size-5' />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='flex items-center justify-between rounded-lg bg-hunter-600/10 p-3'>
                      <span className='text-sm font-medium text-slate-300'>
                        Status:
                      </span>
                      <Badge
                        className={
                          subscriptionStatus.isActive
                            ? 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300'
                            : 'border-red-600/40 bg-red-600/15 text-red-300'
                        }
                      >
                        {subscriptionStatus.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {subscriptionStatus.subscribedAt && (
                      <div className='flex items-center justify-between rounded-lg bg-hunter-600/10 p-3'>
                        <span className='text-sm font-medium text-slate-300'>
                          Subscribed:
                        </span>
                        <span className='text-sm text-slate-400'>
                          {new Date(
                            subscriptionStatus.subscribedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {subscriptionStatus.preferences && (
                      <div className='rounded-lg bg-hunter-600/10 p-3 md:col-span-2 lg:col-span-1'>
                        <span className='mb-3 block text-sm font-medium text-slate-300'>
                          Preferences:
                        </span>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-slate-400'>
                              Weekly Digest
                            </span>
                            <Badge
                              className={
                                subscriptionStatus.preferences.weeklyDigest
                                  ? 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300'
                                  : 'border-red-600/40 bg-red-600/15 text-red-300'
                              }
                            >
                              {subscriptionStatus.preferences.weeklyDigest
                                ? 'On'
                                : 'Off'}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-slate-400'>
                              New Posts
                            </span>
                            <Badge
                              className={
                                subscriptionStatus.preferences.newPosts
                                  ? 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300'
                                  : 'border-red-600/40 bg-red-600/15 text-red-300'
                              }
                            >
                              {subscriptionStatus.preferences.newPosts
                                ? 'On'
                                : 'Off'}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-slate-400'>
                              Special Offers
                            </span>
                            <Badge
                              className={
                                subscriptionStatus.preferences.specialOffers
                                  ? 'border-hunter-600/40 bg-hunter-600/15 text-hunter-300'
                                  : 'border-red-600/40 bg-red-600/15 text-red-300'
                              }
                            >
                              {subscriptionStatus.preferences.specialOffers
                                ? 'On'
                                : 'Off'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Result Messages */}
          {result && (
            <div className='mt-6'>
              <Alert
                className={
                  result.success
                    ? 'border-hunter-600/20 bg-hunter-600/10'
                    : 'border-red-600/20 bg-red-600/10'
                }
              >
                {result.success ? (
                  <CheckCircle className='size-4 text-hunter-400' />
                ) : (
                  <AlertTriangle className='size-4 text-red-400' />
                )}
                <AlertDescription
                  className={
                    result.success ? 'text-hunter-300' : 'text-red-300'
                  }
                >
                  {result.message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className='mt-6 text-center'>
              <div className='inline-flex items-center gap-2 text-slate-400'>
                <div className='size-4 animate-spin rounded-full border-b-2 border-hunter-600'></div>
                Processing...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPreferencesPage;
