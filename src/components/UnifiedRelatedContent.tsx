import { useState, useEffect, useCallback, useRef } from 'react'
import { Badge } from './ui/badge'
import { MessageSquare, TrendingUp, ExternalLink } from 'lucide-react'
import { ContentItem } from '../types/content'

interface UnifiedRelatedContentProps {
  title?: string
  tags?: string[]
  contentType?: string
  currentUrl: string
  className?: string
  maxResults?: number
  variant?: 'sidebar' | 'inline'
  content?: string
}

export function UnifiedRelatedContent({ 
  title, 
  tags = [], 
  contentType,
  currentUrl,
  className = '',
  maxResults = 2,
  variant = 'sidebar'
}: UnifiedRelatedContentProps) {
  const [recommendations, setRecommendations] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const getRecommendations = useCallback(async () => {
    if (!title && (!tags || tags.length === 0)) {
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/content-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: title || tags.join(' '),
          contentType: contentType || 'all',
          maxResults: maxResults + 1, // Get one extra to account for current page
          excludeUrl: currentUrl,
          tags: tags || []
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.results) {
        // Filter out the current page and limit results
        const filteredResults = data.results
          .filter((item: ContentItem) => item.url !== currentUrl)
          .slice(0, maxResults)
        
        setRecommendations(filteredResults)
      } else {
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
  }, [title, tags, contentType, currentUrl, maxResults])

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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Related Content
          </h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: maxResults }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground text-center py-4">
          Unable to load recommendations
        </div>
      </div>
    )
  }

  // Show skeleton when no recommendations (instead of debug info)
  if (!isLoading && recommendations.length === 0) {
    return (
      <div className={className}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Related Content
          </h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: maxResults }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return <MessageSquare className="h-3 w-3" />
      case 'portfolio':
        return <TrendingUp className="h-3 w-3" />
      case 'project':
        return <ExternalLink className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'blog':
        return 'brand-bg-secondary text-blue-800 dark:bg-blue-50 dark:text-blue-800'
      case 'portfolio':
        return 'brand-bg-primary text-teal-800 dark:bg-teal-50 dark:text-teal-800'
      case 'project':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-50 dark:text-purple-800'
      default:
        return 'brand-bg-primary text-teal-800 dark:bg-teal-50 dark:text-teal-800'
    }
  }

  if (variant === 'sidebar') {
    // Don't render anything if no recommendations
    if (recommendations.length === 0) {
      return null
    }

    return (
      <div className={className}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Related Content
          </h3>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                             <div className="pb-3">
                 <div className="flex items-start justify-between gap-2">
                   <div className="flex-1 min-w-0">
                     <h4 className="text-base font-medium leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
                       {item.title}
                     </h4>
                     {item.category && (
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                         {item.category}
                       </p>
                     )}
                   </div>
                   <a 
                     href={item.url} 
                     className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 mt-1"
                     aria-label={`Read ${item.title}`}
                   >
                     <ExternalLink className="h-4 w-4" />
                   </a>
                 </div>
               </div>
              
                             <div className="pt-0">
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                   {item.description || 'No description available'}
                 </p>
                 
                                   {/* Enhanced tag display */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                                                 {(() => {
                                                                               // Use helper function to safely parse tags
                        const cleanTags = item.tags.filter((tag: string) => tag && tag.trim().length > 0);
                           
                           return (
                             <>
                               {cleanTags.slice(0, 4).map((tag: string, index: number) => (
                                 <span 
                                   key={index}
                                   className="inline-block text-xs px-2 py-1 brand-bg-primary text-teal-600 dark:bg-teal-50 dark:text-teal-600 rounded-full"
                                   title={tag}
                                 >
                                   {tag}
                                 </span>
                               ))}
                               {cleanTags.length > 4 && (
                                 <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                                   +{cleanTags.length - 4} more
                                 </span>
                               )}
                             </>
                           );
                         })()}
                      </div>
                    </div>
                  )}
                 
                 {/* Bottom row with content type and confidence */}
                 <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                   <div className="flex items-center gap-2">
                     <Badge 
                       variant="secondary" 
                       className={`text-xs px-2 py-1 ${getContentTypeColor(item.contentType)}`}
                     >
                       {getContentTypeIcon(item.contentType)}
                       <span className="ml-1 capitalize">{item.contentType}</span>
                     </Badge>
                   </div>
                   
                                       <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Relevance:</span>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        85%
                      </Badge>
                    </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Inline variant for portfolio/project pages
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Related Content
        </h2>
        <p className="text-muted-foreground">
          Discover more insights and projects
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((item) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors h-full">
            <div className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-lg font-medium leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
                  {item.title}
                </h4>
                <a 
                  href={item.url} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 mt-1"
                  aria-label={`Read ${item.title}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div className="pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-1 ${getContentTypeColor(item.contentType)}`}
                  >
                    {getContentTypeIcon(item.contentType)}
                    <span className="ml-1 capitalize">{item.contentType}</span>
                  </Badge>
                  
                                     <Badge variant="outline" className="text-xs px-2 py-1">
                     85%
                   </Badge>
                </div>
                
                                 {item.tags && item.tags.length > 0 && (
                   <div className="flex flex-wrap gap-1 max-w-[150px]">
                                           {(() => {
                        // Use helper function to safely parse tags
                        const cleanTags = item.tags.filter((tag: string) => tag && tag.trim().length > 0);
                        
                        return (
                          <>
                            {cleanTags.slice(0, 3).map((tag: string, index: number) => (
                              <span 
                                key={index}
                                className="inline-block text-xs px-2 py-1 brand-bg-primary text-teal-600 dark:bg-teal-50 dark:text-teal-600 rounded-full truncate max-w-[100px]"
                                title={tag}
                              >
                                {tag}
                              </span>
                            ))}
                            {cleanTags.length > 3 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                +{cleanTags.length - 3}
                              </span>
                            )}
                          </>
                        );
                      })()}
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
