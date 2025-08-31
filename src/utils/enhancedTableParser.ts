import { TableData } from '@/components/UnifiedTableRenderer'

/**
 * Enhanced table parser that supports rich text formatting within table cells
 */
export function parseEnhancedMarkdownTable(markdownTable: string): TableData | null {
  const lines = markdownTable.trim().split('\n')
  
  if (lines.length < 3) {
    return null // Need at least header, separator, and one data row
  }

  // Parse header row
  const headerLine = lines[0]
  const headers = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0)

  if (headers.length === 0) {
    return null
  }

  // Skip separator line (the one with dashes)
  const dataLines = lines.slice(2)

  // Parse data rows
  const rows: string[][] = []
  
  for (const line of dataLines) {
    if (!line.trim()) continue
    
    const cells = line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
    
    if (cells.length > 0) {
      // Ensure row has same number of cells as headers
      const paddedCells = [...cells]
      while (paddedCells.length < headers.length) {
        paddedCells.push('')
      }
      rows.push(paddedCells)
    }
  }

  return {
    headers,
    rows
  }
}

/**
 * Enhanced HTML table to markdown converter with rich text support
 */
export function enhancedHtmlTableToMarkdown(htmlTable: string): string {
  try {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlTable
    
    const table = tempDiv.querySelector('table')
    if (!table) return ''
    
    const headers: string[] = []
    const rows: string[][] = []
    
    // Extract headers
    const headerCells = table.querySelectorAll('thead th, th')
    headerCells.forEach(cell => {
      headers.push(extractRichTextContent(cell))
    })
    
    // Extract data rows
    const dataRows = table.querySelectorAll('tbody tr, tr')
    dataRows.forEach(row => {
      const cells = row.querySelectorAll('td')
      if (cells.length > 0) {
        const rowData: string[] = []
        cells.forEach(cell => {
          rowData.push(extractRichTextContent(cell))
        })
        rows.push(rowData)
      }
    })
    
    // Build markdown table
    if (headers.length === 0) return ''
    
    let markdown = '| ' + headers.join(' | ') + ' |\n'
    markdown += '|' + headers.map(() => '---').join('|') + '|\n'
    
    rows.forEach(row => {
      const paddedRow = [...row]
      while (paddedRow.length < headers.length) {
        paddedRow.push('')
      }
      markdown += '| ' + paddedRow.join(' | ') + ' |\n'
    })
    
    return markdown
    
  } catch (error) {
    console.error('Error converting HTML table to markdown:', error)
    return ''
  }
}

/**
 * Extract rich text content from HTML elements, preserving markdown formatting
 */
function extractRichTextContent(element: Element): string {
  let content = ''
  
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      content += child.textContent || ''
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as Element
      const tagName = childElement.tagName.toLowerCase()
      
      switch (tagName) {
        case 'strong':
        case 'b':
          content += `**${childElement.textContent || ''}**`
          break
          
        case 'em':
        case 'i':
          content += `*${childElement.textContent || ''}*`
          break
          
        case 'code':
          content += `\`${childElement.textContent || ''}\``
          break
          
        case 'a':
          const href = childElement.getAttribute('href') || ''
          const text = childElement.textContent || ''
          content += `[${text}](${href})`
          break
          
        case 'br':
          content += '\n'
          break
          
        default:
          // Recursively process other elements
          content += extractRichTextContent(childElement)
      }
    }
  }
  
  return content.trim()
}

/**
 * Convert markdown table to HTML with rich text support
 */
export function markdownTableToHtml(markdownTable: string): string {
  try {
    const tableData = parseEnhancedMarkdownTable(markdownTable)
    if (!tableData) return ''
    
    const { headers, rows } = tableData
    
    let html = '<div class="overflow-x-auto my-8"><table class="w-full caption-bottom text-sm border-collapse bg-white dark:bg-teal-900/10 border border-teal-200 dark:border-teal-700 rounded-xl overflow-hidden shadow-sm">'
    
    // Header
    if (headers.length > 0) {
      html += '<thead><tr>'
      headers.forEach(header => {
        html += `<th class="h-14 px-5 text-left align-middle font-semibold text-teal-900 dark:text-teal-100 border-r border-teal-200 dark:border-teal-700 last:border-r-0 bg-teal-50 dark:bg-teal-900/30 text-sm tracking-wide">${parseMarkdownInCell(header)}</th>`
      })
      html += '</tr></thead>'
    }
    
    // Body
    html += '<tbody>'
    rows.forEach(row => {
      html += '<tr class="border-b border-teal-100 dark:border-teal-700 last:border-b-0 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 ease-in-out">'
      row.forEach((cell, index) => {
        const isLast = index === row.length - 1
        html += `<td class="px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 dark:border-teal-700 ${isLast ? 'last:border-r-0' : ''} text-teal-700 dark:text-teal-300 text-sm leading-relaxed">${parseMarkdownInCell(cell)}</td>`
      })
      html += '</tr>'
    })
    html += '</tbody></table></div>'
    
    return html
    
  } catch (error) {
    console.error('Error converting markdown table to HTML:', error)
    return ''
  }
}

/**
 * Parse markdown formatting within table cells
 */
function parseMarkdownInCell(content: string): string {
  if (!content) return ''
  
  let html = content
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-900 dark:text-teal-100">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="font-semibold text-teal-900 dark:text-teal-100">$1</strong>')
    
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic text-teal-800 dark:text-teal-200">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic text-teal-800 dark:text-teal-200">$1</em>')
    
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-teal-50 dark:bg-teal-900/20 px-1 py-0.5 rounded text-xs font-mono text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700">$1</code>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal-600 dark:text-teal-400 underline hover:text-teal-800 dark:hover:text-teal-300 transition-colors duration-200" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Line breaks
    .replace(/\n/g, '<br>')
  
  return html
}

/**
 * Create an editable table cell with rich text support
 */
export function createEditableTableCell(
  content: string, 
  onContentChange: (newContent: string) => void,
  isHeader: boolean = false
): string {
  const cellClass = isHeader 
    ? 'h-14 px-5 text-left align-middle font-semibold text-teal-900 dark:text-teal-100 border-r border-teal-200 dark:border-teal-700 last:border-r-0 bg-teal-50 dark:bg-teal-900/30 text-sm tracking-wide'
    : 'px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 dark:border-teal-700 last:border-r-0 text-teal-700 dark:text-teal-300 text-sm leading-relaxed'
  
  return `<td class="${cellClass}" contenteditable="true" data-original-content="${content}" onblur="this.dispatchEvent(new CustomEvent('cellChange', {detail: {content: this.textContent, original: this.dataset.originalContent}}))">${parseMarkdownInCell(content)}</td>`
}

/**
 * Extract table data from HTML table element
 */
export function extractTableDataFromHtml(htmlTable: string): TableData | null {
  try {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlTable
    
    const table = tempDiv.querySelector('table')
    if (!table) return null
    
    const headers: string[] = []
    const rows: string[][] = []
    
    // Extract headers
    const headerCells = table.querySelectorAll('thead th, th')
    headerCells.forEach(cell => {
      headers.push(extractRichTextContent(cell))
    })
    
    // Extract data rows
    const dataRows = table.querySelectorAll('tbody tr, tr')
    dataRows.forEach(row => {
      const cells = row.querySelectorAll('td')
      if (cells.length > 0) {
        const rowData: string[] = []
        cells.forEach(cell => {
          rowData.push(extractRichTextContent(cell))
        })
        rows.push(rowData)
      }
    })
    
    return { headers, rows }
    
  } catch (error) {
    console.error('Error extracting table data from HTML:', error)
    return null
  }
}

/**
 * Validate markdown table syntax
 */
export function validateMarkdownTable(markdownTable: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const lines = markdownTable.trim().split('\n')
  
  if (lines.length < 3) {
    errors.push('Table must have at least 3 lines (header, separator, and one data row)')
    return { isValid: false, errors }
  }
  
  // Check header row
  const headerLine = lines[0]
  if (!headerLine.includes('|')) {
    errors.push('Header row must contain pipe separators (|)')
  }
  
  // Check separator row
  const separatorLine = lines[1]
  if (!separatorLine.match(/^\|[\s\-:|]+\|$/)) {
    errors.push('Separator row must contain only dashes, colons, and pipes')
  }
  
  // Check data rows
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() && !line.includes('|')) {
      errors.push(`Data row ${i + 1} must contain pipe separators (|)`)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// Export the original function names for backward compatibility
export const parseMarkdownTable = parseEnhancedMarkdownTable
export const htmlTableToMarkdown = enhancedHtmlTableToMarkdown