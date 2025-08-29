import { TableData } from '@/components/SortableTable'

/**
 * Parses markdown table syntax into structured data
 * @param markdownTable - The markdown table string
 * @returns Parsed table data or null if invalid
 */
export function parseMarkdownTable(markdownTable: string): TableData | null {
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
 * Converts HTML table to markdown format
 * @param htmlTable - The HTML table string
 * @returns Markdown table string
 */
export function htmlTableToMarkdown(htmlTable: string): string {
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
      headers.push(cell.textContent?.trim() || '')
    })
    
    // Extract data rows
    const dataRows = table.querySelectorAll('tbody tr, tr')
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
    
    return markdown.trim()
  } catch (error) {
    console.error('Error converting HTML table to markdown:', error)
    return ''
  }
}

/**
 * Checks if a string contains markdown table syntax
 * @param text - The text to check
 * @returns True if the text contains a markdown table
 */
export function containsMarkdownTable(text: string): boolean {
  const lines = text.split('\n')
  let inTable = false
  let hasHeader = false
  let hasSeparator = false
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.includes('|')) {
      if (!inTable) {
        inTable = true
        hasHeader = true
      } else if (hasHeader && !hasSeparator) {
        // Check if this is a separator line (contains only dashes, pipes, and spaces)
        if (/^[\s|\-:]+$/.test(trimmed)) {
          hasSeparator = true
        }
      }
    } else if (inTable && trimmed === '') {
      // Empty line might end the table
      if (hasHeader && hasSeparator) {
        return true
      }
      inTable = false
      hasHeader = false
      hasSeparator = false
    }
  }
  
  return hasHeader && hasSeparator
}

/**
 * Extracts all markdown table blocks from a markdown string
 * @param markdown - The markdown content
 * @returns Array of table markdown strings
 */
export function extractTableBlocks(markdown: string): string[] {
  const lines = markdown.split('\n')
  const tableBlocks: string[] = []
  let currentTable: string[] = []
  let inTable = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    if (trimmed.includes('|')) {
      if (!inTable) {
        inTable = true
        currentTable = [line]
      } else {
        currentTable.push(line)
      }
    } else if (inTable) {
      if (trimmed === '') {
        // Empty line might end the table
        if (currentTable.length >= 3) { // Need at least header, separator, and one data row
          tableBlocks.push(currentTable.join('\n'))
        }
        inTable = false
        currentTable = []
      } else {
        // Non-empty line that's not a table row - end the table
        if (currentTable.length >= 3) {
          tableBlocks.push(currentTable.join('\n'))
        }
        inTable = false
        currentTable = []
      }
    }
  }
  
  // Don't forget the last table if we're still in one
  if (inTable && currentTable.length >= 3) {
    tableBlocks.push(currentTable.join('\n'))
  }
  
  return tableBlocks
}
