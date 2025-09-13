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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-4xl'>
          {/* Page Header */}
          <div className='mb-8 text-center'>
            <div className='mb-4 inline-flex size-20 items-center justify-center rounded-full bg-teal-100'>
              <Mail className='size-10 text-teal-600' />
            </div>
            <h1 className='mb-2 text-4xl font-bold text-slate-900'>
              Newsletter Preferences
            </h1>
            <p className='mx-auto max-w-2xl text-lg text-slate-600'>
              Manage your newsletter subscription, update preferences, or
              unsubscribe from our updates about technology leadership, DevOps,
              and strategic thinking.
            </p>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Left Column - Manage Subscription */}
            <Card className='h-full'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-teal-700'>
                  <Settings className='size-5' />
                  Manage Subscription
                </CardTitle>
                <CardDescription>
                  Enter your email address to check your current status and
                  manage preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label
                    htmlFor='email'
                    className='mb-2 block text-sm font-medium text-slate-700'
                  >
                    Email Address
                  </label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email address'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='w-full focus:border-teal-500 focus:ring-teal-500'
                  />
                </div>

                {/* Preferences Section - Only show if subscribed or if no status checked yet */}
                {subscriptionStatus?.isActive && (
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium text-slate-700'>
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
                          className='rounded border-teal-300 text-teal-600 focus:ring-teal-500'
                        />
                        <span className='text-sm text-slate-600'>
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
                          className='rounded border-teal-300 text-teal-600 focus:ring-teal-500'
                        />
                        <span className='text-sm text-slate-600'>
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
                          className='rounded border-teal-300 text-teal-600 focus:ring-teal-500'
                        />
                        <span className='text-sm text-slate-600'>
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
                    variant='outline'
                    className='min-w-[120px] flex-1 border-teal-200 text-teal-700 hover:border-teal-300 hover:bg-teal-50'
                  >
                    <UserCheck className='mr-2 size-4' />
                    Check Status
                  </Button>
                  {subscriptionStatus?.isActive && (
                    <Button
                      onClick={handleUpdatePreferences}
                      disabled={loading || !email}
                      variant='outline'
                      className='min-w-[120px] flex-1 border-teal-200 text-teal-700 hover:border-teal-300 hover:bg-teal-50'
                    >
                      <Settings className='mr-2 size-4' />
                      Update Preferences
                    </Button>
                  )}
                </div>

                <Separator className='bg-teal-200' />

                <div className='space-y-2'>
                  {/* Show Unsubscribe button only if subscribed */}
                  {subscriptionStatus?.isActive && (
                    <Button
                      onClick={handleUnsubscribe}
                      disabled={loading || !email}
                      variant='destructive'
                      className='w-full'
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
                      variant='default'
                      className='w-full bg-teal-600 hover:bg-teal-700'
                    >
                      <CheckCircle className='mr-2 size-4' />
                      Resubscribe
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - About Our Newsletter */}
            <Card className='h-full'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-teal-700'>
                  <Mail className='size-5' />
                  About Our Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <h4 className='font-medium text-slate-900'>
                    What You'll Receive:
                  </h4>
                  <ul className='space-y-2 text-sm text-slate-600'>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-teal-500'></div>
                      <span>Weekly insights on technology leadership</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-teal-500'></div>
                      <span>Notifications for new blog posts</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-teal-500'></div>
                      <span>Practical DevOps and strategy tips</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-2 size-1.5 shrink-0 rounded-full bg-teal-500'></div>
                      <span>Industry trends and analysis</span>
                    </li>
                  </ul>
                </div>

                <Separator className='bg-teal-200' />

                <div className='rounded-lg bg-teal-50 p-3 text-sm text-slate-600'>
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
              <Card className='border-teal-200'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-teal-700'>
                    <UserCheck className='size-5' />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='flex items-center justify-between rounded-lg bg-teal-50 p-3'>
                      <span className='text-sm font-medium text-slate-700'>
                        Status:
                      </span>
                      <Badge
                        variant={
                          subscriptionStatus.isActive
                            ? 'default'
                            : 'destructive'
                        }
                        className={
                          subscriptionStatus.isActive
                            ? 'border-green-200 bg-green-100 text-green-800'
                            : 'border-red-200 bg-red-100 text-red-800'
                        }
                      >
                        {subscriptionStatus.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {subscriptionStatus.subscribedAt && (
                      <div className='flex items-center justify-between rounded-lg bg-teal-50 p-3'>
                        <span className='text-sm font-medium text-slate-700'>
                          Subscribed:
                        </span>
                        <span className='text-sm text-slate-600'>
                          {new Date(
                            subscriptionStatus.subscribedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {subscriptionStatus.preferences && (
                      <div className='rounded-lg bg-teal-50 p-3 md:col-span-2 lg:col-span-1'>
                        <span className='mb-3 block text-sm font-medium text-slate-700'>
                          Preferences:
                        </span>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-slate-600'>
                              Weekly Digest
                            </span>
                            <Badge
                              variant={
                                subscriptionStatus.preferences.weeklyDigest
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                subscriptionStatus.preferences.weeklyDigest
                                  ? 'border-green-200 bg-green-100 text-green-800'
                                  : 'border-red-200 bg-red-100 text-red-800'
                              }
                            >
                              {subscriptionStatus.preferences.weeklyDigest
                                ? 'On'
                                : 'Off'}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-slate-600'>
                              New Posts
                            </span>
                            <Badge
                              variant={
                                subscriptionStatus.preferences.newPosts
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                subscriptionStatus.preferences.newPosts
                                  ? 'border-green-200 bg-green-100 text-green-800'
                                  : 'border-red-200 bg-red-100 text-red-800'
                              }
                            >
                              {subscriptionStatus.preferences.newPosts
                                ? 'On'
                                : 'Off'}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-slate-600'>
                              Special Offers
                            </span>
                            <Badge
                              variant={
                                subscriptionStatus.preferences.specialOffers
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                subscriptionStatus.preferences.specialOffers
                                  ? 'border-green-200 bg-green-100 text-green-800'
                                  : 'border-red-200 bg-red-100 text-red-800'
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
              <Alert variant={result.success ? 'default' : 'destructive'}>
                {result.success ? (
                  <CheckCircle className='size-4' />
                ) : (
                  <AlertTriangle className='size-4' />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className='mt-6 text-center'>
              <div className='inline-flex items-center gap-2 text-slate-600'>
                <div className='size-4 animate-spin rounded-full border-b-2 border-teal-600'></div>
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
