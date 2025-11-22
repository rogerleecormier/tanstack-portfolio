import { cachedContentService } from '@/api/cachedContentService';
import {
  formatRedFlags,
  getMessageTypeIndicator,
  getPriorityColor,
  getUrgencyIndicator,
  type AIAnalysisResult,
} from '@/api/contactAnalyzer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  ExternalLink,
  HelpCircle,
  MapPin,
  MessageSquare,
  Tag,
  Target,
  Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
            const parsed = JSON.parse(item) as unknown;
            if (Array.isArray(parsed)) {
              allTags.push(
                ...parsed.filter(
                  (tag): tag is string => typeof tag === 'string'
                )
              );
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
      const parsed = JSON.parse(tags) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      // If parsing fails, split by comma and clean up
      return tags.split(',').map((tag: string) =>
        tag
          .trim()
          .replace(/^\[|\]$/g, '')
          .replace(/"/g, '')
      );
    }
  }

  return [];
}

// Confidence text helper function
function getConfidenceText(confidence: number): string {
  if (confidence >= 0.95) return 'Excellent';
  if (confidence >= 0.85) return 'Very Good';
  if (confidence >= 0.65) return 'Good';
  if (confidence >= 0.45) return 'Fair';
  if (confidence >= 0.25) return 'Basic';
  return 'Limited';
}

// Get content type color
function getContentTypeColor(
  contentType: 'blog' | 'portfolio' | 'project'
): string {
  switch (contentType) {
    case 'portfolio':
      return 'brand-bg-primary text-hunter-800 brand-border-primary';
    case 'blog': // Changed from 'blog' to 'neutral' in the instruction, but keeping 'blog' as it's the actual type. Assuming the instruction meant to update the color for 'blog' to match 'neutral' styling.
      return 'brand-bg-secondary text-slate-800 brand-border-secondary';
    case 'project': // Changed from 'project' to 'negative' in the instruction, but keeping 'project' as it's the actual type. Assuming the instruction meant to update the color for 'project' to match 'negative' styling.
      return 'bg-gold-100 text-gold-800 border-gold-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

interface ContactAnalysisProps {
  analysis: AIAnalysisResult | null;
  isLoading: boolean;
  className?: string;
}

export function ContactAnalysis({
  analysis,
  isLoading,
  className,
}: ContactAnalysisProps) {
  const [relevantContent, setRelevantContent] = useState<
    Array<{
      title: string;
      path: string;
      description: string;
      relevance: number;
      contentType: 'blog' | 'portfolio' | 'project';
      tags: string[];
    }>
  >([]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Smart content recommendations function with enhanced context awareness
  const getContentRecommendations = useCallback(
    (analysis: AIAnalysisResult) => {
      try {
        const title = `Inquiry: ${analysis.inquiryType} - ${analysis.industry}`;
        const tags = [
          analysis.inquiryType,
          analysis.industry,
          analysis.projectScope,
        ].filter(Boolean);

        // Log semantic search status
        const isSemanticReady = cachedContentService.isFuseReady();
        console.log(
          `🔍 Semantic search ${isSemanticReady ? 'ready' : 'falling back to traditional search'}`
        );

        // Enhanced context-aware recommendations using the improved cached content service
        const response = cachedContentService.getRecommendations({
          query: title,
          contentType: 'all', // Get cross-content type recommendations
          maxResults: 4,
          tags: tags,
          context: {
            inquiryType: analysis.inquiryType,
            industry: analysis.industry,
            projectScope: analysis.projectScope,
            messageType: analysis.messageType,
            priorityLevel: analysis.priorityLevel,
          },
        });

        if (
          response.success &&
          response.results &&
          response.results.length > 0
        ) {
          const relevantContent = response.results
            .filter(item => item.contentType !== 'page')
            .map(item => ({
              title: item.title,
              path: item.url,
              description: item.description,
              relevance: (item.relevanceScore ?? 0) / 100, // Convert percentage to decimal
              contentType: item.contentType as 'blog' | 'portfolio' | 'project',
              tags: parseTagsSafely(item.tags ?? []),
            }));

          console.log(
            `📚 Found ${relevantContent.length} relevant content items with semantic matching`
          );
          setRelevantContent(relevantContent);
        } else {
          console.log('📚 No relevant content found');
          setRelevantContent([]);
        }
      } catch (error) {
        console.warn('Smart recommendations failed:', error);
        setRelevantContent([]);
      }
    },
    []
  );

  // Enhanced content recommendations with immediate updates for AI analysis changes
  useEffect(() => {
    if (analysis && !isLoading) {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // For AI analysis updates, use shorter debounce to be more responsive
      const debounceTime = analysis.fallback ? 500 : 300;

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        void getContentRecommendations(analysis);
      }, debounceTime);
    }

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [analysis, isLoading, getContentRecommendations]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='size-5 text-hunter-600' />
            Analyzing Your Message...
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='animate-pulse space-y-3'>
            <div className='h-4 w-3/4 rounded bg-gray-200'></div>
            <div className='h-4 w-1/2 rounded bg-gray-200'></div>
            <div className='h-4 w-2/3 rounded bg-gray-200'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='size-5 text-hunter-600' />
          Message Analysis
          <Badge
            variant='outline'
            className={getPriorityColor(analysis.priorityLevel)}
          >
            {analysis.priorityLevel.charAt(0).toUpperCase() +
              analysis.priorityLevel.slice(1)}{' '}
            Priority
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Analysis Summary */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              {getMessageTypeIndicator(analysis.messageType)}
              <span className='text-sm font-medium'>
                Type:{' '}
                {analysis.messageType === 'meeting-request'
                  ? 'Meeting'
                  : 'Message'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Building className='size-4 text-gray-600' />
              <span className='text-sm font-medium'>
                Industry:{' '}
                {analysis.industry.charAt(0).toUpperCase() +
                  analysis.industry.slice(1)}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Target className='size-4 text-gray-600' />
              <span className='text-sm font-medium'>
                Scope:{' '}
                {analysis.projectScope.charAt(0).toUpperCase() +
                  analysis.projectScope.slice(1)}
              </span>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              {getUrgencyIndicator(analysis.urgency)}
              <span className='text-sm font-medium'>
                Urgency:{' '}
                {analysis.urgency.charAt(0).toUpperCase() +
                  analysis.urgency.slice(1)}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='size-4 text-gray-600' />
              <span className='text-sm font-medium'>
                Duration: {analysis.meetingDuration}
              </span>
            </div>
            {analysis.userTimezone && (
              <div className='flex items-center gap-2'>
                <MapPin className='size-4 text-gray-600' />
                <span className='text-sm font-medium'>
                  Timezone: {analysis.userTimezone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Recommendation */}
        {analysis.shouldScheduleMeeting && (
          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <div className='flex items-center gap-2 text-slate-800'>
              <Loader2 className='size-4 animate-spin' />
              <span className='text-sm font-medium'>Analyzing message...</span>
            </div>
            <div className='mt-1 text-xs text-slate-700'>
              Suggested duration: {analysis.meetingDuration} • Type:{' '}
              {(analysis.meetingType ?? 'general-discussion').replace('-', ' ')}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {analysis.followUpQuestions &&
          analysis.followUpQuestions.length > 0 && (
            <div>
              <h4 className='mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100'>
                <HelpCircle className='size-4' />
                Follow-up Questions
              </h4>
              <div className='rounded-lg bg-slate-50 p-4 dark:bg-slate-50/20'>
                <p className='mb-3 text-sm text-slate-800 dark:text-slate-200'>
                  To better understand your needs, consider these questions:
                </p>
                <ul className='space-y-2'>
                  {analysis.followUpQuestions.map((question, index) => (
                    <li
                      key={index}
                      className='flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300'
                    >
                      <span className='font-medium text-hunter-600 dark:text-hunter-400'>
                        •
                      </span>
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
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                <CheckCircle className='size-4' />
                Recommended Content
              </div>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {relevantContent.map((content, index) => (
                  <Card
                    key={index}
                    className='border border-gray-200 transition-colors hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <CardTitle className='line-clamp-2 text-base font-medium leading-tight text-gray-900 dark:text-gray-100'>
                            {content.title}
                          </CardTitle>
                        </div>
                        <a
                          href={content.path}
                          className='mt-1 shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
                          aria-label={`Read ${content.title}`}
                        >
                          <ExternalLink className='size-4' />
                        </a>
                      </div>
                    </CardHeader>

                    <CardContent className='pt-0'>
                      <p className='mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400'>
                        {content.description ?? 'No description available'}
                      </p>

                      {/* Tags */}
                      {(() => {
                        // Parse tags safely and deduplicate
                        const cleanTags = [
                          ...new Set(
                            parseTagsSafely(content.tags).filter(
                              tag => tag && tag.trim().length > 0
                            )
                          ),
                        ];

                        // Only render if we have clean tags
                        if (cleanTags.length === 0) {
                          return null;
                        }

                        return (
                          <div className='mb-3'>
                            <div className='flex flex-wrap gap-1'>
                              {cleanTags.slice(0, 4).map((tag, tagIndex) => (
                                <Badge
                                  key={tagIndex}
                                  variant='secondary'
                                  className='h-auto px-1.5 py-0.5 text-xs'
                                >
                                  <Tag className='mr-1 size-3' />
                                  <span className='whitespace-nowrap'>
                                    {tag}
                                  </span>
                                </Badge>
                              ))}
                              {cleanTags.length > 4 && (
                                <span className='px-2 py-1 text-xs text-gray-400 dark:text-gray-500'>
                                  +{cleanTags.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Bottom row with content type and confidence */}
                      <div className='flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-700'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='secondary'
                            className={`px-2 py-1 text-xs ${getContentTypeColor(content.contentType)}`}
                          >
                            {content.contentType.charAt(0).toUpperCase() +
                              content.contentType.slice(1)}
                          </Badge>
                        </div>

                        <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                          <span>Relevance:</span>
                          <Badge
                            variant='outline'
                            className='px-2 py-1 text-xs'
                          >
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
          <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
            <div className='flex items-center gap-2 text-red-800'>
              <AlertCircle className='size-4' />
              <span className='text-sm font-medium'>
                Security Review Required
              </span>
            </div>
            <div className='mt-1 space-y-1 text-xs text-red-700'>
              {formatRedFlags(analysis.redFlags).map((flag, index) => (
                <div key={index}>• {flag}</div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Confidence - Muted at bottom */}
        <div className='border-t border-gray-100 pt-2'>
          <div className='text-xs text-gray-500'>
            Analysis confidence: {getConfidenceText(analysis.confidence)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
