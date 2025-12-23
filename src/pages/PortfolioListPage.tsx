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
    color: 'from-surface-elevated0 to-strategy-gold',
    bgColor: 'bg-surface-elevated dark:bg-surface-deep/20',
    borderColor: 'border-border-subtle dark:border-precision-charcoal-light',
  },
  'AI & Automation': {
    icon: Sparkles,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  'Data & Analytics': {
    icon: TrendingUp,
    color: 'from-surface-elevated0 to-strategy-gold',
    bgColor: 'bg-surface-elevated dark:bg-surface-deep/20',
    borderColor: 'border-border-subtle dark:border-precision-charcoal-light',
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
      <div className='min-h-screen bg-surface-base'>
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
                className='h-80 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl'
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
    <div className='min-h-screen bg-surface-base'>
      {/* Hero Section - Glassmorphism Theme */}
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
                    Portfolio & Expertise
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-strategy-gold/50'></div>
              </div>
            </div>

            {/* Description with Glassmorphism Theme */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-text-secondary'>
              Strategic technology leadership, enterprise modernization, and
              operational excellence across complex business environments.
              <span className='font-medium text-strategy-gold'>
                {' '}
                Transform with expertise{' '}
              </span>
              and proven strategic leadership.
            </p>

            {/* Quick Stats with Glassmorphism Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>{portfolioItems.length} Portfolio Items</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
                <span>
                  {portfolioSearch?.getCategories().length ?? 0} Categories
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm text-text-secondary'>
                <div className='size-2 rounded-full bg-strategy-gold/60'></div>
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
          <div className='rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 p-6 shadow-lg backdrop-blur-xl'>
            <div className='flex flex-col gap-4 sm:flex-row'>
              {/* Search Input */}
              <div className='relative flex-1'>
                <Search className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-strategy-gold' />
                <Input
                  placeholder='Search portfolio and expertise...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/50 pl-12 text-text-foreground placeholder:text-text-tertiary focus:border-strategy-gold/50 focus:ring-strategy-gold/20'
                />
              </div>

              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
                  >
                    <span className='mr-2'>
                      {selectedCategory === 'all'
                        ? 'All Categories'
                        : selectedCategory}
                    </span>
                    <ChevronDown className='size-4 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='max-h-60 w-full overflow-y-auto rounded-lg border-strategy-gold/20 bg-surface-elevated/90 shadow-xl backdrop-blur-xl sm:w-64'>
                  <DropdownMenuItem
                    onClick={() => setSelectedCategory('all')}
                    className='mx-2 my-1 rounded-lg text-strategy-gold hover:bg-surface-deep/50'
                  >
                    All Categories
                  </DropdownMenuItem>
                  {portfolioSearch?.getCategories().map(category => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className='mx-2 my-1 rounded-lg text-strategy-gold hover:bg-surface-deep/50'
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
                className='h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
              >
                <Filter className='mr-2 size-4' />
                Tags{' '}
                {selectedTags.length > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-2 bg-strategy-gold text-precision-charcoal'
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
                  className='h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
                >
                  <X className='mr-2 size-4' />
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
        </div>

        {/* Results Count */}
        <div className='mx-auto mb-8 max-w-4xl'>
          <div className='flex items-center justify-between'>
            <p className='font-medium text-strategy-gold'>
              Showing {displayedItems.length} of {filteredItems.length} items
            </p>
          </div>
        </div>

        {/* Portfolio Grid */}
        {filteredItems.length === 0 ? (
          <div className='mx-auto max-w-2xl'>
            <Card className='border-strategy-gold/20 bg-surface-elevated/30 py-16 text-center'>
              <CardContent>
                <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-surface-deep/60 ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <Briefcase className='size-10 text-strategy-gold' />
                </div>
                <H3 className='mb-3 text-text-foreground'>
                  No portfolio items found
                </H3>
                <P className='mb-6 text-text-secondary'>
                  Try adjusting your search criteria or filters to find what
                  you're looking for
                </P>
                <Button
                  onClick={clearFilters}
                  className='border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                >
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className='mx-auto mb-8 max-w-7xl'>
              <H2 className='mb-3 text-strategy-gold'>Portfolio Items</H2>

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
                      className='group relative flex h-full flex-col overflow-hidden rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-strategy-gold/40 hover:bg-surface-elevated/50 hover:shadow-xl'
                    >
                      {/* Gold accent on top */}
                      <div className='absolute inset-x-0 top-0 h-1 bg-strategy-gold/60'></div>

                      <div className='relative flex flex-1 flex-col p-6'>
                        {/* Category Badge */}
                        <div className='mb-4 flex items-start justify-between'>
                          <Badge
                            variant='secondary'
                            className='border-strategy-gold/30 bg-strategy-gold/20 text-strategy-gold shadow-sm'
                          >
                            <CategoryIcon className='mr-1 size-3' />
                            {item.category}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className='mb-2 text-xl font-bold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                          <Link
                            to={`/${item.url}`}
                            className='decoration-2 underline-offset-4 hover:underline'
                          >
                            {item.title}
                          </Link>
                        </h3>

                        {/* Description */}
                        <p className='mb-4 line-clamp-3 flex-1 leading-relaxed text-text-secondary'>
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
                                    className='h-auto border-strategy-gold/30 bg-strategy-gold/20 px-2 py-1 text-xs text-strategy-gold'
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
                                    className='border-text-tertiary/30 bg-text-tertiary/10 px-2 py-1 text-xs text-text-tertiary'
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
                          className='mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-strategy-gold px-4 py-3 font-semibold text-precision-charcoal transition-all duration-200 hover:bg-strategy-gold/90 hover:shadow-lg'
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
                <div className='inline-flex items-center gap-3 text-text-secondary'>
                  <div className='size-6 animate-spin rounded-full border-b-2 border-strategy-gold'></div>
                  <span className='font-medium'>Loading more items...</span>
                </div>
              </div>
            )}

            {/* End of items indicator */}
            {displayedItems.length === filteredItems.length &&
              filteredItems.length > 0 && (
                <div className='py-12 text-center'>
                  <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-strategy-gold/20'>
                    <Briefcase className='size-6 text-strategy-gold' />
                  </div>
                  <p className='font-medium text-strategy-gold/60'>
                    You've reached the end of all portfolio items
                  </p>
                </div>
              )}
          </>
        )}

        {/* Tag Filter Dialog */}
        <Dialog open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <DialogContent className='z-[200] flex max-h-[85vh] max-w-3xl flex-col border-strategy-gold/20 bg-surface-elevated/50 backdrop-blur-xl'>
            <DialogHeader className='pb-4'>
              <DialogTitle className='flex items-center gap-3 text-xl text-strategy-gold'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-surface-deep/60 ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <Filter className='size-5 text-strategy-gold' />
                </div>
                Filter by Topics
              </DialogTitle>
              <DialogDescription className='text-text-secondary'>
                Select topics to filter portfolio items by specific themes and
                subjects
              </DialogDescription>
            </DialogHeader>

            <Separator className='bg-strategy-gold/20' />

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
                          ? 'border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                          : 'border-strategy-gold/30 text-strategy-gold hover:border-strategy-gold/60 hover:bg-surface-elevated/50'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className='mr-2 size-3' />
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>

            <Separator className='bg-strategy-gold/20' />

            <div className='flex items-center justify-between p-6'>
              <div className='text-sm text-text-secondary'>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}{' '}
                selected
              </div>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='border-strategy-gold/20 bg-surface-deep/30 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
                >
                  Clear All
                </Button>
                <Button
                  onClick={closeTagFilter}
                  className='border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
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
