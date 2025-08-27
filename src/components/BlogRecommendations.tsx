import { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Sparkles, 
  ArrowRight, 
  Briefcase, 
  Lightbulb,
  RefreshCw,
  AlertCircle,
  Tags,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { smartRecommendationsService, PortfolioItem } from '@/api/smartRecommendationsService'

interface BlogRecommendationsProps {
  blogContent: string
  blogTitle: string
  blogTags?: string[]
  className?: string
  variant?: 'sidebar' | 'inline'
}

export default function BlogRecommendations({ 
  blogContent, 
  blogTitle, 
  blogTags = [], 
  className,
  variant = 'inline'
}: BlogRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchRecommendations = useCallback(async () => {
    if (!blogContent || !blogTitle) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await smartRecommendationsService.getRecommendations({
        content: blogContent,
        title: blogTitle,
        tags: blogTags
      })
      
      if (response.success && response.recommendations) {
        // Ensure we have exactly 2 unique recommendations
        const uniqueRecommendations = response.recommendations.filter((rec, index, arr) => 
          arr.findIndex(r => r.id === rec.id) === index
        ).slice(0, 2)
        
        setRecommendations(uniqueRecommendations)
        setHasLoaded(true)
      } else {
        throw new Error(response.error || 'Failed to get recommendations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations')
    } finally {
      setIsLoading(false)
    }
  }, [blogContent, blogTitle, blogTags])

  useEffect(() => {
    if (!hasLoaded && blogContent && blogTitle) {
      fetchRecommendations()
    }
  }, [blogContent, blogTitle, hasLoaded, fetchRecommendations])

  // Get confidence color based on smart-calculated confidence
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700'
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("space-y-4", variant === 'sidebar' ? "w-full" : "space-y-6", className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Portfolio Page Recommendations</h3>
        </div>
        <div className={cn("space-y-4", variant === 'sidebar' ? "" : "grid grid-cols-1 md:grid-cols-2 gap-6")}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-4", variant === 'sidebar' ? "w-full" : "space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Portfolio Page Recommendations</h3>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Failed to load recommendations
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRecommendations}
                  className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-900"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sidebar variant - more compact
  if (variant === 'sidebar') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Portfolio Page Recommendations</h3>
            <p className="text-xs text-muted-foreground">Related expertise areas</p>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-3">
          {recommendations.slice(0, 2).map((recommendation) => (
            <Card 
              key={recommendation.id} 
              className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500 hover:border-l-teal-600"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold group-hover:text-teal-700 transition-colors mb-1 line-clamp-2">
                      {recommendation.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {recommendation.category}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs font-medium", getConfidenceColor(recommendation.confidence || 0.7))}
                    >
                      {Math.round((recommendation.confidence || 0.7) * 100)}% match
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {recommendation.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {recommendation.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 font-medium bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                <Link to={recommendation.url} className="block">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs group-hover:border-teal-300 group-hover:text-teal-700 group-hover:bg-teal-50 dark:group-hover:bg-teal-950 transition-all duration-200"
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    Explore
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Smart matching based on content analysis
          </p>
        </div>
      </div>
    )
  }

  // Inline variant - full width with grid
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900">
            <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Portfolio Page Recommendations</h3>
            <p className="text-sm text-muted-foreground">Discover related portfolio expertise</p>
          </div>
          <Badge variant="secondary" className="text-xs ml-2">
            <Lightbulb className="h-3 w-3 mr-1" />
            Smart Match
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRecommendations}
          className="text-muted-foreground hover:text-foreground border-dashed"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.slice(0, 2).map((recommendation) => (
          <Card 
            key={recommendation.id} 
            className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500 hover:border-l-teal-600"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold group-hover:text-teal-700 transition-colors mb-2">
                    {recommendation.title}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    {recommendation.category}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs font-medium", getConfidenceColor(recommendation.confidence || 0.7))}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {Math.round((recommendation.confidence || 0.7) * 100)}% match
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {recommendation.description}
              </p>
              
              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tags className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Related Topics
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recommendation.tags.slice(0, 4).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs px-2 py-1 font-medium bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {recommendation.tags.length > 4 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-1 font-medium border-dashed"
                    >
                      +{recommendation.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Link to={recommendation.url} className="block">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:border-teal-300 group-hover:text-teal-700 group-hover:bg-teal-50 dark:group-hover:bg-teal-950 transition-all duration-200"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Explore Portfolio
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Recommendations powered by smart content analysis
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tags and content are analyzed to find the most relevant portfolio expertise
        </p>
      </div>
    </div>
  )
}
