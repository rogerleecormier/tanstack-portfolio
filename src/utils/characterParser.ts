import { logger } from '@/utils/logger'

/**
 * Character parsing and encoding utilities for proper text handling
 * Fixes issues with smart quotes, dashes, and other special characters
 */

/**
 * Decode HTML entities and fix common encoding issues
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return ''
  
  try {
    // Create a temporary DOM element to decode HTML entities
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    let decoded = textarea.value
    
    // Fix common encoding issues
    decoded = decoded
      // Fix smart quotes and apostrophes
      .replace(/â€™/g, "'")      // Right single quotation mark
      .replace(/â€œ/g, '"')      // Left double quotation mark
      .replace(/â€/g, '"')       // Right double quotation mark
      .replace(/â€˜/g, "'")      // Left single quotation mark
      .replace(/â€"/g, '"')      // Alternative right double quote
      .replace(/â€"/g, '"')      // Alternative left double quote
      
      // Fix em dashes and en dashes
      .replace(/â€"/g, '—')      // Em dash
      .replace(/â€"/g, '–')      // En dash
      .replace(/â€"/g, '–')      // Alternative en dash
      
      // Fix other common encoding issues
      .replace(/â€¦/g, '…')      // Horizontal ellipsis
      .replace(/â€¢/g, '•')      // Bullet
      .replace(/â€"/g, '™')      // Trademark
      .replace(/â€"/g, '®')      // Registered trademark
      .replace(/â€"/g, '©')      // Copyright
      
      // Fix common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/&hellip;/g, '…')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&trade;/g, '™')
      .replace(/&reg;/g, '®')
      .replace(/&copy;/g, '©')
      
      // Fix common UTF-8 encoding issues
      .replace(/[\u00A0]/g, ' ')  // Non-breaking space
      .replace(/[\u2018\u2019]/g, "'")  // Smart quotes
      .replace(/[\u201C\u201D]/g, '"')  // Smart quotes
      .replace(/[\u2013\u2014]/g, '–')  // En/Em dashes
      .replace(/[\u2026]/g, '…')        // Ellipsis
      .replace(/[\u2022]/g, '•')        // Bullet
      .replace(/[\u2122]/g, '™')        // Trademark
      .replace(/[\u00AE]/g, '®')        // Registered
      .replace(/[\u00A9]/g, '©')        // Copyright
    
    return decoded
  } catch (error) {
    logger.error('Error decoding HTML entities:', error)
    return text
  }
}

/**
 * Clean and normalize text content
 */
export const cleanTextContent = (text: string): string => {
  if (!text) return ''
  
  try {
    let cleaned = text
    
    // First decode any HTML entities
    cleaned = decodeHtmlEntities(cleaned)
    
    // Remove emojis and problematic Unicode characters
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/gu, '')
    
    // Normalize whitespace
    cleaned = cleaned
      .replace(/\s+/g, ' ')           // Multiple spaces to single
      .replace(/\n\s*\n/g, '\n')      // Multiple newlines to single
      .trim()
    
    // Remove any remaining problematic characters
    cleaned = cleaned.replace(/[ðâ¤ð³ð¬ð¥]/g, '')
    
    return cleaned
  } catch (error) {
    logger.error('Error cleaning text content:', error)
    return text
  }
}

/**
 * Parse and clean markdown content
 */
export const parseMarkdownContent = (content: string): string => {
  if (!content) return ''
  
  try {
    let parsed = content
    
    // First clean the content
    parsed = cleanTextContent(parsed)
    
    // Handle common markdown formatting issues
    parsed = parsed
      // Fix broken links
      .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, text, url) => {
        // Clean the text and URL
        const cleanText = cleanTextContent(text)
        const cleanUrl = cleanTextContent(url)
        return `[${cleanText}](${cleanUrl})`
      })
      
      // Fix broken emphasis
      .replace(/\*\*([^*]+)\*\*/g, '**$1**')
      .replace(/\*([^*]+)\*/g, '*$1*')
      
      // Fix broken inline code
      .replace(/`([^`]+)`/g, '`$1`')
    
    return parsed
  } catch (error) {
    logger.error('Error parsing markdown content:', error)
    return content
  }
}

/**
 * Clean content string by removing extra quotes and formatting
 */
export const cleanContentString = (str: string): string => {
  if (!str) return ''
  
  try {
    let cleaned = str.trim()
    
    // First decode any HTML entities
    cleaned = decodeHtmlEntities(cleaned)
    
    // Remove surrounding quotes
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1)
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1)
    }
    
    // Remove any remaining quotes and clean up whitespace
    cleaned = cleaned
      .replace(/["']/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    return cleaned
  } catch (error) {
    logger.error('Error cleaning content string:', error)
    return str
  }
}

/**
 * Validate and fix text encoding
 */
export const validateTextEncoding = (text: string): { isValid: boolean; fixed: string; issues: string[] } => {
  const issues: string[] = []
  let fixed = text
  
  try {
    // Check for common encoding issues
    if (text.includes('â€™') || text.includes('â€œ') || text.includes('â€')) {
      issues.push('Smart quotes encoding issues detected')
      fixed = decodeHtmlEntities(fixed)
    }
    
    if (text.includes('â€"') || text.includes('â€"')) {
      issues.push('Dash encoding issues detected')
      fixed = decodeHtmlEntities(fixed)
    }
    
    if (text.includes('&amp;') || text.includes('&quot;') || text.includes('&apos;')) {
      issues.push('HTML entity encoding issues detected')
      fixed = decodeHtmlEntities(fixed)
    }
    
    // Check for other problematic characters
    if (text.includes('ð') || text.includes('â¤') || text.includes('ð³')) {
      issues.push('Unicode encoding issues detected')
      fixed = cleanTextContent(fixed)
    }
    
    const isValid = issues.length === 0
    
    return {
      isValid,
      fixed,
      issues
    }
  } catch (error) {
    logger.error('Error validating text encoding:', error)
    return {
      isValid: false,
      fixed: text,
      issues: ['Error during validation']
    }
  }
}

/**
 * Convert text to proper UTF-8 encoding
 */
export const ensureUtf8Encoding = (text: string): string => {
  if (!text) return ''

  try {
    // First clean and decode the text
    let encoded = cleanTextContent(text)

    // Ensure proper UTF-8 encoding - remove control characters safely
    encoded = encoded
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0)
        return code >= 32 && code !== 127 && (code < 128 || code > 159)
      })
      .join('')
      .replace(/[\uFFFD]/g, '') // Remove replacement characters

    return encoded
  } catch (error) {
    logger.error('Error ensuring UTF-8 encoding:', error)
    return text
  }
}

/**
 * Parse and clean content for search indexing
 */
export const parseContentForSearch = (content: string): string => {
  if (!content) return ''
  
  try {
    let parsed = content
    
    // Apply all cleaning steps
    parsed = decodeHtmlEntities(parsed)
    parsed = cleanTextContent(parsed)
    parsed = parseMarkdownContent(parsed)
    parsed = ensureUtf8Encoding(parsed)
    
    return parsed
  } catch (error) {
    logger.error('Error parsing content for search:', error)
    return content
  }
}
