
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  getPriorityColor, 
  getInquiryTypeIcon, 
  getUrgencyIndicator,
  type AIAnalysisResult 
} from '@/api/aiContactAnalyzer'
import { 
  Clock, 
  Building, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { searchData } from '@/utils/searchData'
import Fuse from 'fuse.js'

interface AIContactAnalysisProps {
  analysis: AIAnalysisResult | null
  isLoading: boolean
  className?: string
  onRetry?: () => void
}

export function AIContactAnalysis({ analysis, isLoading, className, onRetry }: AIContactAnalysisProps) {
  const [relevantPortfolioContent, setRelevantPortfolioContent] = useState<Array<{
    title: string
    path: string
    description: string
    relevance: number
  }>>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Search function
  const performSearch = useCallback((analysis: AIAnalysisResult) => {
    try {
      const fuse = new Fuse(searchData, {
        keys: ['title', 'content', 'description'],
        threshold: 0.6,
        includeScore: true,
        minMatchCharLength: 3
      })

      // Create search query from AI analysis
      const searchQuery = [
        analysis.industry,
        analysis.projectScope,
        analysis.inquiryType,
        analysis.originalMessage || ''
      ].filter(Boolean).join(' ')

      if (searchQuery.trim()) {
        const results = fuse.search(searchQuery)
        
        // Map results to portfolio content with relevance scores
        const relevantContent = results
          .slice(0, 4)
          .map(result => {
            const relevance = result.score ? Math.max(0.3, 1 - (result.score * 1.5)) : 0.8
            return {
              title: result.item.title,
              path: result.item.url,
              description: result.item.description || result.item.content.substring(0, 100) + '...',
              relevance: relevance
            }
          })
          .filter(item => item.relevance > 0.25)

        setRelevantPortfolioContent(relevantContent)
        setSearchError(null)
      } else {
        setRelevantPortfolioContent([])
      }
    } catch {
      setSearchError('Failed to find relevant portfolio content')
      setRelevantPortfolioContent([])
    }
  }, [])

  // Use debounced search when AI analysis changes
  useEffect(() => {
    if (analysis && !isLoading) {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(analysis)
      }, 300)
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [analysis, isLoading, performSearch])

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return null
  }

  // Show error state if search failed
  if (searchError) {
    return (
      <Card className={`border-l-4 border-l-teal-500 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-teal-700">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              ⚠️
            </div>
            AI Analysis Results
            <Badge variant="outline" className="text-xs border-teal-200 text-teal-700">
              Search Error
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-sm text-teal-800 mb-3">
              {searchError}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 hover:underline"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Search
              </button>
            )}
          </div>
          
          {/* Show basic analysis even when search fails */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className={getPriorityColor(analysis.priorityLevel)}>
                {analysis.priorityLevel.toUpperCase()} Priority
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getInquiryTypeIcon(analysis.inquiryType)} {analysis.inquiryType}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Industry:</strong> {analysis.industry}</p>
              <p><strong>Project Scope:</strong> {analysis.projectScope}</p>
              <p><strong>Meeting Duration:</strong> {analysis.meetingDuration}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-l-4 border-l-teal-500 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
            🤖
          </div>
          AI Analysis Results
          {analysis.fallback && (
            <Badge variant="outline" className="text-xs">
              Fallback Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Priority and Type Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={getPriorityColor(analysis.priorityLevel)}>
            {analysis.priorityLevel.toUpperCase()} Priority
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {getInquiryTypeIcon(analysis.inquiryType)} {analysis.inquiryType}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {getUrgencyIndicator(analysis.urgency)} {analysis.urgency}
          </Badge>
        </div>

        <Separator />

        {/* Key Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>Industry</span>
            </div>
            <Badge variant="secondary" className="capitalize">
              {analysis.industry}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span>Project Scope</span>
            </div>
            <Badge variant="secondary" className="capitalize">
              {analysis.projectScope}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Meeting Duration</span>
            </div>
            <Badge variant="secondary">
              {analysis.meetingDuration}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysis.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {Math.round(analysis.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Relevant Portfolio Pages - Using Fuzzy Search */}
        {relevantPortfolioContent.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle className="w-4 h-4" />
                AI-Recommended Portfolio Pages
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relevantPortfolioContent.map((content, index) => (
                  <a
                    key={index}
                    href={content.path === '/about' ? '/' : content.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-teal-900 group-hover:text-teal-800 text-sm">
                        {content.title}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(content.relevance * 100)}% match
                      </Badge>
                    </div>
                    <div className="text-xs text-teal-700">
                      {content.description}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Fallback: Show some basic portfolio content if fuzzy search fails
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle className="w-4 h-4" />
                Portfolio Content
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchData.slice(0, 4).map((item, index) => (
                  <a
                    key={index}
                    href={item.url === '/about' ? '/' : item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors group"
                  >
                    <div className="font-medium text-teal-900 group-hover:text-teal-800 text-sm mb-2">
                      {item.title}
                    </div>
                    <div className="text-xs text-teal-700">
                      {item.description || item.content.substring(0, 100) + '...'}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Fallback Warning */}
        {analysis.fallback && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                AI Analysis Unavailable
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Using fallback analysis. AI features may be limited.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
