import { logger } from '@/utils/logger'

/**
 * Converts markdown text to HTML format
 * This function handles all markdown elements including tables, lists, headers, code blocks, and charts
 */
export const markdownToHtml = (markdown: string): string => {


  // Parse markdown line by line for better list handling
  const lines = markdown.split('\n')
  const result: string[] = []
  let currentList: string[] = []
  let currentListType: 'ul' | 'ol' | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      // Empty line - close any open list and add paragraph break
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      result.push('')
      continue
    }
    
    // Check if this is a list item
    if (line.startsWith('* ') || line.startsWith('- ')) {
      // Unordered list item
      if (currentListType !== 'ul') {
        // Close previous list if different type
        if (currentList.length > 0) {
          result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        }
        currentList = []
        currentListType = 'ul'
      }
      
      // Convert markdown to HTML for the list item content
      const content = line.substring(2)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
      
      currentList.push(`<li>${content}</li>`)
      continue
    }
    
    if (/^\d+\.\s/.test(line)) {
      // Ordered list item
      if (currentListType !== 'ol') {
        // Close previous list if different type
        if (currentList.length > 0) {
          result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        }
        currentList = []
        currentListType = 'ol'
      }
      
      // Convert markdown to HTML for the list item content
      const content = line.replace(/^\d+\.\s/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
      
      currentList.push(`<li>${content}</li>`)
      continue
    }
    
    // Check if this is a header
    if (line.startsWith('### ')) {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      result.push(`<h3>${line.substring(4)}</h3>`)
      continue
    }
    
    if (line.startsWith('## ')) {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      result.push(`<h2>${line.substring(3)}</h2>`)
      continue
    }
    
    if (line.startsWith('# ')) {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      result.push(`<h1>${line.substring(2)}</h1>`)
      continue
    }
    
    // Check if this is a horizontal rule
    if (line === '---') {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      result.push('<hr>')
      continue
    }
    
    // Check if this is a blockquote
    if (line.startsWith('> ')) {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      result.push(`<blockquote><p>${line.substring(2)}</p></blockquote>`)
      continue
    }
    
    // Check if this is a table
    if (line.includes('|')) {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      
      // Find all table rows
      const tableRows = []
      let j = i
      while (j < lines.length && lines[j].trim().includes('|')) {
        tableRows.push(lines[j].trim())
        j++
      }
      
      if (tableRows.length >= 2) {
        // Parse table structure
        const headerRow = tableRows[0]
        const dataRows = tableRows.slice(2)
        
        // Parse header cells - split by | and filter out empty cells
        const headerCells = headerRow.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
        
                 // Build table HTML with unified table styling
        let tableHtml = '<table class="w-full caption-bottom text-sm border-collapse my-4 bg-white border border-teal-200 rounded-xl overflow-hidden shadow-sm">'
        
        // Add header row
        tableHtml += '<thead class="bg-teal-50">'
        tableHtml += '<tr class="border-b border-teal-200 last:border-b-0 hover:bg-teal-100 hover:shadow-sm transition-all duration-200 ease-in-out">'
        headerCells.forEach(cell => {
          tableHtml += `<th class="h-14 px-5 text-left align-middle font-semibold text-teal-900 border-r border-teal-200 last:border-r-0 bg-teal-50 text-sm tracking-wide">${cell}</th>`
        })
        tableHtml += '</tr></thead>'
        
        // Add data rows
        tableHtml += '<tbody>'
        dataRows.forEach((row, rowIndex) => {
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
          if (cells.length > 0) {
            const rowClass = `border-b border-teal-100 last:border-b-0 hover:bg-teal-50 hover:shadow-sm transition-all duration-200 ease-in-out ${
              rowIndex % 2 === 0 ? 'bg-white' : 'bg-teal-50'
            }`
            tableHtml += `<tr class="${rowClass}">`
            // Ensure we have the same number of cells as headers
            const paddedCells = [...cells]
            while (paddedCells.length < headerCells.length) {
              paddedCells.push('')
            }
            paddedCells.forEach(cell => {
              tableHtml += `<td class="px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 last:border-r-0 text-teal-700 text-sm leading-relaxed">${cell}</td>`
            })
            tableHtml += '</tr>'
          }
        })
        tableHtml += '</tbody></table>'
        
        result.push(tableHtml)
        i = j - 1 // Skip to end of table
        continue
      }
    }
    
            // Check if this is a chart block
    if (line.startsWith('```') && /^(barchart|linechart|scatterplot|histogram)$/.test(line.substring(3).trim())) {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      
      // Find the end of the chart block
      const chartData = []
      let j = i + 1
      while (j < lines.length && !lines[j].trim().startsWith('```')) {
        chartData.push(lines[j])
        j++
      }
      
      if (j < lines.length) {
        const chartType = line.substring(3).trim()
        const data = chartData.join('\n')
        
        logger.debug('markdownToHtml - processing chart:', { chartType, dataLength: data.length })
        logger.debug('markdownToHtml - chart data preview:', data.substring(0, 100))
        
        // Validate chart data before encoding
        let isValidChartData = true
        try {
          // Try to parse as JSON to validate
          JSON.parse(data)
        } catch (error) {
          logger.warn('markdownToHtml - invalid JSON in chart data:', error)
          isValidChartData = false
        }
        
        if (isValidChartData) {
          // Use base64 encoding instead of URI encoding to prevent corruption
          const encodedData = btoa(unescape(encodeURIComponent(data)))
          
          logger.debug('markdownToHtml - processing chart:', { 
            chartType, 
            originalData: data.substring(0, 200), // Show first 200 chars
            encodedDataLength: encodedData.length,
            dataLength: data.length
          })
          
          // Create chart HTML node with base64-encoded data
          const chartDiv = `<div data-type="chart" data-chart-type="${chartType}" data-chart-data="${encodedData}" data-chart-encoding="base64" data-chart-x-axis-label="" data-chart-y-axis-label="" data-chart-width="100%" data-chart-height="320px"></div>`
          
          result.push(chartDiv)
        } else {
          // If chart data is invalid, preserve as code block instead
          logger.warn('markdownToHtml - preserving invalid chart as code block')
          result.push(`<pre><code class="language-${chartType}">${data}</code></pre>`)
        }
        
        i = j // Skip to end of chart block
        continue
      }
    }
    
    // Check if this is a code block
    if (line.startsWith('```')) {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      
      // Find the end of the code block
      const codeContent = []
      let j = i + 1
      while (j < lines.length && !lines[j].trim().startsWith('```')) {
        codeContent.push(lines[j])
        j++
      }
      
      if (j < lines.length) {
        const language = line.substring(3).trim() || 'text'
        const code = codeContent.join('\n')
        
        // Create code block HTML
        result.push(`<pre><code class="language-${language}">${code}</code></pre>`)
        i = j // Skip to end of code block
        continue
      }
    }
    
    // Regular paragraph - convert inline markdown
    const content = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
    
    result.push(`<p>${content}</p>`)
  }
  
  // Close any remaining open list
  if (currentList.length > 0) {
    result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
  }
  
  // Join all HTML elements and clean up
  return result.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n').trim()
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
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#34;/g, '"')
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
         const chartTypeMatch = match.match(/data-chart-type="([^"]*)"/)
         const chartDataMatch = match.match(/data-chart-data="([^"]*)"/)
         const encodingMatch = match.match(/data-chart-encoding="([^"]*)"/)
         
         if (chartTypeMatch && chartDataMatch) {
           const chartType = chartTypeMatch[1]
           const chartData = chartDataMatch[1]
           const encoding = encodingMatch ? encodingMatch[1] : 'uri' // Default to URI for backward compatibility
           
           let decodedData: string
           
           try {
             if (encoding === 'base64') {
               // Decode base64-encoded chart data
               decodedData = decodeURIComponent(escape(atob(chartData)))
             } else {
               // Decode URI-encoded chart data (backward compatibility)
               decodedData = decodeURIComponent(chartData)
             }
             
                           // Clean up the decoded data by removing carriage returns and extra whitespace
              const cleanedData = decodedData
                .replace(/\r\n/g, '\n')  // Replace carriage returns with newlines
                .replace(/\r/g, '\n')    // Replace any remaining carriage returns
                .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
                .trim()                  // Remove leading/trailing whitespace
              
              // Validate the cleaned data is valid JSON
              try {
                JSON.parse(cleanedData)
              } catch (jsonError) {
                logger.warn('htmlToMarkdown - cleaned chart data is not valid JSON:', jsonError)
                // Try to parse the original decoded data as a fallback
                try {
                  JSON.parse(decodedData)
                } catch (fallbackError) {
                  logger.warn('htmlToMarkdown - fallback parsing also failed:', fallbackError)
                  // Return the original HTML if data is corrupted
                  return match
                }
              }
              
              logger.debug('htmlToMarkdown - converting chart to markdown:', { 
                chartType, 
                encoding,
                originalDataLength: chartData.length,
                decodedDataLength: decodedData.length,
                originalDataPreview: chartData.substring(0, 100),
                decodedDataPreview: cleanedData.substring(0, 100)
              })
              
              // Use the cleaned data for the markdown output
              return `\n\n\`\`\`${chartType}\n${cleanedData}\n\`\`\`\n\n`
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
         const chartTypeMatch = match.match(/data-chart-type="([^"]*)"/)
         const chartDataMatch = match.match(/data-chart-data="([^"]*)"/)
         const encodingMatch = match.match(/data-chart-encoding="([^"]*)"/)
         
         if (chartTypeMatch && chartDataMatch) {
           const chartType = chartTypeMatch[1]
           const chartData = chartDataMatch[1]
           const encoding = encodingMatch ? encodingMatch[1] : 'uri'
           
           let decodedData: string
           
           try {
             if (encoding === 'base64') {
               decodedData = decodeURIComponent(escape(atob(chartData)))
             } else {
               decodedData = decodeURIComponent(chartData)
             }
             
                           // Clean up the decoded data by removing carriage returns and extra whitespace
              const cleanedData = decodedData
                .replace(/\r\n/g, '\n')  // Replace carriage returns with newlines
                .replace(/\r/g, '\n')    // Replace any remaining carriage returns
                .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
                .trim()                  // Remove leading/trailing whitespace
              
              // Validate the cleaned data is valid JSON
              try {
                JSON.parse(cleanedData)
              } catch (jsonError) {
                logger.warn('htmlToMarkdown - cleaned chart data is not valid JSON:', jsonError)
                // Try to parse the original decoded data as a fallback
                try {
                  JSON.parse(decodedData)
                } catch (fallbackError) {
                  logger.warn('htmlToMarkdown - fallback parsing also failed:', fallbackError)
                  return match
                }
              }
              
              logger.debug('htmlToMarkdown - converting self-closing chart to markdown:', { 
                chartType, 
                encoding,
                originalDataLength: chartData.length,
                decodedDataLength: cleanedData.length
              })
              
              // Use the cleaned data for the markdown output
              return `\n\n\`\`\`${chartType}\n${cleanedData}\n\`\`\`\n\n`
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
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}
