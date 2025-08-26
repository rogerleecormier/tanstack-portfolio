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
  Tags
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { blogRecommendationsService, PortfolioRecommendation } from '@/api/blogRecommendationsService'

interface BlogRecommendationsProps {
  blogContent: string
  blogTitle: string
  blogTags?: string[]
  className?: string
}

export default function BlogRecommendations({ 
  blogContent, 
  blogTitle, 
  blogTags = [], 
  className 
}: BlogRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PortfolioRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Get recommendations from AI worker
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await blogRecommendationsService.getRecommendations({
        content: blogContent,
        title: blogTitle,
        tags: blogTags
      })
      
      if (response.success && response.recommendations) {
        setRecommendations(response.recommendations)
        setHasLoaded(true)
      } else {
        throw new Error(response.error || 'Failed to get recommendations')
      }
    } catch (err) {
      console.error('Error fetching blog recommendations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }, [blogContent, blogTitle, blogTags])

  // Load recommendations on mount
  useEffect(() => {
    if (blogContent && blogTitle && !hasLoaded) {
      fetchRecommendations()
    }
  }, [blogContent, blogTitle, hasLoaded, fetchRecommendations])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold">AI-Powered Recommendations</h3>
        </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {Array.from({ length: 3 }).map((_, i) => (
             <Card key={i} className="animate-pulse">
               <CardHeader className="pb-4">
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
                     <Skeleton className="h-6 w-3/4 mb-2" />
                     <Skeleton className="h-4 w-1/2" />
                   </div>
                   <Skeleton className="h-5 w-8" />
                 </div>
               </CardHeader>
               <CardContent className="space-y-4">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-2/3" />
                 <Skeleton className="h-4 w-3/4" />
                 
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <Skeleton className="h-3 w-3" />
                     <Skeleton className="h-3 w-20" />
                   </div>
                   <div className="flex gap-1.5">
                     <Skeleton className="h-6 w-16" />
                     <Skeleton className="h-6 w-20" />
                     <Skeleton className="h-6 w-14" />
                   </div>
                 </div>
                 
                 <Skeleton className="h-9 w-full" />
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
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold">AI-Powered Recommendations</h3>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRecommendations}
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No recommendations
  if (!recommendations.length) {
    return null
  }

  return (
    <div className={cn("space-y-6", className)}>
             {/* Header */}
       <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-3">
           <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900">
             <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
           </div>
           <div>
             <h3 className="text-xl font-semibold text-foreground">AI-Powered Recommendations</h3>
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
         {recommendations.map((recommendation, index) => (
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
                 <Badge 
                   variant="outline" 
                   className="text-xs border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 font-medium"
                 >
                   #{index + 1}
                 </Badge>
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
           Recommendations powered by AI analysis of this article's content and themes
         </p>
         <p className="text-xs text-muted-foreground mt-1">
           Tags and content are analyzed to find the most relevant portfolio expertise
         </p>
       </div>
    </div>
  )
}
