import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowRight, FileText, Scale } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { H1, H2, P } from '@/components/ui/typography';

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
    url: '/tools/healthbridge-enhanced',
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
    url: '/tools/markdown',
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
    url: '/tools/raci-builder',
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
    url: '/tools/priority-matrix',
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
    url: '/tools/gantt-builder',
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
    url: '/tools/risk-assessment',
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
            className='bg-teal-600 text-white hover:bg-teal-700'
          >
            Active
          </Badge>
        );
      case 'beta':
        return (
          <Badge
            variant='secondary'
            className='brand-bg-secondary brand-border-secondary text-blue-800 hover:bg-blue-200'
          >
            Beta
          </Badge>
        );
      case 'coming-soon':
        return (
          <Badge variant='outline' className='border-gray-300 text-gray-600'>
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
    <div className='min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 dark:from-teal-950 dark:via-blue-950 dark:to-teal-900'>
      {/* Hero Section - Compact with Targeting Theme */}
      <div className='relative overflow-hidden border-b border-teal-200 dark:border-teal-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Targeting Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg'>
                  <Wrench className='size-7 text-white' />
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
                <H1
                  className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl'
                  style={{ fontWeight: 700 }}
                >
                  <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent'>
                    Tools & Utilities
                  </span>
                </H1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <P className='mx-auto max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300'>
              Strategic utilities and professional tools to enhance your
              workflow and productivity.
              <span className='font-medium text-teal-700 dark:text-teal-300'>
                {' '}
                Target your efficiency{' '}
              </span>
              with precision-engineered solutions and strategic automation.
            </P>

            {/* Quick Stats with Targeting Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-teal-500'></div>
                <span>Workflow Tools</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-blue-500'></div>
                <span>Productivity Boost</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-purple-500'></div>
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
                      className='bg-teal-600 text-white transition-colors hover:bg-teal-700 group-hover:bg-teal-800'
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
                      className='cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400'
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
          <Card className='border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50'>
            <CardContent className='p-8'>
              <div className='mb-4 flex items-center justify-center'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-teal-100'>
                  <Wrench className='size-6 text-teal-600' />
                </div>
              </div>
              <H2 className='mb-2 text-2xl font-bold text-gray-900'>
                More Tools Coming Soon
              </H2>
              <P className='mx-auto mb-4 max-w-2xl text-gray-600'>
                We're constantly developing new tools and utilities to help
                streamline your workflow. Have a specific tool in mind? Let us
                know what would be most helpful for your needs.
              </P>
              <Button
                asChild
                variant='outline'
                className='border-teal-300 text-teal-700 hover:bg-teal-50'
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
