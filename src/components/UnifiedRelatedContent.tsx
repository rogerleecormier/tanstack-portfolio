import { useEffect, useState, useCallback, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp,
  ExternalLink,
  Clock,
  Tag,
  BookOpen,
  User,
  ArrowRight
} from 'lucide-react'
import { ContentItem } from '../types/content'
import { parseContentForSearch } from '../utils/characterParser'
import { cachedContentService } from '@/api/cachedContentService'
import { useDynamicHeight } from '@/hooks/useDynamicHeight'

interface UnifiedRelatedContentProps {
  title?: string
  tags?: string[]
  currentUrl: string
  className?: string
  maxResults?: number
  variant?: 'sidebar' | 'inline'
  content?: string
  dynamicHeight?: boolean
  containerRef?: React.RefObject<HTMLElement>
}

// Extended ContentItem interface to include relevance score
interface ExtendedContentItem extends ContentItem {
  relevanceScore?: number
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
  const [recommendations, setRecommendations] = useState<ExtendedContentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Dynamic height calculation - simplified approach
  const dynamicMaxResults = useDynamicHeight({
    containerRef: (containerRef || sidebarRef) as React.RefObject<HTMLElement>,
    itemHeight: 100, // Conservative height estimate for each related content card
    minItems: 2, // Always show at least 2 items
    maxItems: 6, // Reasonable maximum
    padding: 40 // Minimal padding buffer
  })

  // Use dynamic height if enabled, otherwise use the provided maxResults
  // For now, let's use a simple approach: show more items by default when dynamic is enabled
  const effectiveMaxResults = dynamicHeight ? Math.max(3, dynamicMaxResults) : maxResults

  const getRecommendations = useCallback(async () => {
    if (!title && (!tags || tags.length === 0)) {
      return
    }

    // Check if cached service is ready with retry logic
    let retryCount = 0
    const maxRetries = 3
    
    while (!cachedContentService.isReady() && retryCount < maxRetries) {
      retryCount++
      console.log(`🔄 Waiting for content service to be ready... (attempt ${retryCount}/${maxRetries})`)
      // Use requestIdleCallback for better performance instead of setTimeout
      await new Promise(resolve => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(resolve)
        } else {
          // Fallback for browsers that don't support requestIdleCallback
          setTimeout(resolve, 100)
        }
      })
    }

    if (!cachedContentService.isReady()) {
      console.warn('⚠️ Content service not ready after retries, showing error state')
      setError('Content service not ready after multiple attempts')
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 Getting recommendations from cached content service...')

      // Use the cached content service for recommendations
      const response = await cachedContentService.getRecommendations({
        query: title || tags.join(' '),
        contentType: 'all', // Always use 'all' for cross-content type recommendations
        maxResults: effectiveMaxResults + 1, // Get one extra to account for current page
        excludeUrl: currentUrl,
        tags: tags || []
      })

      if (response.success && response.results) {
        console.log(`✅ Found ${response.results.length} recommendations`)
        console.log('🔍 Raw recommendations:', response.results.map(r => ({ url: r.url, title: r.title })))
        console.log('🔍 Current URL:', currentUrl)
        console.log('🔍 Effective max results:', effectiveMaxResults)
        
        // Filter out the current page and limit results
        const filteredResults = response.results
          .filter((item: ContentItem) => item.url !== currentUrl)
          .slice(0, effectiveMaxResults)
        
        console.log(`📋 Filtered to ${filteredResults.length} relevant results`)
        console.log('🔍 Final recommendations:', filteredResults.map(r => ({ url: r.url, title: r.title })))
        setRecommendations(filteredResults)
      } else {
        console.log('❌ No recommendations found or service error')
        setRecommendations([])
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error loading recommendations:', err)
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [title, tags, currentUrl, effectiveMaxResults])

  useEffect(() => {
    getRecommendations()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [getRecommendations])

  if (isLoading) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Related Content
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: effectiveMaxResults }, (_, i) => (
            <Card key={i} className="border-dashed border-gray-200">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-4/5" />
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-base text-muted-foreground">
                Unable to load recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show skeleton when no recommendations
  if (!isLoading && recommendations.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Related Content
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: effectiveMaxResults }, (_, i) => (
            <Card key={i} className="border-dashed opacity-50">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-4/5" />
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return <BookOpen className="h-4 w-4" />
      case 'portfolio':
        return <TrendingUp className="h-4 w-4" />
      case 'project':
        return <ExternalLink className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'blog':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
      case 'portfolio':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800'
      case 'project':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800'
    }
  }

  if (variant === 'sidebar') {
    // Don't render anything if no recommendations
    if (recommendations.length === 0) {
      return null
    }

    return (
      <div ref={sidebarRef} className={className}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Related Content
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {parseContentForSearch(item.title)}
                    </CardTitle>
                    {item.category && (
                      <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {parseContentForSearch(item.category)}
                      </CardDescription>
                    )}
                  </div>
                  <a 
                    href={item.url} 
                    className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex-shrink-0 p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950"
                    aria-label={`Read ${parseContentForSearch(item.title)}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-4 leading-relaxed">
                  {parseContentForSearch(item.description || 'No description available')}
                </p>
                
                {/* Compact tag display */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        // Deduplicate tags and filter out empty ones
                        const cleanTags = [...new Set(item.tags.filter((tag: string) => tag && tag.trim().length > 0))];
                        
                        return (
                          <>
                            {cleanTags.slice(0, 3).map((tag: string, index: number) => (
                              <Badge 
                                key={index}
                                variant="secondary"
                                className="text-xs px-1.5 py-0.5 h-auto"
                                title={parseContentForSearch(tag)}
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                <span className="whitespace-nowrap">{parseContentForSearch(tag)}</span>
                              </Badge>
                            ))}
                            {cleanTags.length > 3 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
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
             
              <CardFooter className="pt-0 pb-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 border ${getContentTypeColor(item.contentType)}`}
                    >
                      {getContentTypeIcon(item.contentType)}
                      <span className="ml-1 capitalize">{parseContentForSearch(item.contentType)}</span>
                    </Badge>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>Relevance:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {item.relevanceScore ? `${item.relevanceScore}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Inline variant for portfolio/project pages
  return (
    <div className={className}>
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Related Content
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
        </div>
        <p className="text-lg text-muted-foreground">
          Discover more insights and projects
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((item) => (
          <Card key={item.id} className="group hover:shadow-xl transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 h-full overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <CardTitle className="text-lg font-semibold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors flex-1">
                  {parseContentForSearch(item.title)}
                </CardTitle>
                <a 
                  href={item.url} 
                  className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex-shrink-0 p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950"
                  aria-label={`Read ${parseContentForSearch(item.title)}`}
                >
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 pb-4">
              <p className="text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-4 leading-relaxed">
                {parseContentForSearch(item.description)}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`text-sm px-3 py-1.5 border ${getContentTypeColor(item.contentType)}`}
                  >
                    {getContentTypeIcon(item.contentType)}
                    <span className="ml-2 capitalize font-medium">{parseContentForSearch(item.contentType)}</span>
                  </Badge>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Relevance:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {item.relevanceScore ? `${item.relevanceScore}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const cleanTags = [...new Set(item.tags.filter((tag: string) => tag && tag.trim().length > 0))];
                      
                      return (
                        <>
                          {cleanTags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge 
                              key={index}
                              variant="secondary"
                              className="text-xs px-1.5 py-0.5 h-auto"
                              title={parseContentForSearch(tag)}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              <span className="whitespace-nowrap">{parseContentForSearch(tag)}</span>
                            </Badge>
                          ))}
                          {cleanTags.length > 3 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
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
  )
}
