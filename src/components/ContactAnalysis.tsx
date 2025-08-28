
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  getPriorityColor, 
  getUrgencyIndicator,
  getMessageTypeIndicator,
  formatRedFlags,
  type AIAnalysisResult 
} from '@/api/contactAnalyzer'
import { 
  Building, 
  Target,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Clock,
  MapPin,
  HelpCircle
} from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { unifiedSmartRecommendationsService } from '@/api/unifiedSmartRecommendationsService'

// Confidence text helper function
function getConfidenceText(confidence: number): string {
  if (confidence >= 0.95) return 'Excellent'
  if (confidence >= 0.85) return 'Very Good'
  if (confidence >= 0.65) return 'Good'
  if (confidence >= 0.45) return 'Fair'
  if (confidence >= 0.25) return 'Basic'
  return 'Limited'
}

// Get content type color
function getContentTypeColor(contentType: 'blog' | 'portfolio' | 'project'): string {
  switch (contentType) {
    case 'portfolio': return 'bg-teal-100 text-teal-800 border-teal-200'
    case 'blog': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'project': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

interface ContactAnalysisProps {
  analysis: AIAnalysisResult | null
  isLoading: boolean
  className?: string
}

export function ContactAnalysis({ 
  analysis, 
  isLoading, 
  className 
}: ContactAnalysisProps) {
  const [relevantContent, setRelevantContent] = useState<Array<{
    title: string
    path: string
    description: string
    relevance: number
    contentType: 'blog' | 'portfolio' | 'project'
  }>>([])

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Smart content recommendations function
  const getContentRecommendations = useCallback(async (analysis: AIAnalysisResult) => {
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
      
      const response = await unifiedSmartRecommendationsService.getRecommendations({
        content,
        title,
        tags,
        maxResults: 4
      })
      
              if (response.success && response.recommendations) {
          const relevantContent = response.recommendations
            .filter(item => item.contentType !== 'page')
            .map(item => ({
              title: item.title,
              path: item.url,
              description: item.description,
              relevance: item.confidence || 0.7,
              contentType: item.contentType as 'blog' | 'portfolio' | 'project'
            }))
          
          setRelevantContent(relevantContent)
        } else {
        // Fallback to type-based recommendations
        const fallbackResponse = await unifiedSmartRecommendationsService.getRecommendationsByType(
          'portfolio',
          undefined,
          4
        )
        if (fallbackResponse.success) {
          const relevantContent = fallbackResponse.recommendations
            .filter(item => item.contentType !== 'page')
            .map(item => ({
              title: item.title,
              path: item.url,
              description: item.description,
              relevance: item.confidence || 0.7,
              contentType: item.contentType as 'blog' | 'portfolio' | 'project'
            }))
          setRelevantContent(relevantContent)
        } else {
          setRelevantContent([])
        }
      }
    } catch (error) {
      console.warn('Smart recommendations failed, using fallback:', error)
      // Fallback to type-based recommendations
      try {
        const fallbackResponse = await unifiedSmartRecommendationsService.getRecommendationsByType(
          'portfolio',
          undefined,
          4
        )
        if (fallbackResponse.success) {
          const relevantContent = fallbackResponse.recommendations
            .filter(item => item.contentType !== 'page')
            .map(item => ({
              title: item.title,
              path: item.url,
              description: item.description,
              relevance: item.confidence || 0.7,
              contentType: item.contentType as 'blog' | 'portfolio' | 'project'
            }))
          setRelevantContent(relevantContent)
        } else {
          setRelevantContent([])
        }
      } catch (fallbackError) {
        console.error('Fallback recommendations also failed:', fallbackError)
        setRelevantContent([])
      }
    }
  }, [])

  // Debounced content recommendations
  useEffect(() => {
    if (analysis && !isLoading) {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        getContentRecommendations(analysis)
      }, 500)
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [analysis, isLoading, getContentRecommendations])

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
            {analysis.priorityLevel.charAt(0).toUpperCase() + analysis.priorityLevel.slice(1)} Priority
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getMessageTypeIndicator(analysis.messageType)}
              <span className="text-sm font-medium">Type: {analysis.messageType === 'meeting-request' ? 'Meeting' : 'Message'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Industry: {analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Scope: {analysis.projectScope.charAt(0).toUpperCase() + analysis.projectScope.slice(1)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getUrgencyIndicator(analysis.urgency)}
              <span className="text-sm font-medium">Urgency: {analysis.urgency.charAt(0).toUpperCase() + analysis.urgency.slice(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Duration: {analysis.meetingDuration}</span>
            </div>
            {analysis.userTimezone && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Timezone: {analysis.userTimezone}</span>
              </div>
            )}
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
              Suggested duration: {analysis.meetingDuration} • Type: {(analysis.meetingType || 'general-discussion').replace('-', ' ')}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {analysis.followUpQuestions && analysis.followUpQuestions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Follow-up Questions
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                To better understand your needs, consider these questions:
              </p>
              <ul className="space-y-2">
                {analysis.followUpQuestions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">•</span>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Relevant Content Recommendations */}
        {relevantContent.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle className="w-4 h-4" />
                Recommended Content
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relevantContent.map((content, index) => (
                  <a
                    key={index}
                    href={content.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-teal-900 group-hover:text-teal-800 text-sm">
                        {content.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getContentTypeColor(content.contentType)}`}
                        >
                          {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(content.relevance * 100)}% match
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-teal-700">
                      {content.description}
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

        {/* Analysis Confidence - Muted at bottom */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Analysis confidence: {getConfidenceText(analysis.confidence)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


