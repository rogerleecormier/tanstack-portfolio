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
import { SortableTableExtension } from '@/extensions/SortableTableExtension'

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
  Copy,
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
import { markdownToHtml, htmlToMarkdown } from '@/utils/markdownConverter'


// Create lowlight instance with common languages
const lowlight = createLowlight(common)

// Remove the CustomTableExtension since it makes tables non-editable
// Instead, we'll use the standard Table extension with unified styling

// Custom table header extension to match UnifiedTableRenderer styling
const CustomTableHeader = TableHeader.extend({
  addGlobalAttributes() {
    return [
      {
        types: ['tableHeader'],
        attributes: {
          class: {
            default: 'h-14 px-5 text-left align-middle font-semibold text-teal-900 border-r border-teal-200 last:border-r-0 bg-teal-50 text-sm tracking-wide',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {
                  class: 'h-14 px-5 text-left align-middle font-semibold text-teal-900 border-r border-teal-200 last:border-r-0 bg-teal-50 text-sm tracking-wide'
                }
              }
              return {
                class: attributes.class
              }
            }
          }
        }
      }
    ]
  }
})

// Custom table cell extension to match UnifiedTableRenderer styling
const CustomTableCell = TableCell.extend({
  addGlobalAttributes() {
    return [
      {
        types: ['tableCell'],
        attributes: {
          class: {
            default: 'px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 last:border-r-0 text-teal-700 text-sm leading-relaxed',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {
                  class: 'px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 last:border-r-0 text-teal-700 text-sm leading-relaxed'
                }
              }
              return {
                class: attributes.class
              }
            }
          }
        }
      }
    ]
  }
})

interface MarkdownEditorProps {
  initialContent?: string
  onContentChange?: (html: string, markdown: string) => void
  showPreview?: boolean
  showToolbar?: boolean
  className?: string
  minHeight?: string
  contentType?: 'blog' | 'portfolio' | 'project'
  onDirectoryChange?: (directory: string) => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
  onContentChange,
  showPreview = false,
  showToolbar = true,
  className = '',
  minHeight = '600px',
  contentType,
  onDirectoryChange
}) => {
  const [showPreviewState, setShowPreviewState] = useState(showPreview)
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [showPasteDialog, setShowPasteDialog] = useState(false)
  const [pasteMarkdown, setPasteMarkdown] = useState('')
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [chartType, setChartType] = useState('barchart')
  const [chartData, setChartData] = useState('')
  const [chartTitle, setChartTitle] = useState('')

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
  const [copySuccess, setCopySuccess] = useState(false)
  const [chartValidationError, setChartValidationError] = useState<string | null>(null)
  
  // Track if we're currently setting content to prevent infinite loops
  const isSettingContent = useRef(false)
  
  // Function to get default directory based on content type
  const getDefaultDirectory = (type: string) => {
    switch (type) {
      case 'blog': return 'src/content/blog'
      case 'portfolio': return 'src/content/portfolio'
      case 'project': return 'src/content/projects'
      default: return 'src/content'
    }
  }
  
  // Update save directory when content type changes
  useEffect(() => {
    if (contentType && onDirectoryChange) {
      const defaultDir = getDefaultDirectory(contentType)
      onDirectoryChange(defaultDir)
    }
  }, [contentType, onDirectoryChange])
  
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
            class: 'my-6 w-full caption-bottom text-sm border-collapse bg-white border border-teal-200 rounded-xl overflow-hidden shadow-sm',
          },
        }),
        CustomTableHeader,
        CustomTableCell,
        TableRow.configure({
          HTMLAttributes: {
            class: 'border-b border-teal-100 last:border-b-0 hover:bg-teal-50 hover:shadow-sm transition-all duration-200 ease-in-out',
          },
        }),
       SortableTableExtension.configure({
         HTMLAttributes: {
           class: 'my-4',
         },
       }),
       Chart,
    ],
    editorProps: {
      attributes: {
        class: `focus:outline-none p-6 min-h-[${minHeight}] transition-colors duration-200 bg-white ${className}`,
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
      // Prevent automatic HTML entity encoding
      transformPastedHTML: (html) => {
        // Decode any HTML entities that might be in pasted content
        return html
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&apos;/g, "'")
      },
    },
    content: initialContent || '<p>Start Writing</p>',
         onCreate: () => {
       // Don't force cursor position - let user maintain their position naturally
     },
               onUpdate: () => {
        // DISABLED: No content updates while typing to prevent cursor jumping and corruption
        // The editor will remain completely stable during typing
        // Markdown output will only update when explicitly requested
        return
      },
  })

  



     // Update editor content when initialContent changes - but only once to prevent reversion
   useEffect(() => {
     if (editor && initialContent && !editor.isDestroyed && editor.view) {
       try {
         const currentContent = editor.getHTML()
         
         // Only set content if editor is empty or has default content
         // This prevents reversion when user has made changes
         if (currentContent === '<p>Start Writing</p>' || currentContent === '' || currentContent.includes('Start Writing')) {
           logger.debug('Setting initial editor content')
           
           // Check if initialContent is already HTML or if it's markdown
           let newHtml: string
           if (initialContent.startsWith('<') && initialContent.includes('>')) {
             // Content is already HTML, decode HTML entities and use it directly
             newHtml = decodeHtmlEntities(initialContent)
           } else {
             // Content is markdown, convert it to HTML
             newHtml = markdownToHtml(initialContent)
           }
           
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
       } catch (error) {
         logger.error('Failed to update editor content:', error)
       }
     } else if (editor && !initialContent && !editor.isDestroyed && editor.view) {
       try {
         // When initialContent is empty, ensure we have clean default content
         const currentContent = editor.getHTML()
         if (currentContent.includes('<h1>') || currentContent.includes('<h2>') || currentContent.includes('<h3>')) {
           editor.commands.setContent('<p>Start Writing</p>')
           setMarkdownOutput('')
         }
       } catch (error) {
         logger.error('Failed to setup default content:', error)
       }
     }
   }, [editor, initialContent])



  

  const handlePasteMarkdown = useCallback(() => {
    if (pasteMarkdown.trim() && editor && !editor.isDestroyed && editor.view) {
      try {
        // Decode any HTML entities in the pasted markdown
        const cleanMarkdown = decodeHtmlEntities(pasteMarkdown)
        const html = markdownToHtml(cleanMarkdown)
        editor.commands.setContent(html)
        setPasteMarkdown('')
        setShowPasteDialog(false)
      } catch (error) {
        logger.error('Failed to paste markdown:', error)
      }
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
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.commands.setContent('<p>Start Writing</p>')
        setMarkdownOutput('')
      } catch (error) {
        logger.error('Failed to clear editor:', error)
      }
    }
  }, [editor])

  const handleInsertChart = useCallback(() => {
    if (chartData.trim() && editor && !editor.isDestroyed && editor.view) {
      try {
        // Clean the chart data before inserting to prevent encoding issues
        let cleanedChartData = chartData.trim()
        
        try {
          // Parse and re-stringify to ensure valid JSON and clean formatting
          const parsedData = JSON.parse(cleanedChartData)
          cleanedChartData = JSON.stringify(parsedData, null, 2)
          logger.debug('Chart data cleaned and validated successfully')
        } catch (jsonError) {
          logger.warn('Invalid JSON in chart data, attempting to clean:', jsonError)
          
          // Try to clean the data by removing problematic characters
          try {
            const cleanedData = cleanedChartData
              .replace(/\r\n/g, '\n')  // Replace carriage returns with newlines
              .replace(/\r/g, '\n')    // Replace any remaining carriage returns
              .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
              .trim()                  // Remove leading/trailing whitespace
            
            // Try to parse the cleaned data
            const parsedData = JSON.parse(cleanedData)
            cleanedChartData = JSON.stringify(parsedData, null, 2)
            logger.debug('Chart data cleaned successfully after initial cleaning')
          } catch (cleaningError) {
            logger.error('Failed to clean chart data:', cleaningError)
            // Show error to user
            alert('Invalid chart data. Please ensure your JSON is valid.')
            return
          }
        }
        
        // Insert the chart using the Chart extension with cleaned data
        editor.commands.setChart({
          chartType,
          data: cleanedChartData,
          chartTitle,
          xAxisLabel,
          yAxisLabel,
          width: chartWidth,
          height: chartHeight,
        })
        
        setChartData('')
        setChartTitle('')
        setXAxisLabel('')
        setYAxisLabel('')
        setChartWidth('100%')
        setChartHeight('320px')
        setChartValidationError(null)
        setShowChartDialog(false)
        
        logger.debug('Chart inserted successfully with cleaned data')
      } catch (error) {
        logger.error('Error inserting chart:', error)
        alert('Error inserting chart. Please try again.')
      }
    }
  }, [chartData, chartType, chartTitle, xAxisLabel, yAxisLabel, chartWidth, chartHeight, editor])

  const handleInsertTable = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        logger.debug('Inserting table with:', { rows: tableRows, cols: tableCols, withHeader: tableWithHeader })
        
        // Generate markdown table content
        let markdownTable = '| '
        
        // Create headers
        for (let i = 0; i < tableCols; i++) {
          markdownTable += `Column ${i + 1} | `
        }
        markdownTable = markdownTable.slice(0, -1) + '\n|'
        
        // Create separator row
        for (let i = 0; i < tableCols; i++) {
          markdownTable += ' --- |'
        }
        markdownTable += '\n'
        
        // Create data rows
        for (let row = 0; row < tableRows; row++) {
          markdownTable += '| '
          for (let col = 0; col < tableCols; col++) {
            if (tableWithHeader && row === 0) {
              markdownTable += `Header ${col + 1} | `
            } else {
              markdownTable += `Cell ${row + 1}-${col + 1} | `
            }
          }
          markdownTable = markdownTable.slice(0, -1) + '\n'
        }
        
        // Insert regular TipTap table so headers can be edited
        editor.chain().focus().insertTable({ 
          rows: tableRows, 
          cols: tableCols, 
          withHeaderRow: tableWithHeader 
        }).run()
        
        // Update markdown output
        setTimeout(() => {
          if (!editor.isDestroyed && editor.view) {
            try {
              const html = editor.getHTML()
              // Decode any HTML entities before converting to markdown
              const cleanHtml = decodeHtmlEntities(html)
              const markdown = htmlToMarkdown(cleanHtml)
              setMarkdownOutput(markdown)
            } catch (error) {
              logger.error('Error updating markdown output:', error)
            }
          }
        }, 100)
        
        setShowTableDialog(false)
        
        // Focus the editor
        editor.commands.focus()
      } catch (error) {
        logger.error('Error inserting table:', error)
        alert('Error inserting table. Please try again.')
      }
    }
  }, [editor, tableRows, tableCols, tableWithHeader])

  const insertTableTemplate = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        // Insert a sample table with meaningful data
        const sampleMarkdown = `| Project | Status | Progress | Due Date |
|---------|--------|----------|----------|
| Website Redesign | In Progress | 75% | Dec 15, 2024 |
| Mobile App | Planning | 10% | Jan 30, 2025 |
| Database Migration | Completed | 100% | Nov 1, 2024 |
| API Integration | On Hold | 45% | Feb 15, 2025 |`

        // Insert regular TipTap table so headers can be edited
        editor.chain().focus().insertContent(sampleMarkdown).run()
        
        // Update markdown output - ensure no HTML entities
        const cleanMarkdown = decodeHtmlEntities(sampleMarkdown)
        setMarkdownOutput(cleanMarkdown)
        
        // Focus the editor
        editor.commands.focus()
      } catch (error) {
        logger.error('Error inserting table template:', error)
      }
    }
  }, [editor])

  const handleAddRowBefore = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.chain().focus().addRowBefore().run()
      } catch (error) {
        logger.error('Error adding row before:', error)
      }
    }
  }, [editor])

  const handleAddRowAfter = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.chain().focus().addRowAfter().run()
      } catch (error) {
        logger.error('Error adding row after:', error)
      }
    }
  }, [editor])

  const handleAddColumnBefore = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.chain().focus().addColumnBefore().run()
      } catch (error) {
        logger.error('Error adding column before:', error)
      }
    }
  }, [editor])

  const handleAddColumnAfter = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.chain().focus().addColumnAfter().run()
      } catch (error) {
        logger.error('Error adding column after:', error)
      }
    }
  }, [editor])

  const handleDeleteRow = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.chain().focus().deleteRow().run()
      } catch (error) {
        logger.error('Error deleting row:', error)
      }
    }
  }, [editor])

  const handleDeleteColumn = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.chain().focus().deleteColumn().run()
      } catch (error) {
        logger.error('Error deleting column:', error)
      }
    }
  }, [editor])

  const handleDeleteTable = useCallback(() => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        editor.chain().focus().deleteTable().run()
      } catch (error) {
        logger.error('Error deleting table:', error)
      }
    }
  }, [editor])

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdownOutput)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000) // Reset after 2 seconds
      logger.debug('Markdown copied to clipboard successfully')
    } catch (error) {
      logger.error('Failed to copy to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = markdownOutput
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }, [markdownOutput])

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
  { "Budget Tier": "Low (≤33rd)", "Count": 1334 },
  { "Budget Tier": "Mid (33rd–67th)", "Count": 1333 },
  { "Budget Tier": "High (>67th)", "Count": 1333 }
]`
      case 'linechart':
        return `[
  { "Budget Tier": "Low (≤33rd)", "Agile": 4.670, "Non-Agile": 3.982 },
  { "Budget Tier": "Mid (33rd–67th)", "Agile": 6.667, "Non-Agile": 5.436 },
  { "Budget Tier": "High (>67th)", "Agile": 8.919, "Non-Agile": 6.391 }
]`
      case 'scatterplot':
        return `[
  { "x": 450000, "y": 4.5, "series": "Agile" },
  { "x": 1200000, "y": 6.2, "series": "Non-Agile" },
  { "x": 2800000, "y": 6.5, "series": "Non-Agile" }
]`
      case 'histogram':
        return `[
  { "Budget Range": "$0.16M–$0.40M", "Count": 1 },
  { "Budget Range": "$0.40M–$0.64M", "Count": 2 },
  { "Budget Range": "$3.66M–$3.91M", "Count": 1 }
]`
      default:
        return `[
  { "Budget Tier": "Low (≤33rd)", "value": 100 },
  { "Budget Tier": "Mid (33rd–67th)", "value": 200 }
]`
    }
  }

  // Function to validate chart data and show helpful errors
  const validateChartData = (data: string): { isValid: boolean; error: string | null; cleanedData?: string } => {
    if (!data.trim()) {
      return { isValid: false, error: 'Chart data cannot be empty' }
    }
    
    try {
      // First, try to clean the data
      let cleanedData = data.trim()
        .replace(/\r\n/g, '\n')  // Replace carriage returns with newlines
        .replace(/\r/g, '\n')    // Replace any remaining carriage returns
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      
      // Try to parse the cleaned data
      const parsedData = JSON.parse(cleanedData)
      
      // Validate that it's an array
      if (!Array.isArray(parsedData)) {
        return { isValid: false, error: 'Chart data must be an array of objects' }
      }
      
      // Validate that array is not empty
      if (parsedData.length === 0) {
        return { isValid: false, error: 'Chart data array cannot be empty' }
      }
      
      // Validate that all items are objects
      for (let i = 0; i < parsedData.length; i++) {
        if (typeof parsedData[i] !== 'object' || parsedData[i] === null) {
          return { isValid: false, error: `Item at index ${i} must be an object` }
        }
      }
      
      return { 
        isValid: true, 
        error: null, 
        cleanedData: JSON.stringify(parsedData, null, 2) 
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { 
          isValid: false, 
          error: `Invalid JSON: ${error.message}. Check for missing commas, quotes, or brackets.` 
        }
      }
      return { isValid: false, error: 'Unknown error validating chart data' }
    }
  }

  // Function to decode HTML entities to prevent &quot; and &amp;quot; issues
  const decodeHtmlEntities = (content: string): string => {
    return content
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
  }

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>
  }

  // Safe wrapper for toolbar actions to prevent crashes when editor isn't ready
  const safeEditorAction = (action: () => void) => {
    if (editor && !editor.isDestroyed && editor.view) {
      try {
        action()
      } catch (error) {
        logger.error('Editor action failed:', error)
      }
    }
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
                  onClick={() => safeEditorAction(() => editor.chain().focus().undo().run())}
                  title="Undo"
                >
                  <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().redo().run())}
                  title="Redo"
                >
                  <Redo className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
                  isActive={editor.isActive('heading', { level: 1 })}
                  title="Heading 1"
                >
                  <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                  isActive={editor.isActive('heading', { level: 2 })}
                  title="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
                  isActive={editor.isActive('heading', { level: 3 })}
                  title="Heading 3"
                >
                  <Heading3 className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleBold().run())}
                  isActive={editor.isActive('bold')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleItalic().run())}
                  isActive={editor.isActive('italic')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleCode().run())}
                  isActive={editor.isActive('code')}
                  title="Inline Code"
                >
                  <Code className="h-4 w-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleBulletList().run())}
                  isActive={editor.isActive('bulletList')}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleOrderedList().run())}
                  isActive={editor.isActive('orderedList')}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleBlockquote().run())}
                  isActive={editor.isActive('blockquote')}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => safeEditorAction(() => editor.chain().focus().toggleCodeBlock().run())}
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
                 
                                                                       <Button
                     onClick={() => {
                       if (editor && !editor.isDestroyed && editor.view) {
                         try {
                           const content = editor.getHTML()
                           
                           // Always try to convert the current HTML content back to markdown
                           // This ensures we get the actual content as it appears in the editor
                           const markdown = htmlToMarkdown(content)
                           setMarkdownOutput(markdown)
                           
                           if (onContentChange) {
                             onContentChange(content, markdown)
                           }
                           
                           logger.debug('Markdown output updated from current editor content')
                         } catch (error) {
                           logger.error('Failed to update markdown:', error)
                         }
                       }
                     }}
                     size="sm"
                     className="bg-blue-600 hover:bg-blue-700 text-white"
                     title="Update Markdown Output"
                   >
                     <div className="w-4 h-4 border border-current rounded-sm">
                       <div className="w-2 h-2 border border-current rounded-sm mx-auto mt-0.5"></div>
                     </div>
                   </Button>
                
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
                <ToolbarButton
                  onClick={() => insertTableTemplate()}
                  title="Insert Sample Table"
                >
                  <div className="w-4 h-4 border border-current rounded-sm">
                    <div className="w-2 h-2 border border-current rounded-sm mx-auto mt-0.5"></div>
                  </div>
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

      <div className="space-y-6">
        {/* Editor */}
        <div className="w-full">
          <div className="prose prose-sm max-w-none">
            <EditorContent 
              editor={editor} 
              className="min-h-[600px] max-h-[800px] overflow-y-auto border border-teal-200 rounded-lg"
              onContextMenu={handleTableContextMenu}
            />
          </div>
        </div>

        {/* Preview */}
        {showPreviewState && (
          <>
            <Separator className="bg-teal-200" />
            <div className="w-full p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border border-teal-200">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-teal-900 mb-2">Preview</h2>
                
                                 <div className="space-y-4">
                   {/* Show markdown output */}
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <h3 className="text-sm font-medium text-teal-800">Markdown Output</h3>
                       <Button
                         onClick={handleCopyToClipboard}
                         size="sm"
                         variant="outline"
                         className="border-teal-200 text-teal-700 hover:bg-teal-50 flex items-center gap-2"
                         title="Copy to Clipboard"
                       >
                         {copySuccess ? (
                           <>
                             <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                               <div className="w-2 h-2 bg-white rounded-full"></div>
                             </div>
                             Copied!
                           </>
                         ) : (
                           <>
                             <Copy className="h-4 w-4" />
                             Copy
                           </>
                         )}
                       </Button>
                     </div>
                     <Card className="border border-teal-200 bg-white">
                       <CardContent className="p-4">
                         <pre className="font-mono text-sm overflow-auto max-h-[400px] whitespace-pre-wrap text-gray-700 bg-gray-50 p-3 rounded border">{markdownOutput}</pre>
                       </CardContent>
                     </Card>
                   </div>
                 </div>
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
      <Dialog open={showChartDialog} onOpenChange={(open) => {
        setShowChartDialog(open)
        if (!open) {
          // Clear all chart-related state when dialog is closed
          setChartData('')
          setChartTitle('')
          setXAxisLabel('')
          setYAxisLabel('')
          setChartWidth('100%')
          setChartHeight('320px')
          setChartValidationError(null)
        }
      }}>
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
                      setChartTitle('')
                      setChartValidationError(null)
                    }}>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar Chart
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setChartType('linechart')
                      setChartData(getChartTemplate('linechart'))
                      setChartTitle('')
                      setChartValidationError(null)
                    }}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Line Chart
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setChartType('scatterplot')
                      setChartData(getChartTemplate('scatterplot'))
                      setChartTitle('')
                      setChartValidationError(null)
                    }}>
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Scatter Plot
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setChartType('histogram')
                      setChartData(getChartTemplate('histogram'))
                      setChartTitle('')
                      setChartValidationError(null)
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
                <label htmlFor="chart-title" className="text-sm font-medium text-teal-700">
                  Chart Title (Optional)
                </label>
                <input
                  id="chart-title"
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="e.g., Revenue Overview, Project Timeline..."
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                />
              </div>
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
                onChange={(e) => {
                  const newData = e.target.value
                  setChartData(newData)
                  
                  // Clear previous validation error
                  setChartValidationError(null)
                  
                  // Validate the data if it's not empty
                  if (newData.trim()) {
                    const validation = validateChartData(newData)
                    if (!validation.isValid) {
                      setChartValidationError(validation.error)
                    }
                  }
                }}
                placeholder="Enter chart data in JSON format..."
                className={`min-h-[300px] font-mono text-sm border-teal-200 focus:border-teal-400 ${
                  chartValidationError ? 'border-red-300 focus:border-red-400' : ''
                }`}
              />
              
              {/* Validation Error */}
              {chartValidationError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 font-medium">Validation Error:</p>
                  <p className="text-sm text-red-600">{chartValidationError}</p>
                </div>
              )}
              
              {/* Validation Success */}
              {chartData.trim() && !chartValidationError && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700 font-medium">✓ Valid JSON</p>
                  <p className="text-sm text-green-600">Your chart data is properly formatted.</p>
                </div>
              )}
              
              {/* Clean Data Button */}
              {chartData.trim() && chartValidationError && (
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const validation = validateChartData(chartData)
                      if (validation.cleanedData) {
                        setChartData(validation.cleanedData)
                        setChartValidationError(null)
                      }
                    }}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    Try to Clean Data
                  </Button>
                </div>
              )}
              
              <div className="text-xs text-teal-600 mt-1 space-y-1">
                <p>Use the exact format from your project analysis page. Data should be valid JSON.</p>
                <p><strong>Tips:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Ensure all quotes are straight quotes (") not curly quotes (" or ")</li>
                  <li>Remove any carriage returns or extra whitespace</li>
                  <li>Use proper JSON syntax with commas between objects</li>
                  <li>Avoid HTML entities like &amp;gt; - use &gt; instead</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChartDialog(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInsertChart}
                disabled={!chartData.trim() || !!chartValidationError}
                className="bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
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
