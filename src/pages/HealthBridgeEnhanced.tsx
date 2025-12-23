/**
 * @fileoverview Enhanced HealthBridge Weight Analysis Dashboard
 * @description Advanced weight loss tracking with projections and comprehensive analytics (pounds only)
 * @author Roger Lee Cormier
 * @version 4.0.0
 * @lastUpdated 2024
 *
 * @features
 * - Weight loss projections with confidence intervals (pounds only)
 * - Advanced trend analysis and analytics
 * - Enhanced data visualization with shadcn charts
 * - Comprehensive health metrics tracking
 * - Mobile-responsive design with modern UI
 * - Goals are managed in Settings page only
 *
 * @technologies
 * - React 19 with TypeScript
 * - TanStack React Query for data fetching
 * - shadcn/ui components and charts
 * - Tailwind CSS for styling
 * - Cloudflare Access authentication
 *
 * @refactored
 * - Components extracted to src/features/projects/components/health-bridge/
 * - EnhancedWeightEntry, WeightDataTable, WeightProjections, AnalyticsDashboard
 */

import { BarChart3, Pill, Scale, TableIcon, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

// Extracted feature components
import {
  AnalyticsDashboard,
  EnhancedWeightEntry,
  WeightDataTable,
  WeightProjections,
} from '../features/projects/components/health-bridge';

// shadcn/ui components
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';

/**
 * Enhanced HealthBridge main component
 */
export default function HealthBridgeEnhancedPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(
    isAuthenticated ? 'overview' : 'data'
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Generate TOC entries for the sidebar
  useEffect(() => {
    const tocEntries = [
      { title: '📊 Weight Entry', slug: 'weight-entry' },
      { title: '📈 Projections', slug: 'projections' },
      { title: '📊 Analytics', slug: 'analytics' },
      { title: '📋 Data Table', slug: 'data-table' },
    ];

    // Dispatch custom event to update sidebar TOC
    window.dispatchEvent(
      new CustomEvent('toc-updated', {
        detail: { toc: tocEntries, file: 'healthbridge-enhanced' },
      })
    );

    // Clean up event when component unmounts
    return () => {
      window.dispatchEvent(
        new CustomEvent('toc-updated', {
          detail: { toc: [], file: null },
        })
      );
    };
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-surface-elevated to-slate-100 dark:from-slate-950 dark:via-surface-deep dark:to-slate-900'>
      {/* Hero Section - Compact with Targeting Theme */}
      <div className='relative overflow-hidden border-b border-strategy-gold/20 dark:border-strategy-gold/30'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Targeting Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg'>
                  <Zap className='size-7 text-white' />
                </div>
                {/* Targeting indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>
                  <span className='bg-gradient-to-r from-strategy-gold to-strategy-gold bg-clip-text text-transparent'>
                    HealthBridge Enhanced
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-slate-300'>
              Advanced weight loss tracking with AI-powered projections and
              comprehensive analytics.
              <span className='font-medium text-strategy-gold/30'>
                {' '}
                Target your health goals{' '}
              </span>
              with precision-driven insights and data-driven decision making.
            </p>

            {/* Quick Stats with Targeting Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-text-tertiary'>
                <div className='size-2 rounded-full bg-surface-elevated'></div>
                <span>Precision Analytics</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-tertiary'>
                <div className='size-2 rounded-full bg-surface-elevated'></div>
                <span>AI Projections</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-tertiary'>
                <div className='size-2 rounded-full bg-surface-elevated/30'></div>
                <span>Goal Targeting</span>
              </div>
            </div>

            {isAuthenticated && (
              <p className='mt-4 text-sm text-muted-foreground'>
                💡 Weight goals are managed in your{' '}
                <a
                  href='/protected/settings'
                  className='text-text-foreground hover:underline'
                >
                  Settings page
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {!isAuthenticated && (
          <div className='mb-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 p-6'>
            <h2 className='mb-3 text-xl font-semibold text-blue-900'>
              Welcome to HealthBridge Enhanced - Demo Mode
            </h2>
            <p className='mb-4 text-blue-800'>
              This advanced weight loss tracking dashboard provides personalized
              insights, predictive modeling, and comprehensive analytics. You're
              currently viewing in demo mode with sample data. Sign in to access
              your personal data and start tracking your health journey.
            </p>
            <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
              <div className='rounded-lg bg-white/60 p-3 text-center'>
                <TrendingUp className='mx-auto mb-2 size-6 text-text-foreground' />
                <strong>Weight Projections</strong>
                <p className='text-text-foreground'>
                  AI-powered predictions with medication analysis
                </p>
              </div>
              <div className='rounded-lg bg-white/60 p-3 text-center'>
                <BarChart3 className='mx-auto mb-2 size-6 text-strategy-gold' />
                <strong>Advanced Analytics</strong>
                <p className='text-strategy-gold'>
                  Comprehensive health metrics and trends
                </p>
              </div>
              <div className='rounded-lg bg-white/60 p-3 text-center'>
                <Pill className='mx-auto mb-2 size-6 text-text-foreground' />
                <strong>Medication Tracking</strong>
                <p className='text-text-foreground'>
                  Monitor medication effects on weight loss
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList
            className={`grid w-full ${isAuthenticated ? 'grid-cols-4' : 'grid-cols-3'} border border-strategy-gold/20 bg-white/80 backdrop-blur-sm dark:border-strategy-gold/30 dark:bg-gray-900/80`}
          >
            {isAuthenticated && (
              <TabsTrigger
                value='overview'
                className='data-[state=active]:border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white'
              >
                <Scale className='mr-2 size-4' />
                Enter Weight
              </TabsTrigger>
            )}
            <TabsTrigger
              value='data'
              className='data-[state=active]:border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white'
            >
              <TableIcon className='mr-2 size-4' />
              Current Progress
            </TabsTrigger>
            <TabsTrigger
              value='projections'
              className='data-[state=active]:border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white'
            >
              <TrendingUp className='mr-2 size-4' />
              Projections
            </TabsTrigger>
            <TabsTrigger
              value='analytics'
              className='data-[state=active]:border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white'
            >
              <BarChart3 className='mr-2 size-4' />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            {!isAuthenticated ? (
              <Card className='mx-auto max-w-md border-strategy-gold/20 bg-white/80 backdrop-blur-sm dark:border-strategy-gold/30 dark:bg-gray-900/80'>
                <CardHeader>
                  <CardTitle className='text-teal-900 dark:text-teal-100'>
                    Authentication Required
                  </CardTitle>
                  <CardDescription className='text-strategy-gold dark:text-strategy-gold'>
                    Please sign in to enter weight data and access personalized
                    features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() =>
                      (window.location.href = '/projects/healthbridge-enhanced')
                    }
                    className='w-full border-0 bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700'
                  >
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <EnhancedWeightEntry />
            )}
          </TabsContent>

          <TabsContent value='data' className='space-y-6'>
            {!isAuthenticated && (
              <div className='mb-4 rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 p-3 dark:border-strategy-gold/30 dark:bg-surface-base/50'>
                <p className='text-sm text-strategy-gold dark:text-strategy-gold'>
                  💡 <strong>Demo Mode:</strong> Showing sample data to
                  demonstrate the dashboard features
                </p>
              </div>
            )}
            <WeightDataTable />
          </TabsContent>

          <TabsContent value='projections' className='space-y-6'>
            {!isAuthenticated && (
              <div className='mb-4 rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 p-3 dark:border-strategy-gold/30 dark:bg-surface-base/50'>
                <p className='text-sm text-strategy-gold dark:text-strategy-gold'>
                  💡 <strong>Demo Mode:</strong> Showing sample projections to
                  demonstrate the dashboard features
                </p>
              </div>
            )}
            <WeightProjections />
          </TabsContent>

          <TabsContent value='analytics' className='space-y-6'>
            {!isAuthenticated && (
              <div className='mb-4 rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 p-3 dark:border-strategy-gold/30 dark:bg-surface-base/50'>
                <p className='text-sm text-strategy-gold dark:text-strategy-gold'>
                  💡 <strong>Demo Mode:</strong> Showing sample analytics to
                  demonstrate the dashboard features
                </p>
              </div>
            )}
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
