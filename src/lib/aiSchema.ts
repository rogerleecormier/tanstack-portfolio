import { z } from 'zod';

// Zod schema for AI analysis response validation
export const AIAnalysisSchema = z.object({
  inquiryType: z.enum([
    'consultation',
    'project',
    'partnership',
    'general',
    'urgent',
  ]),
  priorityLevel: z.enum(['high', 'medium', 'low']),
  industry: z.enum([
    'technology',
    'healthcare',
    'finance',
    'manufacturing',
    'retail',
    'education',
    'government',
    'nonprofit',
    'startup',
    'enterprise',
    'other',
  ]),
  projectScope: z.enum(['small', 'medium', 'large', 'enterprise']),
  urgency: z.enum(['immediate', 'soon', 'flexible']),
  messageType: z.enum(['message', 'meeting-request']),
  suggestedResponse: z.string().min(10).max(500),
  meetingDuration: z.enum(['30 minutes', '1 hour', '1.5 hours', '2 hours']),
  relevantContent: z.array(z.string()).max(10),
  confidence: z.number().min(0).max(1).optional().default(0.8),
  shouldScheduleMeeting: z.boolean(),
  meetingType: z
    .enum([
      'consultation',
      'project-planning',
      'technical-review',
      'strategy-session',
      'general-discussion',
    ])
    .nullable()
    .optional()
    .default('general-discussion'),
  recommendedTimeSlots: z.array(z.string()).max(5),
  timezoneConsideration: z.string(),
  userTimezone: z.string().optional(),
  followUpRequired: z.boolean(),
  redFlags: z.array(z.string()).max(5),
  followUpQuestions: z.array(z.string()).max(5),
  timestamp: z.string().datetime(),
  originalMessage: z.string(),
  wordCount: z.number().int().min(0),
  hasCompany: z.boolean(),
  emailDomain: z.string(),
  fallback: z.boolean().optional(),
  aiAvailable: z.boolean().optional().default(true),
});

// Type inference from schema
export type AIAnalysisResult = z.infer<typeof AIAnalysisSchema>;

// Validation function with error handling
export function validateAIAnalysis(data: unknown): AIAnalysisResult {
  try {
    return AIAnalysisSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('AI analysis validation failed:', error.errors);
      throw new Error(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw error;
  }
}

// Safe validation that returns fallback data on failure
export function safeValidateAIAnalysis(data: unknown): AIAnalysisResult {
  try {
    return validateAIAnalysis(data);
  } catch (error) {
    console.warn('AI analysis validation failed, using fallback:', error);

    // Try to extract any valid fields from the response
    if (typeof data === 'object' && data !== null) {
      const partialData = data as Partial<AIAnalysisResult>;

      // Return partial data with fallback defaults for missing fields
      return {
        inquiryType: partialData.inquiryType || 'general',
        priorityLevel: partialData.priorityLevel || 'medium',
        industry: partialData.industry || 'other',
        projectScope: partialData.projectScope || 'medium',
        urgency: partialData.urgency || 'flexible',
        messageType: partialData.messageType || 'message',
        suggestedResponse:
          partialData.suggestedResponse ||
          "Thank you for your message. I'll review it and get back to you soon.",
        meetingDuration: partialData.meetingDuration || '1 hour',
        relevantContent: partialData.relevantContent || ['general portfolio'],
        confidence: partialData.confidence || 0.6,
        shouldScheduleMeeting: partialData.shouldScheduleMeeting || false,
        meetingType: partialData.meetingType || 'general-discussion',
        recommendedTimeSlots: partialData.recommendedTimeSlots || [
          'morning',
          'afternoon',
        ],
        timezoneConsideration:
          partialData.timezoneConsideration || "user's local timezone",
        userTimezone: partialData.userTimezone || '',
        followUpRequired: partialData.followUpRequired || false,
        redFlags: partialData.redFlags || [],
        followUpQuestions: partialData.followUpQuestions || [],
        timestamp: partialData.timestamp || new Date().toISOString(),
        originalMessage: partialData.originalMessage || '[CONTENT_ANALYZED]',
        wordCount: partialData.wordCount || 0,
        hasCompany: partialData.hasCompany || false,
        emailDomain: partialData.emailDomain || 'unknown',
        fallback: true,
        aiAvailable: partialData.aiAvailable || false,
      };
    }

    // Return safe fallback data if no partial data available
    return {
      inquiryType: 'general',
      priorityLevel: 'medium',
      industry: 'other',
      projectScope: 'medium',
      urgency: 'flexible',
      messageType: 'message',
      suggestedResponse:
        "Thank you for your message. I'll review it and get back to you soon.",
      meetingDuration: '1 hour',
      relevantContent: ['general portfolio'],
      confidence: 0.5,
      shouldScheduleMeeting: false,
      meetingType: 'general-discussion',
      recommendedTimeSlots: ['morning', 'afternoon'],
      timezoneConsideration: "user's local timezone",
      userTimezone: '',
      followUpRequired: false,
      redFlags: [],
      followUpQuestions: [],
      timestamp: new Date().toISOString(),
      originalMessage: '[CONTENT_ANALYZED]',
      wordCount: 0,
      hasCompany: false,
      emailDomain: 'unknown',
      fallback: true,
      aiAvailable: false,
    };
  }
}
