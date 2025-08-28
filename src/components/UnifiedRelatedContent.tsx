import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ExternalLink, TrendingUp } from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { unifiedSmartRecommendationsService, type UnifiedContentItem } from '@/api/unifiedSmartRecommendationsService'

interface UnifiedRelatedContentProps {
  content: string
  title: string
  tags?: string[]
  contentType?: 'blog' | 'portfolio' | 'project' | 'page'
  currentUrl?: string
  className?: string
  maxResults?: number
  variant?: 'sidebar' | 'inline'
}

export function UnifiedRelatedContent({ 
  content, 
  title, 
  tags = [], 
  contentType,
  currentUrl,
  className = '',
  maxResults = 2,
  variant = 'sidebar'
}: UnifiedRelatedContentProps) {
  const [recommendations, setRecommendations] = useState<UnifiedContentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const getRecommendations = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const response = await unifiedSmartRecommendationsService.getRecommendations({
        content,
        title,
        tags,
        contentType,
        excludeUrl: currentUrl,
        maxResults
      })

      if (response.success && response.recommendations) {
        setRecommendations(response.recommendations)
      } else {
        setRecommendations([])
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Failed to load recommendations')
        console.error('Error loading recommendations:', err)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [content, title, tags, contentType, currentUrl, maxResults])

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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'portfolio':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
      case 'project':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
            <Card key={item.id} className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                             <CardHeader className="pb-3">
                 <div className="flex items-start justify-between gap-2">
                   <div className="flex-1 min-w-0">
                     <CardTitle className="text-base font-medium leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
                       {item.title}
                     </CardTitle>
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
               </CardHeader>
              
                             <CardContent className="pt-0">
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                   {item.description || 'No description available'}
                 </p>
                 
                                   {/* Enhanced tag display */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                                                 {(() => {
                           // Enhanced tag parsing to handle various formats
                           let tagsArray = item.tags;
                           
                           // If tags is an array with a single string element that looks like JSON
                           if (Array.isArray(item.tags) && item.tags.length === 1 && typeof item.tags[0] === 'string') {
                             const firstTag = item.tags[0];
                             if (firstTag.startsWith('[') && firstTag.endsWith(']')) {
                               try {
                                 tagsArray = JSON.parse(firstTag);
                               } catch {
                                 // Fallback to string splitting
                                 tagsArray = firstTag.slice(1, -1).split(',').map(tag => 
                                   tag.trim().replace(/"/g, '')
                                 );
                               }
                             }
                           }
                           // If tags is a string, try to parse it
                           else if (typeof item.tags === 'string') {
                             try {
                               tagsArray = JSON.parse(item.tags);
                             } catch {
                               // If parsing fails, split by comma and clean up
                               tagsArray = item.tags.split(',').map(tag => 
                                 tag.trim().replace(/^\[|\]$/g, '').replace(/"/g, '')
                               );
                             }
                           }
                           
                           // Ensure we have an array and filter out empty strings
                           const cleanTags = Array.isArray(tagsArray) 
                             ? tagsArray.filter(tag => tag && tag.trim().length > 0)
                             : [];
                           
                           // Debug logging in development
                           if (process.env.NODE_ENV === 'development') {
                             console.log('Tag parsing debug:', {
                               originalTags: item.tags,
                               parsedTags: tagsArray,
                               cleanTags: cleanTags
                             });
                           }
                           
                           return (
                             <>
                               {cleanTags.slice(0, 4).map((tag, index) => (
                                 <span 
                                   key={index}
                                   className="inline-block text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
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
                       {Math.round(item.confidence * 100)}%
                     </Badge>
                   </div>
                 </div>
               </CardContent>
            </Card>
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
          <Card key={item.id} className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-medium leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
                  {item.title}
                </CardTitle>
                <a 
                  href={item.url} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 mt-1"
                  aria-label={`Read ${item.title}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
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
                    {Math.round(item.confidence * 100)}%
                  </Badge>
                </div>
                
                                 {item.tags && item.tags.length > 0 && (
                   <div className="flex flex-wrap gap-1 max-w-[150px]">
                                           {(() => {
                        // Enhanced tag parsing to handle various formats
                        let tagsArray = item.tags;
                        
                        // If tags is an array with a single string element that looks like JSON
                        if (Array.isArray(item.tags) && item.tags.length === 1 && typeof item.tags[0] === 'string') {
                          const firstTag = item.tags[0];
                          if (firstTag.startsWith('[') && firstTag.endsWith(']')) {
                            try {
                              tagsArray = JSON.parse(firstTag);
                            } catch {
                              // Fallback to string splitting
                              tagsArray = firstTag.slice(1, -1).split(',').map(tag => 
                                tag.trim().replace(/"/g, '')
                              );
                            }
                          }
                        }
                        // If tags is a string, try to parse it
                        else if (typeof item.tags === 'string') {
                          try {
                            tagsArray = JSON.parse(item.tags);
                          } catch {
                            // If parsing fails, split by comma and clean up
                            tagsArray = item.tags.split(',').map(tag => 
                              tag.trim().replace(/^\[|\]$/g, '').replace(/"/g, '')
                            );
                          }
                        }
                        
                        // Ensure we have an array and filter out empty strings
                        const cleanTags = Array.isArray(tagsArray) 
                          ? tagsArray.filter(tag => tag && tag.trim().length > 0)
                          : [];
                        
                        return (
                          <>
                            {cleanTags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-block text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full truncate max-w-[100px]"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
