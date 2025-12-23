import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowRight, FileText, Scale } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { H2, P } from '@/components/ui/typography';

interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  features: string[];
  status: 'active' | 'beta' | 'coming-soon';
}

const tools: Tool[] = [
  {
    id: 'healthbridge-enhanced',
    title: 'HealthBridge Enhanced',
    description:
      'Advanced weight loss tracking dashboard with projections and comprehensive health analytics. Features weight loss projections, trend analysis, and data visualization in pounds.',
    category: 'Health & Wellness',
    icon: Scale,
    url: '/projects/healthbridge-enhanced',
    features: [
      'AI Projections',
      'Medication Analysis',
      'Trend Analytics',
      'Data Visualization',
    ],
    status: 'active' as const,
  },
  {
    id: 'markdown-editor',
    title: 'Markdown Editor',
    description:
      'Advanced markdown editing platform with live preview, comprehensive formatting support, and integrated content management for seamless writing and publishing workflows.',
    category: 'Content Creation',
    icon: FileText,
    url: '/projects/markdown',
    features: [
      'Live Preview',
      'WYSIWYG Editor',
      'CodeMirror',
      'Content Management',
    ],
    status: 'active' as const,
  },
  {
    id: 'raci-builder',
    title: 'RACI Chart Builder',
    description:
      'Create professional RACI matrices to define roles and responsibilities for your projects. Generate interactive tables and exportable Mermaid diagrams.',
    category: 'Project Management',
    icon: Wrench,
    url: '/projects/raci-builder',
    features: [
      'Role Assignment',
      'Matrix Generation',
      'Mermaid Diagrams',
      'Export Options',
    ],
    status: 'active' as const,
  },
  {
    id: 'priority-matrix',
    title: 'Priority Matrix Generator',
    description:
      'Prioritize your tasks using the Eisenhower Matrix based on importance and urgency. Visualize quadrants and export to XLSX for offline use.',
    category: 'Project Management',
    icon: Wrench,
    url: '/projects/priority-matrix',
    features: [
      'Eisenhower Matrix',
      'Quadrant Visualization',
      'Score-based Prioritization',
      'XLSX Export',
    ],
    status: 'active' as const,
  },
  {
    id: 'gantt-builder',
    title: 'Gantt Chart Builder',
    description:
      'Build project timelines with task durations and dates. Visualize with interactive Gantt charts and export to XLSX. Ready for AI-optimized scheduling.',
    category: 'Project Management',
    icon: Wrench,
    url: '/projects/gantt-chart',
    features: [
      'Timeline Visualization',
      'Duration Calculation',
      'Date Range Support',
      'XLSX Export',
      'AI Ready',
    ],
    status: 'coming-soon' as const,
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Tool',
    description:
      'Assess project risks with likelihood and impact scores. Generate matrix table with risk levels and export to XLSX. Ready for AI mitigation suggestions.',
    category: 'Project Management',
    icon: Wrench,
    url: '/projects/risk-assessment',
    features: [
      'Risk Scoring',
      'Matrix Generation',
      'Level Classification',
      'XLSX Export',
      'AI Ready',
    ],
    status: 'coming-soon' as const,
  },
];

const ToolsListPage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant='default'
            className='bg-gradient-to-r from-strategy-gold to-surface-elevated0 text-white hover:from-surface-elevated0 hover:to-strategy-gold'
          >
            Active
          </Badge>
        );
      case 'beta':
        return (
          <Badge
            variant='secondary'
            className='border-strategy-gold/40 bg-strategy-gold/15 text-strategy-gold/30 hover:bg-strategy-gold/25'
          >
            Beta
          </Badge>
        );
      case 'coming-soon':
        return (
          <Badge
            variant='outline'
            className='border-slate-600/30 text-slate-400'
          >
            Coming Soon
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Content Creation':
        return <FileText className='size-5' />;
      case 'Health & Wellness':
        return <Scale className='size-5' />;
      default:
        return <Wrench className='size-5' />;
    }
  };

  return (
    <div className='min-h-screen bg-surface-deep'>
      {/* Header Section */}
      <div className='relative overflow-hidden border-b border-surface-elevated0/20 bg-surface-deep/40 backdrop-blur-xl'>
        <div className='relative px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-surface-deep/60 ring-1 ring-surface-elevated0/20 backdrop-blur-md'>
                  <Wrench className='size-7 text-strategy-gold' />
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-strategy-gold sm:text-5xl lg:text-6xl'>
                  Tools & Resources
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-surface-elevated0/40'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-grey-300'>
              Strategic utilities and professional tools to enhance your
              workflow and productivity.
              <span className='font-medium text-strategy-gold'>
                {' '}
                Target your efficiency{' '}
              </span>
              with professional-grade utilities and automation tools.
            </p>

            {/* Quick Stats */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-grey-400'>
                <div className='size-2 rounded-full bg-surface-elevated0/50'></div>
                <span>Workflow Tools</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-grey-400'>
                <div className='size-2 rounded-full bg-surface-elevated0/50'></div>
                <span>Productivity Boost</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-grey-400'>
                <div className='size-2 rounded-full bg-surface-elevated0/50'></div>
                <span>Strategic Automation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Tools Grid */}
        <div className='mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {tools.map(tool => (
            <Card
              key={tool.id}
              className='group border-surface-elevated0/20 bg-surface-deep/30 backdrop-blur-xl transition-all duration-200 hover:border-surface-elevated0/40 hover:bg-surface-deep/40'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-strategy-gold/15 p-2 transition-colors group-hover:bg-strategy-gold/25'>
                      <tool.icon className='size-6 text-strategy-gold' />
                    </div>
                    <div>
                      <CardTitle className='text-xl text-white transition-colors group-hover:text-strategy-gold'>
                        {tool.title}
                      </CardTitle>
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='flex items-center gap-1 text-sm text-slate-400'>
                          {getCategoryIcon(tool.category)}
                          <span>{tool.category}</span>
                        </div>
                        {getStatusBadge(tool.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='pt-0'>
                <p className='mb-4 leading-relaxed text-slate-300'>
                  {tool.description}
                </p>

                <div className='mb-4'>
                  <H2 className='mb-2 text-sm font-semibold text-slate-300'>
                    Key Features:
                  </H2>
                  <div className='flex flex-wrap gap-1'>
                    {tool.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='border-surface-elevated0/30 bg-surface-elevated0/20 text-xs text-strategy-gold/30'
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='text-sm text-grey-400'>
                    {tool.status === 'active'
                      ? 'Ready to use'
                      : tool.status === 'beta'
                        ? 'Available for testing'
                        : 'Development in progress'}
                  </div>

                  {tool.status === 'active' ? (
                    <Button
                      asChild
                      size='sm'
                      className='border-0 bg-strategy-gold text-surface-deep transition-all hover:bg-surface-elevated0 hover:shadow-lg'
                    >
                      <Link to={tool.url}>
                        Open Tool
                        <ArrowRight className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
                      </Link>
                    </Button>
                  ) : tool.status === 'beta' ? (
                    <Button disabled size='sm' variant='outline'>
                      Try Beta
                    </Button>
                  ) : (
                    <Button
                      disabled
                      size='sm'
                      variant='outline'
                      className='cursor-not-allowed border-grey-600/30 bg-grey-800/30 text-grey-500'
                    >
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Tools Coming Soon */}
        <div className='text-center'>
          <Card className='border-surface-elevated0/20 bg-surface-deep/30 backdrop-blur-xl'>
            <CardContent className='p-8'>
              <div className='mb-4 flex items-center justify-center'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-surface-deep/60 ring-1 ring-surface-elevated0/20'>
                  <Wrench className='size-6 text-strategy-gold' />
                </div>
              </div>
              <H2 className='mb-2 text-2xl font-bold text-white'>
                Need a Custom Tool?
              </H2>
              <P className='mx-auto mb-4 max-w-2xl text-grey-300'>
                I build automation tools and utilities tailored to specific
                workflows. Let me know what would be most helpful for your
                needs.
              </P>
              <Button
                asChild
                variant='outline'
                className='border-surface-elevated0/30 text-strategy-gold hover:border-surface-elevated0/50 hover:bg-surface-elevated0/10'
              >
                <Link to='/contact'>
                  Suggest a Tool
                  <ArrowRight className='ml-2 size-4' />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ToolsListPage;
