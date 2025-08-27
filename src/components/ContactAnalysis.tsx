
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  getPriorityColor, 
  getInquiryTypeIcon, 
  getUrgencyIndicator,
  formatRedFlags,
  type AIAnalysisResult 
} from '@/api/contactAnalyzer'
import { 
  Building, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MessageSquare
} from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { smartRecommendationsService } from '@/api/smartRecommendationsService'

// Confidence text helper function
function getConfidenceText(confidence: number): string {
  if (confidence >= 0.95) return 'Excellent'
  if (confidence >= 0.85) return 'Very Good'
  if (confidence >= 0.65) return 'Good'
  if (confidence >= 0.45) return 'Fair'
  if (confidence >= 0.25) return 'Basic'
  return 'Limited'
}

interface ContactAnalysisProps {
  analysis: AIAnalysisResult | null
  isLoading: boolean
  className?: string
}

export function ContactAnalysis({ analysis, isLoading, className }: ContactAnalysisProps) {
  const [relevantPortfolioContent, setRelevantPortfolioContent] = useState<Array<{
    title: string
    path: string
    description: string
    relevance: number
  }>>([])

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Smart portfolio recommendations function
  const getPortfolioRecommendations = useCallback(async (analysis: AIAnalysisResult) => {
    try {
      // Create content for analysis from AI results
      const content = [
        analysis.industry,
        analysis.projectScope,
        analysis.inquiryType,
        analysis.originalMessage || ''
      ].filter(Boolean).join(' ')
      
      const title = `Inquiry: ${analysis.inquiryType} - ${analysis.industry}`
      const tags = [analysis.inquiryType, analysis.industry, analysis.projectScope].filter(Boolean)
      
      const response = await smartRecommendationsService.getRecommendations({
        content,
        title,
        tags
      })
      
      if (response.success && response.recommendations) {
        const relevantContent = response.recommendations.map(item => ({
          title: item.title,
          path: item.url,
          description: item.description,
          relevance: item.confidence || 0.7
        }))
        
        setRelevantPortfolioContent(relevantContent)
      } else {
        // Fallback to static portfolio items
        const fallbackItems = smartRecommendationsService.getAllPortfolioItems()
        const relevantContent = fallbackItems.slice(0, 4).map(item => ({
          title: item.title,
          path: item.url,
          description: item.description,
          relevance: 0.7 // Default confidence
        }))
        
        setRelevantPortfolioContent(relevantContent)
      }
    } catch (error) {
      console.warn('Smart recommendations failed, using fallback:', error)
      // Fallback to static portfolio items
      const fallbackItems = smartRecommendationsService.getAllPortfolioItems()
      const relevantContent = fallbackItems.slice(0, 4).map(item => ({
        title: item.title,
        path: item.url,
        description: item.description,
        relevance: 0.7 // Default confidence
      }))
      
      setRelevantPortfolioContent(relevantContent)
    }
  }, [])

  // Debounced portfolio recommendations
  useEffect(() => {
    if (analysis && !isLoading) {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Set new timeout for debounced search - longer delay for better UX
      searchTimeoutRef.current = setTimeout(() => {
        getPortfolioRecommendations(analysis)
      }, 500) // Increased from 300ms to 500ms for smoother experience
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [analysis, isLoading, getPortfolioRecommendations])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Analyzing Your Message...
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

  if (!analysis) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Message Analysis
          <Badge 
            variant="outline" 
            className={getPriorityColor(analysis.priorityLevel)}
          >
            {analysis.priorityLevel} Priority
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getInquiryTypeIcon(analysis.inquiryType)}
              <span className="text-sm font-medium">Type: {analysis.inquiryType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Industry: {analysis.industry}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Scope: {analysis.projectScope}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getUrgencyIndicator(analysis.urgency)}
              <span className="text-sm font-medium">Urgency: {analysis.urgency}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Confidence: {getConfidenceText(analysis.confidence)}</span>
            </div>

          </div>
        </div>

        {/* Meeting Recommendation */}
        {analysis.shouldScheduleMeeting && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Meeting Recommended
              </span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Suggested duration: {analysis.meetingDuration}
            </div>
          </div>
        )}

        {/* Relevant Portfolio Content */}
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
          // Fallback: Show some basic portfolio content if smart recommendations fail
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle className="w-4 h-4" />
                Portfolio Content
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {smartRecommendationsService.getAllPortfolioItems().slice(0, 4).map((item, index) => (
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
                      {item.description}
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
