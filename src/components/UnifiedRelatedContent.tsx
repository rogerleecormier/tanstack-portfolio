import {
  CachedContentItem,
  cachedContentService,
} from '@/api/cachedContentService';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDynamicHeight } from '@/hooks/useDynamicHeight';
import {
  ArrowRight,
  BookOpen,
  Clock,
  ExternalLink,
  Tag,
  TrendingUp,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ContentItem } from '../types/content';
import { parseContentForSearch } from '../utils/characterParser';

interface UnifiedRelatedContentProps {
  title?: string;
  tags?: string[];
  currentUrl: string;
  className?: string;
  maxResults?: number;
  variant?: 'sidebar' | 'inline';
  content?: string;
  dynamicHeight?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

// Extended ContentItem interface to include relevance score
interface ExtendedContentItem extends ContentItem {
  relevanceScore?: number;
}

export function UnifiedRelatedContent({
  title,
  tags = [],
  currentUrl,
  className = '',
  maxResults = 2,
  variant = 'sidebar',
  dynamicHeight = false,
  containerRef,
}: UnifiedRelatedContentProps) {
  const [recommendations, setRecommendations] = useState<ExtendedContentItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Dynamic height calculation - simplified approach
  const dynamicMaxResults = useDynamicHeight({
    containerRef: (containerRef ?? sidebarRef) as React.RefObject<HTMLElement>,
    itemHeight: 100, // Conservative height estimate for each related content card
    minItems: 2, // Always show at least 2 items
    maxItems: 6, // Reasonable maximum
    padding: 40, // Minimal padding buffer
  });

  // Use dynamic height if enabled, otherwise use the provided maxResults
  // For now, let's use a simple approach: show more items by default when dynamic is enabled
  const effectiveMaxResults = dynamicHeight
    ? Math.max(3, dynamicMaxResults)
    : maxResults;

  const getRecommendations = useCallback(async () => {
    if (!title && (!tags || tags.length === 0)) {
      return;
    }

    // Check if cached service is ready with retry logic
    let retryCount = 0;
    const maxRetries = 3;

    while (!cachedContentService.isReady() && retryCount < maxRetries) {
      retryCount++;
      console.log(
        `🔄 Waiting for content service to be ready... (attempt ${retryCount}/${maxRetries})`
      );
      // Use requestIdleCallback for better performance instead of setTimeout
      await new Promise(resolve => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(resolve);
        } else {
          // Fallback for browsers that don't support requestIdleCallback
          setTimeout(resolve, 100);
        }
      });
    }

    if (!cachedContentService.isReady()) {
      console.warn(
        '⚠️ Content service not ready after retries, showing error state'
      );
      setError('Content service not ready after multiple attempts');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Getting recommendations from cached content service...');

      // Use the cached content service for recommendations
      const response = cachedContentService.getRecommendations({
        query: title ?? tags.join(' '),
        contentType: 'all', // Always use 'all' for cross-content type recommendations
        maxResults: effectiveMaxResults + 1, // Get one extra to account for current page
        excludeUrl: currentUrl,
        tags: tags ?? [],
      });

      if (response.success && response.results) {
        console.log(`✅ Found ${response.results.length} recommendations`);
        console.log(
          '🔍 Raw recommendations:',
          response.results.map(r => ({ id: r.id, title: r.title }))
        );
        console.log('🔍 Current URL:', currentUrl);
        console.log('🔍 Effective max results:', effectiveMaxResults);

        // Derive url and score for each item
        const extendedResults: ExtendedContentItem[] = response.results.map(
          (item: CachedContentItem) => ({
            ...item,
            url: `/${item.contentType}/${item.id}`,
            relevanceScore: 85, // Default score if not provided
          })
        );

        // Filter out the current page and limit results
        const filteredResults = extendedResults
          .filter((item: ExtendedContentItem) => {
            const currentId = currentUrl.split('/').pop();
            return item.id !== currentId;
          })
          .slice(0, effectiveMaxResults);

        console.log(
          `📋 Filtered to ${filteredResults.length} relevant results`
        );
        console.log(
          '🔍 Final recommendations:',
          filteredResults.map(r => ({ url: r.url, title: r.title }))
        );
        setRecommendations(filteredResults);
      } else {
        console.log('❌ No recommendations found or service error');
        setRecommendations([]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading recommendations:', err);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [title, tags, currentUrl, effectiveMaxResults]);

  useEffect(() => {
    void getRecommendations();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getRecommendations]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className='mb-6'>
          <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100'>
            Related Content
          </h3>
          <div className='h-1 w-16 rounded-full bg-gradient-to-r from-hunter-500 to-gold-500'></div>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: effectiveMaxResults }, (_, i) => (
            <Card key={i} className='border-dashed border-gray-200'>
              <CardHeader className='pb-3'>
                <Skeleton className='h-5 w-4/5' />
              </CardHeader>
              <CardContent className='pb-4 pt-0'>
                <Skeleton className='mb-3 h-4 w-full' />
                <Skeleton className='mb-3 h-4 w-3/4' />
                <Skeleton className='h-4 w-2/3' />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-500'>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card className='border-destructive/20 bg-destructive/5'>
          <CardContent className='pt-6'>
            <div className='py-4 text-center'>
              <p className='text-base text-muted-foreground'>
                Unable to load recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show skeleton when no recommendations
  if (!isLoading && recommendations.length === 0) {
    return (
      <div className={className}>
        <div className='mb-6'>
          <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100'>
            Related Content
          </h3>
          <div className='h-1 w-16 rounded-full bg-gradient-to-r from-hunter-500 to-gold-500'></div>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: effectiveMaxResults }, (_, i) => (
            <Card key={i} className='border-dashed opacity-50'>
              <CardHeader className='pb-3'>
                <Skeleton className='h-5 w-4/5' />
              </CardHeader>
              <CardContent className='pb-4 pt-0'>
                <Skeleton className='mb-3 h-4 w-full' />
                <Skeleton className='mb-3 h-4 w-3/4' />
                <Skeleton className='h-4 w-2/3' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return <BookOpen className='size-4' />;
      case 'portfolio':
        return <TrendingUp className='size-4' />;
      case 'project':
        return <ExternalLink className='size-4' />;
      default:
        return <BookOpen className='size-4' />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'blog':
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800';
      case 'portfolio':
        return 'bg-hunter-50 text-hunter-700 border-hunter-200 dark:bg-hunter-950 dark:text-hunter-300 dark:border-hunter-800';
      case 'project':
        return 'bg-gold-50 text-gold-700 border-gold-200 dark:bg-gold-950 dark:text-gold-300 dark:border-gold-800';
      default:
        return 'bg-hunter-50 text-hunter-700 border-hunter-200 dark:bg-hunter-950 dark:text-hunter-300 dark:border-hunter-800';
    }
  };

  if (variant === 'sidebar') {
    // Don't render anything if no recommendations
    if (recommendations.length === 0) {
      return null;
    }

    return (
      <div ref={sidebarRef} className={className}>
        <div className='mb-6'>
          <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100'>
            Related Content
          </h3>
          <div className='h-1 w-16 rounded-full bg-gradient-to-r from-hunter-500 to-gold-500'></div>
        </div>

        <div className='space-y-4'>
          {recommendations.map(item => (
            <Card
              key={item.id}
              className='group overflow-hidden transition-all duration-200 hover:border-hunter-300 hover:shadow-lg dark:hover:border-hunter-600'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start gap-3'>
                  <div className='min-w-0 flex-1'>
                    <CardTitle className='line-clamp-2 text-base font-semibold leading-tight text-gray-900 transition-colors group-hover:text-hunter-700 dark:text-gray-100 dark:group-hover:text-hunter-300'>
                      {parseContentForSearch(item.title)}
                    </CardTitle>
                    {item.category && (
                      <CardDescription className='mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                        <User className='size-4' />
                        {parseContentForSearch(item.category)}
                      </CardDescription>
                    )}
                  </div>
                  <a
                    href={item.url}
                    className='shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-hunter-50 hover:text-hunter-600 dark:hover:bg-hunter-950 dark:hover:text-hunter-400'
                    aria-label={`Read ${parseContentForSearch(item.title)}`}
                  >
                    <ArrowRight className='size-4' />
                  </a>
                </div>
              </CardHeader>

              <CardContent className='pb-4 pt-0'>
                <p className='mb-4 line-clamp-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  {parseContentForSearch(
                    item.description || 'No description available'
                  )}
                </p>

                {/* Compact tag display */}
                {item.tags && item.tags.length > 0 && (
                  <div className='mb-4'>
                    <div className='flex flex-wrap gap-1.5'>
                      {(() => {
                        // Deduplicate tags and filter out empty ones
                        const cleanTags = [
                          ...new Set(
                            item.tags.filter(
                              (tag: string) => tag && tag.trim().length > 0
                            )
                          ),
                        ];

                        return (
                          <>
                            {cleanTags
                              .slice(0, 3)
                              .map((tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant='secondary'
                                  className='h-auto px-1.5 py-0.5 text-xs'
                                  title={parseContentForSearch(tag)}
                                >
                                  <Tag className='mr-1 size-3' />
                                  <span className='whitespace-nowrap'>
                                    {parseContentForSearch(tag)}
                                  </span>
                                </Badge>
                              ))}
                            {cleanTags.length > 3 && (
                              <span className='px-2 py-1 text-xs text-gray-400 dark:text-gray-500'>
                                +{cleanTags.length - 3}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className='pb-4 pt-0'>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Badge
                      variant='outline'
                      className={`border px-2 py-1 text-xs ${getContentTypeColor(item.contentType)}`}
                    >
                      {getContentTypeIcon(item.contentType)}
                      <span className='ml-1 capitalize'>
                        {parseContentForSearch(item.contentType)}
                      </span>
                    </Badge>

                    <div className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
                      <Clock className='size-3' />
                      <span>Relevance:</span>
                      <span className='font-medium text-green-600 dark:text-green-400'>
                        {item.relevanceScore
                          ? `${item.relevanceScore}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Inline variant for portfolio/project pages
  return (
    <div className={className}>
      <div className='mb-8'>
        <div className='mb-4'>
          <h2 className='mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Related Content
          </h2>
          <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-hunter-500 to-gold-500'></div>
        </div>
        <p className='text-lg text-muted-foreground'>
          Discover more insights and projects
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {recommendations.map(item => (
          <Card
            key={item.id}
            className='group h-full overflow-hidden transition-all duration-200 hover:border-hunter-300 hover:shadow-xl dark:hover:border-hunter-600'
          >
            <CardHeader className='pb-4'>
              <div className='flex items-start gap-3'>
                <CardTitle className='line-clamp-2 flex-1 text-lg font-semibold leading-tight text-gray-900 transition-colors group-hover:text-hunter-700 dark:text-gray-100 dark:group-hover:text-hunter-300'>
                  {parseContentForSearch(item.title)}
                </CardTitle>
                <a
                  href={item.url}
                  className='shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-hunter-50 hover:text-hunter-600 dark:hover:bg-hunter-950 dark:hover:text-hunter-400'
                  aria-label={`Read ${parseContentForSearch(item.title)}`}
                >
                  <ArrowRight className='size-5' />
                </a>
              </div>
            </CardHeader>

            <CardContent className='pb-4 pt-0'>
              <p className='mb-4 line-clamp-4 text-base leading-relaxed text-gray-600 dark:text-gray-400'>
                {parseContentForSearch(item.description)}
              </p>

              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Badge
                    variant='outline'
                    className={`border px-3 py-1.5 text-sm ${getContentTypeColor(item.contentType)}`}
                  >
                    {getContentTypeIcon(item.contentType)}
                    <span className='ml-2 font-medium capitalize'>
                      {parseContentForSearch(item.contentType)}
                    </span>
                  </Badge>

                  <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                    <Clock className='size-4' />
                    <span>Relevance:</span>
                    <span className='font-medium text-green-600 dark:text-green-400'>
                      {item.relevanceScore ? `${item.relevanceScore}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1.5'>
                    {(() => {
                      const cleanTags = [
                        ...new Set(
                          item.tags.filter(
                            (tag: string) => tag && tag.trim().length > 0
                          )
                        ),
                      ];

                      return (
                        <>
                          {cleanTags
                            .slice(0, 3)
                            .map((tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant='secondary'
                                className='h-auto px-1.5 py-0.5 text-xs'
                                title={parseContentForSearch(tag)}
                              >
                                <Tag className='mr-1 size-3' />
                                <span className='whitespace-nowrap'>
                                  {parseContentForSearch(tag)}
                                </span>
                              </Badge>
                            ))}
                          {cleanTags.length > 3 && (
                            <span className='px-2 py-1 text-xs text-gray-400 dark:text-gray-500'>
                              +{cleanTags.length - 3}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
