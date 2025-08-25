// AI-powered contact form analyzer using Cloudflare AI
// HARDENED VERSION with security, privacy, and abuse prevention

// PII and sensitive data patterns to filter out
const SENSITIVE_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  creditCard: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  apiKey: /\b(api[_-]?key|token|secret|password)[\s]*[:=][\s]*['"]?[A-Za-z0-9._-]{10,}['"]?/gi,
  oauth: /\b(oauth|bearer)[\s]*[:=][\s]*['"]?[A-Za-z0-9._-]{20,}['"]?/gi
}

// Rate limiting configuration
const RATE_LIMITS = {
  requestsPerMinute: 5, // Reduced from 10 for anonymous traffic
  requestsPerHour: 20,
  burstLimit: 3
}

// Strict JSON schema for AI analysis
const ANALYSIS_SCHEMA = {
  inquiryType: ['consultation', 'project', 'partnership', 'general', 'urgent'],
  priorityLevel: ['high', 'medium', 'low'],
  industry: ['technology', 'healthcare', 'finance', 'manufacturing', 'other'],
  projectScope: ['small', 'medium', 'large', 'enterprise'],
  urgency: ['immediate', 'soon', 'flexible'],
  meetingType: ['consultation', 'project-planning', 'technical-review', 'strategy-session', 'general-discussion'],
  confidence: { min: 0, max: 1 },
  redFlags: { type: 'array', maxLength: 5 },
  followUps: { type: 'array', maxLength: 3 }
}

// PII and sensitive data scrubber
function scrubSensitiveData(text) {
  if (!text || typeof text !== 'string') return text
  
  let scrubbed = text
  
  // Replace sensitive patterns with placeholders
  Object.entries(SENSITIVE_PATTERNS).forEach(([type, pattern]) => {
    scrubbed = scrubbed.replace(pattern, `[${type.toUpperCase()}_REDACTED]`)
  })
  
  // Additional business logic checks
  const suspiciousPatterns = [
    /\b(crypto|bitcoin|ethereum|wallet)\b/gi,
    /\b(seo|backlink|ranking|traffic)\b/gi,
    /\b(loan|mortgage|refinance|debt)\b/gi,
    /(https?:\/\/[^\s]+)/g, // URLs
    /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g // Emails again
  ]
  
  suspiciousPatterns.forEach(pattern => {
    scrubbed = scrubbed.replace(pattern, '[SUSPICIOUS_CONTENT]')
  })
  
  return scrubbed
}

// Rate limiting with IP tracking (KV optional)
async function checkRateLimit(request, env) {
  // If KV is not available, skip rate limiting
  if (!env.KV) {
    console.warn('KV not available, skipping rate limiting')
    return true
  }
  
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Forwarded-For') || 
                   'unknown'
  
  const now = Date.now()
  const minuteKey = `rate_limit:${clientIP}:${Math.floor(now / 60000)}`
  const hourKey = `rate_limit:${clientIP}:${Math.floor(now / 3600000)}`
  
  try {
    // Get current counts
    const [minuteCount, hourCount] = await Promise.all([
      env.KV.get(minuteKey, { type: 'text' }).then(v => parseInt(v) || 0),
      env.KV.get(hourKey, { type: 'text' }).then(v => parseInt(v) || 0)
    ])
    
    // Check limits
    if (minuteCount >= RATE_LIMITS.requestsPerMinute) {
      throw new Error('Rate limit exceeded: too many requests per minute')
    }
    
    if (hourCount >= RATE_LIMITS.requestsPerHour) {
      throw new Error('Rate limit exceeded: too many requests per hour')
    }
    
    // Increment counters with expiration
    await Promise.all([
      env.KV.put(minuteKey, (minuteCount + 1).toString(), { expirationTtl: 60 }),
      env.KV.put(hourKey, (hourCount + 1).toString(), { expirationTtl: 3600 })
    ])
    
    return true
  } catch (error) {
    if (error.message.includes('Rate limit exceeded')) {
      throw error
    }
    // If KV is unavailable, allow request but log
    console.warn('Rate limiting unavailable, allowing request')
    return true
  }
}

// Validate and sanitize input data with enhanced security
function validateInput(data) {
  const { name, email, company, subject, message, consent } = data
  
  // Check required fields
  if (!name || !email || !subject || !message) {
    throw new Error('Missing required fields')
  }
  
  // Check explicit consent for AI analysis
  if (!consent || consent !== 'true') {
    throw new Error('Explicit consent required for AI analysis')
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  
  // Check for honeypot field (hidden field that should be empty)
  if (data.honeypot && data.honeypot.trim() !== '') {
    throw new Error('Form submission rejected')
  }
  
  // Sanitize inputs (enhanced XSS prevention)
  const sanitize = (str) => {
    if (!str || typeof str !== 'string') return ''
    return str
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000) // Limit length
  }
  
  const sanitized = {
    name: sanitize(name),
    email: sanitize(email),
    company: company ? sanitize(company) : '',
    subject: sanitize(subject),
    message: sanitize(message)
  }
  
  // Validate lengths
  if (sanitized.name.length < 2 || sanitized.name.length > 100) {
    throw new Error('Invalid name length')
  }
  
  if (sanitized.subject.length < 5 || sanitized.subject.length > 200) {
    throw new Error('Invalid subject length')
  }
  
  if (sanitized.message.length < 20 || sanitized.message.length > 2000) {
    throw new Error('Invalid message length')
  }
  
  return sanitized
}

// Validate AI response against schema
function validateAIResponse(response) {
  try {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format')
    }
    
    // Check required fields
    const required = ['inquiryType', 'priorityLevel', 'industry', 'projectScope', 'urgency']
    for (const field of required) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    // Validate enum values
    if (!ANALYSIS_SCHEMA.inquiryType.includes(response.inquiryType)) {
      response.inquiryType = 'general'
    }
    
    if (!ANALYSIS_SCHEMA.priorityLevel.includes(response.priorityLevel)) {
      response.priorityLevel = 'medium'
    }
    
    if (!ANALYSIS_SCHEMA.industry.includes(response.industry)) {
      response.industry = 'other'
    }
    
    if (!ANALYSIS_SCHEMA.projectScope.includes(response.projectScope)) {
      response.projectScope = 'medium'
    }
    
    if (!ANALYSIS_SCHEMA.urgency.includes(response.urgency)) {
      response.urgency = 'flexible'
    }
    
    // Validate confidence score
    if (typeof response.confidence !== 'number' || 
        response.confidence < ANALYSIS_SCHEMA.confidence.min || 
        response.confidence > ANALYSIS_SCHEMA.confidence.max) {
      response.confidence = 0.7
    }
    
    // Ensure arrays exist and are within limits
    if (!Array.isArray(response.redFlags)) {
      response.redFlags = []
    } else {
      response.redFlags = response.redFlags.slice(0, ANALYSIS_SCHEMA.redFlags.maxLength)
    }
    
         if (!Array.isArray(response.followUps)) {
       response.followUps = []
     } else {
               // Filter out placeholder text and ensure actual questions
        response.followUps = response.followUps
          .filter(question => {
            if (!question || typeof question !== 'string') return false
            
            const questionLower = question.toLowerCase().trim()
            
            // Remove placeholder text variations
            if (questionLower.includes('1-3') || questionLower.includes('clarifying questions if needed')) return false
            if (questionLower.includes('array of') || questionLower.includes('security concerns if any')) return false
            if (questionLower.includes('specific question') && questionLower.match(/specific question \d+/)) return false
            if (questionLower.includes('follow-up questions') && questionLower.includes('if needed')) return false
            if (questionLower.includes('questions if needed')) return false
            if (questionLower.includes('clarifying questions')) return false
            
            // Filter out very short or generic text
            if (question.length < 10) return false
            if (questionLower === 'questions' || questionLower === 'follow-ups' || questionLower === 'followups') return false
            
            return question.trim().length > 0
          })
          .slice(0, ANALYSIS_SCHEMA.followUps.maxLength)
     }
    
    return response
  } catch (error) {
    throw new Error(`AI response validation failed: ${error.message}`)
  }
}

// Calculate confidence based on data quality and completeness
function calculateConfidence({ name, email, company, subject, message, analysis }) {
  let confidence = 0.0
  
  // Base confidence from required fields (35%)
  if (name && name.trim().length > 0) confidence += 0.12
  if (email && email.includes('@') && email.includes('.')) confidence += 0.13
  if (subject && subject.trim().length > 0) confidence += 0.10
  
  // Message quality (35%)
  const messageLength = message.trim().length
  if (messageLength >= 100) confidence += 0.35
  else if (messageLength >= 80) confidence += 0.30
  else if (messageLength >= 60) confidence += 0.25
  else if (messageLength >= 40) confidence += 0.20
  else if (messageLength >= 30) confidence += 0.15
  else if (messageLength >= 20) confidence += 0.10
  else confidence += 0.05
  
  // Company information (10%)
  if (company && company.trim().length > 0) confidence += 0.10
  
  // Email domain quality (5%)
  const emailDomain = email.split('@')[1] || ''
  if (emailDomain && emailDomain !== 'gmail.com' && emailDomain !== 'yahoo.com' && emailDomain !== 'hotmail.com') {
    confidence += 0.05
  }
  
  // Subject specificity (5%)
  const subjectWords = subject.trim().split(' ').length
  if (subjectWords >= 5) confidence += 0.05
  else if (subjectWords >= 3) confidence += 0.03
  else confidence += 0.01
  
  // Message content indicators (10%)
  const hasProjectKeywords = /project|development|implementation|integration|modernization|migration|consultation|strategy/i.test(message)
  const hasTechnicalTerms = /api|database|cloud|saas|devops|ci\/cd|automation|system|platform|web|app|application/i.test(message)
  const hasBusinessTerms = /business|enterprise|company|organization|team|leadership|management|process|startup/i.test(message)
  
  if (hasProjectKeywords) confidence += 0.03
  if (hasTechnicalTerms) confidence += 0.03
  if (hasBusinessTerms) confidence += 0.04
  
  // AI analysis quality bonus (up to 5%)
  if (analysis.inquiryType && analysis.inquiryType !== 'general') confidence += 0.02
  if (analysis.industry && analysis.industry !== 'other') confidence += 0.02
  if (analysis.projectScope && analysis.projectScope !== 'medium') confidence += 0.01
  
  // Penalties for low-quality data
  if (messageLength < 20) confidence -= 0.25
  else if (messageLength < 40) confidence -= 0.20
  else if (messageLength < 60) confidence -= 0.15
  else if (messageLength < 80) confidence -= 0.10
  
  // Heavy penalty for incomplete sentences (no period, question mark, or exclamation at end)
  if (messageLength > 0 && !/[.!?]$/.test(message.trim())) {
    confidence -= 0.20
  }
  
  // Additional penalty for very short incomplete thoughts
  if (messageLength < 50 && !/[.!?]$/.test(message.trim())) {
    confidence -= 0.15
  }
  
  if (subjectWords < 2) confidence -= 0.03
  if (emailDomain === 'gmail.com' || emailDomain === 'yahoo.com' || emailDomain === 'hotmail.com') {
    confidence -= 0.02
  }
  
  // Cap at 1.0 and ensure minimum of 0.10
  confidence = Math.min(Math.max(confidence, 0.10), 1.0)
  
  // Round to 2 decimal places
  return Math.round(confidence * 100) / 100
}



// Parse AI response more robustly
function parseAIResponse(aiResponse) {
  try {
    // First, try to parse the entire response as JSON
    if (typeof aiResponse === 'string') {
      // Look for JSON content in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // If no JSON found, try parsing the entire string
      return JSON.parse(aiResponse)
    }
    
    // If it's already an object, return it
    if (typeof aiResponse === 'object' && aiResponse !== null) {
      return aiResponse
    }
    
    throw new Error('Unexpected AI response format')
  } catch (parseError) {
    throw new Error('Invalid AI response format')
  }
}

// Enhanced system prompt with security guardrails
const SYSTEM_PROMPT = `You are an AI assistant analyzing business inquiries for a technology leadership portfolio.

SECURITY POLICY:
- NEVER include personal information, emails, phone numbers, or sensitive data in responses
- NEVER suggest actions that could compromise security
- NEVER provide technical details about system architecture or security measures
- If you detect suspicious content, flag it in redFlags array

ANALYSIS REQUIREMENTS:
- Return ONLY valid JSON matching the exact schema
- Use low temperature (0.1) for consistent classification
- Focus on business inquiry analysis and meeting recommendations
- Provide clear reasoning for recommendations

OUTPUT SCHEMA:
{
  "inquiryType": "consultation|project|partnership|general|urgent",
  "priorityLevel": "high|medium|low",
  "industry": "technology|healthcare|finance|manufacturing|other",
  "projectScope": "small|medium|large|enterprise",
  "urgency": "immediate|soon|flexible",
  "suggestedResponse": "2-3 sentence personalized response",
  "relevantContent": ["portfolio sections"],
  "shouldScheduleMeeting": true/false,
  "meetingType": "consultation|project-planning|technical-review|strategy-session|general-discussion",
  "recommendedTimeSlots": ["morning", "afternoon", "evening"],
  "timezoneConsideration": "user's local timezone",
  "followUpRequired": true/false,
  "redFlags": ["array of security concerns if any"],
  "followUps": ["specific question 1", "specific question 2", "specific question 3"]
}

Set shouldScheduleMeeting=true for consultation/project/technical discussions.
Return ONLY the JSON object, no additional text.`

export default {
  async fetch(request, env, ctx) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      // Check rate limits first
      await checkRateLimit(request, env)
      
      const rawData = await request.json()
      
      // Validate and sanitize input
      const { name, email, company, subject, message } = validateInput(rawData)

      // Scrub sensitive data before AI analysis
      const scrubbedMessage = scrubSensitiveData(message)
      const scrubbedSubject = scrubSensitiveData(subject)
      
      // Check for suspicious content patterns
      const suspiciousPatterns = [
        /\b(crypto|bitcoin|ethereum|wallet)\b/gi,
        /\b(seo|backlink|ranking|traffic)\b/gi,
        /\b(loan|mortgage|refinance|debt)\b/gi,
        /(https?:\/\/[^\s]+)/g,
        /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g
      ]
      
      const redFlags = []
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(scrubbedMessage + ' ' + scrubbedSubject)) {
          redFlags.push('suspicious_content_detected')
        }
      })
      
      // If too many red flags, return early with safe response
      if (redFlags.length > 2) {
        return new Response(JSON.stringify({
          inquiryType: 'general',
          priorityLevel: 'low',
          industry: 'other',
          projectScope: 'small',
          urgency: 'flexible',
          suggestedResponse: 'Thank you for your message. I\'ll review it and get back to you soon.',
          relevantContent: ['general portfolio'],
          shouldScheduleMeeting: false,
          meetingType: 'general-discussion',
          recommendedTimeSlots: ['morning', 'afternoon'],
          timezoneConsideration: 'user\'s local timezone',
          followUpRequired: false,
          redFlags,
          followUps: [],
          confidence: 0.3,
          timestamp: new Date().toISOString(),
          originalMessage: '[CONTENT_REVIEWED]',
          wordCount: 0,
          hasCompany: !!company,
          emailDomain: email.split('@')[1] || 'unknown',
          fallback: true
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      // Calculate meeting duration deterministically BEFORE AI analysis
      const messageLower = scrubbedMessage.toLowerCase()
      const subjectLower = scrubbedSubject.toLowerCase()
      
      // Analyze message content for deterministic meeting duration
      let deterministicDuration = '1 hour' // default
      
      // Check for urgency indicators
      const hasUrgentKeywords = /urgent|asap|immediately|emergency|critical|deadline|rush/i.test(messageLower + ' ' + subjectLower)
      const hasComplexKeywords = /complex|complicated|detailed|comprehensive|extensive|multiple|several|various/i.test(messageLower)
      const hasProjectKeywords = /project|development|implementation|integration|migration|modernization|strategy|planning/i.test(messageLower)
      const hasTechnicalKeywords = /technical|architecture|system|platform|api|database|infrastructure|devops/i.test(messageLower)
      const hasSimpleKeywords = /quick|simple|basic|question|inquiry|discussion|chat/i.test(messageLower)
      
      if (hasUrgentKeywords || hasComplexKeywords || (hasProjectKeywords && hasTechnicalKeywords)) {
        deterministicDuration = '2 hours'
      } else if (hasProjectKeywords || hasTechnicalKeywords) {
        deterministicDuration = '1.5 hours'
      } else if (hasSimpleKeywords) {
        deterministicDuration = '30 minutes'
      } else {
        deterministicDuration = '1 hour'
      }

            // Use Cloudflare AI to analyze the message
      let aiResponse
      try {
        // Try with the correct model name
        aiResponse = await env.ai.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: [{
            role: 'user',
                         content: `Analyze this contact form and return JSON. For followUps, generate 1-3 specific questions about information that's missing from their message. Make each question contextual and specific to what they mentioned:

 {
   "inquiryType": "consultation|project|partnership|general|urgent",
   "priorityLevel": "high|medium|low", 
   "industry": "technology|healthcare|finance|manufacturing|other",
   "projectScope": "small|medium|large|enterprise",
   "urgency": "immediate|soon|flexible",
   "suggestedResponse": "2-3 sentence personalized response",
   "relevantContent": ["portfolio sections"],
   "shouldScheduleMeeting": true/false,
   "meetingType": "consultation|project-planning|technical-review|strategy-session|general-discussion",
   "recommendedTimeSlots": ["morning", "afternoon", "evening"],
   "timezoneConsideration": "user's local timezone",
   "followUpRequired": true/false,
   "redFlags": ["array of security concerns if any"],
   "followUps": ["What's your timeline for this ERP implementation?", "How many users will need access to the system?", "Which specific ERP modules are you looking to implement?"]
 }

Contact: ${name} (${company || 'Not specified'})
Subject: ${scrubbedSubject}
Message: ${scrubbedMessage}

JSON only:`
          }],
          temperature: 0.1 // Low temperature for consistent classification
        })
      } catch (aiError) {
        console.error('AI service error:', aiError)
        // Fall back to keyword-based analysis
        const messageLower = scrubbedMessage.toLowerCase()
        const subjectLower = scrubbedSubject.toLowerCase()
        
        let inquiryType = 'general'
        let priorityLevel = 'medium'
        let shouldScheduleMeeting = false
        let meetingDuration = '1 hour'
        
        // Check for urgency
        const hasUrgentKeywords = /urgent|asap|immediately|emergency|critical|deadline|rush/i.test(messageLower + ' ' + subjectLower)
        if (hasUrgentKeywords) {
          priorityLevel = 'high'
          inquiryType = 'urgent'
          shouldScheduleMeeting = true
          meetingDuration = '2 hours'
        }
        
        // Check for project keywords
        const hasProjectKeywords = /project|development|implementation|integration|migration|modernization|strategy|planning/i.test(messageLower)
        if (hasProjectKeywords) {
          inquiryType = 'project'
          shouldScheduleMeeting = true
          meetingDuration = '1.5 hours'
        }
        
        // Check for consultation keywords
        const hasConsultationKeywords = /consultation|advice|guidance|help|support|discussion/i.test(messageLower)
        if (hasConsultationKeywords) {
          inquiryType = 'consultation'
          shouldScheduleMeeting = true
          meetingDuration = '1 hour'
        }

                 // Create fallback analysis with contextual follow-up questions based on missing information
         const basicFollowUps = []
         
         // Analyze what information is missing from the message
         const hasTimeline = /timeline|deadline|schedule|when|time|duration/i.test(messageLower)
         const hasTeamSize = /team|team size|developers|staff|people|employees|users/i.test(messageLower)
         const hasBudget = /budget|cost|price|investment|funding/i.test(messageLower)
         const hasTechnicalDetails = /technology|tech stack|framework|platform|api|database|infrastructure/i.test(messageLower)
         const hasBusinessContext = /business|company|industry|sector|market|customers/i.test(messageLower)
         const hasSpecificGoals = /goals|objectives|outcomes|results|success|metrics/i.test(messageLower)
         
         // Ask about missing critical information
         if (!hasTimeline) {
           basicFollowUps.push("What's your timeline for this project?")
         }
         if (!hasTeamSize) {
           basicFollowUps.push("How large is your team or organization?")
         }
         if (!hasTechnicalDetails && (hasProjectKeywords || hasTechnicalKeywords)) {
           basicFollowUps.push("What technologies or platforms are you currently using?")
         }
         if (!hasBusinessContext) {
           basicFollowUps.push("What industry or business context should I understand?")
         }
         if (!hasSpecificGoals) {
           basicFollowUps.push("What specific outcomes are you looking to achieve?")
         }
         
         // If we still don't have enough questions, add some general ones
         if (basicFollowUps.length < 2) {
           if (basicFollowUps.length === 0) {
             basicFollowUps.push("What specific challenge are you facing?")
           }
           basicFollowUps.push("How can I best help you achieve your goals?")
         }
         
         analysis = {
           inquiryType,
           priorityLevel,
           industry: 'other',
           projectScope: 'medium',
           urgency: hasUrgentKeywords ? 'immediate' : 'flexible',
           suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
           relevantContent: ['general portfolio'],
           shouldScheduleMeeting,
           meetingType: shouldScheduleMeeting ? 'general-discussion' : 'consultation',
           recommendedTimeSlots: ['morning', 'afternoon'],
           timezoneConsideration: 'user\'s local timezone',
           followUpRequired: shouldScheduleMeeting,
           redFlags,
           followUps: basicFollowUps,
           fallback: true
         }
        
        // Skip AI parsing since we're using fallback
        aiResponse = null
      }

      // Parse AI response and extract JSON
      let analysis
      if (aiResponse) {
        try {
          analysis = parseAIResponse(aiResponse.response)
          analysis = validateAIResponse(analysis)
        } catch (parseError) {
          console.error('AI response parsing error:', parseError)
                     // Fallback analysis if AI response parsing fails
           const basicFollowUps = ["What specific challenge are you facing?", "How can I best help you achieve your goals?"]
           
           analysis = {
             inquiryType: 'general',
             priorityLevel: 'medium',
             industry: 'other',
             projectScope: 'medium',
             urgency: 'flexible',
             suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
             relevantContent: ['general portfolio'],
             shouldScheduleMeeting: true,
             meetingType: 'general-discussion',
             recommendedTimeSlots: ['morning', 'afternoon'],
             timezoneConsideration: 'user\'s local timezone',
             followUpRequired: true,
             redFlags,
             followUps: basicFollowUps,
             fallback: true
           }
        }
      }
      // If aiResponse is null, we already have the fallback analysis from the catch block

      // Ensure all required fields exist with defaults
      const defaultAnalysis = {
        inquiryType: 'general',
        priorityLevel: 'medium',
        industry: 'other',
        projectScope: 'medium',
        urgency: 'flexible',
        meetingDuration: '1 hour',
        relevantContent: ['general portfolio'],
        shouldScheduleMeeting: false,
        meetingType: 'general-discussion',
        recommendedTimeSlots: ['morning', 'afternoon'],
        timezoneConsideration: 'user\'s local timezone',
        followUpRequired: false,
        redFlags: [],
        followUps: []
      }
      
      // Remove any AI-set confidence to ensure our calculation takes precedence
      delete analysis.confidence
      
      // Merge with defaults for missing fields
      analysis = { ...defaultAnalysis, ...analysis }
      
      // Set the deterministic meeting duration (calculated earlier)
      analysis.meetingDuration = deterministicDuration
      
      // Update the suggested response to include the deterministic duration
      if (analysis.suggestedResponse) {
        // Remove any existing duration mentions and add the deterministic one
        const baseResponse = analysis.suggestedResponse
          .replace(/for \d+ (minutes?|hours?|hours?)/gi, '')
          .replace(/in \d+ (minutes?|hours?|hours?)/gi, '')
          .replace(/a \d+ (minutes?|hours?|hours?) meeting/gi, '')
          .trim()
        
        analysis.suggestedResponse = `${baseResponse} I'd be happy to schedule a ${deterministicDuration} meeting to discuss this further.`
      }

      // Add metadata
      const enhancedAnalysis = {
        ...analysis,
        timestamp: new Date().toISOString(),
        originalMessage: '[CONTENT_ANALYZED]', // Don't store original message
        wordCount: scrubbedMessage.split(' ').length,
        hasCompany: !!company,
        emailDomain: email.split('@')[1] || 'unknown'
      }
      
      // ALWAYS calculate confidence based on actual data quality, overriding any AI-set value
      enhancedAnalysis.confidence = calculateConfidence({
        name,
        email,
        company,
        subject: scrubbedSubject,
        message: scrubbedMessage,
        analysis: enhancedAnalysis
      })
      
      // Log only timing and status (no content)
      console.log(`AI analysis completed: ${Date.now()} - confidence: ${enhancedAnalysis.confidence} - redFlags: ${redFlags.length}`)
      
      return new Response(JSON.stringify(enhancedAnalysis), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })

    } catch (error) {
      // Log error without sensitive data
      console.error(`AI analysis error: ${error.message} - timestamp: ${Date.now()}`)
      
      return new Response(JSON.stringify({ 
        error: error.message || 'AI analysis failed',
        fallback: true,
        timestamp: new Date().toISOString()
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
  }
}
