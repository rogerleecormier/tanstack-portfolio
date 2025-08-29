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
        
        // Build table HTML with proper TipTap table structure
        let tableHtml = '<table class="border-collapse border border-gray-300 w-full my-4">'
        
        // Add header row
        tableHtml += '<thead><tr>'
        headerCells.forEach(cell => {
          tableHtml += `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">${cell}</th>`
        })
        tableHtml += '</tr></thead>'
        
        // Add data rows
        tableHtml += '<tbody>'
        dataRows.forEach(row => {
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
          if (cells.length > 0) {
            tableHtml += '<tr>'
            // Ensure we have the same number of cells as headers
            const paddedCells = [...cells]
            while (paddedCells.length < headerCells.length) {
              paddedCells.push('')
            }
            paddedCells.forEach(cell => {
              tableHtml += `<td class="border border-gray-300 px-4 py-2 min-w-[100px]">${cell}</td>`
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
        
        // Create chart HTML node
        result.push(`<div data-type="chart" data-chart-type="${chartType}" data-chart-data="${data.replace(/"/g, '&quot;')}" data-chart-x-axis-label="" data-chart-y-axis-label="" data-chart-width="100%" data-chart-height="320px"></div>`)
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
  // Simple HTML to markdown conversion with improved list handling
  return html
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
    // Handle tables - improved version that handles both thead/tbody and direct tr structure
    .replace(/<table[^>]*>(.*?)<\/table>/gs, (match, tableContent) => {
      // Try to find header row first
      let headers: string[] = []
      let rows: string[][] = []
      
      // Check if we have a thead structure
      const headerMatch = tableContent.match(/<thead[^>]*>(.*?)<\/thead>/s)
      if (headerMatch) {
        const headerRowMatch = headerMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/s)
        if (headerRowMatch) {
          const headerCells = headerRowMatch[1].match(/<th[^>]*>(.*?)<\/th>/g)
          if (headerCells) {
            headers = headerCells.map((cell: string) => cell.replace(/<th[^>]*>(.*?)<\/th>/s, '$1').trim())
          }
        }
        
        // Extract data rows from tbody
        const tbodyMatch = tableContent.match(/<tbody[^>]*>(.*?)<\/tbody>/s)
        if (tbodyMatch) {
          const rowMatches = tbodyMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gs)
          if (rowMatches) {
            rows = rowMatches.map((row: string) => {
              const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/g)
              if (!cellMatches) return []
              return cellMatches.map((cell: string) => cell.replace(/<td[^>]*>(.*?)<\/td>/s, '$1').trim())
            })
          }
        }
      } else {
        // No thead structure, try to parse all rows
        const allRowMatches = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs)
        if (allRowMatches && allRowMatches.length > 0) {
          // First row might be headers (if it contains th elements)
          const firstRow = allRowMatches[0]
          const firstRowCells = firstRow.match(/<(th|td)[^>]*>(.*?)<\/(th|td)>/g)
          if (firstRowCells) {
            const isFirstRowHeader = firstRow.includes('<th')
            if (isFirstRowHeader) {
              // First row is header
              headers = firstRowCells.map((cell: string) => cell.replace(/<(th|td)[^>]*>(.*?)<\/(th|td)>/s, '$2').trim())
              // Parse remaining rows as data
              rows = allRowMatches.slice(1).map((row: string) => {
                const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/g)
                if (!cellMatches) return []
                return cellMatches.map((cell: string) => cell.replace(/<td[^>]*>(.*?)<\/td>/s, '$1').trim())
              })
            } else {
              // No header row, treat all as data
              rows = allRowMatches.map((row: string) => {
                const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/g)
                if (!cellMatches) return []
                return cellMatches.map((cell: string) => cell.replace(/<td[^>]*>(.*?)<\/td>/s, '$1').trim())
              })
              // Create default headers
              if (rows.length > 0) {
                headers = rows[0].map((_, index) => `Column ${index + 1}`)
              }
            }
          }
        }
      }
      
      // Build markdown table
      if (headers.length > 0) {
        let markdown = '\n'
        
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
    })
    // Handle chart nodes
    .replace(/<div[^>]*data-type="chart"[^>]*data-chart-type="([^"]*)"[^>]*data-chart-data="([^"]*)"[^>]*><\/div>/g, (_match, chartType, chartData) => {
      return `\n\n\`\`\`${chartType}\n${chartData}\n\`\`\`\n\n`
    })
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}
