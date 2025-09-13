import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowRight, Lock, TestTube } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { H1, H2, P } from '@/components/ui/typography';

interface PrivateTool {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  features: string[];
  status: 'beta' | 'development';
  accessLevel: 'private';
}

const privateTools: PrivateTool[] = [
  {
    id: 'raci-builder',
    title: 'RACI Chart Builder',
    description:
      'Create professional RACI matrices to define roles and responsibilities for your projects. Generate interactive tables and exportable Mermaid diagrams.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/raci-builder',
    features: [
      'Role Assignment',
      'Matrix Generation',
      'Mermaid Diagrams',
      'Export Options',
    ],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
  {
    id: 'priority-matrix',
    title: 'Priority Matrix Generator',
    description:
      'Prioritize your tasks using the Eisenhower Matrix based on importance and urgency. Visualize quadrants and export to XLSX for offline use.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/priority-matrix',
    features: [
      'Eisenhower Matrix',
      'Quadrant Visualization',
      'Score-based Prioritization',
      'XLSX Export',
    ],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
  {
    id: 'gantt-builder',
    title: 'Gantt Chart Builder',
    description:
      'Build project timelines with task durations and dates. Visualize with interactive Gantt charts and export to XLSX. Ready for AI-optimized scheduling.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/gantt-chart',
    features: [
      'Timeline Visualization',
      'Duration Calculation',
      'Date Range Support',
      'XLSX Export',
      'AI Ready',
    ],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Tool',
    description:
      'Assess project risks with likelihood and impact scores. Generate matrix table with risk levels and export to XLSX. Ready for AI mitigation suggestions.',
    category: 'Project Management',
    icon: Wrench,
    url: '/tools/risk-assessment',
    features: [
      'Risk Scoring',
      'Matrix Generation',
      'Level Classification',
      'XLSX Export',
      'AI Ready',
    ],
    status: 'development' as const,
    accessLevel: 'private' as const,
  },
];

const PrivateToolsPage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusBadge = (status: PrivateTool['status']) => {
    switch (status) {
      case 'beta':
        return (
          <Badge
            variant='secondary'
            className='brand-bg-secondary brand-border-secondary text-blue-800 hover:bg-blue-200'
          >
            Beta Testing
          </Badge>
        );
      case 'development':
        return (
          <Badge
            variant='outline'
            className='border-orange-300 text-orange-600'
          >
            In Development
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Content Creation':
        return <Wrench className='size-5' />;
      default:
        return <Wrench className='size-5' />;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 dark:from-teal-950 dark:via-blue-950 dark:to-teal-900'>
      {/* Hero Section - Compact with Private Theme */}
      <div className='relative overflow-hidden border-b border-teal-200 dark:border-teal-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Private Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg'>
                  <Lock className='size-7 text-white' />
                </div>
                {/* Private indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-purple-600'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <H1
                  className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl'
                  style={{ fontWeight: 700 }}
                >
                  <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent'>
                    Private Tools
                  </span>
                </H1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
              </div>
            </div>

            {/* Description with Private Language */}
            <P className='mx-auto max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300'>
              Access your private toolkit with tools currently in development
              and beta testing.
              <span className='font-medium text-teal-700 dark:text-teal-300'>
                {' '}
                Exclusive access{' '}
              </span>
              to cutting-edge utilities and experimental features.
            </P>

            {/* Quick Stats with Private Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-red-500'></div>
                <span>Private Access</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-orange-500'></div>
                <span>Early Access</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-purple-500'></div>
                <span>Development Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Tools Grid */}
        <div className='mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {privateTools.map(tool => (
            <Card
              key={tool.id}
              className='group border border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-lg'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-teal-100 p-2 transition-colors group-hover:bg-teal-200'>
                      <tool.icon className='size-6 text-teal-700' />
                    </div>
                    <div>
                      <CardTitle className='text-xl transition-colors group-hover:text-gray-900'>
                        {tool.title}
                      </CardTitle>
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                          {getCategoryIcon(tool.category)}
                          <span>{tool.category}</span>
                        </div>
                        {getStatusBadge(tool.status)}
                        <Badge
                          variant='outline'
                          className='border-red-300 text-xs text-red-600'
                        >
                          <Lock className='mr-1 size-3' />
                          Private
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='pt-0'>
                <P className='mb-4 leading-relaxed text-gray-600'>
                  {tool.description}
                </P>

                <div className='mb-4'>
                  <H2 className='mb-2 text-sm font-semibold text-gray-700'>
                    Key Features:
                  </H2>
                  <div className='flex flex-wrap gap-1'>
                    {tool.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='border-gray-200 bg-gray-50 text-xs text-gray-600'
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='text-sm text-gray-500'>
                    {tool.status === 'beta'
                      ? 'Available for testing'
                      : 'Development in progress'}
                  </div>

                  {tool.status === 'beta' ? (
                    <Button
                      asChild
                      size='sm'
                      className='bg-teal-600 text-white transition-colors hover:bg-teal-700 group-hover:bg-teal-800'
                    >
                      <Link to={tool.url}>
                        Try Beta
                        <ArrowRight className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size='sm'
                      variant='outline'
                      className='border-orange-300 text-orange-600 transition-colors hover:bg-orange-50 group-hover:border-orange-400'
                    >
                      <Link to={tool.url}>
                        <TestTube className='mr-2 size-4' />
                        Test Development
                        <ArrowRight className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className='text-center'>
          <Card className='border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50'>
            <CardContent className='p-8'>
              <div className='mb-4 flex items-center justify-center'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-teal-100'>
                  <Wrench className='size-6 text-teal-600' />
                </div>
              </div>
              <H2 className='mb-2 text-2xl font-bold text-gray-900'>
                More Private Tools Coming Soon
              </H2>
              <P className='mx-auto mb-4 max-w-2xl text-gray-600'>
                We're constantly developing new private tools and utilities.
                These exclusive tools are available only to authenticated users
                during their development phase.
              </P>
              <div className='flex flex-col justify-center gap-3 sm:flex-row'>
                <Button
                  asChild
                  variant='outline'
                  className='border-teal-300 text-teal-700 hover:bg-teal-50'
                >
                  <Link to='/tools'>
                    View Public Tools
                    <ArrowRight className='ml-2 size-4' />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='border-orange-300 text-orange-700 hover:bg-orange-50'
                >
                  <Link to='/protected/content-studio'>
                    Content Studio
                    <ArrowRight className='ml-2 size-4' />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivateToolsPage;
