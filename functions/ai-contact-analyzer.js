// AI-powered contact form analyzer using Cloudflare AI

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
  else if (messageLength >= 50) confidence += 0.25
  else if (messageLength >= 30) confidence += 0.20
  else if (messageLength >= 20) confidence += 0.15
  else confidence += 0.10
  
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
  if (messageLength < 20) confidence -= 0.05
  if (subjectWords < 2) confidence -= 0.03
  if (emailDomain === 'gmail.com' || emailDomain === 'yahoo.com' || emailDomain === 'hotmail.com') {
    confidence -= 0.02
  }
  
  // Cap at 1.0 and ensure minimum of 0.25
  confidence = Math.min(Math.max(confidence, 0.25), 1.0)
  
  // Round to 2 decimal places
  return Math.round(confidence * 100) / 100
}

// Validate and sanitize input data
function validateInput(data) {
  const { name, email, company, subject, message } = data
  
  // Check required fields
  if (!name || !email || !subject || !message) {
    throw new Error('Missing required fields')
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  
  // Sanitize inputs (basic XSS prevention)
  const sanitize = (str) => str.replace(/[<>]/g, '').trim()
  
  return {
    name: sanitize(name),
    email: sanitize(email),
    company: company ? sanitize(company) : '',
    subject: sanitize(subject),
    message: sanitize(message)
  }
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
      const rawData = await request.json()
      
      // Validate and sanitize input
      const { name, email, company, subject, message } = validateInput(rawData)

      // Calculate meeting duration deterministically BEFORE AI analysis
      const messageLower = message.toLowerCase()
      const subjectLower = subject.toLowerCase()
      
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
        aiResponse = await env.ai.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: [{
            role: 'user',
            content: `Analyze this contact form submission and provide a JSON response with the following structure:
            {
              "inquiryType": "consultation|project|partnership|general|urgent",
              "priorityLevel": "high|medium|low",
              "industry": "technology|healthcare|finance|manufacturing|other",
              "projectScope": "small|medium|large|enterprise",
              "urgency": "immediate|soon|flexible",
              "suggestedResponse": "A personalized 2-3 sentence response that acknowledges their inquiry",
              "relevantContent": ["suggested portfolio sections or case studies"],
              "confidence": 0.0,
              "shouldScheduleMeeting": true/false,
              "meetingType": "consultation|project-planning|technical-review|strategy-session|general-discussion",
              "recommendedTimeSlots": ["morning", "afternoon", "evening"],
              "timezoneConsideration": "user's local timezone",
              "followUpRequired": true/false
            }

            IMPORTANT: 
            - DO NOT include meetingDuration in your response - we will set this separately.
            - Set shouldScheduleMeeting to true if this inquiry would benefit from a meeting (consultation, project planning, technical discussions).
            - Recommend time slots based on urgency and project scope.
            - Consider the user's context when determining meeting type.
            - Set confidence to 0.0 initially - we will calculate it based on data quality.

            Contact Details:
            Name: ${name}
            Company: ${company || 'Not specified'}
            Subject: ${subject}
            Message: ${message}

            Respond only with valid JSON.`
          }]
        })
      } catch (aiError) {
        throw new Error('AI service unavailable')
      }

      // Parse AI response and extract JSON
      let analysis
      try {
        analysis = parseAIResponse(aiResponse.response)
      } catch (parseError) {
        // Fallback analysis if AI response parsing fails
        analysis = {
          inquiryType: 'general',
          priorityLevel: 'medium',
          industry: 'other',
          projectScope: 'medium',
          urgency: 'flexible',
          suggestedResponse: `Thank you for reaching out, ${name}! I've received your inquiry about "${subject}" and I'm looking forward to discussing how I can help with your project.`,
          relevantContent: ['general portfolio'],
          confidence: 0.0, // Will be calculated below
          shouldScheduleMeeting: true,
          meetingType: 'general-discussion',
          recommendedTimeSlots: ['morning', 'afternoon'],
          timezoneConsideration: 'user\'s local timezone',
          followUpRequired: true,
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
        meetingDuration: '1 hour',
        relevantContent: ['general portfolio'],
        shouldScheduleMeeting: false,
        meetingType: 'general-discussion',
        recommendedTimeSlots: ['morning', 'afternoon'],
        timezoneConsideration: 'user\'s local timezone',
        followUpRequired: false
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
        originalMessage: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
        wordCount: message.split(' ').length,
        hasCompany: !!company,
        emailDomain: email.split('@')[1] || 'unknown'
      }
      
      // ALWAYS calculate confidence based on actual data quality, overriding any AI-set value
      enhancedAnalysis.confidence = calculateConfidence({
        name,
        email,
        company,
        subject,
        message,
        analysis: enhancedAnalysis
      })
      
      return new Response(JSON.stringify(enhancedAnalysis), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })

    } catch (error) {
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
