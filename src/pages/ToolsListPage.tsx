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
            className='bg-gradient-to-r from-hunter-600 to-hunter-500 text-white hover:from-hunter-500 hover:to-hunter-400'
          >
            Active
          </Badge>
        );
      case 'beta':
        return (
          <Badge
            variant='secondary'
            className='border-gold-600/40 bg-gold-600/15 text-gold-300 hover:bg-gold-600/25'
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
    <div className='min-h-screen bg-hunter-950'>
      {/* Header Section */}
      <div className='relative overflow-hidden border-b border-gold-500/20 bg-hunter-950/40 backdrop-blur-xl'>
        <div className='relative px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-hunter-900/60 ring-1 ring-gold-500/20 backdrop-blur-md'>
                  <Wrench className='size-7 text-gold-400' />
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-gold-400 sm:text-5xl lg:text-6xl'>
                  Tools & Resources
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gold-500/40'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <p className='text-grey-300 mx-auto max-w-3xl text-lg leading-7'>
              Strategic utilities and professional tools to enhance your
              workflow and productivity.
              <span className='font-medium text-gold-400'>
                {' '}
                Target your efficiency{' '}
              </span>
              with professional-grade utilities and automation tools.
            </p>

            {/* Quick Stats */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='text-grey-400 flex items-center gap-2 text-sm'>
                <div className='size-2 rounded-full bg-gold-500/50'></div>
                <span>Workflow Tools</span>
              </div>
              <div className='text-grey-400 flex items-center gap-2 text-sm'>
                <div className='size-2 rounded-full bg-gold-500/50'></div>
                <span>Productivity Boost</span>
              </div>
              <div className='text-grey-400 flex items-center gap-2 text-sm'>
                <div className='size-2 rounded-full bg-gold-500/50'></div>
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
              className='group border-gold-500/20 bg-hunter-900/30 backdrop-blur-xl transition-all duration-200 hover:border-gold-500/40 hover:bg-hunter-900/40'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-hunter-600/15 p-2 transition-colors group-hover:bg-hunter-600/25'>
                      <tool.icon className='size-6 text-hunter-400' />
                    </div>
                    <div>
                      <CardTitle className='text-xl text-white transition-colors group-hover:text-hunter-400'>
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
                        className='border-gold-500/30 bg-gold-500/20 text-xs text-gold-300'
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='text-grey-400 text-sm'>
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
                      className='border-0 bg-gold-600 text-hunter-950 transition-all hover:bg-gold-500 hover:shadow-lg'
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
                      className='border-grey-600/30 bg-grey-800/30 text-grey-500 cursor-not-allowed'
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
          <Card className='border-gold-500/20 bg-hunter-900/30 backdrop-blur-xl'>
            <CardContent className='p-8'>
              <div className='mb-4 flex items-center justify-center'>
                <div className='flex size-12 items-center justify-center rounded-xl bg-hunter-900/60 ring-1 ring-gold-500/20'>
                  <Wrench className='size-6 text-gold-400' />
                </div>
              </div>
              <H2 className='mb-2 text-2xl font-bold text-white'>
                Need a Custom Tool?
              </H2>
              <P className='text-grey-300 mx-auto mb-4 max-w-2xl'>
                I build automation tools and utilities tailored to specific
                workflows. Let me know what would be most helpful for your
                needs.
              </P>
              <Button
                asChild
                variant='outline'
                className='border-gold-500/30 text-gold-400 hover:border-gold-500/50 hover:bg-gold-500/10'
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
