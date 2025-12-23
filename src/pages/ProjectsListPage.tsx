import {
  type CachedContentItem,
} from '@/api/cachedContentService';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { H2, H3, P } from '@/components/ui/typography';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNavigate, Link, useLoaderData } from '@tanstack/react-router';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  FileText,
  Filter,
  Search,
  Tag,
  TrendingUp,
  User,
  Wrench,
  Scale,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

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

export default function ProjectsListPage() {
  const navigate = useNavigate();
  
  // Get pre-loaded data from route loader
  const loaderData = useLoaderData({ strict: false }) as CachedContentItem[] | undefined;
  
  // Initialize state with loader data (no loading state needed - data is already available)
  const [projects] = useState<CachedContentItem[]>(() => loaderData ?? []);
  const [filteredProjects, setFilteredProjects] = useState<CachedContentItem[]>(
    () => loaderData ?? []
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [displayedProjects, setDisplayedProjects] = useState<
    CachedContentItem[]
  >([]);
  const [projectsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get status badge for tools
  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant='default'
            className='bg-gradient-to-r from-strategy-gold/80 to-strategy-gold text-precision-charcoal hover:from-strategy-gold hover:to-strategy-gold/80'
          >
            Active
          </Badge>
        );
      case 'beta':
        return (
          <Badge
            variant='secondary'
            className='border-strategy-gold/40 bg-strategy-gold/15 text-strategy-gold hover:bg-strategy-gold/25'
          >
            Beta
          </Badge>
        );
      case 'coming-soon':
        return (
          <Badge
            variant='outline'
            className='border-text-tertiary/30 text-text-tertiary'
          >
            Coming Soon
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get category icon for tools
  const getToolCategoryIcon = (category: string) => {
    switch (category) {
      case 'Content Creation':
        return <FileText className='size-5' />;
      case 'Health & Wellness':
        return <Scale className='size-5' />;
      default:
        return <Wrench className='size-5' />;
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update document title and meta tags
  useDocumentTitle({
    title: 'Projects',
    description:
      'Explore my technical projects, case studies, professional tools, and analytical work in project management, digital transformation, and data analysis.',
    keywords: [
      'Projects',
      'Case Studies',
      'Tools',
      'Technical Projects',
      'Data Analysis',
      'Project Management',
      'Digital Transformation',
    ],
    type: 'website',
  });

  // Initialize filtered projects when loader data is available
  useEffect(() => {
    if (loaderData && loaderData.length > 0 && filteredProjects.length === 0) {
      setFilteredProjects(loaderData);
    }
  }, [loaderData, filteredProjects.length]);

  // Filter projects based on search and tags
  useEffect(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(
        project =>
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project =>
        selectedTags.some(tag => project.tags.includes(tag))
      );
    }

    setFilteredProjects(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [projects, searchQuery, selectedTags]);

  // Update displayed projects when filtered projects or current page changes
  useEffect(() => {
    const endIndex = currentPage * projectsPerPage;
    const displayed = filteredProjects.slice(0, endIndex);
    setDisplayedProjects(displayed);
  }, [filteredProjects, currentPage, projectsPerPage]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  // Get all unique tags from ALL projects (not just filtered)
  const allTags = [
    ...new Set(projects.flatMap(project => project.tags)),
  ].sort();

  // Intersection Observer for infinite scroll
  const loadingRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        const observer = new IntersectionObserver(
          entries => {
            const [entry] = entries;
            if (
              entry?.isIntersecting &&
              !isLoadingMore &&
              displayedProjects.length < filteredProjects.length
            ) {
              setIsLoadingMore(true);
              // Small delay to show loading state
              setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsLoadingMore(false);
              }, 300);
            }
          },
          {
            rootMargin: '100px', // Trigger 100px before the element comes into view
            threshold: 0.1,
          }
        );
        observer.observe(node);
        return () => observer.disconnect();
      }
      return undefined;
    },
    [
      isLoadingMore,
      displayedProjects.length,
      filteredProjects.length,
    ]
  );

  const handleProjectClick = (projectId: string) => {
    void navigate({ to: `/projects/${projectId}` });
  };

  // Category icons mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    Analytics: <BarChart3 className='mr-1 size-3' />,
    'Health Analytics': <TrendingUp className='mr-1 size-3' />,
    // Add more as needed based on cache categories
  };

  // Note: Loading skeleton removed - data is pre-loaded via route loader

  return (
    <div className='min-h-screen bg-surface-base'>
      {/* Header with Glassmorphism Theme */}
      <div className='relative overflow-hidden border-b border-surface-elevated/50 bg-surface-base/40 backdrop-blur-xl'>
        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Glassmorphism Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-surface-elevated/60 shadow-lg ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <Briefcase className='size-7 text-strategy-gold' />
                </div>
                {/* Content indicator dots */}
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
                    Projects & Case Studies
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-strategy-gold/50'></div>
              </div>
            </div>

            {/* Description with Glassmorphism Theme */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-text-secondary'>
              Real-world projects, professional tools, and case studies
              showcasing delivered impact across enterprise transformation and
              technology modernization.
              <span className='font-medium text-strategy-gold'>
                {' '}
                Proven solutions{' '}
              </span>
              with measurable business outcomes and expert execution.
            </p>

            {/* Quick Stats with Glassmorphism Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>Strategic Tools</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>Proven Delivery</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>Business Impact</span>
              </div>
            </div>

            <div className='mt-6 flex flex-wrap justify-center gap-3'>
              <Badge
                variant='secondary'
                className='border-strategy-gold/30 bg-strategy-gold/20 px-3 py-1.5 text-sm text-strategy-gold'
              >
                <BarChart3 className='mr-1.5 size-4' />
                Data Analysis
              </Badge>
              <Badge
                variant='secondary'
                className='border-strategy-gold/30 bg-strategy-gold/20 px-3 py-1.5 text-sm text-strategy-gold'
              >
                <Briefcase className='mr-1.5 size-4' />
                Project Management
              </Badge>
              <Badge
                variant='secondary'
                className='border-strategy-gold/30 bg-strategy-gold/20 px-3 py-1.5 text-sm text-strategy-gold'
              >
                <User className='mr-1.5 size-4' />
                Digital Transformation
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Search and Filters with Glassmorphism - TOP */}
        <div className='mb-12 rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 p-6 shadow-lg backdrop-blur-xl'>
          <div className='mb-4'>
            <h3 className='mb-3 text-sm font-semibold text-strategy-gold'>
              Filter & Search
            </h3>
          </div>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-strategy-gold' />
              <Input
                placeholder='Search projects & case studies...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='h-11 border-strategy-gold/20 bg-surface-deep/50 pl-12 text-text-foreground placeholder:text-text-tertiary focus:border-strategy-gold/50 focus:ring-strategy-gold/20'
              />
            </div>
            <Button
              variant='outline'
              onClick={() => setIsTagFilterOpen(true)}
              className='flex h-11 items-center gap-2 border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
            >
              <Filter className='size-4' />
              Filter {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Button>
            {(searchQuery || selectedTags.length > 0) && (
              <Button
                variant='outline'
                onClick={clearFilters}
                className='flex h-11 items-center gap-2 border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
              >
                <X className='size-4' />
                Clear
              </Button>
            )}
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className='mt-4 border-t border-strategy-gold/20 pt-4'>
              <div className='mb-3 flex items-center gap-2'>
                <span className='text-sm font-medium text-strategy-gold'>
                  Active filters:
                </span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant='default'
                    className='cursor-pointer border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className='mr-1 size-3' />
                    {tag}
                    <X className='ml-1 size-3' />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tag Filter Dialog */}
        <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <DialogContent className='z-[200] border-strategy-gold/20 bg-surface-elevated/50 backdrop-blur-xl sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-strategy-gold'>
                Filter by Topics & Tools
              </DialogTitle>
              <DialogDescription className='text-text-secondary'>
                Select topics and tools to filter content. Choose multiple
                filters to narrow your search.
              </DialogDescription>
            </DialogHeader>
            <div className='max-h-96 overflow-y-auto'>
              <div className='grid grid-cols-2 gap-3 py-4'>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => toggleTag(tag)}
                    className={`h-auto justify-start px-3 py-2 text-left ${
                      selectedTags.includes(tag)
                        ? 'border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                        : 'border-strategy-gold/30 text-strategy-gold hover:border-strategy-gold/60 hover:bg-surface-elevated/50'
                    }`}
                  >
                    <Tag className='mr-2 size-3 shrink-0' />
                    {tag}
                  </Button>
                ))}
                {/* Tool names as filter options */}
                {tools.map(tool => (
                  <Button
                    key={tool.id}
                    variant={
                      selectedTags.includes(tool.title) ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => toggleTag(tool.title)}
                    className={`h-auto justify-start px-3 py-2 text-left ${
                      selectedTags.includes(tool.title)
                        ? 'border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                        : 'border-strategy-gold/30 text-strategy-gold hover:border-strategy-gold/60 hover:bg-surface-elevated/50'
                    }`}
                  >
                    <Wrench className='mr-2 size-3 shrink-0' />
                    {tool.title}
                  </Button>
                ))}
              </div>
            </div>
            <div className='flex items-center justify-between border-t border-strategy-gold/20 pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  setSelectedTags([]);
                  setIsTagFilterOpen(false);
                }}
                className='border-strategy-gold/20 bg-surface-deep/30 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
              >
                Clear All
              </Button>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsTagFilterOpen(false)}
                  className='border-strategy-gold/20 bg-surface-deep/30 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsTagFilterOpen(false)}
                  className='border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                >
                  Apply Filters ({selectedTags.length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className='mb-16'>
          <div className='mb-8 flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-strategy-gold/20 ring-1 ring-strategy-gold/30'>
              <Wrench className='size-6 text-strategy-gold' />
            </div>
            <div>
              <H2 className='text-strategy-gold'>Projects</H2>
              <p className='text-sm text-text-secondary'>
                Professional utilities and workflow automation
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {tools.map(tool => (
              <Card
                key={tool.id}
                className='group flex h-full flex-col border-strategy-gold/20 bg-surface-elevated/30 transition-all duration-300 hover:border-strategy-gold/40 hover:bg-surface-elevated/50'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='rounded-lg bg-strategy-gold/20 p-2 transition-colors group-hover:bg-strategy-gold/30'>
                        <tool.icon className='size-6 text-strategy-gold' />
                      </div>
                      <div>
                        <CardTitle className='text-lg font-bold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                          {tool.title}
                        </CardTitle>
                        <div className='mt-1 flex items-center gap-2'>
                          <div className='flex items-center gap-1 text-xs text-text-secondary'>
                            {getToolCategoryIcon(tool.category)}
                            <span>{tool.category}</span>
                          </div>
                          {getStatusBadge(tool.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='flex h-full flex-col pt-0'>
                  <p className='mb-4 leading-relaxed text-text-secondary'>
                    {tool.description}
                  </p>

                  <div className='mb-4'>
                    <div className='mb-2 text-xs font-semibold text-text-secondary'>
                      Key Features:
                    </div>
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

                  <div className='mt-auto flex items-center justify-between'>
                    <div className='text-xs text-text-tertiary'>
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
                        className='border-0 bg-strategy-gold py-2 text-xs text-precision-charcoal hover:bg-strategy-gold/90'
                      >
                        <Link to={tool.url}>
                          Open Tool
                          <ArrowRight className='ml-2 size-3 transition-transform group-hover:translate-x-1' />
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
                        className='cursor-not-allowed border-text-tertiary/30 bg-text-tertiary/10 text-text-tertiary'
                      >
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CASE STUDIES SECTION */}
        <div>
          <div className='mb-8 flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-strategy-gold/20 ring-1 ring-strategy-gold/30'>
              <Briefcase className='size-6 text-strategy-gold' />
            </div>
            <div>
              <H2 className='text-strategy-gold'>Case Studies</H2>
              <p className='text-sm text-text-secondary'>
                Real-world implementations and business outcomes
              </p>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <Card className='border-strategy-gold/20 bg-surface-elevated/30 py-16 text-center'>
              <CardContent>
                <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-surface-deep/60 ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <Briefcase className='size-8 text-strategy-gold' />
                </div>
                <H3 className='mb-3 text-text-foreground'>No projects found</H3>
                <P className='mx-auto max-w-md text-text-secondary'>
                  {searchQuery || selectedTags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'No projects have been published yet'}
                </P>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* All Projects Grid */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {displayedProjects.map(project => {
                  const categoryIcon = categoryIcons[project.category] ?? (
                    <Briefcase className='mr-1 size-3' />
                  );
                  return (
                    <Card
                      key={project.id}
                      className='group flex h-full flex-col border-strategy-gold/20 bg-surface-elevated/30 transition-all duration-300 hover:border-strategy-gold/40 hover:bg-surface-elevated/50'
                    >
                      <CardHeader className='shrink-0 pb-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <Badge
                            variant='outline'
                            className='border-strategy-gold/30 text-xs text-strategy-gold'
                          >
                            {categoryIcon}
                            {project.category}
                          </Badge>
                          {project.date && (
                            <span className='text-xs text-text-tertiary'>
                              {new Date(project.date).getFullYear()}
                            </span>
                          )}
                        </div>
                        <CardTitle className='text-xl font-bold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                          {project.title}
                        </CardTitle>
                        <CardDescription className='text-sm leading-relaxed text-text-secondary'>
                          {project.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className='flex h-full flex-col pt-0'>
                        <div className='mb-3 flex flex-wrap gap-1.5'>
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='border-strategy-gold/30 bg-strategy-gold/20 px-2 py-0.5 text-xs text-strategy-gold'
                            >
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge
                              variant='secondary'
                              className='border-text-tertiary/30 bg-text-tertiary/10 px-2 py-0.5 text-xs text-text-tertiary'
                            >
                              +{project.tags.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className='mt-auto'>
                          <div className='mb-2 flex items-center justify-between text-xs text-text-tertiary'>
                            <div className='flex items-center'>
                              <Calendar className='mr-1 size-3' />
                              <span>
                                {project.date
                                  ? new Date(project.date).getFullYear()
                                  : 'Ongoing'}
                              </span>
                            </div>
                            <div className='flex items-center'>
                              <User className='mr-1 size-3' />
                              <span>Roger Cormier</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleProjectClick(project.id)}
                            className='w-full border-0 bg-strategy-gold py-2 text-sm text-precision-charcoal hover:bg-strategy-gold/90'
                          >
                            View Project
                            <ArrowRight className='ml-1.5 size-3 transition-transform group-hover:translate-x-1' />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Loading indicator for infinite scroll */}
              {displayedProjects.length < filteredProjects.length && (
                <div ref={loadingRef} className='py-12 text-center'>
                  <div className='inline-flex items-center gap-3 text-text-secondary'>
                    <div className='size-6 animate-spin rounded-full border-b-2 border-strategy-gold'></div>
                    <span className='font-medium'>
                      Loading more projects...
                    </span>
                  </div>
                </div>
              )}

              {/* End of projects indicator */}
              {displayedProjects.length === filteredProjects.length &&
                filteredProjects.length > 0 && (
                  <div className='py-12 text-center'>
                    <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-strategy-gold/20'>
                      <Briefcase className='size-6 text-strategy-gold' />
                    </div>
                    <p className='font-medium text-strategy-gold/60'>
                      You've reached the end of all projects
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
