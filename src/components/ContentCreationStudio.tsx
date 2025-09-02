import React, { useState, useCallback, useEffect } from 'react'
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
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  PieChart,
  ChevronDown,
  Table as TableIcon,
  FileText,
  Edit3,
  Settings,
  Plus,
  Minus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { logger } from '@/utils/logger'
import { markdownToHtml, htmlToMarkdown } from '@/utils/enhancedMarkdownConverter'
import { FrontmatterGenerator } from '@/utils/frontmatterGenerator'

import FrontmatterManager, { FrontmatterData } from '@/components/FrontmatterManager'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

// Custom table header extension with enhanced styling
const CustomTableHeader = TableHeader.extend({
  addGlobalAttributes() {
    return [
      {
        types: ['tableHeader'],
        attributes: {
          class: {
            default: 'h-14 px-5 text-left align-middle font-semibold text-teal-900 border-r border-teal-200 last:border-r-0 bg-teal-50 text-sm tracking-wide',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => ({
              class: attributes.class || 'h-14 px-5 text-left align-middle font-semibold text-teal-900 border-r border-teal-200 last:border-r-0 bg-teal-50 text-sm tracking-wide'
            })
          }
        }
      }
    ]
  }
})

// Custom table cell extension with enhanced styling
const CustomTableCell = TableCell.extend({
  addGlobalAttributes() {
    return [
      {
        types: ['tableCell'],
        attributes: {
          class: {
            default: 'px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 last:border-r-0 text-teal-700 text-sm leading-relaxed',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => ({
              class: attributes.class || 'px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 last:border-r-0 text-teal-700 text-sm leading-relaxed'
            })
          }
        }
      }
    ]
  }
})

interface ContentCreationStudioProps {
  initialContent?: string
  initialFrontmatter?: Partial<FrontmatterData>
  onContentChange?: (html: string, markdown: string, frontmatter: FrontmatterData) => void
  showPreview?: boolean
  showToolbar?: boolean
  className?: string
  minHeight?: string
  contentType?: 'blog' | 'portfolio' | 'project'
  onDirectoryChange?: (directory: string) => void
  isFullWidth?: boolean
}



const ContentCreationStudio: React.FC<ContentCreationStudioProps> = ({
  initialContent = '',
  initialFrontmatter = {},
  onContentChange,
  showPreview = false,
  showToolbar = true,
  className = '',
  minHeight = '600px',
  contentType,
  onDirectoryChange,
  isFullWidth = false
}) => {
  const [viewMode, setViewMode] = useState<'html' | 'markdown'>('html')
  const [showPreviewState, setShowPreviewState] = useState(showPreview)
  const [markdownContent, setMarkdownContent] = useState('')
  const [frontmatter, setFrontmatter] = useState<FrontmatterData>({
    title: '',
    description: '',
    author: 'Roger Lee Cormier',
    tags: [],
    keywords: [],
    date: new Date().toISOString().split('T')[0],
    ...initialFrontmatter
  })
  
  const [showFrontmatterDialog, setShowFrontmatterDialog] = useState(false)
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [chartConfig, setChartConfig] = useState({
    type: 'barchart',
    data: '',
    title: '',
    xAxisLabel: '',
    yAxisLabel: '',
    width: '100%',
    height: '320px'
  })
  const [tableConfig, setTableConfig] = useState({
    rows: 3,
    cols: 3,
    withHeader: true
  })
  
  const [isSettingContent, setIsSettingContent] = useState(false)
  const [autoSaveEnabled] = useState(true)
  
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

  // Update preview state when prop changes
  useEffect(() => {
    setShowPreviewState(showPreview)
  }, [showPreview])

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
        class: `focus:outline-none p-6 transition-colors duration-200 bg-white ${isFullWidth ? 'h-full' : `min-h-[${minHeight}]`} ${className}`,
      },
      handleKeyDown: (_view, event) => {
        // Ctrl/Cmd + T to insert table
        if ((event.ctrlKey || event.metaKey) && event.key === 't') {
          event.preventDefault()
          setShowTableDialog(true)
          return true
        }
        // Ctrl/Cmd + Shift + C to insert chart
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
          event.preventDefault()
          setShowChartDialog(true)
          return true
        }
        return false
      },
    },
    content: initialContent || '<p>Start Writing</p>',
    onCreate: () => {
      // Initialize content
    },
    onUpdate: ({ editor }) => {
      if (!isSettingContent && autoSaveEnabled) {
        const html = editor.getHTML()
        const markdown = htmlToMarkdown(html)
        setMarkdownContent(markdown)
        
        if (onContentChange) {
          onContentChange(html, markdown, frontmatter)
        }
      }
    },
  })

  // Initialize content when editor is ready
  useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      try {
        const currentContent = editor.getHTML()
        
        if (currentContent === '<p>Start Writing</p>' || currentContent === '' || currentContent.includes('Start Writing')) {
          logger.debug('Setting initial editor content')
          
          let newHtml: string
          if (initialContent.startsWith('<') && initialContent.includes('>')) {
            newHtml = initialContent
          } else {
            newHtml = markdownToHtml(initialContent)
          }
          
          setIsSettingContent(true)
          editor.commands.setContent(newHtml)
          
          const markdown = htmlToMarkdown(newHtml)
          setMarkdownContent(markdown)
          
          setTimeout(() => {
            setIsSettingContent(false)
          }, 100)
          
          logger.debug('Editor content updated successfully')
        }
      } catch (error) {
        logger.error('Failed to update editor content:', error)
      }
    }
  }, [editor, initialContent])

  // Handle view mode switching
  const handleViewModeSwitch = useCallback(() => {
    if (viewMode === 'html') {
      // Switch to markdown view
      const html = editor?.getHTML() || ''
      const markdown = htmlToMarkdown(html)
      setMarkdownContent(markdown)
      setViewMode('markdown')
    } else {
      // Switch to HTML view
      const markdown = markdownContent
      const html = markdownToHtml(markdown)
      setIsSettingContent(true)
      editor?.commands.setContent(html)
      setViewMode('html')
      
      setTimeout(() => {
        setIsSettingContent(false)
      }, 100)
    }
  }, [viewMode, editor, markdownContent])

  // Handle markdown content changes
  const handleMarkdownChange = useCallback((value: string) => {
    setMarkdownContent(value)
    
    if (autoSaveEnabled && onContentChange) {
      const html = markdownToHtml(value)
      onContentChange(html, value, frontmatter)
    }
  }, [autoSaveEnabled, onContentChange, frontmatter])

  // Handle frontmatter changes
  const handleFrontmatterChange = useCallback((updatedFrontmatter: FrontmatterData) => {
    setFrontmatter(updatedFrontmatter)
    
    if (onContentChange) {
      const html = editor?.getHTML() || ''
      onContentChange(html, markdownContent, updatedFrontmatter)
    }
  }, [onContentChange, editor, markdownContent])

  // Insert table
  const insertTable = useCallback(() => {
    if (!editor) return
    
    const { rows, cols, withHeader } = tableConfig
    let tableHTML = '<table class="my-6 w-full caption-bottom text-sm border-collapse bg-white border border-teal-200 rounded-xl overflow-hidden shadow-sm">'
    
    if (withHeader) {
      tableHTML += '<thead><tr>'
      for (let i = 0; i < cols; i++) {
        tableHTML += `<th class="h-14 px-5 text-left align-middle font-semibold text-teal-900 border-r border-teal-200 last:border-r-0 bg-teal-50 text-sm tracking-wide">Header ${i + 1}</th>`
      }
      tableHTML += '</tr></thead>'
    }
    
    tableHTML += '<tbody>'
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr class="border-b border-teal-100 last:border-b-0 hover:bg-teal-50 hover:shadow-sm transition-all duration-200 ease-in-out">'
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td class="px-5 py-4 align-middle min-w-[120px] border-r border-teal-100 last:border-r-0 text-teal-700 text-sm leading-relaxed">Cell ${i + 1}-${j + 1}</td>`
      }
      tableHTML += '</tr>'
    }
    tableHTML += '</tbody></table>'
    
    editor.commands.insertContent(tableHTML)
    setShowTableDialog(false)
  }, [editor, tableConfig])

  // Insert chart
  const insertChart = useCallback(() => {
    if (!editor) return
    
    const { type, data, title, xAxisLabel, yAxisLabel, width, height } = chartConfig
    
    try {
      // Validate JSON data
      JSON.parse(data)
      
      const chartHTML = `<div data-type="chart" data-chart-type="${type}" data-chart-data="${encodeURIComponent(data)}" data-chart-title="${title}" data-chart-x-axis-label="${xAxisLabel}" data-chart-y-axis-label="${yAxisLabel}" data-chart-width="${width}" data-chart-height="${height}" class="my-6"></div>`
      
      editor.commands.insertContent(chartHTML)
      setShowChartDialog(false)
    } catch (error) {
      logger.error('Invalid chart data:', error)
    }
  }, [editor, chartConfig])

  // Generate frontmatter from content
  const generateFrontmatter = useCallback(() => {
    if (!contentType) return
    
    const content = viewMode === 'html' ? (editor?.getHTML() || '') : markdownContent
    const generated = FrontmatterGenerator.generateFrontmatter(content, contentType)
    setFrontmatter(generated)
  }, [contentType, viewMode, editor, markdownContent])

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        {/* Compact Toolbar Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                {contentType || 'content'}
              </Badge>
              <span className="text-sm text-gray-600">•</span>
              <span className="text-sm text-gray-700 font-medium">
                {viewMode === 'html' ? 'HTML Editor' : 'Markdown Editor'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'html' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('html')}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              HTML
            </Button>
            
            <Button
              variant={viewMode === 'markdown' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('markdown')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Markdown
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFrontmatterDialog(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Frontmatter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewState(!showPreviewState)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {showPreviewState ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreviewState ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>

        {/* Main Editor Area - Optimized for Dual Pane */}
        <div className={`grid gap-6 h-full ${
          showPreviewState 
            ? 'grid-cols-1 xl:grid-cols-2' 
            : 'grid-cols-1'
        } ${
          isFullWidth
            ? 'w-full h-full'
            : 'max-w-7xl mx-auto'
        }`}>
          {/* Editor Panel */}
          <Card className={`border-0 shadow-lg bg-white ${isFullWidth ? 'h-full flex flex-col' : ''}`}>
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {viewMode === 'html' ? 'HTML Editor' : 'Markdown Editor'}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewModeSwitch}
                    className="text-xs border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Switch to {viewMode === 'html' ? 'Markdown' : 'HTML'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className={`p-0 ${isFullWidth ? 'flex-1 overflow-hidden' : ''}`}>
              {viewMode === 'html' ? (
                <>
                  {/* HTML Editor Toolbar */}
                  {showToolbar && (
                    <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bold</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Italic</TooltipContent>
                      </Tooltip>
                      
                      <Separator orientation="vertical" className="h-6" />
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <Heading1 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Heading 1</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <Heading2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Heading 2</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <Heading3 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Heading 3</TooltipContent>
                      </Tooltip>
                      
                      <Separator orientation="vertical" className="h-6" />
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <List className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bullet List</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <ListOrdered className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ordered List</TooltipContent>
                      </Tooltip>
                      
                      <Separator orientation="vertical" className="h-6" />
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTableDialog(true)}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <TableIcon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Insert Table</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowChartDialog(true)}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Insert Chart</TooltipContent>
                      </Tooltip>
                      
                      <Separator orientation="vertical" className="h-6" />
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <Undo className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            className="h-8 w-8 p-0 hover:bg-teal-100"
                          >
                            <Redo className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                  
                  {/* HTML Editor Content */}
                  <EditorContent editor={editor} className={isFullWidth ? "h-full" : "min-h-[600px]"} />
                </>
              ) : (
                /* Markdown Editor */
                <div className={`p-4 ${isFullWidth ? 'h-full' : ''}`}>
                  <Textarea
                    value={markdownContent}
                    onChange={(e) => handleMarkdownChange(e.target.value)}
                    placeholder="Write your markdown content here..."
                    className={`font-mono text-sm border-gray-200 focus:border-teal-400 focus:ring-teal-400 ${isFullWidth ? 'h-full resize-none' : 'min-h-[600px]'}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Panel */}
          {showPreviewState && (
            <Card className={`border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 ${isFullWidth ? 'h-full flex flex-col' : ''}`}>
              <CardHeader className="pb-3 border-b border-blue-100">
                <h3 className="text-lg font-medium text-blue-900">Live Preview</h3>
              </CardHeader>
              <CardContent className={`p-4 ${isFullWidth ? 'flex-1 overflow-auto' : ''}`}>
                <div 
                  className={`max-w-none space-y-6 ${isFullWidth ? 'h-full' : 'min-h-[600px]'}`}
                  dangerouslySetInnerHTML={{ 
                    __html: viewMode === 'html' 
                      ? editor.getHTML() 
                      : markdownToHtml(markdownContent) 
                  }} 
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Frontmatter Manager */}
        <FrontmatterManager
          open={showFrontmatterDialog}
          onOpenChange={setShowFrontmatterDialog}
          frontmatter={frontmatter}
          onFrontmatterChange={handleFrontmatterChange}
          contentType={contentType}
          content={viewMode === 'html' ? (editor?.getHTML() || '') : markdownContent}
          onGenerateFromContent={generateFrontmatter}
        />

        {/* Chart Dialog */}
        <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Insert Chart</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chartType">Chart Type</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {chartConfig.type}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setChartConfig(prev => ({ ...prev, type: 'barchart' }))}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Bar Chart
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setChartConfig(prev => ({ ...prev, type: 'linechart' }))}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Line Chart
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setChartConfig(prev => ({ ...prev, type: 'piechart' }))}>
                        <PieChart className="w-4 h-4 mr-2" />
                        Pie Chart
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div>
                  <Label htmlFor="chartTitle">Chart Title</Label>
                  <Input
                    id="chartTitle"
                    value={chartConfig.title}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter chart title"
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="xAxisLabel">X-Axis Label</Label>
                  <Input
                    id="xAxisLabel"
                    value={chartConfig.xAxisLabel}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, xAxisLabel: e.target.value }))}
                    placeholder="Enter X-axis label"
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="yAxisLabel">Y-Axis Label</Label>
                  <Input
                    id="yAxisLabel"
                    value={chartConfig.yAxisLabel}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, yAxisLabel: e.target.value }))}
                    placeholder="Enter Y-axis label"
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="chartData">Chart Data (JSON)</Label>
                <Textarea
                  id="chartData"
                  value={chartConfig.data}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, data: e.target.value }))}
                  placeholder='[{"name": "A", "value": 10}, {"name": "B", "value": 20}]'
                  className="min-h-[120px] font-mono text-sm border-teal-200 focus:border-teal-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter data in JSON format. Each object should have consistent keys.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowChartDialog(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={insertChart}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Insert Chart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Table Dialog */}
        <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Table</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tableRows">Rows</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableConfig(prev => ({ ...prev, rows: Math.max(1, prev.rows - 1) }))}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      id="tableRows"
                      type="number"
                      min="1"
                      value={tableConfig.rows}
                      onChange={(e) => setTableConfig(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                      className="text-center border-teal-200 focus:border-teal-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableConfig(prev => ({ ...prev, rows: prev.rows + 1 }))}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tableCols">Columns</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableConfig(prev => ({ ...prev, cols: Math.max(1, prev.cols - 1) }))}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      id="tableCols"
                      type="number"
                      min="1"
                      value={tableConfig.cols}
                      onChange={(e) => setTableConfig(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                      className="text-center border-teal-200 focus:border-teal-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableConfig(prev => ({ ...prev, cols: prev.cols + 1 }))}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="tableWithHeader"
                  type="checkbox"
                  checked={tableConfig.withHeader}
                  onChange={(e) => setTableConfig(prev => ({ ...prev, withHeader: e.target.checked }))}
                  className="rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                />
                <Label htmlFor="tableWithHeader">Include header row</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTableDialog(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={insertTable}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Insert Table
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default ContentCreationStudio