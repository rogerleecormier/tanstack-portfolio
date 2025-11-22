import {
  cachedContentService,
  type CachedContentItem,
} from '@/api/cachedContentService';
import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Filter,
  Search,
  Shield,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
// PortfolioItem type is now CachedContentItem from cachedContentService
import { ScrollToTop } from '@/components/ScrollToTop';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { H2, H3, P } from '@/components/ui/typography';
import { logger } from '@/utils/logger';

// Helper function to safely parse tags
function parseTagsSafely(tags: unknown): string[] {
  if (!tags) return [];

  // If tags is already an array, process each item
  if (Array.isArray(tags)) {
    const allTags: string[] = [];

    for (const item of tags) {
      if (typeof item === 'string') {
        // Check if this string looks like JSON
        if (item.trim().startsWith('[') && item.trim().endsWith(']')) {
          try {
            const parsed = JSON.parse(item) as unknown;
            if (Array.isArray(parsed)) {
              allTags.push(
                ...parsed.filter(
                  (tag): tag is string => typeof tag === 'string'
                )
              );
            }
          } catch {
            // If parsing fails, treat as a single tag
            allTags.push(item);
          }
        } else {
          // Regular string tag
          allTags.push(item);
        }
      }
    }

    return allTags;
  }

  // If tags is a string, try to parse it
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      // If parsing fails, split by comma and clean up
      return tags.split(',').map((tag: string) =>
        tag
          .trim()
          .replace(/^\[|\]$/g, '')
          .replace(/"/g, '')
      );
    }
  }

  return [];
}

// Portfolio search functionality
class PortfolioSearch {
  private items: CachedContentItem[];

  constructor(items: CachedContentItem[]) {
    this.items = items;
  }

  search(query: string, category: string, tags: string[]): CachedContentItem[] {
    let results = this.items;

    // Filter by category
    if (category && category !== 'all') {
      results = results.filter(item => item.category === category);
    }

    // Filter by tags
    if (tags.length > 0) {
      results = results.filter(item =>
        tags.some(tag => item.tags.includes(tag))
      );
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        item =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm)
          ) ||
          item.category.toLowerCase().includes(searchTerm)
      );
    }

    return results;
  }

  getCategories(): string[] {
    return [...new Set(this.items.map(item => item.category))].sort();
  }

  getTags(): string[] {
    const allTags = this.items.flatMap(item => item.tags);
    return [...new Set(allTags)].sort();
  }
}

// Category configuration with icons and colors
const categoryConfig = {
  'Strategy & Consulting': {
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  'Leadership & Culture': {
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  'Technology & Operations': {
    icon: Zap,
    color: 'from-hunter-500 to-hunter-600',
    bgColor: 'bg-hunter-50 dark:bg-hunter-950/20',
    borderColor: 'border-hunter-200 dark:border-hunter-800',
  },
  'AI & Automation': {
    icon: Sparkles,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  'Data & Analytics': {
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  'Risk & Compliance': {
    icon: Shield,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
};

export default function PortfolioListPage() {
  const [portfolioItems, setPortfolioItems] = useState<CachedContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CachedContentItem[]>([]);
  const [portfolioSearch, setPortfolioSearch] =
    useState<PortfolioSearch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [displayedItems, setDisplayedItems] = useState<CachedContentItem[]>([]);
  const [postsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Load portfolio items on component mount
  useEffect(() => {
    const loadItems = () => {
      try {
        setIsLoading(true);
        logger.debug('🚀 Starting to load portfolio items from KV cache...');

        const cachedItems = cachedContentService.getContentByType('portfolio');

        const items: CachedContentItem[] = cachedItems;
        logger.debug('✨ Portfolio items loaded from KV:', items);
        logger.debug(
          `📊 Discovered ${items.length} portfolio items:`,
          items.map(item => item.id)
        );
        setPortfolioItems(items);

        // Initialize search
        const search = new PortfolioSearch(items);
        setPortfolioSearch(search);
        setFilteredItems(items);
      } catch (error) {
        console.error('Error loading portfolio items:', error);
        logger.error('❌ Error loading portfolio items from KV cache:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void loadItems();
  }, []);

  // Update filtered results when search criteria change
  useEffect(() => {
    if (portfolioSearch) {
      const results = portfolioSearch.search(
        searchQuery,
        selectedCategory,
        selectedTags
      );
      setFilteredItems(results);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [searchQuery, selectedCategory, selectedTags, portfolioSearch]);

  // Update displayed items when filtered items or current page changes
  useEffect(() => {
    const endIndex = currentPage * postsPerPage;
    setDisplayedItems(filteredItems.slice(0, endIndex));
  }, [filteredItems, currentPage, postsPerPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTags([]);
  };

  const closeTagFilter = () => {
    setIsTagFilterOpen(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
              displayedItems.length < filteredItems.length
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
    [isLoading, isLoadingMore, displayedItems.length, filteredItems.length]
  );

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-teal-950/20'>
        <div className='container mx-auto px-4 py-8'>
          {/* Header Skeleton */}
          <div className='mb-12 text-center'>
            <Skeleton className='mx-auto mb-4 h-16 w-96' />
            <Skeleton className='mx-auto h-6 w-2/3' />
          </div>

          {/* Search Skeleton */}
          <div className='mx-auto mb-8 max-w-4xl'>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <Skeleton className='h-12 flex-1' />
              <Skeleton className='h-12 w-48' />
              <Skeleton className='h-12 w-32' />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className='h-80 border-0 bg-white/50 shadow-xl backdrop-blur-sm dark:bg-slate-900/50'
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-hunter-50 to-slate-100 dark:from-slate-950 dark:via-hunter-950 dark:to-slate-900'>
      {/* Hero Section - Compact with Targeting Theme */}
      <div className='relative overflow-hidden border-b border-hunter-200 dark:border-hunter-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-hunter-600/5 via-slate-600/5 to-hunter-600/5 dark:from-hunter-400/10 dark:via-slate-400/10 dark:to-hunter-400/10'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Targeting Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hunter-500 to-slate-600 shadow-lg'>
                  <Briefcase className='size-7 text-white' />
                </div>
                {/* Targeting indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-purple-600'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-hunter-400 to-slate-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>
                  <span className='bg-gradient-to-r from-hunter-400 to-hunter-300 bg-clip-text text-transparent'>
                    Portfolio & Expertise
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-hunter-500 to-slate-500'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-slate-300'>
              Strategic technology leadership, enterprise modernization, and
              operational excellence across complex business environments.
              <span className='font-medium text-gold-300'>
                {' '}
                Target your transformation{' '}
              </span>
              with proven expertise and strategic leadership.
            </p>

            {/* Quick Stats with Targeting Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-slate-400'>
                <div className='size-2 rounded-full bg-hunter-500'></div>
                <span>{portfolioItems.length} Portfolio Items</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-slate-400'>
                <div className='size-2 rounded-full bg-blue-500'></div>
                <span>
                  {portfolioSearch?.getCategories().length ?? 0} Categories
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-purple-500'></div>
                <span>{portfolioSearch?.getTags().length ?? 0} Topics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Search and Filters */}
        <div className='mx-auto mb-8 max-w-4xl'>
          <div className='rounded-2xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:border-slate-800/20 dark:bg-slate-900/70'>
            <div className='flex flex-col gap-4 sm:flex-row'>
              {/* Search Input */}
              <div className='relative flex-1'>
                <Search className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400' />
                <Input
                  placeholder='Search portfolio and expertise...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='h-12 rounded-xl border-0 bg-white/50 pl-12 shadow-sm focus:ring-2 focus:ring-hunter-500/20 dark:bg-slate-800/50'
                />
              </div>

              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-12 rounded-xl border-0 bg-white/50 px-6 shadow-sm hover:bg-white/70 dark:bg-slate-800/50 dark:hover:bg-slate-800/70'
                  >
                    <span className='mr-2'>
                      {selectedCategory === 'all'
                        ? 'All Categories'
                        : selectedCategory}
                    </span>
                    <ChevronDown className='size-4 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='max-h-60 w-full overflow-y-auto rounded-xl border-0 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-slate-900/95 sm:w-64'>
                  <DropdownMenuItem
                    onClick={() => setSelectedCategory('all')}
                    className='mx-2 my-1 rounded-lg hover:bg-hunter-50 dark:hover:bg-hunter-950/20'
                  >
                    All Categories
                  </DropdownMenuItem>
                  {portfolioSearch?.getCategories().map(category => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className='mx-2 my-1 rounded-lg hover:bg-hunter-50 dark:hover:bg-hunter-950/20'
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tags Filter Button */}
              <Button
                variant='outline'
                onClick={() => setIsTagFilterOpen(true)}
                className='h-12 rounded-xl border-0 bg-white/50 px-6 shadow-sm hover:bg-white/70 dark:bg-slate-800/50 dark:hover:bg-slate-800/70'
              >
                <Filter className='mr-2 size-4' />
                Tags{' '}
                {selectedTags.length > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-2 bg-hunter-100 text-hunter-800 dark:bg-hunter-900 dark:text-hunter-200'
                  >
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>

              {/* Clear Filters */}
              {(searchQuery ||
                selectedCategory !== 'all' ||
                selectedTags.length > 0) && (
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='h-12 rounded-xl border-red-200 bg-red-50 px-6 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40'
                >
                  <X className='mr-2 size-4' />
                  Clear
                </Button>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className='mt-4 border-t border-slate-200 pt-4 dark:border-slate-700'>
                <div className='mb-3 flex items-center gap-2'>
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Active filters:
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant='default'
                      className='btn-hunter cursor-pointer border-0 shadow-sm'
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
        </div>

        {/* Results Count */}
        <div className='mx-auto mb-8 max-w-4xl'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-slate-600 dark:text-slate-300'>
              Showing {displayedItems.length} of {filteredItems.length} items
            </p>
          </div>
        </div>

        {/* Portfolio Grid */}
        {filteredItems.length === 0 ? (
          <div className='mx-auto max-w-2xl'>
            <Card className='border-0 bg-white/70 py-16 text-center shadow-xl backdrop-blur-sm dark:bg-slate-900/70'>
              <CardContent>
                <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'>
                  <Briefcase className='size-10 text-slate-400' />
                </div>
                <H3 className='mb-3 text-slate-700 dark:text-slate-300'>
                  No portfolio items found
                </H3>
                <P className='mb-6 text-slate-500 dark:text-slate-400'>
                  Try adjusting your search criteria or filters to find what
                  you're looking for
                </P>
                <Button
                  onClick={clearFilters}
                  className='btn-hunter border-0 shadow-lg'
                >
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className='mx-auto mb-8 max-w-7xl'>
              <H2 className='mb-3 text-gray-800 dark:text-gray-200'>
                Portfolio Items
              </H2>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {displayedItems.map(item => {
                  const categoryInfo = categoryConfig[
                    item.category as keyof typeof categoryConfig
                  ] || {
                    icon: Briefcase,
                    color: 'from-slate-500 to-slate-600',
                    bgColor: 'bg-slate-50 dark:bg-slate-950/20',
                    borderColor: 'border-slate-200 dark:border-slate-800',
                  };
                  const CategoryIcon = categoryInfo.icon;

                  return (
                    <div
                      key={item.id}
                      className='group relative flex h-full flex-col overflow-hidden rounded-2xl border border-hunter-600/20 bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-hunter-600/20'
                    >
                      {/* Gradient accent on top */}
                      <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-hunter-600/0 via-hunter-500 to-hunter-600/0'></div>

                      <div className='relative flex flex-1 flex-col p-6'>
                        {/* Category Badge */}
                        <div className='mb-4 flex items-start justify-between'>
                          <Badge
                            variant='secondary'
                            className='border-hunter-600/30 bg-hunter-600/15 text-hunter-300 shadow-sm'
                          >
                            <CategoryIcon className='mr-1 size-3' />
                            {item.category}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className='mb-2 text-xl font-bold text-white transition-colors group-hover:text-hunter-300'>
                          <Link
                            to={`/${item.url}`}
                            className='decoration-2 underline-offset-4 hover:underline'
                          >
                            {item.title}
                          </Link>
                        </h3>

                        {/* Description */}
                        <p className='mb-4 line-clamp-3 flex-1 leading-relaxed text-slate-300'>
                          {item.description}
                        </p>

                        {/* Tags */}
                        <div className='mb-6 flex flex-wrap gap-2'>
                          {(() => {
                            const cleanTags = parseTagsSafely(item.tags).filter(
                              tag => tag && tag.trim().length > 0
                            );
                            return (
                              <>
                                {cleanTags.slice(0, 3).map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant='secondary'
                                    className='h-auto border-hunter-600/30 bg-hunter-600/15 px-2 py-1 text-xs text-hunter-300'
                                  >
                                    <Tag className='mr-1 size-3' />
                                    <span className='whitespace-nowrap'>
                                      {tag}
                                    </span>
                                  </Badge>
                                ))}
                                {cleanTags.length > 3 && (
                                  <Badge
                                    variant='secondary'
                                    className='border-slate-600/30 bg-slate-700/50 px-2 py-1 text-xs text-slate-300'
                                  >
                                    +{cleanTags.length - 3}
                                  </Badge>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Prominent View Details Button */}
                        <Link
                          to={`/${item.url}`}
                          className='mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-hunter-600 to-hunter-500 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-hunter-700 hover:to-hunter-600 hover:shadow-lg hover:shadow-hunter-600/50'
                        >
                          View Details
                          <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Loading indicator for infinite scroll */}
            {displayedItems.length < filteredItems.length && (
              <div ref={loadingRef} className='py-12 text-center'>
                <div className='inline-flex items-center gap-3 text-slate-500 dark:text-slate-400'>
                  <div className='size-6 animate-spin rounded-full border-b-2 border-hunter-600'></div>
                  <span className='font-medium'>Loading more items...</span>
                </div>
              </div>
            )}

            {/* End of items indicator */}
            {displayedItems.length === filteredItems.length &&
              filteredItems.length > 0 && (
                <div className='py-12 text-center'>
                  <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-hunter-100 to-slate-100 dark:from-hunter-900/50 dark:to-slate-900/50'>
                    <Briefcase className='size-6 text-hunter-600 dark:text-hunter-400' />
                  </div>
                  <p className='font-medium text-slate-500 dark:text-slate-400'>
                    You've reached the end of all portfolio items
                  </p>
                </div>
              )}
          </>
        )}

        {/* Tag Filter Dialog */}
        <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <DialogContent className='flex max-h-[85vh] max-w-3xl flex-col rounded-2xl border-0 bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-slate-900/95'>
            <DialogHeader className='pb-4'>
              <DialogTitle className='flex items-center gap-3 text-xl'>
                <div className='flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-hunter-500 to-slate-600'>
                  <Filter className='size-5 text-white' />
                </div>
                Filter by Topics
              </DialogTitle>
              <DialogDescription className='text-slate-600 dark:text-slate-300'>
                Select topics to filter portfolio items by specific themes and
                subjects
              </DialogDescription>
            </DialogHeader>

            <Separator className='bg-slate-200 dark:bg-slate-700' />

            <div className='flex-1 overflow-y-auto p-6'>
              <div className='flex flex-wrap gap-3'>
                {portfolioItems
                  .flatMap(item => item.tags)
                  .filter((tag, index, self) => self.indexOf(tag) === index)
                  .sort()
                  .map(tag => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? 'secondary' : 'outline'
                      }
                      className={`cursor-pointer px-3 py-2 text-sm transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'btn-hunter border-0 shadow-lg'
                          : 'border-slate-200 bg-white/50 hover:border-hunter-300 hover:bg-hunter-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-hunter-700 dark:hover:bg-hunter-950/20'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className='mr-2 size-3' />
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>

            <Separator className='bg-slate-200 dark:bg-slate-700' />

            <div className='flex items-center justify-between p-6'>
              <div className='text-sm text-slate-600 dark:text-slate-300'>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}{' '}
                selected
              </div>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                >
                  Clear All
                </Button>
                <Button
                  onClick={closeTagFilter}
                  className='btn-hunter border-0 shadow-lg'
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
