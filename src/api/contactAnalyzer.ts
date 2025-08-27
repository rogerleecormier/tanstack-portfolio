// AI Contact Form Analyzer Service
// Integrates with Cloudflare AI Worker for intelligent form analysis
// ENHANCED VERSION with industry identification, timezone analysis, and smart fallbacks

import { safeValidateAIAnalysis, type AIAnalysisResult } from '@/lib/aiSchema'
import { logger } from '../utils/logger'

// Re-export the type for backward compatibility
export type { AIAnalysisResult }

export interface ContactFormData {
  name: string
  email: string
  company?: string
  subject: string
  message: string
  consent: boolean
  honeypot?: string // Hidden field for spam prevention
}

// AI Worker endpoint - Production only
const AI_WORKER_ENDPOINT = 'https://ai-contact-analyzer.rcormier.workers.dev'

// Retry configuration
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

// Enhanced error handling with specific error types
export class AIAnalysisError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'CONSENT_REQUIRED' | 'VALIDATION_ERROR' | 'AI_UNAVAILABLE' | 'NETWORK_ERROR' = 'NETWORK_ERROR'
  ) {
    super(message)
    this.name = 'AIAnalysisError'
  }
}

// Get user timezone from browser
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'America/New_York' // Fallback to EST
  }
}

// AI-powered industry identification
async function identifyIndustry(companyName: string, message: string): Promise<string> {
  if (!companyName || companyName.trim() === '') {
    return 'other'
  }

  try {
    // Try AI-powered industry detection first
    const response = await fetch(AI_WORKER_ENDPOINT + '/industry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: companyName,
        message: message.substring(0, 500) // Limit message size
      }),
    })

    if (response.ok) {
      const result = await response.json()
      return result.industry || 'other'
    }
  } catch (error) {
    logger.warn('AI industry detection failed, using fallback:', error)
  }

  // Fallback: keyword-based industry detection
  const messageLower = message.toLowerCase()
  const companyLower = companyName.toLowerCase()

  // Industry keywords mapping
  const industryKeywords = {
    technology: ['tech', 'software', 'saas', 'platform', 'digital', 'ai', 'automation', 'cloud', 'api'],
    healthcare: ['health', 'medical', 'hospital', 'clinic', 'patient', 'doctor', 'nurse', 'pharma', 'biotech'],
    finance: ['bank', 'financial', 'investment', 'insurance', 'credit', 'loan', 'trading', 'fintech', 'payments'],
    manufacturing: ['manufacturing', 'factory', 'production', 'industrial', 'machinery', 'supply chain', 'logistics'],
    retail: ['retail', 'ecommerce', 'store', 'shopping', 'consumer', 'merchandise', 'sales'],
    education: ['education', 'school', 'university', 'college', 'learning', 'training', 'academic'],
    government: ['government', 'public', 'federal', 'state', 'municipal', 'agency', 'department'],
    nonprofit: ['nonprofit', 'charity', 'foundation', 'ngo', 'volunteer', 'donation'],
    startup: ['startup', 'venture', 'funding', 'accelerator', 'incubator', 'seed', 'series'],
    enterprise: ['enterprise', 'corporate', 'fortune', 'global', 'multinational', 'conglomerate']
  }

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => 
      companyLower.includes(keyword) || messageLower.includes(keyword)
    )) {
      return industry
    }
  }

  return 'other'
}

// Enhanced message analysis with AI
async function analyzeMessageContent(
  name: string,
  company: string,
  subject: string,
  message: string
): Promise<Partial<AIAnalysisResult>> {
  try {
    logger.aiWorker('Attempting AI analysis with worker:', AI_WORKER_ENDPOINT)
    
    const response = await fetch(AI_WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        company: company || '',
        subject,
        message,
        consent: 'true'
      }),
    })

    logger.response('AI Worker Response Status:', response.status, response.statusText)

    if (response.ok) {
      const result = await response.json()
      logger.success('AI Worker Response:', result)
      
      // Mark as AI-available if we got a successful response
      return {
        ...result,
        fallback: false,
        aiAvailable: true
      }
    } else {
      logger.error('AI Worker returned error status:', response.status, response.statusText)
      const errorText = await response.text()
      logger.error('AI Worker error details:', errorText)
    }
  } catch (error) {
    logger.error('AI Worker request failed:', error)
    logger.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }

  logger.info('Falling back to keyword-based analysis')
  
  // Fallback analysis
  return createFallbackAnalysis({ 
    name, 
    email: 'user@example.com', // Default email for fallback
    company, 
    subject, 
    message,
    consent: true // Default consent for fallback
  })
}

// Enhanced fallback analysis when AI fails
const createFallbackAnalysis = (formData: ContactFormData): AIAnalysisResult => {
  const messageLower = formData.message.toLowerCase()
  const subjectLower = formData.subject.toLowerCase()
  
  // Enhanced keyword-based analysis
  const hasUrgentKeywords = /urgent|asap|immediately|emergency|critical|deadline|rush|priority/i.test(messageLower + ' ' + subjectLower)
  const hasProjectKeywords = /project|development|implementation|integration|migration|modernization|strategy|planning|consultation/i.test(messageLower)
  const hasTechnicalKeywords = /technical|architecture|system|platform|api|database|infrastructure|devops|automation/i.test(messageLower)
  const hasMeetingKeywords = /meet|schedule|call|discussion|conversation|consultation|review|planning/i.test(messageLower)
  const hasSimpleKeywords = /quick|simple|basic|question|inquiry|information|help/i.test(messageLower)
  
  let inquiryType: AIAnalysisResult['inquiryType'] = 'general'
  let priorityLevel: AIAnalysisResult['priorityLevel'] = 'medium'
  let messageType: AIAnalysisResult['messageType'] = 'message'
  let shouldScheduleMeeting = false
  let meetingDuration: AIAnalysisResult['meetingDuration'] = '1 hour'
  let urgency: AIAnalysisResult['urgency'] = 'flexible'
  let projectScope: AIAnalysisResult['projectScope'] = 'medium'
  
  // Determine inquiry type and priority
  if (hasUrgentKeywords) {
    priorityLevel = 'high'
    inquiryType = 'urgent'
    urgency = 'immediate'
    shouldScheduleMeeting = true
    meetingDuration = '2 hours'
  } else if (hasProjectKeywords && hasTechnicalKeywords) {
    inquiryType = 'project'
    priorityLevel = 'medium'
    shouldScheduleMeeting = true
    meetingDuration = '1.5 hours'
    projectScope = 'large'
  } else if (hasProjectKeywords) {
    inquiryType = 'project'
    shouldScheduleMeeting = true
    meetingDuration = '1 hour'
    projectScope = 'medium'
  } else if (hasMeetingKeywords) {
    inquiryType = 'consultation'
    messageType = 'meeting-request'
    shouldScheduleMeeting = true
    meetingDuration = '1 hour'
  } else if (hasSimpleKeywords) {
    inquiryType = 'general'
    messageType = 'message'
    shouldScheduleMeeting = false
    meetingDuration = '30 minutes'
    projectScope = 'small'
  }
  
  // Generate contextual follow-up questions
  const followUpQuestions = generateFollowUpQuestions(messageLower, inquiryType)
  
  return {
    inquiryType,
    priorityLevel,
    industry: 'other', // Will be set by industry identification
    projectScope,
    urgency,
    messageType,
    suggestedResponse: `Thank you for reaching out, ${formData.name}! I've received your inquiry about "${formData.subject}" and I'm looking forward to discussing how I can help with your project.`,
    meetingDuration,
    relevantContent: ['general portfolio'],
    confidence: 0.6,
    shouldScheduleMeeting,
    meetingType: shouldScheduleMeeting ? 'general-discussion' : 'consultation',
    recommendedTimeSlots: ['morning', 'afternoon'],
    timezoneConsideration: 'user\'s local timezone',
    userTimezone: getUserTimezone(),
    followUpRequired: shouldScheduleMeeting,
    redFlags: [],
    followUpQuestions,
    timestamp: new Date().toISOString(),
    originalMessage: formData.message.substring(0, 200) + (formData.message.length > 200 ? '...' : ''),
    wordCount: formData.message.split(' ').length,
    hasCompany: !!formData.company,
    emailDomain: formData.email.split('@')[1] || 'unknown',
    fallback: true,
    aiAvailable: false
  }
}

// Generate contextual follow-up questions
function generateFollowUpQuestions(message: string, inquiryType: string): string[] {
  const questions: string[] = []
  
  // Analyze what information is missing
  const hasTimeline = /timeline|deadline|schedule|when|time|duration|timeline/i.test(message)
  const hasTeamSize = /team|team size|developers|staff|people|employees|users|organization/i.test(message)
  const hasBudget = /budget|cost|price|investment|funding|financial|expense/i.test(message)
  const hasTechnicalDetails = /technology|tech stack|framework|platform|api|database|infrastructure|system/i.test(message)
  const hasBusinessContext = /business|company|industry|sector|market|customers|clients/i.test(message)
  const hasSpecificGoals = /goals|objectives|outcomes|results|success|metrics|kpis|targets/i.test(message)
  const hasStakeholders = /stakeholders|decision makers|leadership|management|executives/i.test(message)
  
  // Ask about missing critical information based on inquiry type
  if (inquiryType === 'project') {
    if (!hasTimeline) questions.push("What's your timeline for this project?")
    if (!hasTeamSize) questions.push("How large is your team or organization?")
    if (!hasBudget) questions.push("What's your budget range for this project?")
    if (!hasTechnicalDetails) questions.push("What technologies or platforms are you currently using?")
    if (!hasSpecificGoals) questions.push("What specific outcomes are you looking to achieve?")
  } else if (inquiryType === 'consultation') {
    if (!hasBusinessContext) questions.push("What industry or business context should I understand?")
    if (!hasSpecificGoals) questions.push("What specific challenge are you facing?")
    if (!hasStakeholders) questions.push("Who are the key stakeholders involved?")
  } else if (inquiryType === 'urgent') {
    if (!hasTimeline) questions.push("What's the urgency timeline for this request?")
    if (!hasSpecificGoals) questions.push("What immediate outcome do you need?")
    questions.push("How can I best help you address this urgent need?")
  } else {
    // General inquiry
    if (!hasBusinessContext) questions.push("What industry or business context should I understand?")
    if (!hasSpecificGoals) questions.push("What specific challenge are you facing?")
    questions.push("How can I best help you achieve your goals?")
  }
  
  // Ensure we have at least 2 questions
  if (questions.length < 2) {
    questions.push("What specific challenge are you facing?")
    questions.push("How can I best help you achieve your goals?")
  }
  
  return questions.slice(0, 5) // Limit to 5 questions
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
    if (maxRetries === 0) {
      throw error
    }
    
          logger.info(`Retrying... (${maxRetries} attempts left)`)
    await new Promise(resolve => setTimeout(resolve, delay))
    
    return retryWithBackoff(fn, maxRetries - 1, delay * 2)
  }
}

// Enhanced AI analysis with all new features
export const analyzeContactForm = async (formData: ContactFormData): Promise<AIAnalysisResult | null> => {
  try {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      throw new AIAnalysisError(
        'Missing required fields: name, email, subject, and message are required.',
        'VALIDATION_ERROR'
      )
    }

    // Check consent
    if (!formData.consent) {
      throw new AIAnalysisError(
        'Consent is required for AI analysis.',
        'CONSENT_REQUIRED'
      )
    }

    // Check honeypot (spam prevention)
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      throw new AIAnalysisError(
        'Invalid submission detected.',
        'VALIDATION_ERROR'
      )
    }

    // Get user timezone
    const userTimezone = getUserTimezone()

    // Try AI analysis with retry logic
    const analysis = await retryWithBackoff(async () => {
      const result = await analyzeMessageContent(
        formData.name,
        formData.company || '',
        formData.subject,
        formData.message
      )
      
      if (result) {
        // Add timezone information
        result.userTimezone = userTimezone
        
        // Validate the response using Zod schema
        return safeValidateAIAnalysis(result)
      } else {
        throw new Error('AI analysis returned null')
      }
    })

    // If AI analysis succeeded, try industry identification
    if (analysis && !analysis.fallback) {
      try {
        const industry = await identifyIndustry(formData.company || '', formData.message)
        // Type assertion to ensure industry is valid
        analysis.industry = industry as AIAnalysisResult['industry']
      } catch (error) {
        logger.warn('Industry identification failed:', error)
        // Keep the industry from AI analysis or default to 'other'
      }
    }

    return analysis

  } catch (error) {
    // Handle specific error types
    if (error instanceof AIAnalysisError) {
      logger.error('AI Analysis Error:', error.message, error.code)
      throw error
    }

    // For other errors, return fallback analysis
    logger.warn('AI analysis failed, using fallback:', error)
    const fallbackAnalysis = createFallbackAnalysis(formData)
    
    // Try industry identification even in fallback mode
    try {
      const industry = await identifyIndustry(formData.company || '', formData.message)
      // Type assertion to ensure industry is valid
      fallbackAnalysis.industry = industry as AIAnalysisResult['industry']
    } catch (error) {
      logger.warn('Industry identification failed in fallback mode:', error)
    }
    
    return fallbackAnalysis
  }
}

// Get priority color for UI display
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Get urgency indicator
export const getUrgencyIndicator = (urgency: string): string => {
  switch (urgency) {
    case 'immediate':
      return '🔴'
    case 'urgent':
      return '🟠'
    case 'flexible':
      return '🟢'
    default:
      return '⚪'
  }
}

// Get message type indicator
export const getMessageTypeIndicator = (messageType: string): string => {
  switch (messageType) {
    case 'meeting-request': return '📅'
    case 'message': return '💬'
    default: return '📧'
  }
}

// Get red flag indicator
export const formatRedFlags = (redFlags: string[]): string[] => {
  return redFlags.map(flag => {
    if (flag.includes('suspicious')) return '🚨 Suspicious activity detected'
    if (flag.includes('spam')) return '📧 Potential spam content'
    if (flag.includes('malicious')) return '⚠️ Malicious content detected'
    return `⚠️ ${flag}`
  })
}

// Test AI Worker connectivity
export async function testAIWorker(): Promise<{ success: boolean; error?: string; details?: unknown }> {
  try {
    logger.test('Testing AI Worker connectivity...')
    logger.location('Worker URL:', AI_WORKER_ENDPOINT)
    logger.network('Environment:', import.meta.env.PROD ? 'Production' : 'Development')
    logger.security('CORS Mode:', 'cors')
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      subject: 'Test Subject',
      message: 'This is a test message to check if the AI worker is working properly.',
      consent: 'true'
    }
    
    logger.data('Sending test data:', testData)
    
    // Test with different fetch options
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
      mode: 'cors' as RequestMode,
      cache: 'no-cache' as RequestCache,
    }
    
    logger.response('Fetch options:', fetchOptions)
    
    const response = await fetch(AI_WORKER_ENDPOINT, fetchOptions)
    
    logger.response('Test Response Status:', response.status, response.statusText)
    logger.response('Response Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const result = await response.json()
      logger.success('AI Worker Test Successful:', result)
      return { 
        success: true, 
        details: { status: response.status, result } 
      }
    } else {
      let errorText = 'Unknown error'
      try {
        errorText = await response.text()
      } catch (e) {
        logger.warn('Could not read error response:', e)
      }
      
      logger.error('AI Worker Test Failed:', response.status, errorText)
      logger.error('Response Headers:', Object.fromEntries(response.headers.entries()))
      
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}`,
        details: { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers.entries())
        }
      }
    }
  } catch (error) {
    logger.error('AI Worker Test Error:', error)
    
    // More detailed error information
    let errorDetails = {
      message: 'Unknown error',
      name: 'Unknown',
      stack: undefined as string | undefined
    }
    
    if (error instanceof Error) {
      errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    } else if (error instanceof TypeError) {
      errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    }
    
    logger.error('Error details:', errorDetails)
    
    // Check if it's a CORS issue
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logger.error('This looks like a CORS or network issue')
      logger.error('Check if the worker is running and accessible')
    }
    
    return { 
      success: false, 
      error: errorDetails.message,
      details: { 
        error: errorDetails,
        workerUrl: AI_WORKER_ENDPOINT,
        environment: import.meta.env.PROD ? 'Production' : 'Development'
      }
    }
  }
}
