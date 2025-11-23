import {
  cachedContentService,
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
import { Skeleton } from '@/components/ui/skeleton';
import { H2, H3, P } from '@/components/ui/typography';
import { UnifiedRelatedContent } from '@/components/UnifiedRelatedContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  Filter,
  Search,
  Tag,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<CachedContentItem[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<CachedContentItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [displayedProjects, setDisplayedProjects] = useState<
    CachedContentItem[]
  >([]);
  const [projectsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update document title and meta tags
  useDocumentTitle({
    title: 'Projects & Case Studies',
    description:
      'Explore my technical projects, case studies, and analytical work in project management, digital transformation, and data analysis.',
    keywords: [
      'Projects',
      'Case Studies',
      'Technical Projects',
      'Data Analysis',
      'Project Management',
      'Digital Transformation',
    ],
    type: 'website',
  });

  // Load projects from cache
  useEffect(() => {
    const loadProjects = () => {
      try {
        setIsLoading(true);

        const loadedProjects = cachedContentService.getContentByType('project');
        setProjects(loadedProjects);
        setFilteredProjects(loadedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to empty array or handle error state
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

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

  // Get all unique tags from projects
  const allTags = [
    ...new Set(filteredProjects.flatMap(project => project.tags)),
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
              !isLoading &&
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
      isLoading,
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

  if (isLoading) {
    return (
      <div className='min-h-screen bg-hunter-950'>
        <div className='container mx-auto px-4 py-8'>
          {/* Hero Skeleton */}
          <div className='mb-12 text-center'>
            <Skeleton className='mx-auto mb-4 h-16 w-96' />
            <Skeleton className='mx-auto h-6 w-2/3' />
          </div>

          {/* Search Skeleton */}
          <div className='mx-auto mb-8 max-w-4xl'>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <Skeleton className='h-12 flex-1' />
              <Skeleton className='h-12 w-48' />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className='h-80 border-gold-500/20 bg-hunter-900/30 shadow-lg backdrop-blur-xl dark:border-gold-500/20 dark:bg-hunter-900/30'
              >
                <CardHeader className='pb-3'>
                  <Skeleton className='mb-2 h-6 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='mb-2 h-4 w-full' />
                  <Skeleton className='mb-2 h-4 w-3/4' />
                  <Skeleton className='mb-4 h-4 w-1/2' />
                  <div className='mb-4 flex gap-2'>
                    <Skeleton className='h-6 w-16' />
                    <Skeleton className='h-6 w-20' />
                  </div>
                  <Skeleton className='h-4 w-24' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-hunter-950'>
      {/* Header with Glassmorphism Theme */}
      <div className='dark:border-grey-800 relative overflow-hidden border-b border-hunter-900/50 bg-hunter-950/40 backdrop-blur-xl dark:bg-hunter-950/30'>
        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Glassmorphism Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-hunter-900/60 shadow-lg ring-1 ring-gold-500/20 backdrop-blur-md'>
                  <Briefcase className='size-7 text-gold-400' />
                </div>
                {/* Content indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-hunter-800/80 backdrop-blur-sm'>
                  <div className='size-2 rounded-full bg-gold-400'></div>
                </div>
                <div className='bg-grey-700/60 absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full backdrop-blur-sm'>
                  <div className='size-1.5 rounded-full bg-gold-300'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>
                  <span className='text-gold-400'>Projects & Case Studies</span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gold-500/50'></div>
              </div>
            </div>

            {/* Description with Glassmorphism Theme */}
            <p className='text-grey-300 mx-auto max-w-3xl text-lg leading-7'>
              Real-world projects and case studies showcasing delivered impact
              across enterprise transformation and technology modernization.
              <span className='font-medium text-gold-300'>
                {' '}
                Proven solutions{' '}
              </span>
              with measurable business outcomes and expert execution.
            </p>

            {/* Quick Stats with Glassmorphism Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='text-grey-400 flex items-center gap-2 text-sm'>
                <div className='size-2 rounded-full bg-gold-500/60'></div>
                <span>Strategic Insights</span>
              </div>
              <div className='text-grey-400 flex items-center gap-2 text-sm'>
                <div className='size-2 rounded-full bg-gold-500/60'></div>
                <span>Proven Delivery</span>
              </div>
              <div className='text-grey-400 flex items-center gap-2 text-sm'>
                <div className='size-2 rounded-full bg-gold-500/60'></div>
                <span>Business Impact</span>
              </div>
            </div>

            <div className='mt-6 flex flex-wrap justify-center gap-3'>
              <Badge
                variant='secondary'
                className='border-gold-500/30 bg-gold-600/20 px-3 py-1.5 text-sm text-gold-300 dark:border-gold-500/30 dark:bg-gold-600/20 dark:text-gold-300'
              >
                <BarChart3 className='mr-1.5 size-4' />
                Data Analysis
              </Badge>
              <Badge
                variant='secondary'
                className='border-gold-500/30 bg-gold-600/20 px-3 py-1.5 text-sm text-gold-300 dark:border-gold-500/30 dark:bg-gold-600/20 dark:text-gold-300'
              >
                <Briefcase className='mr-1.5 size-4' />
                Project Management
              </Badge>
              <Badge
                variant='secondary'
                className='border-gold-500/30 bg-gold-600/20 px-3 py-1.5 text-sm text-gold-300 dark:border-gold-500/30 dark:bg-gold-600/20 dark:text-gold-300'
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
        {/* Search and Filters with Glassmorphism */}
        <div className='mb-8 rounded-lg border border-gold-500/20 bg-hunter-900/30 p-6 shadow-lg backdrop-blur-xl dark:border-gold-500/20 dark:bg-hunter-900/30'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gold-400' />
              <Input
                placeholder='Search projects and case studies...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='placeholder-grey-500 h-11 border-gold-500/20 bg-hunter-800/50 pl-12 text-white focus:border-gold-500/50 focus:ring-gold-500/20 dark:border-gold-500/20 dark:bg-hunter-800/50'
              />
            </div>
            {allTags.length > 0 && (
              <Button
                variant='outline'
                onClick={() => setIsTagFilterOpen(true)}
                className='flex h-11 items-center gap-2 border-gold-500/20 bg-hunter-800/30 px-6 text-gold-400 hover:border-gold-500/50 hover:bg-hunter-700/50 dark:border-gold-500/20 dark:bg-hunter-800/30'
              >
                <Filter className='size-4' />
                Topics {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
            )}
            {(searchQuery || selectedTags.length > 0) && (
              <Button
                variant='outline'
                onClick={clearFilters}
                className='flex h-11 items-center gap-2 border-gold-500/20 bg-hunter-800/30 px-6 text-gold-400 hover:border-gold-500/50 hover:bg-hunter-700/50 dark:border-gold-500/20 dark:bg-hunter-800/30'
              >
                <X className='size-4' />
                Clear
              </Button>
            )}
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className='mt-4 border-t border-gold-500/20 pt-4 dark:border-gold-500/20'>
              <div className='mb-3 flex items-center gap-2'>
                <span className='text-sm font-medium text-gold-400 dark:text-gold-400'>
                  Active filters:
                </span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant='default'
                    className='cursor-pointer border-0 bg-gold-600/70 text-hunter-900 hover:bg-gold-500 dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
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
          <DialogContent className='z-[200] border-gold-500/20 bg-hunter-900/50 backdrop-blur-xl dark:border-gold-500/20 dark:bg-hunter-900/30 sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-gold-400'>
                Filter by Topics
              </DialogTitle>
              <DialogDescription className='text-grey-300'>
                Select topics to filter projects. Choose multiple topics to see
                projects that match any of them.
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
                        ? 'border-0 bg-gold-600/70 text-hunter-900 hover:bg-gold-500 dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
                        : 'border-gold-500/30 text-gold-400 hover:border-gold-500/60 hover:bg-hunter-800/50 dark:border-gold-500/30 dark:text-gold-400 dark:hover:bg-hunter-800/70'
                    }`}
                  >
                    <Tag className='mr-2 size-3 shrink-0' />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div className='flex items-center justify-between border-t border-gold-500/20 pt-4 dark:border-gold-500/20'>
              <Button
                variant='outline'
                onClick={() => {
                  setSelectedTags([]);
                  setIsTagFilterOpen(false);
                }}
                className='border-gold-500/20 bg-hunter-800/30 text-gold-400 hover:border-gold-500/50 hover:bg-hunter-700/50 dark:border-gold-500/20 dark:bg-hunter-800/30'
              >
                Clear All
              </Button>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsTagFilterOpen(false)}
                  className='border-gold-500/20 bg-hunter-800/30 text-gold-400 hover:border-gold-500/50 hover:bg-hunter-700/50 dark:border-gold-500/20 dark:bg-hunter-800/30'
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsTagFilterOpen(false)}
                  className='border-0 bg-gold-600/70 text-hunter-900 hover:bg-gold-500 dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
                >
                  Apply Filters ({selectedTags.length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Projects Grid */}
        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className='h-full border-gold-500/20 bg-hunter-900/30 dark:border-gold-500/20 dark:bg-hunter-900/30'
              >
                <CardHeader>
                  <Skeleton className='mb-2 h-6 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='mb-4 h-20 w-full' />
                  <div className='mb-4 flex gap-2'>
                    <Skeleton className='h-6 w-16' />
                    <Skeleton className='h-6 w-20' />
                  </div>
                  <div className='mb-4 flex gap-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                  <Skeleton className='mb-4 h-4 w-32' />
                  <Skeleton className='h-10 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className='border-gold-500/20 bg-hunter-900/30 py-16 text-center dark:border-gold-500/20 dark:bg-hunter-900/30'>
            <CardContent>
              <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-hunter-800/60 ring-1 ring-gold-500/20 backdrop-blur-md'>
                <Briefcase className='size-8 text-gold-400' />
              </div>
              <H3 className='text-grey-100 mb-3'>No projects found</H3>
              <P className='text-grey-400 mx-auto max-w-md'>
                {searchQuery || selectedTags.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'No projects have been published yet'}
              </P>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* All Projects Grid */}
            <div className='mb-8'>
              <H2 className='mb-6 text-gold-400'>Projects & Case Studies</H2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {displayedProjects.map(project => {
                  const categoryIcon = categoryIcons[project.category] ?? (
                    <Briefcase className='mr-1 size-3' />
                  );
                  return (
                    <Card
                      key={project.id}
                      className='group flex h-full flex-col border-gold-500/20 bg-hunter-900/30 transition-all duration-300 hover:border-gold-500/40 hover:bg-hunter-800/40 dark:border-gold-500/20 dark:bg-hunter-900/30'
                    >
                      <CardHeader className='shrink-0 pb-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <Badge
                            variant='outline'
                            className='border-gold-500/30 text-xs text-gold-300 dark:border-gold-500/30 dark:text-gold-300'
                          >
                            {categoryIcon}
                            {project.category}
                          </Badge>
                          {project.date && (
                            <span className='text-grey-500 dark:text-grey-500 text-xs'>
                              {new Date(project.date).getFullYear()}
                            </span>
                          )}
                        </div>
                        <CardTitle className='text-xl font-bold text-white transition-colors group-hover:text-gold-400 dark:text-white dark:group-hover:text-gold-400'>
                          {project.title}
                        </CardTitle>
                        <CardDescription className='text-grey-300 text-sm leading-relaxed'>
                          {project.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className='flex h-full flex-col pt-0'>
                        <div className='mb-3 flex flex-wrap gap-1.5'>
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='border-gold-500/30 bg-gold-600/20 px-2 py-0.5 text-xs text-gold-300 dark:border-gold-500/30 dark:bg-gold-600/20 dark:text-gold-300'
                            >
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge
                              variant='secondary'
                              className='border-grey-600/30 bg-grey-700/50 text-grey-300 dark:border-grey-600/30 dark:bg-grey-700/50 dark:text-grey-300 px-2 py-0.5 text-xs'
                            >
                              +{project.tags.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className='mt-auto'>
                          <div className='text-grey-500 dark:text-grey-500 mb-2 flex items-center justify-between text-xs'>
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
                            className='w-full border-0 bg-gold-600/70 py-2 text-sm text-hunter-900 hover:bg-gold-500 dark:bg-gold-500 dark:text-hunter-950 dark:hover:bg-gold-400'
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
            </div>

            {/* Loading indicator for infinite scroll */}
            {displayedProjects.length < filteredProjects.length && (
              <div ref={loadingRef} className='py-12 text-center'>
                <div className='text-grey-400 dark:text-grey-400 inline-flex items-center gap-3'>
                  <div className='size-6 animate-spin rounded-full border-b-2 border-gold-500'></div>
                  <span className='font-medium'>Loading more projects...</span>
                </div>
              </div>
            )}

            {/* End of projects indicator */}
            {displayedProjects.length === filteredProjects.length &&
              filteredProjects.length > 0 && (
                <div className='py-12 text-center'>
                  <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gold-500/20'>
                    <Briefcase className='size-6 text-gold-400' />
                  </div>
                  <p className='font-medium text-gold-400/60'>
                    You've reached the end of all projects
                  </p>
                </div>
              )}
          </>
        )}

        {/* Methodology Section - Glassmorphism */}
        <div className='mb-12 rounded-lg border border-gold-500/20 bg-hunter-900/30 p-6 backdrop-blur-xl dark:border-gold-500/20 dark:bg-hunter-900/30'>
          <div className='mb-6 text-center'>
            <h3 className='mb-3 text-xl font-bold text-gold-400'>
              Analytical Approach
            </h3>
            <p className='text-grey-300 mx-auto max-w-3xl text-base'>
              My projects follow a structured methodology combining quantitative
              analysis, industry best practices, and practical implementation
              strategies.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-gold-500/20'>
                <BarChart3 className='size-6 text-gold-400' />
              </div>
              <h4 className='mb-1.5 text-sm font-semibold text-gold-300'>
                Data-Driven Insights
              </h4>
              <p className='text-grey-400 text-xs'>
                Comprehensive data analysis using statistical methods and
                visualization techniques
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-gold-500/20'>
                <TrendingUp className='size-6 text-gold-400' />
              </div>
              <h4 className='mb-1.5 text-sm font-semibold text-gold-300'>
                Strategic Recommendations
              </h4>
              <p className='text-grey-400 text-xs'>
                Actionable insights and implementation roadmaps for business
                impact
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-hunter-500 to-slate-600'>
                <User className='size-6 text-white' />
              </div>
              <h4 className='mb-1.5 text-sm font-semibold text-gray-900 dark:text-white'>
                Expert Execution
              </h4>
              <p className='text-xs text-gray-600 dark:text-gray-300'>
                PMP-certified project management with proven delivery
                methodologies
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - More Compact */}
        <div className='text-center'>
          <div className='rounded-xl bg-gradient-to-r from-hunter-600 to-slate-600 p-6 text-white'>
            <h3 className='mb-3 text-xl font-bold'>
              Ready to Transform Your Projects?
            </h3>
            <p className='mx-auto mb-4 max-w-2xl text-base text-hunter-100'>
              Let's discuss how data-driven project management and strategic
              analysis can drive success in your organization.
            </p>
            <div className='flex flex-col justify-center gap-3 sm:flex-row'>
              <Button
                onClick={() => void navigate({ to: '/contact' })}
                variant='secondary'
                size='default'
                className='border-0 bg-white text-hunter-600 hover:bg-gray-100'
              >
                Get in Touch
              </Button>
              <Button
                onClick={() => void navigate({ to: '/portfolio' })}
                variant='secondary'
                size='default'
                className='border border-white/30 bg-white/20 text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-hunter-600'
              >
                View Portfolio
              </Button>
            </div>
          </div>
        </div>

        {/* Related Content */}
        <div className='mx-auto mt-16 max-w-4xl'>
          <UnifiedRelatedContent
            title='Projects and Case Studies'
            tags={['projects', 'analytics', 'case studies']}
            currentUrl='/projects'
            maxResults={3}
            variant='inline'
          />
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
