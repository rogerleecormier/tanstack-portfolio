import { z } from 'zod'

// Zod schema for AI analysis response validation
export const AIAnalysisSchema = z.object({
  inquiryType: z.enum(['consultation', 'project', 'partnership', 'general', 'urgent']),
  priorityLevel: z.enum(['high', 'medium', 'low']),
  industry: z.enum(['technology', 'healthcare', 'finance', 'manufacturing', 'other']),
  projectScope: z.enum(['small', 'medium', 'large', 'enterprise']),
  urgency: z.enum(['immediate', 'soon', 'flexible']),
  suggestedResponse: z.string().min(10).max(500),
  meetingDuration: z.enum(['30 minutes', '1 hour', '1.5 hours', '2 hours']),
  relevantContent: z.array(z.string()).max(10),
  confidence: z.number().min(0).max(1),
  shouldScheduleMeeting: z.boolean(),
  meetingType: z.enum(['consultation', 'project-planning', 'technical-review', 'strategy-session', 'general-discussion']),
  recommendedTimeSlots: z.array(z.string()).max(5),
  timezoneConsideration: z.string(),
  followUpRequired: z.boolean(),
  redFlags: z.array(z.string()).max(5),
  followUps: z.array(z.string()).max(3),
  timestamp: z.string().datetime(),
  originalMessage: z.string(),
  wordCount: z.number().int().min(0),
  hasCompany: z.boolean(),
  emailDomain: z.string(),
  fallback: z.boolean().optional()
})

// Type inference from schema
export type AIAnalysisResult = z.infer<typeof AIAnalysisSchema>

// Validation function with error handling
export function validateAIAnalysis(data: unknown): AIAnalysisResult {
  try {
    return AIAnalysisSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('AI analysis validation failed:', error.errors)
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// Safe validation that returns fallback data on failure
export function safeValidateAIAnalysis(data: unknown): AIAnalysisResult {
  try {
    return validateAIAnalysis(data)
  } catch {
    // Return safe fallback data
    return {
      inquiryType: 'general',
      priorityLevel: 'medium',
      industry: 'other',
      projectScope: 'medium',
      urgency: 'flexible',
      suggestedResponse: 'Thank you for your message. I\'ll review it and get back to you soon.',
      meetingDuration: '1 hour',
      relevantContent: ['general portfolio'],
      confidence: 0.5,
      shouldScheduleMeeting: false,
      meetingType: 'general-discussion',
      recommendedTimeSlots: ['morning', 'afternoon'],
      timezoneConsideration: 'user\'s local timezone',
      followUpRequired: false,
      redFlags: [],
      followUps: [],
      timestamp: new Date().toISOString(),
      originalMessage: '[CONTENT_ANALYZED]',
      wordCount: 0,
      hasCompany: false,
      emailDomain: 'unknown',
      fallback: true
    }
  }
}
