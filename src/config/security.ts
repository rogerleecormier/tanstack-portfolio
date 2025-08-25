// Security configuration for AI contact form
// Centralized security settings and patterns

export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimits: {
    requestsPerMinute: 5,
    requestsPerHour: 20,
    burstLimit: 3
  },

  // Content filtering
  contentFilters: {
    maxMessageLength: 2000,
    maxSubjectLength: 200,
    maxNameLength: 100,
    minMessageLength: 20,
    minSubjectLength: 5,
    minNameLength: 2
  },

  // Suspicious content patterns
  suspiciousPatterns: {
    crypto: /\b(crypto|bitcoin|ethereum|wallet|blockchain)\b/gi,
    seo: /\b(seo|backlink|ranking|traffic|organic)\b/gi,
    financial: /\b(loan|mortgage|refinance|debt|credit)\b/gi,
    urls: /(https?:\/\/[^\s]+)/g,
    emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phoneNumbers: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    creditCards: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    apiKeys: /\b(api[_-]?key|token|secret|password)[\s]*[:=][\s]*['"]?[A-Za-z0-9._-]{10,}['"]?/gi,
    oauth: /\b(oauth|bearer)[\s]*[:=][\s]*['"]?[A-Za-z0-9._-]{20,}['"]?/gi
  },

  // Confidence thresholds
  confidence: {
    minimumForAutoAction: 0.85,
    minimumForRecommendation: 0.7,
    fallbackThreshold: 0.5
  },

  // AI model settings
  ai: {
    temperature: 0.1, // Low temperature for consistent classification
    maxTokens: 1000,
    timeoutMs: 5000
  },

  // Privacy settings
  privacy: {
    scrubPII: true,
    logContent: false,
    storeOriginalMessage: false,
    retentionDays: 0 // No storage
  },

  // Feature flags
  features: {
    aiAnalysis: true,
    rateLimiting: true,
    contentFiltering: true,
    honeypot: true,
    consentRequired: true
  }
}

// Content validation functions
export function validateContent(content: string, type: 'message' | 'subject' | 'name'): boolean {
  const { contentFilters } = SECURITY_CONFIG
  
  switch (type) {
    case 'message':
      return content.length >= contentFilters.minMessageLength && 
             content.length <= contentFilters.maxMessageLength
    case 'subject':
      return content.length >= contentFilters.minSubjectLength && 
             content.length <= contentFilters.maxSubjectLength
    case 'name':
      return content.length >= contentFilters.minNameLength && 
             content.length <= contentFilters.maxNameLength
    default:
      return false
  }
}

// Check for suspicious content
export function detectSuspiciousContent(content: string): string[] {
  const redFlags: string[] = []
  const { suspiciousPatterns } = SECURITY_CONFIG

  Object.entries(suspiciousPatterns).forEach(([type, pattern]) => {
    if (pattern.test(content)) {
      redFlags.push(`${type}_detected`)
    }
  })

  return redFlags
}

// Scrub sensitive data
export function scrubSensitiveData(content: string): string {
  let scrubbed = content
  const { suspiciousPatterns } = SECURITY_CONFIG

  // Replace sensitive patterns with placeholders
  Object.entries(suspiciousPatterns).forEach(([type, pattern]) => {
    scrubbed = scrubbed.replace(pattern, `[${type.toUpperCase()}_REDACTED]`)
  })

  return scrubbed
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check if content should be blocked
export function shouldBlockContent(content: string): boolean {
  const redFlags = detectSuspiciousContent(content)
  return redFlags.length > 2 // Block if more than 2 suspicious patterns detected
}
