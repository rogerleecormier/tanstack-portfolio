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
  industry: ['technology', 'healthcare', 'finance', 'manufacturing', 'retail', 'education', 'government', 'nonprofit', 'startup', 'enterprise', 'other'],
  projectScope: ['small', 'medium', 'large', 'enterprise'],
  urgency: ['immediate', 'soon', 'flexible'],
  meetingType: ['consultation', 'project-planning', 'technical-review', 'strategy-session', 'general-discussion'],
  confidence: { min: 0, max: 1 },
  redFlags: { type: 'array', maxLength: 5 },
  followUpQuestions: { type: 'array', maxLength: 3 }
}

// CORS headers helper function
function addCorsHeaders(response, status = 200) {
  const headers = new Headers(response.headers || {})
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
  
  return new Response(response.body, {
    status,
    headers
  })
}

// Intelligent fallback follow-up question generation
function generateIntelligentFollowUpQuestions(message, subject, company) {
  const messageLower = message.toLowerCase()
  const subjectLower = subject.toLowerCase()
  const questions = []
  
  // Technology-specific questions
  if (messageLower.includes('netsuite') || subjectLower.includes('netsuite')) {
    questions.push('What specific NetSuite modules or functionality are you looking to implement or optimize?')
  }
  if (messageLower.includes('erp') || subjectLower.includes('erp')) {
    questions.push('What are your current pain points with your existing ERP system?')
  }
  if (messageLower.includes('cloud') || messageLower.includes('migration') || subjectLower.includes('cloud') || subjectLower.includes('migration')) {
    questions.push('What is your target timeline for the cloud migration project?')
  }
  if (messageLower.includes('api') || messageLower.includes('integration') || subjectLower.includes('api') || subjectLower.includes('integration')) {
    questions.push('What systems or platforms do you need to integrate with?')
  }
  if (messageLower.includes('devops') || messageLower.includes('ci/cd') || subjectLower.includes('devops') || subjectLower.includes('ci/cd')) {
    questions.push('What is your current deployment and release process?')
  }
  if (messageLower.includes('automation') || messageLower.includes('workflow') || subjectLower.includes('automation') || subjectLower.includes('workflow')) {
    questions.push('Which business processes are you looking to automate?')
  }
  
  // Business context questions
  if (messageLower.includes('team') || messageLower.includes('users') || subjectLower.includes('team') || subjectLower.includes('users')) {
    questions.push('How many users will need access to the new system?')
  }
  if (messageLower.includes('budget') || messageLower.includes('cost') || subjectLower.includes('budget') || subjectLower.includes('cost')) {
    questions.push('What is your budget range for this project?')
  }
  if (messageLower.includes('timeline') || messageLower.includes('deadline') || subjectLower.includes('timeline') || subjectLower.includes('deadline')) {
    questions.push('What is your target completion date for this project?')
  }
  if (messageLower.includes('startup') || messageLower.includes('enterprise') || subjectLower.includes('startup') || subjectLower.includes('enterprise')) {
    questions.push('What is your company size and growth stage?')
  }
  
  // Project scope questions
  if (messageLower.includes('project') || messageLower.includes('implementation') || subjectLower.includes('project') || subjectLower.includes('implementation')) {
    questions.push('What is the scope and complexity of this project?')
  }
  if (messageLower.includes('consultation') || messageLower.includes('strategy') || subjectLower.includes('consultation') || subjectLower.includes('strategy')) {
    questions.push('What specific challenges or goals are you looking to address?')
  }
  
  // Industry-specific questions
  if (messageLower.includes('healthcare') || subjectLower.includes('healthcare')) {
    questions.push('What compliance requirements (HIPAA, etc.) do you need to consider?')
  }
  if (messageLower.includes('finance') || messageLower.includes('banking') || subjectLower.includes('finance') || subjectLower.includes('banking')) {
    questions.push('What regulatory or security requirements do you need to meet?')
  }
  if (messageLower.includes('manufacturing') || subjectLower.includes('manufacturing')) {
    questions.push('What production systems or equipment do you need to integrate with?')
  }
  
  // Generic but intelligent questions based on content length and completeness
  if (questions.length === 0) {
    if (message.split(' ').length < 50) {
      questions.push('Can you provide more details about your specific requirements and goals?')
    }
    if (!company || company.trim().length === 0) {
      questions.push('What industry is your company in and what is your current technology stack?')
    }
    if (!messageLower.includes('when') && !messageLower.includes('timeline') && !messageLower.includes('deadline')) {
      questions.push('What is your preferred timeline for this project or consultation?')
    }
  }
  
  // Ensure we have exactly 3 questions
  while (questions.length < 3) {
    if (questions.length === 0) {
      questions.push('What specific outcomes are you looking to achieve with this project?')
    } else if (questions.length === 1) {
      questions.push('What is your current technology infrastructure and what challenges are you facing?')
    } else {
      questions.push('How can I best help you achieve your technology and business goals?')
    }
  }
  
  return questions.slice(0, 3)
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
  console.log('🔍 Validating input data:', JSON.stringify(data, null, 2))
  
  const { name, email, company, subject, message, consent } = data
  
  console.log('🔍 Extracted fields:', { name, email, company, subject, message, consent })
  
  // Check required fields
  if (!name || !subject || !message) {
    console.error('❌ Missing required fields:', { name: !!name, subject: !!subject, message: !!message })
    throw new Error('Missing required fields')
  }
  
  // Check explicit consent for AI analysis (accept both boolean true and string 'true')
  if (!consent || (consent !== true && consent !== 'true')) {
    throw new Error('Explicit consent required for AI analysis')
  }
  
  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }
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
    email: email ? sanitize(email) : '',
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
    
         if (!Array.isArray(response.followUpQuestions)) {
       response.followUpQuestions = []
     } else {
               // Filter out placeholder text and ensure actual questions
        response.followUpQuestions = response.followUpQuestions
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
          .slice(0, ANALYSIS_SCHEMA.followUpQuestions.maxLength)
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
  const emailDomain = email ? email.split('@')[1] || '' : ''
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
  if (emailDomain && (emailDomain === 'gmail.com' || emailDomain === 'yahoo.com' || emailDomain === 'hotmail.com')) {
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
    // Handle different response formats
    let jsonText = aiResponse
    
    if (typeof aiResponse === 'string') {
      // Remove markdown code block formatting - handle both ```json and ``` blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
      // Also try to extract JSON from the response if it's not in code blocks
      else if (aiResponse.includes('{') && aiResponse.includes('}')) {
        const startBrace = aiResponse.indexOf('{')
        const endBrace = aiResponse.lastIndexOf('}')
        if (startBrace !== -1 && endBrace !== -1 && endBrace > startBrace) {
          jsonText = aiResponse.substring(startBrace, endBrace + 1)
        }
      }
      
      // If we still don't have valid JSON, try to find the first complete JSON object
      if (!jsonText.match(/^\{.*\}$/s)) {
        const jsonObjects = aiResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)
        if (jsonObjects && jsonObjects.length > 0) {
          // Use the longest JSON object found
          jsonText = jsonObjects.reduce((longest, current) => 
            current.length > longest.length ? current : longest
          )
        }
      }
      
      // Clean up any remaining markdown artifacts
      jsonText = jsonText.replace(/^```.*$/gm, '').replace(/^`.*`$/gm, '').trim()
      
      // Additional cleaning for common AI response artifacts
      jsonText = jsonText.replace(/^Here's the analysis:/i, '')
      jsonText = jsonText.replace(/^Analysis:/i, '')
      jsonText = jsonText.replace(/^Response:/i, '')
      jsonText = jsonText.replace(/^JSON:/i, '')
      jsonText = jsonText.replace(/^Here is the JSON:/i, '')
      jsonText = jsonText.trim()
    }
    
    // Attempt to parse the cleaned JSON text
    const result = JSON.parse(jsonText)
    
    // Validate that we got a proper object
    if (!result || typeof result !== 'object') {
      throw new Error('AI response is not a valid object')
    }
    
    return result
  } catch (parseError) {
    console.warn('Failed to parse AI response as JSON:', parseError.message)
    console.warn('Raw AI response was:', aiResponse)
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

FOLLOW-UP QUESTION STRATEGY:
Generate intelligent, context-aware follow-up questions that:
1. Identify missing information using the 5W1H framework (Who, What, When, Where, Why, How)
2. Ask specific questions about technologies, platforms, or tools mentioned in the message
3. Request clarification on project scope, timeline, budget, or team size
4. Probe for business context, challenges, and desired outcomes
5. Ask about previous experience with similar projects or technologies

EXAMPLES OF INTELLIGENT QUESTIONS:
- If NetSuite is mentioned: "What specific NetSuite modules or functionality are you looking to implement or optimize?"
- If ERP is mentioned: "What are your current pain points with your existing ERP system?"
- If cloud migration is mentioned: "What is your target timeline for the cloud migration project?"
- If team size is mentioned: "How many users will need access to the new system?"
- If budget is mentioned: "What is your budget range for this project?"

AVOID GENERIC QUESTIONS:
- Don't ask: "Do you have any questions?"
- Don't ask: "Can you provide more details?"
- Don't ask: "What else would you like to know?"

OUTPUT SCHEMA:
{
  "inquiryType": "consultation|project|partnership|general|urgent",
  "priorityLevel": "high|medium|low",
  "industry": "technology|healthcare|finance|manufacturing|retail|education|government|nonprofit|startup|enterprise|other",
  "projectScope": "small|medium|large|enterprise",
  "urgency": "immediate|soon|flexible",
  "messageType": "message|meeting-request",
  "suggestedResponse": "2-3 sentence personalized response",
  "meetingDuration": "30 minutes|1 hour|1.5 hours|2 hours",
  "relevantContent": ["portfolio sections"],
  "shouldScheduleMeeting": true/false,
  "meetingType": "consultation|project-planning|technical-review|strategy-session|general-discussion",
  "recommendedTimeSlots": ["morning", "afternoon", "evening"],
  "timezoneConsideration": "user's local timezone",
  "userTimezone": "user's detected timezone",
  "followUpRequired": true/false,
  "redFlags": ["array of security concerns if any"],
  "followUpQuestions": ["specific, context-aware question 1", "specific, context-aware question 2", "specific, context-aware question 3"],
  "confidence": 0.0-1.0,
  "timestamp": "ISO timestamp",
  "originalMessage": "analyzed message content",
  "wordCount": number,
  "hasCompany": true/false,
  "emailDomain": "email domain"
}

MEETING DETECTION RULES:
- Set shouldScheduleMeeting=true if the message contains meeting-related keywords like: "meet", "schedule", "call", "discussion", "conversation", "consultation", "review", "planning", "appointment", "get together", "set up a meeting", "book a call"
- Set shouldScheduleMeeting=true for consultation/project/technical discussions
- Set shouldScheduleMeeting=true if the subject line contains meeting-related words
- Set messageType to "meeting-request" when shouldScheduleMeeting=true

EXAMPLES:
- Message: "I need to schedule a meeting" → shouldScheduleMeeting: true, messageType: "meeting-request"
- Message: "Can we set up a call?" → shouldScheduleMeeting: true, messageType: "meeting-request"
- Subject: "Meeting Request" → shouldScheduleMeeting: true, messageType: "meeting-request"
- Message: "Just a quick question" → shouldScheduleMeeting: false, messageType: "message"

Return ONLY the JSON object, no additional text.`

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
      console.log('CORS preflight request received')
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Handle health check
    if (request.method === 'GET') {
      return addCorsHeaders(new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cors: 'enabled'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
    }

    if (request.method !== 'POST') {
      return addCorsHeaders(new Response('Method not allowed', { 
        status: 405,
        headers: { 'Content-Type': 'text/plain' }
      }))
    }

    try {
      // Check rate limits first
      await checkRateLimit(request, env)
      
      const rawData = await request.json()
      
      // Debug: Log the received data
      console.log('📥 Received data:', JSON.stringify(rawData, null, 2))
      
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
        return addCorsHeaders(new Response(JSON.stringify({
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
          followUpQuestions: [],
          confidence: 0.3,
          timestamp: new Date().toISOString(),
          originalMessage: '[CONTENT_REVIEWED]',
          wordCount: 0,
          hasCompany: !!company,
          emailDomain: email ? email.split('@')[1] || 'unknown' : 'unknown',
          fallback: true
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }))
      }

      // Calculate meeting duration deterministically BEFORE AI analysis
      const messageLower = scrubbedMessage.toLowerCase()
      const subjectLower = scrubbedSubject.toLowerCase()
      
      // Analyze message content for deterministic meeting duration
      let deterministicDuration = '1 hour' // default
      
      // Declare analysis variable at the top level
      let analysis
      
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
        console.log('🤖 Attempting AI service call...')
        console.log('📝 Input data:', { name, company, subject: scrubbedSubject, messageLength: scrubbedMessage.length })
        
        // Try multiple AI models for better JSON compliance
        const models = [
          '@cf/meta/llama-2-7b-chat-int8',
          '@cf/mistral/mistral-7b-instruct-v0.2',
          '@cf/meta/llama-3.1-8b-instruct'
        ]
        
        console.log('🚀 Starting AI model attempts...')
        
        for (const model of models) {
          try {
            console.log(`🤖 Attempting AI model: ${model}`)
            aiResponse = await env.ai.run(model, {
              messages: [{
                role: 'system',
                content: 'You are a JSON-only response bot. You must return ONLY valid JSON with no additional text, explanations, or formatting. Never use markdown, never add explanations.'
              }, {
                role: 'user',
                content: `Analyze this contact form message and return ONLY a JSON object:

Name: ${name}
Company: ${company || 'N/A'}
Subject: ${scrubbedSubject}
Message: ${scrubbedMessage}

IMPORTANT: Generate 2-3 intelligent follow-up questions that YOU would ask the client to better understand their needs. These should be questions FOR the client to answer, not statements about what the client said.

Return this exact JSON structure (no other text):
{
  "inquiryType": "consultation|project|partnership|general|urgent",
  "priorityLevel": "high|medium|low",
  "industry": "technology|healthcare|finance|manufacturing|retail|education|government|nonprofit|startup|enterprise|other", 
  "projectScope": "small|medium|large|enterprise",
  "urgency": "immediate|soon|flexible",
  "shouldScheduleMeeting": true/false,
  "meetingType": "consultation|project-planning|technical-review|strategy-session|general-discussion",
  "followUpQuestions": ["What specific areas of your ERP system need modernization?", "What is your timeline for this project?", "What are your current pain points with existing systems?"]
}`
              }],
              temperature: 0.1,
              max_tokens: 400
            })
            
            console.log(`✅ AI model ${model} successful`)
            console.log(`📝 Raw AI response from ${model}:`, aiResponse)
            break
          } catch (modelError) {
            console.log(`❌ AI model ${model} failed:`, modelError.message)
            console.log(`🔍 Error details for ${model}:`, {
              name: modelError.name,
              message: modelError.message,
              stack: modelError.stack
            })
            continue
          }
        }
        
        // If all models failed, throw an error
        if (!aiResponse) {
          throw new Error('All AI models failed to respond')
        }
        
        console.log('✅ AI service call successful')
        console.log('🤖 AI Response:', aiResponse)
        console.log('🔍 AI Response type:', typeof aiResponse)
        
        if (typeof aiResponse === 'string') {
          console.log('🔍 AI Response length:', aiResponse.length)
          console.log('🔍 AI Response preview:', aiResponse.substring(0, 200) + '...')
        } else if (typeof aiResponse === 'object' && aiResponse !== null) {
          console.log('🔍 AI Response keys:', Object.keys(aiResponse))
          console.log('🔍 AI Response preview:', JSON.stringify(aiResponse).substring(0, 200) + '...')
        } else {
          console.log('🔍 AI Response is:', aiResponse)
        }
      } catch (aiError) {
        console.error('❌ AI service error:', aiError)
        console.error('🔍 Error details:', {
          message: aiError.message,
          name: aiError.name,
          stack: aiError.stack
        })
        // Fall back to keyword-based analysis
        const messageLower = scrubbedMessage.toLowerCase()
        const subjectLower = scrubbedSubject.toLowerCase()
        
        let inquiryType = 'general'
        let priorityLevel = 'medium'
        let shouldScheduleMeeting = false
        let meetingDuration = '1 hour'
        
        // Declare analysis variable at the top level
        let analysis
        
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

                 // Create fallback analysis with intelligent follow-up questions
         let basicFollowUps
         try {
           basicFollowUps = generateIntelligentFollowUpQuestions(scrubbedMessage, scrubbedSubject, company)
         } catch (error) {
           console.error('Error generating intelligent follow-up questions in fallback:', error.message)
           // Fallback to basic questions if intelligent generation fails
           basicFollowUps = []
           
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
         }
         
                 analysis = {
          inquiryType,
          priorityLevel,
          industry: 'other',
          projectScope: 'medium',
          urgency: hasUrgentKeywords ? 'immediate' : 'flexible',
          messageType: shouldScheduleMeeting ? 'meeting-request' : 'message',
          suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
          relevantContent: ['general portfolio'],
          confidence: 0.6,
          shouldScheduleMeeting,
          meetingType: shouldScheduleMeeting ? 'general-discussion' : 'consultation',
          meetingDuration: '1 hour',
          recommendedTimeSlots: ['morning', 'afternoon'],
          timezoneConsideration: 'user\'s local timezone',
          userTimezone: 'America/New_York',
          followUpRequired: shouldScheduleMeeting,
          redFlags,
          followUpQuestions: basicFollowUps,
          timestamp: new Date().toISOString(),
          originalMessage: '[CONTENT_ANALYZED]',
          wordCount: scrubbedMessage.split(' ').length,
          hasCompany: !!company,
          emailDomain: email ? email.split('@')[1] || 'unknown' : 'unknown',
          fallback: true
        }
        
        // Skip AI parsing since we're using fallback
        aiResponse = null
      }

      // Parse AI response and extract JSON
      if (aiResponse) {
        console.log('🔍 Processing AI response...')
        try {
          analysis = parseAIResponse(aiResponse.response)
          console.log('📊 Parsed analysis:', analysis)
          analysis = validateAIResponse(analysis)
          console.log('✅ AI analysis validated successfully')
        } catch (parseError) {
          console.error('❌ AI response parsing error:', parseError)
          // Fallback analysis if AI response parsing fails
          let basicFollowUps
          try {
            basicFollowUps = generateIntelligentFollowUpQuestions(scrubbedMessage, scrubbedSubject, company)
          } catch (error) {
            console.error('Error generating intelligent follow-up questions in parse error fallback:', error.message)
            basicFollowUps = ["What specific challenge are you facing?", "How can I best help you achieve your goals?"]
          }
          
          analysis = {
            inquiryType: 'general',
            priorityLevel: 'medium',
            industry: 'other',
            projectScope: 'medium',
            urgency: 'flexible',
            messageType: 'meeting-request',
            meetingDuration: '1 hour',
            suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
            relevantContent: ['general portfolio'],
            confidence: 0.6,
            shouldScheduleMeeting: true,
            meetingType: 'general-discussion',
            recommendedTimeSlots: ['morning', 'afternoon'],
            timezoneConsideration: 'user\'s local timezone',
            userTimezone: 'America/New_York',
            followUpRequired: true,
            redFlags,
            followUpQuestions: basicFollowUps,
            timestamp: new Date().toISOString(),
            originalMessage: '[CONTENT_ANALYZED]',
            wordCount: scrubbedMessage.split(' ').length,
            hasCompany: !!company,
            emailDomain: email ? email.split('@')[1] || 'unknown' : 'unknown',
            fallback: true
          }
        }
      } else {
        // If aiResponse is null, create fallback analysis
        let basicFollowUps
        try {
          basicFollowUps = generateIntelligentFollowUpQuestions(scrubbedMessage, scrubbedSubject, company)
        } catch (error) {
          console.error('Error generating intelligent follow-up questions in null response fallback:', error.message)
          basicFollowUps = ["What specific challenge are you facing?", "How can I best help you achieve your goals?"]
        }
        
        analysis = {
          inquiryType: 'general',
          priorityLevel: 'medium',
          industry: 'other',
          projectScope: 'medium',
          urgency: 'flexible',
          messageType: 'message',
          meetingDuration: '1 hour',
          suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
          relevantContent: ['general portfolio'],
          confidence: 0.6,
          shouldScheduleMeeting: false,
          meetingType: 'general-discussion',
          recommendedTimeSlots: ['morning', 'afternoon'],
          timezoneConsideration: 'user\'s local timezone',
          userTimezone: 'America/New_York',
          followUpRequired: false,
          redFlags,
          followUpQuestions: basicFollowUps,
          timestamp: new Date().toISOString(),
          originalMessage: '[CONTENT_ANALYZED]',
          wordCount: scrubbedMessage.split(' ').length,
          hasCompany: !!company,
          emailDomain: email ? email.split('@')[1] || 'unknown' : 'unknown',
          fallback: true
        }
      }

      // Ensure all required fields exist with defaults
      const defaultAnalysis = {
        inquiryType: 'general',
        priorityLevel: 'medium',
        industry: 'other',
        projectScope: 'medium',
        urgency: 'flexible',
        messageType: 'message',
        meetingDuration: '1 hour',
        suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${scrubbedSubject}" and I'm looking forward to discussing how I can help with your project.`,
        relevantContent: ['general portfolio'],
        confidence: 0.8,
        shouldScheduleMeeting: false,
        meetingType: 'general-discussion',
        recommendedTimeSlots: ['morning', 'afternoon'],
        timezoneConsideration: 'user\'s local timezone',
        userTimezone: 'America/New_York',
        followUpRequired: false,
        redFlags: [],
        followUpQuestions: [], // Will be set later after function is available
        timestamp: new Date().toISOString(),
        originalMessage: '[CONTENT_ANALYZED]',
        wordCount: scrubbedMessage.split(' ').length,
        hasCompany: !!company,
        emailDomain: email ? email.split('@')[1] || 'unknown' : 'unknown'
      }
      
      // Fallback meeting detection if AI didn't properly detect meeting requests
      const fallbackMeetingDetection = (message, subject) => {
        const messageLower = message.toLowerCase()
        const subjectLower = subject.toLowerCase()
        
        const meetingKeywords = [
          'meet', 'schedule', 'call', 'discussion', 'conversation', 'consultation',
          'review', 'planning', 'appointment', 'get together', 'set up a meeting',
          'book a call', 'meeting request', 'need to meet', 'would like to meet',
          'can we meet', 'available for a call', 'set up a time'
        ]
        
        const hasMeetingKeywords = meetingKeywords.some(keyword => 
          messageLower.includes(keyword) || subjectLower.includes(keyword)
        )
        
        return hasMeetingKeywords
      }

      // Set the followUpQuestions now that the function is available
      try {
        defaultAnalysis.followUpQuestions = generateIntelligentFollowUpQuestions(scrubbedMessage, scrubbedSubject, company)
      } catch (error) {
        console.error('Error generating follow-up questions:', error.message)
        defaultAnalysis.followUpQuestions = [
          'What specific outcomes are you looking to achieve with this project?',
          'What is your current technology infrastructure and what challenges are you facing?',
          'How can I best help you achieve your technology and business goals?'
        ]
      }
      
      // Ensure the AI response has all required fields by merging with defaults
      if (analysis) {
        // Check if AI missed a meeting request and override if necessary
        const shouldOverrideMeetingDetection = fallbackMeetingDetection(scrubbedMessage, scrubbedSubject)
        
        // Ensure all required fields are present
        analysis = {
          ...defaultAnalysis,
          ...analysis,
          // Ensure these specific fields are always set
          messageType: shouldOverrideMeetingDetection ? 'meeting-request' : (analysis.messageType || 'message'),
          meetingDuration: analysis.meetingDuration || '1 hour',
          suggestedResponse: analysis.suggestedResponse || defaultAnalysis.suggestedResponse,
          relevantContent: analysis.relevantContent || ['general portfolio'],
          shouldScheduleMeeting: shouldOverrideMeetingDetection ? true : (analysis.shouldScheduleMeeting !== undefined ? analysis.shouldScheduleMeeting : false),
          meetingType: shouldOverrideMeetingDetection ? 'general-discussion' : (analysis.meetingType || 'general-discussion'),
          recommendedTimeSlots: analysis.recommendedTimeSlots || ['morning', 'afternoon'],
          timezoneConsideration: analysis.timezoneConsideration || 'user\'s local timezone',
          userTimezone: analysis.userTimezone || 'America/New_York',
          followUpRequired: shouldOverrideMeetingDetection ? true : (analysis.followUpRequired !== undefined ? analysis.followUpRequired : false),
          redFlags: analysis.redFlags || [],
          followUpQuestions: analysis.followUpQuestions && analysis.followUpQuestions.length > 0 ? analysis.followUpQuestions : (() => {
            try {
              return generateIntelligentFollowUpQuestions(scrubbedMessage, scrubbedSubject, company)
            } catch (error) {
              console.error('Error generating follow-up questions:', error.message)
              return [
                'What specific outcomes are you looking to achieve with this project?',
                'What is your current technology infrastructure and what challenges are you facing?',
                'How can I best help you achieve your technology and business goals?'
              ]
            }
          })(),
          timestamp: analysis.timestamp || new Date().toISOString(),
          originalMessage: analysis.originalMessage || '[CONTENT_ANALYZED]',
          wordCount: analysis.wordCount || scrubbedMessage.split(' ').length,
          hasCompany: analysis.hasCompany !== undefined ? analysis.hasCompany : !!company,
          emailDomain: analysis.emailDomain || (email ? email.split('@')[1] || 'unknown' : 'unknown')
        }
      } else {
        // If no analysis object, use defaults
        analysis = { ...defaultAnalysis }
      }
      
      // Remove any AI-set confidence to ensure our calculation takes precedence
      delete analysis.confidence
      
      // Store the fallback detection results before merging with defaults
      const fallbackResults = {
        messageType: analysis.messageType,
        shouldScheduleMeeting: analysis.shouldScheduleMeeting,
        meetingType: analysis.meetingType,
        followUpRequired: analysis.followUpRequired
      }
      
      // Merge with defaults for missing fields
      analysis = { ...defaultAnalysis, ...analysis }
      
      // Restore the fallback detection results to ensure they're not overwritten
      if (fallbackResults.messageType) analysis.messageType = fallbackResults.messageType
      if (fallbackResults.shouldScheduleMeeting !== undefined) analysis.shouldScheduleMeeting = fallbackResults.shouldScheduleMeeting
      if (fallbackResults.meetingType) analysis.meetingType = fallbackResults.meetingType
      if (fallbackResults.followUpRequired !== undefined) analysis.followUpRequired = fallbackResults.followUpRequired
      
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
        emailDomain: email ? email.split('@')[1] || 'unknown' : 'unknown',
        fallback: false // Explicitly mark as successful AI analysis
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
      
      return addCorsHeaders(new Response(JSON.stringify(enhancedAnalysis), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }))

    } catch (error) {
      // Log error without sensitive data
      console.error(`AI analysis error: ${error.message} - timestamp: ${Date.now()}`)
      
      return addCorsHeaders(new Response(JSON.stringify({ 
        error: error.message || 'AI analysis failed',
        fallback: true,
        timestamp: new Date().toISOString()
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
        }
      }))
    }
  }
}
