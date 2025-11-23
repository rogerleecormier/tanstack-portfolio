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
            className='border-strategy-gold/40 bg-strategy-gold/15 text-strategy-gold'
          >
            Beta Testing
          </Badge>
        );
      case 'development':
        return (
          <Badge
            variant='outline'
            className='border-strategy-gold-dark/50 text-strategy-gold-dark'
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
    <div className='min-h-screen bg-surface-base'>
      {/* Header with Glassmorphism */}
      <div className='relative overflow-hidden border-b border-surface-elevated/50 bg-surface-base/40 backdrop-blur-xl'>
        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-surface-elevated/60 shadow-lg ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <Wrench className='size-7 text-strategy-gold' />
                </div>
                {/* Tools indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-surface-deep/80 backdrop-blur-sm'>
                  <div className='size-2 rounded-full bg-strategy-gold'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-text-tertiary/60 backdrop-blur-sm'>
                  <div className='size-1.5 rounded-full bg-strategy-gold'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-text-foreground sm:text-5xl lg:text-6xl'>
                  <span className='text-strategy-gold'>
                    Private Tools
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-strategy-gold/50'></div>
              </div>
            </div>

            {/* Description */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-text-secondary'>
              Access your private toolkit with utilities currently in
              development and beta testing.
              <span className='font-medium text-strategy-gold'>
                {' '}
                Exclusive access{' '}
              </span>
              to cutting-edge features and experimental tools.
            </p>

            {/* Quick Stats */}
            <div className='mt-6 flex flex-wrap justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>Development & Beta</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>Experimental Features</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
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
              className='group relative overflow-hidden border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-strategy-gold/40 hover:bg-surface-elevated/50'
            >
              {/* Subtle gradient overlay on hover */}
              <div className='absolute inset-0 bg-gradient-to-br from-strategy-gold/0 to-strategy-gold/0 transition-all duration-300 group-hover:from-strategy-gold/5 group-hover:to-strategy-gold/10'></div>

              <CardHeader className='relative pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-strategy-gold/20 p-2 transition-all duration-300 group-hover:bg-strategy-gold/30'>
                      <tool.icon className='size-6 text-strategy-gold' />
                    </div>
                    <div>
                      <CardTitle className='text-xl font-semibold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                        {tool.title}
                      </CardTitle>
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='flex items-center gap-1 text-sm text-text-secondary'>
                          {getCategoryIcon(tool.category)}
                          <span>{tool.category}</span>
                        </div>
                        {getStatusBadge(tool.status)}
                        <Badge
                          variant='outline'
                          className='border-strategy-rose/50 text-xs text-strategy-rose'
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
                <P className='mb-4 leading-relaxed text-text-secondary'>
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
                        className='border-strategy-gold/30 bg-strategy-gold/20 text-xs text-strategy-gold'
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-between border-t border-strategy-gold/20 pt-4'>
                  <div className='text-sm text-text-tertiary'>
                    {tool.status === 'beta'
                      ? 'Available for testing'
                      : 'Development in progress'}
                  </div>

                  {tool.status === 'beta' ? (
                    <Button
                      asChild
                      size='sm'
                      className='border-0 bg-strategy-gold text-precision-charcoal transition-all duration-300 hover:bg-strategy-gold/90'
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
                      variant='outline'
                      className='border-strategy-gold-dark/50 bg-strategy-gold-dark/10 text-strategy-gold-dark transition-all duration-300 hover:border-strategy-gold-dark hover:bg-strategy-gold-dark/20'
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
          <Card className='border-strategy-gold/30 bg-surface-elevated/30 shadow-lg backdrop-blur-xl'>
            <CardContent className='p-8'>
              <div className='mb-4 flex items-center justify-center'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-strategy-emerald/20'>
                  <Wrench className='size-6 text-strategy-emerald' />
                </div>
              </div>
              <H2 className='mb-2 text-2xl font-bold text-text-foreground'>
                More Private Tools Coming Soon
              </H2>
              <P className='mx-auto mb-4 max-w-2xl text-text-secondary'>
                We're constantly developing new private tools and utilities.
                These exclusive tools are available only to authenticated users
                during their development phase.
              </P>
              <div className='flex flex-col justify-center gap-3 sm:flex-row'>
                <Button
                  asChild
                  variant='outline'
                  className='border-strategy-emerald/50 bg-strategy-emerald/10 text-strategy-emerald transition-all duration-300 hover:border-strategy-emerald hover:bg-strategy-emerald/20'
                >
                  <Link to='/tools'>
                    View Public Tools
                    <ArrowRight className='ml-2 size-4' />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='border-strategy-gold-dark/50 bg-strategy-gold-dark/10 text-strategy-gold-dark transition-all duration-300 hover:border-strategy-gold-dark hover:bg-strategy-gold-dark/20'
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
