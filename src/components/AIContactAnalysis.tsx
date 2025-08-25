
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  getPriorityColor, 
  getInquiryTypeIcon, 
  getUrgencyIndicator,
  getRedFlagIndicator,
  formatRedFlags,
  type AIAnalysisResult 
} from '@/api/aiContactAnalyzer'
import { 
  Building, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { searchData } from '@/utils/searchData'
import Fuse from 'fuse.js'

// Confidence text helper function
function getConfidenceText(confidence: number): string {
  if (confidence >= 0.95) return 'Excellent'
  if (confidence >= 0.85) return 'Very Good'
  if (confidence >= 0.65) return 'Good'
  if (confidence >= 0.45) return 'Fair'
  if (confidence >= 0.25) return 'Basic'
  return 'Limited'
}

// Suggestions for improving analysis quality
function getConfidenceSuggestions(confidence: number): string[] {
  if (confidence >= 0.65) return []
  
  return [
    "What specific project or challenge are you facing?",
    "Which industry or sector does this relate to?",
    "What's your timeline or urgency level?",
    "How large is your organization or team?",
    "What specific outcomes are you looking for?",
    "Are there any technical constraints or requirements?"
  ]
}

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
      
      // Set new timeout for debounced search - longer delay for better UX
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(analysis)
      }, 500) // Increased from 300ms to 500ms for smoother experience
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
            📊
          </div>
          Message Analysis
          {analysis.fallback && (
            <Badge variant="outline" className="text-xs">
              Basic Analysis
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
          {analysis.redFlags && analysis.redFlags.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 border-red-200 text-red-700">
              {getRedFlagIndicator(analysis.redFlags)} Security Review
            </Badge>
          )}
        </div>

        <Separator />

        {/* Key Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Analysis Quality - Moved to first position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Analysis Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysis.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {getConfidenceText(analysis.confidence)} ({Math.round(analysis.confidence * 100)}%)
              </span>
            </div>
          </div>

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
        </div>

        {/* Confidence Suggestions */}
        {getConfidenceSuggestions(analysis.confidence).length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-2">
                  Help us provide better recommendations
                </h4>
                <p className="text-blue-800 text-xs mb-3">
                  Adding more details will help us tailor our recommendations to your specific needs.
                </p>
                <div className="space-y-1">
                  {getConfidenceSuggestions(analysis.confidence).map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 text-xs flex-shrink-0 mt-0.5">•</span>
                      <span className="text-blue-800 text-xs leading-relaxed">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Follow-up Questions - Show contextual questions about missing information */}
        {analysis.followUps && 
         analysis.followUps.length > 0 && 
         analysis.followUps.some(q => q && q.trim().length > 10 && !q.toLowerCase().includes('clarifying questions if needed')) && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">
                To provide better recommendations, could you share:
              </span>
            </div>
            <div className="text-xs text-blue-700 mt-1 space-y-1">
              {analysis.followUps
                .filter(q => q && q.trim().length > 10 && !q.toLowerCase().includes('clarifying questions if needed'))
                .map((question, index) => (
                  <div key={index}>• {question}</div>
                ))}
            </div>
          </div>
        )}

        {/* Relevant Portfolio Pages - Using Fuzzy Search */}
        {relevantPortfolioContent.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle className="w-4 h-4" />
                Recommended Portfolio Pages
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

        {/* Red Flags Warning */}
        {analysis.redFlags && analysis.redFlags.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Security Review Required
              </span>
            </div>
            <div className="text-xs text-red-700 mt-1 space-y-1">
              {formatRedFlags(analysis.redFlags).map((flag, index) => (
                <div key={index}>• {flag}</div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback Warning */}
        {analysis.fallback && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Advanced Analysis Unavailable
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Using basic analysis. Some features may be limited.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
