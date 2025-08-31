import { logger } from '@/utils/logger'

/**
 * Enhanced markdown to HTML converter with support for tables, charts, and advanced features
 */
export const enhancedMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return ''
  
  try {
    let html = markdown
    
    // Handle frontmatter (remove it from HTML output)
    html = html.replace(/^---\n[\s\S]*?\n---\n?/g, '')
    
    // Headers with enhanced styling
    html = html
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-3 text-teal-800 dark:text-teal-200">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-teal-900 dark:text-teal-100">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-5 text-teal-900 dark:text-teal-100">$1</h1>')
    
    // Bold and italic with enhanced styling
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-900 dark:text-teal-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-teal-800 dark:text-teal-200">$1</em>')
      .replace(/__(.*?)__/g, '<strong class="font-semibold text-teal-900 dark:text-teal-100">$1</strong>')
      .replace(/_(.*?)_/g, '<em class="italic text-teal-800 dark:text-teal-200">$1</em>')
    
    // Inline code with enhanced styling
    html = html
      .replace(/`(.*?)`/g, '<code class="bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded text-sm font-mono text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700">$1</code>')
    
    // Links with enhanced styling
    html = html
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal-600 dark:text-teal-400 underline hover:text-teal-800 dark:hover:text-teal-300 transition-colors duration-200" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Horizontal rules with enhanced styling
    html = html
      .replace(/^---$/gm, '<hr class="border-teal-300 dark:border-teal-600 my-8 opacity-50">')
      .replace(/^\*\*\*$/gm, '<hr class="border-teal-300 dark:border-teal-600 my-8 opacity-50">')
    
    // Blockquotes with enhanced styling
    html = html
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-teal-500 pl-6 py-3 my-6 bg-teal-50 dark:bg-teal-900/20 italic text-teal-700 dark:text-teal-300 rounded-r-lg">$1</blockquote>')
    
    // Enhanced list handling
    html = html
      // Unordered lists
      .replace(/^[-*+] (.*$)/gim, '<li class="text-teal-700 dark:text-teal-300 mb-2">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="text-teal-700 dark:text-teal-300 mb-2">$1</li>')
    
    // Wrap list items in proper list tags
    html = html
      .replace(/(<li.*<\/li>)/gs, '<ul class="list-disc list-inside mb-6 space-y-2 ml-6">$1</ul>')
    
    // Enhanced code blocks with syntax highlighting
    html = html
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
        const language = lang || 'text'
        return `<pre class="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg overflow-x-auto mb-6 border border-teal-200 dark:border-teal-700"><code class="language-${language} text-sm text-teal-800 dark:text-teal-200">${code}</code></pre>`
      })
    
    // Enhanced table handling
    html = html
      .replace(/\|(.+)\|\n\|([-:\s|]+)\|\n((?:\|.+\|\n?)+)/g, (_match, headerRow, _separatorRow, dataRows) => {
        const headers = headerRow.split('|').map((h: string) => h.trim()).filter(Boolean)
        const rows = dataRows.trim().split('\n').map((row: string) => 
          row.split('|').map((cell: string) => cell.trim()).filter(Boolean)
        )
        
        let tableHTML = '<div class="overflow-x-auto my-8"><table class="w-full caption-bottom text-sm border-collapse bg-white dark:bg-teal-900/10 border border-teal-200 dark:border-teal-700 rounded-xl overflow-hidden shadow-sm">'
        
        // Header
        if (headers.length > 0) {
          tableHTML += '<thead><tr>'
          headers.forEach((header: string) => {
            tableHTML += `<th class="h-14 px-5 text-left align-middle font-semibold text-teal-900 dark:text-teal-100 border-r border-teal-200 dark:border-teal-700 last:border-r-0 bg-teal-50 dark:bg-teal-900/30 text-sm tracking-wide">${header}</th>`
          })
          tableHTML += '</tr></thead>'
        }
        
        // Body
        tableHTML += '<tbody>'
        rows.forEach((row: string[]) => {
          tableHTML += '<tr class="border-b border-teal-100 dark:border-teal-700 last:border-b-0 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 ease-in-out">'
          row.forEach((cell: string, index: number) => {
            const isLast = index === row.length - 1
            tableHTML += `<td class="px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 dark:border-teal-700 ${isLast ? 'last:border-r-0' : ''} text-teal-700 dark:text-teal-300 text-sm leading-relaxed">${cell}</td>`
          })
          tableHTML += '</tr>'
        })
        tableHTML += '</tbody></table></div>'
        
        return tableHTML
      })
    
    // Enhanced chart handling
    html = html
      .replace(/```chart\s+(\w+)\s*\n([\s\S]*?)```/g, (_match, chartType, chartData) => {
        try {
          const data = JSON.parse(chartData.trim())
          return `<div data-type="chart" data-chart-type="${chartType}" data-chart-data="${encodeURIComponent(JSON.stringify(data))}" class="my-8 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
            <div class="text-center text-teal-700 dark:text-teal-300 mb-4">
              <strong>Chart: ${chartType}</strong>
            </div>
            <div class="chart-placeholder text-center text-teal-600 dark:text-teal-400">
              Chart will be rendered here
            </div>
          </div>`
        } catch (error) {
          logger.error('Invalid chart data:', error)
          return `<div class="my-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            Invalid chart data
          </div>`
        }
      })
    
    // Paragraphs with enhanced styling
    html = html
      .replace(/^([^<].*)$/gm, '<p class="mb-4 text-teal-700 dark:text-teal-300 leading-relaxed">$1</p>')
    
    // Clean up empty paragraphs and excessive spacing
    html = html
      .replace(/<p class="mb-4 text-teal-700 dark:text-teal-300 leading-relaxed"><\/p>/g, '')
      .replace(/<p class="mb-4 text-teal-700 dark:text-teal-300 leading-relaxed">\s*<\/p>/g, '')
      .replace(/\n\s*\n/g, '\n')
    
    // Final cleanup
    html = html
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
    
    return html
    
  } catch (error) {
    logger.error('Error converting markdown to HTML:', error)
    return markdown
  }
}

/**
 * Enhanced HTML to markdown converter with support for tables, charts, and advanced features
 */
export const enhancedHtmlToMarkdown = (html: string): string => {
  if (!html) return ''
  
  try {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    let markdown = ''
    
    // Process each child node
    for (const child of Array.from(tempDiv.children)) {
      markdown += processNode(child)
    }
    
    // Clean up the markdown
    markdown = markdown
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
    
    return markdown
    
  } catch (error) {
    logger.error('Error converting HTML to markdown:', error)
    return html
  }
}

/**
 * Process individual DOM nodes and convert them to markdown
 */
function processNode(node: Element): string {
  const tagName = node.tagName.toLowerCase()
  const textContent = node.textContent || ''
  
  // Handle different element types
  switch (tagName) {
    case 'h1':
      return `# ${textContent.trim()}\n\n`
    
    case 'h2':
      return `## ${textContent.trim()}\n\n`
    
    case 'h3':
      return `### ${textContent.trim()}\n\n`
    
    case 'h4':
      return `#### ${textContent.trim()}\n\n`
    
    case 'h5':
      return `##### ${textContent.trim()}\n\n`
    
    case 'h6':
      return `###### ${textContent.trim()}\n\n`
    
    case 'p':
      return processParagraph(node)
    
    case 'strong':
    case 'b':
      return `**${textContent.trim()}**`
    
    case 'em':
    case 'i':
      return `*${textContent.trim()}*`
    
    case 'code':
      if (node.parentElement?.tagName === 'PRE') {
        return textContent
      }
      return `\`${textContent.trim()}\``
    
    case 'pre': {
      const codeElement = node.querySelector('code')
      const language = codeElement?.className?.replace('language-', '') || ''
      const code = codeElement?.textContent || textContent
      return `\`\`\`${language}\n${code}\n\`\`\`\n\n`
    }
    
    case 'blockquote':
      return `> ${textContent.trim()}\n\n`
    
    case 'ul':
      return processUnorderedList(node)
    
    case 'ol':
      return processOrderedList(node)
    
    case 'li':
      return `- ${textContent.trim()}\n`
    
    case 'table':
      return processTable(node)
    
    case 'div':
      // Check if it's a chart
      if (node.getAttribute('data-type') === 'chart') {
        return processChart(node)
      }
      // Check if it's a sortable table
      if (node.getAttribute('data-type') === 'sortable-table') {
        return processSortableTable(node)
      }
      // Regular div content
      return processDivContent(node)
    
    case 'hr':
      return '---\n\n'
    
    case 'a': {
      const href = node.getAttribute('href') || ''
      return `[${textContent.trim()}](${href})`
    }
    
    case 'br':
      return '\n'
    
    default:
      // For unknown tags, try to extract text content
      return textContent + '\n'
  }
}

/**
 * Process paragraph content
 */
function processParagraph(node: Element): string {
  let content = ''
  
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      content += child.textContent || ''
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      content += processNode(child as Element)
    }
  }
  
  return `${content.trim()}\n\n`
}

/**
 * Process unordered list content
 */
function processUnorderedList(node: Element): string {
  let content = ''
  
  for (const child of Array.from(node.children)) {
    if (child.tagName.toLowerCase() === 'li') {
      content += processNode(child)
    }
  }
  
  return content + '\n'
}

/**
 * Process ordered list content
 */
function processOrderedList(node: Element): string {
  let content = ''
  let counter = 1
  
  for (const child of Array.from(node.children)) {
    if (child.tagName.toLowerCase() === 'li') {
      content += `${counter}. ${(child.textContent || '').trim()}\n`
      counter++
    }
  }
  
  return content + '\n'
}

/**
 * Process table content
 */
function processTable(node: Element): string {
  const headers: string[] = []
  const rows: string[][] = []
  
  // Extract headers
  const headerCells = node.querySelectorAll('thead th, th')
  headerCells.forEach(cell => {
    headers.push(cell.textContent?.trim() || '')
  })
  
  // Extract data rows
  const dataRows = node.querySelectorAll('tbody tr, tr')
  dataRows.forEach(row => {
    const cells = row.querySelectorAll('td')
    if (cells.length > 0) {
      const rowData: string[] = []
      cells.forEach(cell => {
        rowData.push(cell.textContent?.trim() || '')
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
  
  return markdown + '\n'
}

/**
 * Process chart content
 */
function processChart(node: Element): string {
  const chartType = node.getAttribute('data-chart-type') || 'chart'
  const chartData = node.getAttribute('data-chart-data') || '[]'
  
  try {
    // Decode the chart data
    const decodedData = decodeURIComponent(chartData)
    return `\`\`\`chart ${chartType}\n${decodedData}\n\`\`\`\n\n`
  } catch (error) {
    logger.error('Failed to decode chart data:', error)
    return `\`\`\`chart ${chartType}\n${chartData}\n\`\`\`\n\n`
  }
}

/**
 * Process sortable table content
 */
function processSortableTable(node: Element): string {
  const content = node.getAttribute('data-content') || ''
  if (content) {
    return content + '\n\n'
  }
  return ''
}

/**
 * Process div content
 */
function processDivContent(node: Element): string {
  let content = ''
  
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      content += child.textContent || ''
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      content += processNode(child as Element)
    }
  }
  
  return content.trim() ? `${content.trim()}\n\n` : ''
}

/**
 * Convert markdown to HTML (alias for backward compatibility)
 */
export const markdownToHtml = enhancedMarkdownToHtml

/**
 * Convert HTML to markdown (alias for backward compatibility)
 */
export const htmlToMarkdown = enhancedHtmlToMarkdown