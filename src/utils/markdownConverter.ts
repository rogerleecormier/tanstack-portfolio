import { logger } from '@/utils/logger'

/**
 * Converts markdown text to HTML format
 * Simple, robust conversion that handles common markdown elements
 */
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return ''
  
  try {
    let html = markdown
    
    // Remove emojis and problematic characters first
    html = html
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/gu, '')
      .replace(/[ðâ¤ð³ð¬ð¥]/g, '') // Remove specific problematic characters
    
    // Convert markdown to HTML - simple and effective
    html = html
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      .replace(/__(.*?)__/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/_(.*?)_/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal-600 dark:text-teal-400 underline hover:text-teal-800 dark:hover:text-teal-300" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="border-gray-300 dark:border-gray-600 my-6">')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-teal-50 dark:bg-teal-900/20 italic text-gray-700 dark:text-gray-300">$1</blockquote>')
      
      // Lists - handle both ordered and unordered
      .replace(/^[-*+] (.*$)/gim, '<li class="text-gray-700 dark:text-gray-300">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="text-gray-700 dark:text-gray-300">$1</li>')
      
      // Wrap list items in proper list tags
      .replace(/(<li.*<\/li>)/gs, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4"><code class="language-$1">$2</code></pre>')
      
      // Paragraphs - wrap text in <p> tags
      .replace(/^([^<].*)$/gm, '<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">$1</p>')
      
      // Clean up empty paragraphs and excessive spacing
      .replace(/<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed"><\/p>/g, '')
      .replace(/<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">\s*<\/p>/g, '')
      .replace(/\n\s*\n/g, '\n')
    
    // Clean up the final HTML
    html = html
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
    
    return html
    
  } catch (error) {
    logger.error('Error converting markdown to HTML:', error)
    // Return a cleaned version of the original markdown if conversion fails
    return markdown
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/gu, '')
      .replace(/[ðâ¤ð³ð¬ð¥]/g, '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
  }
}

/**
 * Converts HTML to markdown format
 * This function handles all HTML elements including tables, lists, headers, code blocks, and charts
 */
export const htmlToMarkdown = (html: string): string => {
  // First, decode HTML entities to prevent &quot; and &amp;quot; issues
  const decodeHtmlEntities = (str: string): string => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = str
    return textarea.value
  }

  // Decode HTML entities first
  let decodedHtml = html
  try {
    // Handle common HTML entities that might be causing issues
    decodedHtml = html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#38;/g, '&')
      .replace(/&#60;/g, '<')
      .replace(/&#62;/g, '>')
  } catch {
    // Fallback to DOM-based decoding if available
    try {
      decodedHtml = decodeHtmlEntities(html)
    } catch {
      // If all else fails, use the original HTML
      decodedHtml = html
    }
  }

  // Simple HTML to markdown conversion with improved list handling
  return decodedHtml
    .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
    .replace(/<h4>(.*?)<\/h4>/g, '#### $1\n\n')
    .replace(/<h5>(.*?)<\/h5>/g, '##### $1\n\n')
    .replace(/<h6>(.*?)<\/h6>/g, '###### $1\n\n')
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<pre><code class="language-(\w+)">(.*?)<\/code><\/pre>/gs, '```$1\n$2\n```\n\n')
    .replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n\n')
    // Improved list handling - remove empty list items and clean up spacing
    .replace(/<ul>(.*?)<\/ul>/gs, (match) => {
      // Remove empty list items and clean up spacing
      return match
        .replace(/<li>\s*<\/li>/g, '') // Remove empty list items
        .replace(/<li>(.*?)<\/li>/g, (_, content) => {
          // Remove any <p> tags that might be wrapping list item content
          const cleanContent = content.replace(/<p>(.*?)<\/p>/g, '$1').trim()
          return cleanContent ? `- ${cleanContent}\n` : ''
        })
        .replace(/\n\s*\n/g, '\n') // Clean up excessive spacing
    })
    .replace(/<ol>(.*?)<\/ol>/gs, (match) => {
      // Remove empty list items and clean up spacing for ordered lists
      return match
        .replace(/<li>\s*<\/li>/g, '') // Remove empty list items
        .replace(/<li>(.*?)<\/li>/g, (_, content) => {
          // Remove any <p> tags that might be wrapping list item content
          const cleanContent = content.replace(/<p>(.*?)<\/p>/g, '$1').trim()
          return cleanContent ? `${cleanContent}\n` : ''
        })
        .replace(/\n\s*\n/g, '\n') // Clean up excessive spacing
    })
    .replace(/<blockquote>(.*?)<\/blockquote>/gs, '> $1\n\n')
    // Handle horizontal rules
    .replace(/<hr\s*\/?>/g, '---\n\n')
         // Handle sortable tables first - more flexible regex to catch all variations
     .replace(/<div[^>]*data-type="sortable-table"[^>]*data-content="([^"]*)"[^>]*>/g, (match, encodedContent) => {
       try {
         const decodedContent = decodeURIComponent(encodedContent)
         return decodedContent
       } catch (error) {
         console.error('Error decoding sortable table content:', error)
         return match
       }
     })
     // Also handle sortable tables without quotes around data-content
     .replace(/<div[^>]*data-type="sortable-table"[^>]*data-content=([^>\s]*)[^>]*>/g, (match, encodedContent) => {
       try {
         const decodedContent = decodeURIComponent(encodedContent)
         return decodedContent
       } catch (error) {
         console.error('Error decoding sortable table content:', error)
         return match
       }
     })
     // Handle regular tables - completely rewritten to handle TipTap HTML structure
     .replace(/<table[^>]*>(.*?)<\/table>/gs, (match, tableContent) => {
      try {
        let headers: string[] = []
        let rows: string[][] = []
        
        // First, try to find thead structure
        const theadMatch = tableContent.match(/<thead[^>]*>(.*?)<\/thead>/s)
        if (theadMatch) {
          // Parse header row
          const headerRowMatch = theadMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/s)
          if (headerRowMatch) {
            const headerCells = headerRowMatch[1].match(/<th[^>]*>(.*?)<\/th>/gs)
            if (headerCells) {
              headers = headerCells.map((cell: string) => {
                // Extract text content, handling <p> tags and other HTML
                const cleanContent = cell.replace(/<th[^>]*>(.*?)<\/th>/s, '$1')
                  .replace(/<p[^>]*>(.*?)<\/p>/g, '$1') // Remove <p> tags
                  .replace(/<br[^>]*>/g, ' ') // Replace <br> with space
                  .trim()
                return cleanContent
              })
            }
          }
          
          // Parse tbody
          const tbodyMatch = tableContent.match(/<tbody[^>]*>(.*?)<\/tbody>/s)
          if (tbodyMatch) {
            const rowMatches = tbodyMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gs)
            if (rowMatches) {
              rows = rowMatches.map((row: string) => {
                const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/gs)
                if (!cellMatches) return []
                return cellMatches.map((cell: string) => {
                  // Extract text content, handling <p> tags and other HTML
                  const cleanContent = cell.replace(/<td[^>]*>(.*?)<\/td>/s, '$1')
                    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1') // Remove <p> tags
                    .replace(/<br[^>]*>/g, ' ') // Replace <br> with space
                    .replace(/\n+/g, ' ') // Replace multiple newlines with single space
                    .trim()
                  return cleanContent
                })
              })
            }
          }
        } else {
          // No thead, parse all rows directly
          const allRowMatches = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs)
          if (allRowMatches && allRowMatches.length > 0) {
            // Check if first row contains th elements (header row)
            const firstRow = allRowMatches[0]
            const hasHeaderRow = firstRow.includes('<th')
            
            if (hasHeaderRow) {
              // First row is header
              const headerCells = firstRow.match(/<th[^>]*>(.*?)<\/th>/gs)
              if (headerCells) {
                headers = headerCells.map((cell: string) => {
                  // Extract text content, handling <p> tags and other HTML
                  const cleanContent = cell.replace(/<th[^>]*>(.*?)<\/th>/s, '$1')
                    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1') // Remove <p> tags
                    .replace(/<br[^>]*>/g, ' ') // Replace <br> with space
                    .trim()
                  return cleanContent
                })
              }
              
              // Parse remaining rows as data
              for (let i = 1; i < allRowMatches.length; i++) {
                const row = allRowMatches[i]
                const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/gs)
                if (cellMatches) {
                  const rowData = cellMatches.map((cell: string) => {
                    // Extract text content, handling <p> tags and other HTML
                    const cleanContent = cell.replace(/<td[^>]*>(.*?)<\/td>/s, '$1')
                      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1') // Remove <p> tags
                      .replace(/<br[^>]*>/g, ' ') // Replace <br> with space
                      .replace(/\n+/g, ' ') // Replace multiple newlines with single space
                      .trim()
                    return cleanContent
                  })
                  if (rowData.length > 0) {
                    rows.push(rowData)
                  }
                }
              }
            } else {
              // No header row, treat all as data
              for (let i = 0; i < allRowMatches.length; i++) {
                const row = allRowMatches[i]
                const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/gs)
                if (cellMatches) {
                  const rowData = cellMatches.map((cell: string) => {
                    // Extract text content, handling <p> tags and other HTML
                    const cleanContent = cell.replace(/<td[^>]*>(.*?)<\/td>/s, '$1')
                      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1') // Remove <p> tags
                      .replace(/<br[^>]*>/g, ' ') // Replace <br> with space
                      .replace(/\n+/g, ' ') // Replace multiple newlines with single space
                      .trim()
                    return cleanContent
                  })
                  if (rowData.length > 0) {
                    rows.push(rowData)
                  }
                }
              }
              
              // Create default headers
              if (rows.length > 0) {
                const maxCols = Math.max(...rows.map(row => row.length))
                headers = Array.from({ length: maxCols }, (_, index) => `Column ${index + 1}`)
              }
            }
          }
        }
        
        // Build markdown table
        if (headers.length > 0) {
          let markdown = '\n'
          
          // Check if all headers are empty and generate defaults if needed
          const allHeadersEmpty = headers.every(header => !header.trim())
          if (allHeadersEmpty) {
            // Generate default column names
            headers = headers.map((_, index) => `Column ${index + 1}`)
          }
          
          // Header row
          markdown += '| ' + headers.join(' | ') + ' |\n'
          
          // Separator row
          markdown += '|' + headers.map(() => '---').join('|') + '|\n'
          
          // Data rows
          rows.forEach((row: string[]) => {
            if (row.length > 0) {
              // Ensure row has same number of cells as headers
              const paddedRow = [...row]
              while (paddedRow.length < headers.length) {
                paddedRow.push('')
              }
              markdown += '| ' + paddedRow.join(' | ') + ' |\n'
            }
          })
          
          return markdown + '\n'
        }
        
        // Fallback: return original table HTML if parsing failed
        return match
      } catch (error) {
        console.error('Error parsing table:', error)
        return match
      }
    })
                        // Handle chart nodes - improved regex to handle chart data properly
     .replace(/<div[^>]*data-type="chart"[^>]*>/g, (match) => {
       logger.debug('htmlToMarkdown - found chart div:', match)
       try {
         // Extract chart attributes using more robust parsing
         // First try to get the raw data from the 'data' attribute (contains the actual JSON)
         const rawDataMatch = match.match(/data="([^"]*)"/)
         const chartTypeMatch = match.match(/data-chart-type="([^"]*)"/)
         const chartDataMatch = match.match(/data-chart-data="([^"]*)"/)
         const encodingMatch = match.match(/data-chart-encoding="([^"]*)"/)
         
         if (chartTypeMatch) {
           const chartType = chartTypeMatch[1]
           let chartData = ''
           let encoding = encodingMatch ? encodingMatch[1] : 'uri'
           
                        // Prefer raw data attribute if available, otherwise fall back to encoded data - FIRST INSTANCE
           if (rawDataMatch) {
             chartData = rawDataMatch[1]
             // Raw data is not encoded, so we can use it directly
             encoding = 'raw'
           } else if (chartDataMatch) {
             chartData = chartDataMatch[1]
           } else {
             logger.warn('htmlToMarkdown - no chart data found in attributes')
             return match
           }
           
           let decodedData: string
           
           try {
             if (encoding === 'base64') {
               // Decode base64-encoded chart data
               decodedData = decodeURIComponent(escape(atob(chartData)))
             } else if (encoding === 'raw') {
               // Raw data is already decoded
               decodedData = chartData
             } else {
               // Decode URI-encoded chart data (backward compatibility)
               decodedData = decodeURIComponent(chartData)
             }
             
             // First, decode HTML entities that might be in the data
             const htmlDecodedData = decodedData
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'")
               .replace(/&#39;/g, "'")
               .replace(/&#34;/g, '"')
               .replace(/&#38;/g, '&')
               .replace(/&#60;/g, '<')
               .replace(/&#62;/g, '>')
             
             // Clean up the decoded data by removing carriage returns and extra whitespace - FIRST INSTANCE
             // The key issue is that the data contains newlines within the JSON string
             // We need to normalize these newlines and ensure proper JSON formatting
             const cleanedData = htmlDecodedData
               .replace(/\r\n/g, '\n')  // Replace carriage returns with newlines
               .replace(/\r/g, '\n')    // Replace any remaining carriage returns
               .trim()                  // Remove leading/trailing whitespace
             
             // Validate the cleaned data is valid JSON
             let finalData = cleanedData
             let dataSource = 'cleaned'
             
             try {
               JSON.parse(cleanedData)
               // Basic cleaning worked, use cleanedData
             } catch (jsonError) {
               logger.warn('htmlToMarkdown - cleaned chart data is not valid JSON:', jsonError)
               
               // Try to fix the JSON by normalizing newlines and whitespace
               try {
                 // First, try to parse and re-stringify to get clean JSON
                 const parsedData = JSON.parse(cleanedData.replace(/\n/g, ' ').replace(/\s+/g, ' '))
                 finalData = JSON.stringify(parsedData, null, 2)
                 dataSource = 'normalized'
                 logger.debug('htmlToMarkdown - JSON normalization succeeded')
               } catch (normalizeError) {
                 logger.warn('htmlToMarkdown - JSON normalization failed:', normalizeError)
                 
                 // Try more aggressive cleaning for carriage returns and whitespace
                 const aggressivelyCleanedData = cleanedData
                   .replace(/\r/g, '')  // Remove ALL carriage returns
                   .replace(/\n/g, ' ') // Replace newlines with spaces
                   .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                   .trim()
                 
                 try {
                   JSON.parse(aggressivelyCleanedData)
                   // Aggressive cleaning worked
                   finalData = aggressivelyCleanedData
                   dataSource = 'aggressive'
                 } catch (aggressiveError) {
                   logger.warn('htmlToMarkdown - aggressive cleaning also failed:', aggressiveError)
                   
                   // Try to parse the HTML-decoded data as a fallback
                   try {
                     JSON.parse(htmlDecodedData)
                     // HTML-decoded data worked
                     finalData = htmlDecodedData
                     dataSource = 'html-decoded'
                   } catch (htmlDecodedError) {
                     logger.warn('htmlToMarkdown - HTML-decoded parsing also failed:', htmlDecodedError)
                     
                     // Try to parse the original decoded data as a final fallback
                     try {
                       JSON.parse(decodedData)
                       // Original data worked
                       finalData = decodedData
                       dataSource = 'original'
                     } catch (fallbackError) {
                       logger.warn('htmlToMarkdown - fallback parsing also failed:', fallbackError)
                       
                       // As a last resort, try to clean the data by removing all newlines and extra whitespace
                       try {
                         const lastResortData = decodedData
                           .replace(/\r/g, '')
                           .replace(/\n/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim()
                         
                         JSON.parse(lastResortData)
                         finalData = lastResortData
                         dataSource = 'last-resort'
                         logger.debug('htmlToMarkdown - last resort cleaning succeeded')
                       } catch (lastResortError) {
                         logger.warn('htmlToMarkdown - last resort cleaning also failed:', lastResortError)
                         // Return the original HTML if all cleaning attempts failed
                         return match
                       }
                     }
                   }
                 }
               }
             }
             
             logger.debug('htmlToMarkdown - converting chart to markdown:', { 
               chartType, 
               encoding,
               originalDataLength: chartData.length,
               decodedDataLength: decodedData.length,
               finalDataLength: finalData.length,
               dataSource,
               finalDataPreview: finalData.substring(0, 100)
             })
             
             // Use the final cleaned data for the markdown output
             return `\n\n\`\`\`${chartType}\n${finalData}\n\`\`\`\n\n`
           } catch (decodeError) {
             logger.error('htmlToMarkdown - failed to decode chart data:', decodeError)
             // Return the original HTML if decoding fails
             return match
           }
         }
         
         // Fallback if attributes can't be parsed
         logger.warn('htmlToMarkdown - failed to parse chart attributes from:', match)
         return match
       } catch (error) {
         logger.error('htmlToMarkdown - error parsing chart:', error)
         return match
       }
     })
     
     // Also handle self-closing chart divs that might be generated by TipTap
     .replace(/<div[^>]*data-type="chart"[^>]*\/>/g, (match) => {
       logger.debug('htmlToMarkdown - found self-closing chart div:', match)
       try {
         // Extract chart attributes using more robust parsing
         // First try to get the raw data from the 'data' attribute (contains the actual JSON)
         const rawDataMatch = match.match(/data="([^"]*)"/)
         const chartTypeMatch = match.match(/data-chart-type="([^"]*)"/)
         const chartDataMatch = match.match(/data-chart-data="([^"]*)"/)
         const encodingMatch = match.match(/data-chart-encoding="([^"]*)"/)
         
         if (chartTypeMatch) {
           const chartType = chartTypeMatch[1]
           let chartData = ''
           let encoding = encodingMatch ? encodingMatch[1] : 'uri'
           
           // Prefer raw data attribute if available, otherwise fall back to encoded data
           if (rawDataMatch) {
             chartData = rawDataMatch[1]
             // Raw data is not encoded, so we can use it directly
             encoding = 'raw'
           } else if (chartDataMatch) {
             chartData = chartDataMatch[1]
           } else {
             logger.warn('htmlToMarkdown - no chart data found in attributes')
             return match
           }
           
           let decodedData: string
           
           try {
             if (encoding === 'base64') {
               decodedData = decodeURIComponent(escape(atob(chartData)))
             } else if (encoding === 'raw') {
               // Raw data is already decoded
               decodedData = chartData
             } else {
               decodedData = decodeURIComponent(chartData)
             }
             
             // First, decode HTML entities that might be in the data
             const htmlDecodedData = decodedData
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'")
               .replace(/&#39;/g, "'")
               .replace(/&#34;/g, '"')
               .replace(/&#38;/g, '&')
               .replace(/&#60;/g, '<')
               .replace(/&#62;/g, '>')
             
             // Clean up the decoded data by removing carriage returns and extra whitespace - SECOND INSTANCE
             // The key issue is that the data contains newlines within the JSON string
             // We need to normalize these newlines and ensure proper JSON formatting
             const cleanedData = htmlDecodedData
               .replace(/\r\n/g, '\n')  // Replace carriage returns with newlines
               .replace(/\r/g, '\n')    // Replace any remaining carriage returns
               .trim()                  // Remove leading/trailing whitespace
             
             // Validate the cleaned data is valid JSON
             let finalData = cleanedData
             let dataSource = 'cleaned'
             
             try {
               JSON.parse(cleanedData)
               // Basic cleaning worked, use cleanedData
             } catch (jsonError) {
               logger.warn('htmlToMarkdown - cleaned chart data is not valid JSON:', jsonError)
               
               // Try to fix the JSON by normalizing newlines and whitespace
               try {
                 // First, try to parse and re-stringify to get clean JSON
                 const parsedData = JSON.parse(cleanedData.replace(/\n/g, ' ').replace(/\s+/g, ' '))
                 finalData = JSON.stringify(parsedData, null, 2)
                 dataSource = 'normalized'
                 logger.debug('htmlToMarkdown - JSON normalization succeeded')
               } catch (normalizeError) {
                 logger.warn('htmlToMarkdown - JSON normalization failed:', normalizeError)
                 
                 // Try more aggressive cleaning for carriage returns and whitespace
                 const aggressivelyCleanedData = cleanedData
                   .replace(/\r/g, '')  // Remove ALL carriage returns
                   .replace(/\n/g, ' ') // Replace newlines with spaces
                   .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                   .trim()
                 
                 try {
                   JSON.parse(aggressivelyCleanedData)
                   // Aggressive cleaning worked
                   finalData = aggressivelyCleanedData
                   dataSource = 'aggressive'
                 } catch (aggressiveError) {
                   logger.warn('htmlToMarkdown - aggressive cleaning also failed:', aggressiveError)
                   
                   // Try to parse the HTML-decoded data as a fallback
                   try {
                     JSON.parse(htmlDecodedData)
                     // HTML-decoded data worked
                     finalData = htmlDecodedData
                     dataSource = 'html-decoded'
                   } catch (htmlDecodedError) {
                     logger.warn('htmlToMarkdown - HTML-decoded parsing also failed:', htmlDecodedError)
                     
                     // Try to parse the original decoded data as a final fallback
                     try {
                       JSON.parse(decodedData)
                       // Original data worked
                       finalData = decodedData
                       dataSource = 'original'
                     } catch (fallbackError) {
                       logger.warn('htmlToMarkdown - fallback parsing also failed:', fallbackError)
                       
                       // As a last resort, try to clean the data by removing all newlines and extra whitespace
                       try {
                         const lastResortData = decodedData
                           .replace(/\r/g, '')
                           .replace(/\n/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim()
                         
                         JSON.parse(lastResortData)
                         finalData = lastResortData
                         dataSource = 'last-resort'
                         logger.debug('htmlToMarkdown - last resort cleaning succeeded')
                       } catch (lastResortError) {
                         logger.warn('htmlToMarkdown - last resort cleaning also failed:', lastResortError)
                         // Return the original HTML if all cleaning attempts failed
                         return match
                       }
                     }
                   }
                 }
               }
             }
             
             logger.debug('htmlToMarkdown - converting self-closing chart to markdown:', { 
               chartType, 
               encoding,
               originalDataLength: chartData.length,
               decodedDataLength: decodedData.length,
               finalDataLength: finalData.length,
               dataSource,
               finalDataPreview: finalData.substring(0, 100)
             })
             
             // Use the final cleaned data for the markdown output
             return `\n\n\`\`\`${chartType}\n${finalData}\n\`\`\`\n\n`
           } catch (decodeError) {
             logger.error('htmlToMarkdown - failed to decode chart data:', decodeError)
             return match
           }
         }
         
         logger.warn('htmlToMarkdown - failed to parse self-closing chart attributes from:', match)
         return match
       } catch (error) {
         logger.error('htmlToMarkdown - error parsing self-closing chart:', error)
         return match
       }
     })
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    // Decode any remaining &quot; entities after attribute parsing to avoid breaking chart data extraction
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}
