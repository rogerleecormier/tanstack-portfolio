import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { common, createLowlight } from 'lowlight'
import { Chart } from '@/extensions/ChartExtension'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Clipboard,
  Upload,
  Square,
  BarChart3,
  TrendingUp,
  PieChart,
  ChevronDown,
  Trash2,
  Table as TableIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { logger } from '@/utils/logger'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

interface MarkdownEditorProps {
  initialContent?: string
  onContentChange?: (html: string, markdown: string) => void
  showPreview?: boolean
  showToolbar?: boolean
  className?: string
  minHeight?: string
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
  onContentChange,
  showPreview = false,
  showToolbar = true,
  className = '',
  minHeight = '600px'
}) => {
  const [showPreviewState, setShowPreviewState] = useState(showPreview)
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [showPasteDialog, setShowPasteDialog] = useState(false)
  const [pasteMarkdown, setPasteMarkdown] = useState('')
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [chartType, setChartType] = useState('barchart')
  const [chartData, setChartData] = useState('')
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('')
  const [chartWidth, setChartWidth] = useState('100%')
  const [chartHeight, setChartHeight] = useState('320px')
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [tableWithHeader, setTableWithHeader] = useState(true)
  const [showTableContextMenu, setShowTableContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  
  // Track if we're currently setting content to prevent infinite loops
  const isSettingContent = useRef(false)
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mt-2',
          },
        },
      }),
      Highlight,
             CodeBlockLowlight.configure({
         lowlight,
         defaultLanguage: 'javascript',
         HTMLAttributes: {
           class: 'code-block',
         },
       }),
       Table.configure({
         resizable: true,
         HTMLAttributes: {
           class: 'border-collapse border border-gray-300 w-full my-4 table-auto',
         },
       }),
       TableRow.configure({
         HTMLAttributes: {
           class: 'border-b border-gray-300 hover:bg-gray-50',
         },
       }),
       TableHeader.configure({
         HTMLAttributes: {
           class: 'border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left text-gray-900',
         },
       }),
       TableCell.configure({
         HTMLAttributes: {
           class: 'border border-gray-300 px-4 py-2 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
         },
       }),
       Chart,
    ],
    editorProps: {
      attributes: {
        class: `focus:outline-none border border-teal-200 focus:border-teal-400 rounded-lg p-6 min-h-[${minHeight}] transition-colors duration-200 bg-white ${className}`,
      },
      handleKeyDown: (_view, event) => {
        // Ctrl/Cmd + T to insert table
        if ((event.ctrlKey || event.metaKey) && event.key === 't') {
          event.preventDefault()
          setShowTableDialog(true)
          return true
        }
        return false
      },
    },
    content: initialContent || `
      <h1>Start Writing</h1>
      <p>Begin your content here...</p>
    `,
    onUpdate: ({ editor }) => {
      // Skip update if we're currently setting content to prevent infinite loops
      if (isSettingContent.current) {
        return
      }
      
      // Convert HTML to markdown-like format
      const content = editor.getHTML()
      const markdown = htmlToMarkdown(content)
      setMarkdownOutput(markdown)
      
      // Call the callback if provided
      if (onContentChange) {
        onContentChange(content, markdown)
      }
    },
  })

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent) {
      const currentContent = editor.getHTML()
      const newHtml = markdownToHtml(initialContent)
      
      // Only update if the content is actually different
      if (currentContent !== newHtml) {
        logger.debug('Setting editor content with:', initialContent)
        logger.debug('Converted to HTML:', newHtml)
        
        // Set flag to prevent onUpdate callback during content setting
        isSettingContent.current = true
        
        editor.commands.setContent(newHtml)
        
        // Also update the markdown output
        const markdown = htmlToMarkdown(newHtml)
        setMarkdownOutput(markdown)
        
        // Reset flag after a short delay to allow editor to settle
        setTimeout(() => {
          isSettingContent.current = false
        }, 100)
        
        logger.debug('Editor content updated successfully')
      }
    }
  }, [editor, initialContent])

  const htmlToMarkdown = (html: string): string => {
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

  const markdownToHtml = (markdown: string): string => {
    logger.debug('Converting markdown to HTML:', markdown)
    
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
         logger.debug('Table detection: Found line with |:', line)
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
         
         logger.debug('Table rows found:', tableRows)
         
         if (tableRows.length >= 2) {
           // Parse table structure
           const headerRow = tableRows[0]
           const separatorRow = tableRows[1]
           const dataRows = tableRows.slice(2)
           
           logger.debug('Header row:', headerRow)
           logger.debug('Separator row:', separatorRow)
           logger.debug('Data rows:', dataRows)
           
           // Parse header cells - split by | and filter out empty cells
           const headerCells = headerRow.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
           
           logger.debug('Header cells:', headerCells)
           
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
           
           logger.debug('Generated table HTML:', tableHtml)
           logger.debug('Adding table to result array')
           result.push(tableHtml)
           logger.debug('Current result array:', result)
           i = j - 1 // Skip to end of table
           continue
         } else {
           logger.debug('Not enough table rows found, treating as regular text')
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
           const language = line.substring(3).trim()
           const code = codeContent.join('\n')
           if (language) {
             result.push(`<pre><code class="language-${language}">${code}</code></pre>`)
           } else {
             result.push(`<pre><code>${code}</code></pre>`)
           }
           i = j // Skip to end of code block
           continue
         }
       }
      
      // If we get here, it's a regular paragraph
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`)
        currentList = []
        currentListType = null
      }
      
      // Convert markdown to HTML for paragraph content
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
    
         const finalResult = result.join('\n')
       .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
       .trim()
     
     logger.debug('Final HTML result:', finalResult)
     logger.debug('Result array before joining:', result)
     logger.debug('Final result length:', finalResult.length)
     return finalResult
  }

  const handlePasteMarkdown = useCallback(() => {
    if (pasteMarkdown.trim() && editor) {
      const html = markdownToHtml(pasteMarkdown)
      editor.commands.setContent(html)
      setPasteMarkdown('')
      setShowPasteDialog(false)
    }
  }, [pasteMarkdown, editor])

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPasteMarkdown(text)
      setShowPasteDialog(true)
    } catch (error) {
      logger.error('Failed to read clipboard:', error)
      // Fallback: just open the dialog
      setShowPasteDialog(true)
    }
  }, [])

  const handleClearEditor = useCallback(() => {
    if (editor) {
      editor.commands.setContent(`
        <h1>Start Writing</h1>
        <p>Begin your content here...</p>
      `)
      setMarkdownOutput('')
    }
  }, [editor])

  const handleInsertChart = useCallback(() => {
    if (chartData.trim() && editor) {
      try {
        // Insert the chart using the Chart extension
        editor.commands.setChart({
          chartType,
          data: chartData,
          xAxisLabel,
          yAxisLabel,
          width: chartWidth,
          height: chartHeight,
        })
        
        setChartData('')
        setXAxisLabel('')
        setYAxisLabel('')
        setChartWidth('100%')
        setChartHeight('320px')
        setShowChartDialog(false)
      } catch (error) {
        logger.error('Error inserting chart:', error)
      }
    }
  }, [chartData, chartType, xAxisLabel, yAxisLabel, chartWidth, chartHeight, editor])

  const handleInsertTable = useCallback(() => {
    if (editor) {
      try {
        // Insert table at current cursor position
        editor.chain().focus().insertTable({ 
          rows: tableRows, 
          cols: tableCols, 
          withHeaderRow: tableWithHeader 
        }).run()
        
        // Add some default content to make it clear the table is editable
        if (tableWithHeader) {
          // Add placeholder text to header cells
          const headerCells = document.querySelectorAll('.ProseMirror table thead th')
          Array.from(headerCells).forEach((cell: Element, index: number) => {
            if (!cell.textContent?.trim()) {
              cell.textContent = `Header ${index + 1}`
            }
          })
        }
        
        // Add placeholder text to first few data cells
        const dataCells = document.querySelectorAll('.ProseMirror table tbody td')
        Array.from(dataCells).slice(0, Math.min(3, dataCells.length)).forEach((cell: Element, index: number) => {
          if (!cell.textContent?.trim()) {
            cell.textContent = `Cell ${index + 1}`
          }
        })
        
        setShowTableDialog(false)
        
        // Focus the first editable cell
        setTimeout(() => {
          const firstCell = document.querySelector('.ProseMirror table td, .ProseMirror table th')
          if (firstCell instanceof HTMLElement) {
            firstCell.focus()
          }
        }, 100)
      } catch (error) {
        logger.error('Error inserting table:', error)
        alert('Error inserting table. Please try again.')
      }
    }
  }, [editor, tableRows, tableCols, tableWithHeader])

  const handleAddRowBefore = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowBefore().run()
    }
  }, [editor])

  const handleAddRowAfter = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowAfter().run()
    }
  }, [editor])

  const handleAddColumnBefore = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnBefore().run()
    }
  }, [editor])

  const handleAddColumnAfter = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnAfter().run()
    }
  }, [editor])

  const handleDeleteRow = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteRow().run()
    }
  }, [editor])

  const handleDeleteColumn = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteColumn().run()
    }
  }, [editor])

  const handleDeleteTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteTable().run()
    }
  }, [editor])

  const isTableActive = useCallback(() => {
    return editor?.isActive('table') || false
  }, [editor])

  const handleTableContextMenu = useCallback((event: React.MouseEvent) => {
    if (isTableActive()) {
      event.preventDefault()
      setContextMenuPosition({ x: event.clientX, y: event.clientY })
      setShowTableContextMenu(true)
    }
  }, [isTableActive])

  const getChartTemplate = (type: string): string => {
    switch (type) {
      case 'barchart':
        return `[
  { "date": "Category 1", "value": 100 },
  { "date": "Category 2", "value": 200 },
  { "date": "Category 3", "value": 150 }
]`
      case 'linechart':
        return `[
  { "date": "Jan", "Series 1": 100, "Series 2": 80 },
  { "date": "Feb", "Series 1": 120, "Series 2": 90 },
  { "date": "Mar", "Series 1": 140, "Series 2": 110 }
]`
      case 'scatterplot':
        return `[
  { "x": 10, "y": 20 },
  { "x": 15, "y": 25 },
  { "x": 20, "y": 30 }
]`
      case 'histogram':
        return `[
  { "date": "0-10", "value": 5 },
  { "date": "10-20", "value": 12 },
  { "date": "20-30", "value": 8 }
]`
      default:
        return `[
  { "date": "Category 1", "value": 100 },
  { "date": "Category 2", "value": 200 }
]`
    }
  }

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void, 
    isActive?: boolean, 
    children: React.ReactNode, 
    title: string 
  }) => (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      className={isActive ? "bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200" : "hover:bg-teal-50 hover:text-teal-700"}
      title={title}
    >
      {children}
    </Button>
  )

  return (
    <div className="w-full">
      {showToolbar && (
        <Card className="border border-teal-200 shadow-sm mb-4">
          <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-200">
            {/* Row 1: Main formatting tools */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  title="Undo"
                >
                  <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  title="Redo"
                >
                  <Redo className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  isActive={editor.isActive('heading', { level: 1 })}
                  title="Heading 1"
                >
                  <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  isActive={editor.isActive('heading', { level: 2 })}
                  title="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  isActive={editor.isActive('heading', { level: 3 })}
                  title="Heading 3"
                >
                  <Heading3 className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive('bold')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  isActive={editor.isActive('code')}
                  title="Inline Code"
                >
                  <Code className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  isActive={editor.isActive('bulletList')}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  isActive={editor.isActive('blockquote')}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </ToolbarButton>
                                                 <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  isActive={editor.isActive('codeBlock')}
                  title="Code Block"
                >
                  <Square className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => setShowChartDialog(true)}
                  title="Insert Chart"
                >
                  <BarChart3 className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <div className="flex items-center gap-2 ml-auto">

                
                <ToolbarButton
                  onClick={() => setShowPreviewState(!showPreviewState)}
                  title={showPreviewState ? "Hide Preview" : "Show Preview"}
                >
                  {showPreviewState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleClearEditor}
                  title="Clear Editor"
                >
                  <Trash2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={handlePasteFromClipboard}
                  title="Paste Markdown from Clipboard"
                >
                  <Clipboard className="h-4 w-4" />
                </ToolbarButton>
              </div>
            </div>

            {/* Row 2: Table tools */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => setShowTableDialog(true)}
                  title="Insert Table (Ctrl/Cmd + T)"
                >
                  <TableIcon className="h-4 w-4" />
                </ToolbarButton>
              </div>

              {/* Table Management Buttons - Only show when table is active */}
              {isTableActive() && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-1">
                    <ToolbarButton
                      onClick={handleAddRowBefore}
                      title="Add Row Before"
                    >
                      <div className="w-4 h-4 border border-current rounded-sm">
                        <div className="w-2 h-1 border border-current rounded-sm mx-auto mt-1"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={handleAddRowAfter}
                      title="Add Row After"
                    >
                      <div className="w-4 h-4 border border-current rounded-sm">
                        <div className="w-2 h-1 border border-current rounded-sm mx-auto mt-2"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={handleAddColumnBefore}
                      title="Add Column Before"
                    >
                      <div className="w-4 h-4 border border-current rounded-sm">
                        <div className="w-1 h-2 border border-current rounded-sm mt-1 ml-1"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={handleAddColumnAfter}
                      title="Add Column After"
                    >
                      <div className="w-4 h-4 border border-current rounded-sm">
                        <div className="w-1 h-2 border border-current rounded-sm mt-1 ml-2"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={handleDeleteRow}
                      title="Delete Row"
                    >
                      <div className="w-4 h-4 border border-current rounded-sm">
                        <div className="w-2 h-1 border border-current rounded-sm mx-auto mt-1.5 bg-red-200"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={handleDeleteColumn}
                      title="Delete Column"
                    >
                      <div className="w-4 h-4 border border-current rounded-sm">
                        <div className="w-1 h-2 border border-current rounded-sm mt-1 ml-1.5 bg-red-200"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={handleDeleteTable}
                      title="Delete Table"
                    >
                      <div className="w-4 h-4 border border-current rounded-sm">
                        <div className="w-2 h-2 border border-current rounded-sm mx-auto mt-0.5 bg-red-200"></div>
                      </div>
                    </ToolbarButton>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="flex">
        {/* Editor */}
        <div className={`${showPreviewState ? 'w-1/2' : 'w-full'}`}>
          <div className="prose prose-sm max-w-none">
            <EditorContent 
              editor={editor} 
              className="min-h-[600px]"
              onContextMenu={handleTableContextMenu}
            />
            <style>{`
              .ProseMirror table {
                border-collapse: collapse;
                border: 1px solid #d1d5db;
                width: 100%;
                margin: 1rem 0;
                table-layout: auto;
              }
              
              .ProseMirror table td,
              .ProseMirror table th {
                border: 1px solid #d1d5db;
                padding: 0.5rem;
                min-width: 100px;
                vertical-align: top;
              }
              
              .ProseMirror table th {
                background-color: #f3f4f6;
                font-weight: 600;
                text-align: left;
                color: #111827;
              }
              
              .ProseMirror table tr:hover {
                background-color: #f9fafb;
              }
              
              .ProseMirror table td:focus,
              .ProseMirror table th:focus {
                outline: none;
                ring: 2px;
                ring-color: #14b8a6;
                border-color: transparent;
              }
              
              .ProseMirror table td:empty::before {
                content: 'Click to edit';
                color: #9ca3af;
                font-style: italic;
              }
              
              .ProseMirror table td:focus:empty::before {
                content: '';
              }
              
              .ProseMirror table td:focus,
              .ProseMirror table th:focus {
                background-color: #f0f9ff;
                border-color: #14b8a6;
              }
              
              .ProseMirror table td:hover,
              .ProseMirror table th:hover {
                background-color: #f8fafc;
              }
              
              .ProseMirror table {
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              }
            `}</style>
          </div>
        </div>

        {/* Preview */}
        {showPreviewState && (
          <>
            <Separator orientation="vertical" className="bg-teal-200" />
            <div className="w-1/2 p-6 bg-gradient-to-br from-teal-50 to-blue-50">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-teal-900 mb-2">Markdown Output</h2>
                <Card className="border border-teal-200 bg-white">
                  <CardContent className="p-4">
                    <pre className="font-mono text-sm overflow-auto max-h-[600px] whitespace-pre-wrap text-gray-700 bg-gray-50 p-3 rounded border">{markdownOutput}</pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Paste Markdown Dialog */}
      <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-teal-900">Paste Markdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="markdown-input" className="block text-sm font-medium text-teal-700 mb-2">
                Paste your markdown content below:
              </label>
              <Textarea
                id="markdown-input"
                value={pasteMarkdown}
                onChange={(e) => setPasteMarkdown(e.target.value)}
                placeholder="Paste your markdown content here..."
                className="min-h-[200px] font-mono text-sm border-teal-200 focus:border-teal-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasteDialog(false)
                  setPasteMarkdown('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasteMarkdown}
                disabled={!pasteMarkdown.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Convert & Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Context Menu */}
      <Dialog open={showTableContextMenu} onOpenChange={setShowTableContextMenu}>
        <DialogContent 
          className="max-w-xs p-0" 
          style={{ 
            position: 'fixed', 
            top: contextMenuPosition.y, 
            left: contextMenuPosition.x,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddRowBefore}
              className="w-full justify-start text-sm"
            >
              <div className="w-4 h-4 border border-current rounded-sm mr-2">
                <div className="w-2 h-1 border border-current rounded-sm mx-auto mt-1"></div>
              </div>
              Add Row Before
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddRowAfter}
              className="w-full justify-start text-sm"
            >
              <div className="w-4 h-4 border border-current rounded-sm mr-2">
                <div className="w-2 h-1 border border-current rounded-sm mx-auto mt-2"></div>
              </div>
              Add Row After
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddColumnBefore}
              className="w-full justify-start text-sm"
            >
              <div className="w-4 h-4 border border-current rounded-sm mr-2">
                <div className="w-1 h-2 border border-current rounded-sm mt-1 ml-1"></div>
              </div>
              Add Column Before
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddColumnAfter}
              className="w-full justify-start text-sm"
            >
              <div className="w-4 h-4 border border-current rounded-sm mr-2">
                <div className="w-1 h-2 border border-current rounded-sm mt-1 ml-2"></div>
              </div>
              Add Column After
            </Button>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteRow}
              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <div className="w-4 h-4 border border-current rounded-sm mr-2">
                <div className="w-2 h-1 border border-current rounded-sm mx-auto mt-1.5 bg-red-200"></div>
              </div>
              Delete Row
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteColumn}
              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <div className="w-4 h-4 border border-current rounded-sm mr-2">
                <div className="w-1 h-2 border border-current rounded-sm mt-1 ml-1.5 bg-red-200"></div>
              </div>
              Delete Column
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteTable}
              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <div className="w-4 h-4 border border-current rounded-sm mr-2">
                <div className="w-2 h-2 border border-current rounded-sm mx-auto mt-0.5 bg-red-200"></div>
              </div>
              Delete Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Insertion Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-teal-900">Insert Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="table-rows" className="text-sm font-medium text-teal-700">
                  Number of Rows
                </Label>
                <input
                  id="table-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <Label htmlFor="table-cols" className="text-sm font-medium text-teal-700">
                  Number of Columns
                </Label>
                <input
                  id="table-cols"
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="table-header"
                checked={tableWithHeader}
                onChange={(e) => setTableWithHeader(e.target.checked)}
                className="text-teal-600 focus:ring-teal-500"
              />
              <Label htmlFor="table-header" className="text-sm font-medium text-teal-700">
                Include header row
              </Label>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <p className="text-sm text-teal-800">
                <strong>Tip:</strong> After inserting the table, you can click into any cell to edit content. 
                Use Tab to navigate between cells and Enter to create new rows.
              </p>
              <div className="mt-2 text-xs text-teal-700 space-y-1">
                <p><strong>Keyboard Shortcuts:</strong></p>
                <p>• <kbd className="px-1 py-0.5 bg-teal-100 rounded text-xs">Tab</kbd> - Navigate between cells</p>
                <p>• <kbd className="px-1 py-0.5 bg-teal-100 rounded text-xs">Enter</kbd> - Create new row</p>
                <p>• <kbd className="px-1 py-0.5 bg-teal-100 rounded text-xs">Ctrl/Cmd + T</kbd> - Insert table</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTableDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInsertTable}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Insert Table
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chart Insertion Dialog */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-teal-900">Insert Chart</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="chart-type" className="text-sm font-medium text-teal-700">
                  Chart Type
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="mt-1 w-full justify-between border-teal-200 focus:border-teal-400"
                    >
                      <div className="flex items-center gap-2">
                        {chartType === 'barchart' && <BarChart3 className="h-4 w-4" />}
                        {chartType === 'linechart' && <TrendingUp className="h-4 w-4" />}
                        {chartType === 'scatterplot' && <PieChart className="h-4 w-4" />}
                        {chartType === 'histogram' && <BarChart3 className="h-4 w-4" />}
                        {chartType === 'barchart' && 'Bar Chart'}
                        {chartType === 'linechart' && 'Line Chart'}
                        {chartType === 'scatterplot' && 'Scatter Plot'}
                        {chartType === 'histogram' && 'Histogram'}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => {
                      setChartType('barchart')
                      setChartData(getChartTemplate('barchart'))
                    }}>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar Chart
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setChartType('linechart')
                      setChartData(getChartTemplate('linechart'))
                    }}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Line Chart
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setChartType('scatterplot')
                      setChartData(getChartTemplate('scatterplot'))
                    }}>
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Scatter Plot
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setChartType('histogram')
                      setChartData(getChartTemplate('histogram'))
                    }}>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Histogram
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="x-axis-label" className="text-sm font-medium text-teal-700">
                  X-Axis Label (Optional)
                </label>
                <input
                  id="x-axis-label"
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder="e.g., Categories, Time, Values..."
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label htmlFor="y-axis-label" className="text-sm font-medium text-teal-700">
                  Y-Axis Label (Optional)
                </label>
                <input
                  id="y-axis-label"
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder="e.g., Count, Percentage, Amount..."
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="chart-width" className="text-sm font-medium text-teal-700">
                  Chart Width
                </label>
                <input
                  id="chart-width"
                  type="text"
                  value={chartWidth}
                  onChange={(e) => setChartWidth(e.target.value)}
                  placeholder="e.g., 100%, 500px, 80%..."
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label htmlFor="chart-height" className="text-sm font-medium text-teal-700">
                  Chart Height
                </label>
                <input
                  id="chart-height"
                  type="text"
                  value={chartHeight}
                  onChange={(e) => setChartHeight(e.target.value)}
                  placeholder="e.g., 320px, 400px, 250px..."
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="chart-data" className="block text-sm font-medium text-teal-700 mb-2">
                Chart Data (JSON Format)
              </Label>
              <Textarea
                id="chart-data"
                value={chartData}
                onChange={(e) => setChartData(e.target.value)}
                placeholder="Enter chart data in JSON format..."
                className="min-h-[300px] font-mono text-sm border-teal-200 focus:border-teal-400"
              />
              <p className="text-xs text-teal-600 mt-1">
                Use the exact format from your project analysis page. Data should be valid JSON.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChartDialog(false)
                  setChartData('')
                  setXAxisLabel('')
                  setYAxisLabel('')
                  setChartWidth('100%')
                  setChartHeight('320px')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInsertChart}
                disabled={!chartData.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Insert Chart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MarkdownEditor
