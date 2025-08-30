/**
 * Simplified Character Parser for Cloudflare Workers
 * Provides basic text cleaning functionality without DOM dependencies
 */

/**
 * Decode HTML entities and fix common encoding issues
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return ''
  
  try {
    let decoded = text
    
    // Fix common encoding issues that appear in GitHub API responses
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
      
      // Fix specific encoding issues we're seeing
      .replace(/ÂÂÂ/g, '')        // Remove problematic sequences
      .replace(/Ã¯Â¸ÂÂÂ£/g, '')   // Remove problematic sequences
      .replace(/ÂÂ§Â­/g, '')      // Remove problematic sequences
      .replace(/ÂÂÂ¯/g, '')       // Remove problematic sequences
      .replace(/ÂÂ/g, '')         // Remove problematic sequences
      .replace(/ÂÂÂ/g, '')        // Remove problematic sequences
      .replace(/ÂÂÂ¯/g, '')       // Remove problematic sequences
      .replace(/ÂÂ/g, '')         // Remove problematic sequences
    
    return decoded
  } catch (error) {
    console.error('Error decoding HTML entities:', error)
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
    console.error('Error cleaning text content:', error)
    return text
  }
}

/**
 * Parse markdown content for search
 */
export const parseMarkdownContent = (content: string): string => {
  if (!content) return ''
  
  try {
    let parsed = content
    
    // Remove markdown syntax
    parsed = parsed
      .replace(/^#{1,6}\s+/gm, '')           // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1')       // Bold
      .replace(/\*(.*?)\*/g, '$1')           // Italic
      .replace(/`(.*?)`/g, '$1')             // Inline code
      .replace(/```[\s\S]*?```/g, '')        // Code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')  // Images
      .replace(/^\s*[-*+]\s+/gm, '')         // List items
      .replace(/^\s*\d+\.\s+/gm, '')         // Numbered lists
      .replace(/^\s*>\s+/gm, '')             // Blockquotes
      .replace(/^\s*\|.*\|.*$/gm, '')        // Tables
      .replace(/^\s*---+\s*$/gm, '')         // Horizontal rules
    
    return parsed
  } catch (error) {
    console.error('Error parsing markdown content:', error)
    return content
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
    
    return parsed
  } catch (error) {
    console.error('Error parsing content for search:', error)
    return content
  }
}
