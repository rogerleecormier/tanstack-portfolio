
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
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cachedContentService } from '@/api/cachedContentService'



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
    case 'portfolio': return 'brand-bg-primary text-teal-800 brand-border-primary'
    case 'blog': return 'brand-bg-secondary text-blue-800 brand-border-secondary'
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
    tags: string[]
  }>>([])

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Smart content recommendations function with enhanced context awareness
  const getContentRecommendations = useCallback(async (analysis: AIAnalysisResult) => {
    try {
      const title = `Inquiry: ${analysis.inquiryType} - ${analysis.industry}`
      const tags = [analysis.inquiryType, analysis.industry, analysis.projectScope].filter(Boolean)
      
      // Log semantic search status
      const isSemanticReady = cachedContentService.isFuseReady()
      console.log(`🔍 Semantic search ${isSemanticReady ? 'ready' : 'falling back to traditional search'}`)
      
      // Enhanced context-aware recommendations using the improved cached content service
      const response = await cachedContentService.getRecommendations({
        query: title,
        contentType: 'all', // Get cross-content type recommendations
        maxResults: 4,
        tags: tags,
        context: {
          inquiryType: analysis.inquiryType,
          industry: analysis.industry,
          projectScope: analysis.projectScope,
          messageType: analysis.messageType,
          priorityLevel: analysis.priorityLevel
        }
      })

      if (response.success && response.results && response.results.length > 0) {
        const relevantContent = response.results
          .filter((item) => item.contentType !== 'page')
          .map((item) => ({
            title: item.title,
            path: item.url,
            description: item.description,
            relevance: (item.relevanceScore || 0) / 100, // Convert percentage to decimal
            contentType: item.contentType as 'blog' | 'portfolio' | 'project',
            tags: parseTagsSafely(item.tags || [])
          }))
        
        console.log(`📚 Found ${relevantContent.length} relevant content items with semantic matching`)
        setRelevantContent(relevantContent)
      } else {
        console.log('📚 No relevant content found')
        setRelevantContent([])
      }
    } catch (error) {
      console.warn('Smart recommendations failed:', error)
      setRelevantContent([])
    }
  }, [])

  // Enhanced content recommendations with immediate updates for AI analysis changes
  useEffect(() => {
    if (analysis && !isLoading) {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // For AI analysis updates, use shorter debounce to be more responsive
      const debounceTime = analysis.fallback ? 500 : 300
      
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        getContentRecommendations(analysis)
      }, debounceTime)
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
            <div className="bg-blue-50 dark:bg-blue-50/20 p-4 rounded-lg">
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
                  <Card key={index} className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-medium leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
                            {content.title}
                          </CardTitle>
                        </div>
                        <a 
                          href={content.path} 
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 mt-1"
                          aria-label={`Read ${content.title}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                        {content.description || 'No description available'}
                      </p>
                      
                      {/* Tags */}
                      {(() => {
                        // Parse tags safely
                        const cleanTags = parseTagsSafely(content.tags).filter(tag => tag && tag.trim().length > 0);
                        
                        // Only render if we have clean tags
                        if (cleanTags.length === 0) {
                          return null;
                        }
                        
                        return (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {cleanTags.slice(0, 4).map((tag, tagIndex) => (
                                <span 
                                  key={tagIndex}
                                  className="inline-block text-xs px-2 py-1 brand-bg-primary text-teal-600 dark:bg-teal-50/20 dark:text-teal-600 rounded-full"
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
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Bottom row with content type and confidence */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-1 ${getContentTypeColor(content.contentType)}`}
                          >
                            {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>Relevance:</span>
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {Math.round(content.relevance * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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


