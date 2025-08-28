import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp,
  CheckCircle,
  MessageSquare,
  Building,
  Target
} from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { smartRecommendationsService, type ContentItem } from '@/api/smartRecommendationsService'

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
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              allTags.push(...parsed.filter((tag): tag is string => typeof tag === 'string'));
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
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      // If parsing fails, split by comma and clean up
      return tags.split(',').map((tag: string) => 
        tag.trim().replace(/^\[|\]$/g, '').replace(/"/g, '')
      );
    }
  }
  
  return [];
}

interface BlogRecommendationsProps {
  blogContent: string
  blogTitle: string
  blogTags: string[]
  className?: string
}

export function BlogRecommendations({ 
  blogContent, 
  blogTitle, 
  blogTags, 
  className 
}: BlogRecommendationsProps) {
  const [relevantContent, setRelevantContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Smart content recommendations function
  const getContentRecommendations = useCallback(async () => {
    if (!blogContent || !blogTitle) return

    setIsLoading(true)
    try {
      const response = await smartRecommendationsService.getRecommendations({
        content: blogContent,
        title: blogTitle,
        tags: blogTags
      })
      
      if (response.success && response.recommendations) {
        setRelevantContent(response.recommendations)
      } else {
        // Fallback to static content items
        const fallbackItems = await smartRecommendationsService.getAllContentItems()
        setRelevantContent(fallbackItems.slice(0, 4))
      }
    } catch (error) {
      console.warn('Smart recommendations failed, using fallback:', error)
      // Fallback to static content items
      const fallbackItems = await smartRecommendationsService.getAllContentItems()
      setRelevantContent(fallbackItems.slice(0, 4))
    } finally {
      setIsLoading(false)
    }
  }, [blogContent, blogTitle, blogTags])

  // Debounced content recommendations
  useEffect(() => {
    if (blogContent && blogTitle) {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        getContentRecommendations()
      }, 500)
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [blogContent, blogTitle, blogTags, getContentRecommendations])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Finding Related Content...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (relevantContent.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Related Content
          <Badge variant="outline" className="text-xs">
            {relevantContent.length} recommendations
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantContent.map((content, index) => (
            <a
              key={index}
              href={content.url === '/about' ? '/' : content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 brand-bg-primary hover:bg-teal-100 brand-border-primary rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-teal-900 group-hover:text-teal-800 text-sm">
                  {content.title}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {content.contentType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round((content.confidence || 0.7) * 100)}% match
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-teal-700 mb-3">
                {content.description}
              </div>
              <div className="flex flex-wrap gap-1">
                {parseTagsSafely(content.tags).slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs brand-bg-primary text-teal-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </a>
          ))}
        </div>

        {/* Content Type Breakdown */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CheckCircle className="w-4 h-4" />
            Content Type Distribution
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['portfolio', 'blog', 'project'].map((contentType) => {
              const count = relevantContent.filter(item => item.contentType === contentType).length
              if (count === 0) return null
              
              return (
                <div key={contentType} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">{contentType}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building className="w-4 h-4" />
            Top Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(relevantContent.map(item => item.category)))
              .slice(0, 5)
              .map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
          </div>
        </div>

        {/* Tag Cloud */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Target className="w-4 h-4" />
            Popular Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set(
                relevantContent.flatMap(item => parseTagsSafely(item.tags))
              )
            )
              .slice(0, 8)
              .map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs brand-bg-secondary text-blue-800">
                  {tag}
                </Badge>
              ))}
          </div>
        </div>

        {/* Confidence Distribution */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="w-4 h-4" />
            Confidence Levels
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relevantContent
              .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
              .slice(0, 4)
              .map((content) => (
                <div key={content.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {content.title}
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">
                    {Math.round((content.confidence || 0.7) * 100)}%
                  </Badge>
                </div>
              ))}
          </div>
        </div>

        {/* Additional Recommendations */}
        {relevantContent.length >= 4 && (
          <>
            <Separator />
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">
                Want to see more related content?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {relevantContent.slice(4, 6).map((content) => (
                  <a
                    key={content.id}
                    href={content.url === '/about' ? '/' : content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    <span>{content.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {content.contentType}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
