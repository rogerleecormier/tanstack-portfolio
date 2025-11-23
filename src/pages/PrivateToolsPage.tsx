import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowRight, Lock, TestTube } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { H2, P } from '@/components/ui/typography';

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
            className='border-strategy-gold/50 bg-strategy-gold/10 text-strategy-gold'
          >
            Beta Testing
          </Badge>
        );
      case 'development':
        return (
          <Badge
            variant='outline'
            className='border-orange-500/50 text-orange-400'
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
    <div className='min-h-screen bg-gradient-to-br from-surface-deep via-surface-base to-surface-deep'>
      {/* Header with Administrative Theme - Glassmorphic Design */}
      <div className='relative overflow-hidden border-b border-strategy-gold/20 bg-surface-elevated/30 backdrop-blur-xl'>
        {/* Glassmorphic background gradient */}
        <div className='from-strategy-gold/8 to-strategy-gold/8 absolute inset-0 bg-gradient-to-r via-strategy-gold/5'></div>
        {/* Subtle glow effect */}
        <div className='absolute -right-1/2 -top-1/2 h-96 w-96 rounded-full bg-strategy-gold/5 blur-3xl'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Administrative Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-strategy-gold to-slate-600 shadow-lg'>
                  <Wrench className='size-7 text-white' />
                </div>
                {/* Tools indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-strategy-gold'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-strategy-gold to-slate-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl'>
                  <span className='bg-gradient-to-r from-strategy-gold to-strategy-gold bg-clip-text text-transparent dark:from-strategy-gold dark:to-strategy-gold'>
                    Private Tools
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-strategy-gold to-slate-500'></div>
              </div>
            </div>

            {/* Description with Tools Language */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-gray-600 dark:text-slate-300'>
              Access your private toolkit with utilities currently in
              development and beta testing.
              <span className='font-medium text-strategy-gold dark:text-strategy-gold'>
                {' '}
                Exclusive access{' '}
              </span>
              to cutting-edge features and experimental tools.
            </p>

            {/* Quick Stats with Administrative Focus */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-strategy-gold/70'>
                <div className='size-2 rounded-full bg-strategy-gold'></div>
                <span>Development & Beta</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-strategy-gold/60'>
                <div className='size-2 rounded-full bg-strategy-gold/50'></div>
                <span>Experimental Features</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-strategy-gold/50'>
                <div className='size-2 rounded-full bg-strategy-gold/40'></div>
                <span>Exclusive Access</span>
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
              className='group relative overflow-hidden border border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-strategy-gold/50 hover:bg-surface-elevated/50 hover:shadow-xl hover:shadow-strategy-gold/20 dark:border-strategy-gold/20'
            >
              {/* Subtle gradient overlay on hover */}
              <div className='absolute inset-0 bg-gradient-to-br from-strategy-gold/0 to-strategy-gold/0 transition-all duration-300 group-hover:from-strategy-gold/5 group-hover:to-strategy-gold/10'></div>

              <CardHeader className='relative pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-gradient-to-br from-strategy-gold/20 to-strategy-gold/20 p-2 transition-all duration-300 group-hover:from-strategy-gold/30 group-hover:to-strategy-gold/40'>
                      <tool.icon className='size-6 text-strategy-gold' />
                    </div>
                    <div>
                      <CardTitle className='text-xl font-semibold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                        {tool.title}
                      </CardTitle>
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='flex items-center gap-1 text-sm text-text-muted'>
                          {getCategoryIcon(tool.category)}
                          <span>{tool.category}</span>
                        </div>
                        {getStatusBadge(tool.status)}
                        <Badge
                          variant='outline'
                          className='border-red-500/50 text-xs text-red-400'
                        >
                          <Lock className='mr-1 size-3' />
                          Private
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='relative pt-0'>
                <P className='mb-4 leading-relaxed text-text-muted-foreground'>
                  {tool.description}
                </P>

                <div className='mb-4'>
                  <H2 className='mb-2 text-sm font-semibold text-text-foreground'>
                    Key Features:
                  </H2>
                  <div className='flex flex-wrap gap-1'>
                    {tool.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='border-slate-600 bg-slate-700/50 text-xs text-slate-300'
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-between border-t border-slate-700 pt-4'>
                  <div className='text-sm text-slate-400'>
                    {tool.status === 'beta'
                      ? 'Available for testing'
                      : 'Development in progress'}
                  </div>

                  {tool.status === 'beta' ? (
                    <Button
                      asChild
                      size='sm'
                      className='bg-gradient-to-r from-strategy-gold to-strategy-gold text-white transition-all duration-300 hover:from-strategy-gold/80 hover:to-strategy-gold/70 hover:shadow-lg hover:shadow-strategy-gold/30'
                    >
                      <Link to={tool.url}>
                        Try Beta
                        <ArrowRight className='ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1' />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size='sm'
                      className='border-orange-500/50 bg-orange-500/10 text-orange-400 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500/20'
                    >
                      <Link to={tool.url}>
                        <TestTube className='mr-2 size-4' />
                        Test Development
                        <ArrowRight className='ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1' />
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
          <Card className='border-strategy-gold/30 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900'>
            <CardContent className='p-8'>
              <div className='mb-4 flex items-center justify-center'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-strategy-gold/20 to-strategy-gold/10'>
                  <Wrench className='size-6 text-strategy-gold' />
                </div>
              </div>
              <H2 className='mb-2 text-2xl font-bold text-slate-100'>
                More Private Tools Coming Soon
              </H2>
              <P className='mx-auto mb-4 max-w-2xl text-slate-300'>
                We're constantly developing new private tools and utilities.
                These exclusive tools are available only to authenticated users
                during their development phase.
              </P>
              <div className='flex flex-col justify-center gap-3 sm:flex-row'>
                <Button
                  asChild
                  className='border-strategy-gold/50 bg-strategy-gold/10 text-strategy-gold transition-all duration-300 hover:border-strategy-gold hover:bg-strategy-gold/20'
                >
                  <Link to='/tools'>
                    View Public Tools
                    <ArrowRight className='ml-2 size-4' />
                  </Link>
                </Button>
                <Button
                  asChild
                  className='border-orange-500/50 bg-orange-500/10 text-orange-400 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500/20'
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
