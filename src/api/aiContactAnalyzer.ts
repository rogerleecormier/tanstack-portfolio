// AI Contact Form Analyzer Service
// Integrates with Cloudflare AI Worker for intelligent form analysis

export interface AIAnalysisResult {
  inquiryType: 'consultation' | 'project' | 'partnership' | 'general' | 'urgent'
  priorityLevel: 'high' | 'medium' | 'low'
  industry: 'technology' | 'healthcare' | 'finance' | 'manufacturing' | 'other'
  projectScope: 'small' | 'medium' | 'large' | 'enterprise'
  urgency: 'immediate' | 'soon' | 'flexible'
  suggestedResponse: string
  meetingDuration: '30 minutes' | '1 hour' | '1.5 hours' | '2 hours'
  relevantContent: string[]
  confidence: number
  shouldScheduleMeeting: boolean
  meetingType: 'consultation' | 'project-planning' | 'technical-review' | 'strategy-session' | 'general-discussion'
  recommendedTimeSlots: string[]
  timezoneConsideration: string
  followUpRequired: boolean
  timestamp: string
  originalMessage: string
  wordCount: number
  hasCompany: boolean
  emailDomain: string
  fallback?: boolean
}

export interface ContactFormData {
  name: string
  email: string
  company?: string
  subject: string
  message: string
}

// AI Worker endpoints - Updated with actual deployed URLs
const AI_WORKER_ENDPOINT = import.meta.env.PROD 
  ? 'https://ai-contact-analyzer.rcormier.workers.dev'
  : 'https://ai-contact-analyzer-development.rcormier.workers.dev'

// Retry configuration
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

// Fallback analysis when AI fails
const createFallbackAnalysis = (formData: ContactFormData): AIAnalysisResult => {
  const messageLower = formData.message.toLowerCase()
  const subjectLower = formData.subject.toLowerCase()
  
  // Simple keyword-based fallback analysis
  const hasUrgentKeywords = /urgent|asap|immediately|emergency|critical|deadline|rush/i.test(messageLower + ' ' + subjectLower)
  const hasProjectKeywords = /project|development|implementation|integration|migration|modernization|strategy|planning/i.test(messageLower)
  const hasTechnicalKeywords = /technical|architecture|system|platform|api|database|infrastructure|devops/i.test(messageLower)
  
  let inquiryType: AIAnalysisResult['inquiryType'] = 'general'
  let priorityLevel: AIAnalysisResult['priorityLevel'] = 'medium'
  let shouldScheduleMeeting = false
  let meetingDuration: AIAnalysisResult['meetingDuration'] = '1 hour'
  
  if (hasUrgentKeywords) {
    priorityLevel = 'high'
    inquiryType = 'urgent'
    shouldScheduleMeeting = true
    meetingDuration = '2 hours'
  } else if (hasProjectKeywords && hasTechnicalKeywords) {
    inquiryType = 'project'
    priorityLevel = 'medium'
    shouldScheduleMeeting = true
    meetingDuration = '1.5 hours'
  } else if (hasProjectKeywords) {
    inquiryType = 'project'
    shouldScheduleMeeting = true
    meetingDuration = '1 hour'
  }
  
  return {
    inquiryType,
    priorityLevel,
    industry: 'other',
    projectScope: 'medium',
    urgency: hasUrgentKeywords ? 'immediate' : 'flexible',
    suggestedResponse: `Thank you for reaching out, ${formData.name}! I've received your inquiry about "${formData.subject}" and I'm looking forward to discussing how I can help with your project.`,
    meetingDuration,
    relevantContent: ['general portfolio'],
    confidence: 0.6, // Lower confidence for fallback
    shouldScheduleMeeting,
    meetingType: shouldScheduleMeeting ? 'general-discussion' : 'consultation',
    recommendedTimeSlots: ['morning', 'afternoon'],
    timezoneConsideration: 'user\'s local timezone',
    followUpRequired: shouldScheduleMeeting,
    timestamp: new Date().toISOString(),
    originalMessage: formData.message.substring(0, 200) + (formData.message.length > 200 ? '...' : ''),
    wordCount: formData.message.split(' ').length,
    hasCompany: !!formData.company,
    emailDomain: formData.email.split('@')[1] || 'unknown',
    fallback: true
  }
}

// Retry function with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (maxRetries <= 0) {
      throw error
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    return retryWithBackoff(fn, maxRetries - 1, delay * 2)
  }
}

export const analyzeContactForm = async (formData: ContactFormData): Promise<AIAnalysisResult | null> => {
  try {
    // Try AI analysis with retry logic
    const result = await retryWithBackoff(async () => {
      const response = await fetch(AI_WORKER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company || '',
          subject: formData.subject,
          message: formData.message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `AI analysis failed with status ${response.status}`)
      }

      return await response.json()
    })

    return result

  } catch {
    // Return fallback analysis instead of null
    return createFallbackAnalysis(formData)
  }
}

// Get priority color for UI display
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Get inquiry type icon
export const getInquiryTypeIcon = (type: string): string => {
  switch (type) {
    case 'consultation': return '💼'
    case 'project': return '🚀'
    case 'partnership': return '🤝'
    case 'urgent': return '⚡'
    default: return '📧'
  }
}

// Get urgency indicator
export const getUrgencyIndicator = (urgency: string): string => {
  switch (urgency) {
    case 'immediate': return '🔴'
    case 'soon': return '🟡'
    default: return '🟢'
  }
}
