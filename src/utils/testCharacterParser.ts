import { parseContentForSearch, validateTextEncoding } from './characterParser'

/**
 * Test the character parser with your specific example
 * This demonstrates how the encoding issues are fixed
 */

export const testYourExample = () => {
  const originalText = "Embedding validation, reconciliation, and audit evidence into ERP and SaaS workflowsâmaking"
  
  console.log('=== Character Parsing Test ===\n')
  console.log('Original text with encoding issues:')
  console.log(originalText)
  console.log('')
  
  console.log('Fixed text using character parser:')
  console.log(parseContentForSearch(originalText))
  console.log('')
  
  console.log('Validation results:')
  const validation = validateTextEncoding(originalText)
  console.log('Is Valid:', validation.isValid)
  console.log('Issues Found:', validation.issues)
  console.log('Fixed Text:', validation.fixed)
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as Window & { testYourExample: () => void }).testYourExample = testYourExample
}
