import React, { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
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
  Download,
  Eye,
  EyeOff,
  FileText,
  Clipboard,
  Upload,
  Square,
  BarChart3,
  TrendingUp,
  PieChart,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { H1, H2, P } from '@/components/ui/typography'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'




// Create lowlight instance with common languages
const lowlight = createLowlight(common)

const MarkdownEditorPage: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false)
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default codeBlock to avoid conflict with CodeBlockLowlight
      }),
      Highlight,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      Chart,
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none border border-teal-200 focus:border-teal-400 rounded-lg p-6 min-h-[600px] transition-colors duration-200 bg-white',
      },
    },
    content: `
      <h1>Professional Markdown Editor</h1>
      <p>Welcome to the markdown editor designed for professional content creation. This tool helps you create well-formatted markdown documents with real-time preview and syntax highlighting.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Rich Text Editing:</strong> Intuitive toolbar for common formatting options</li>
        <li><strong>Real-time Preview:</strong> See your markdown output as you type</li>
        <li><strong>Syntax Highlighting:</strong> Code blocks with language-specific highlighting</li>
        <li><strong>Export Functionality:</strong> Download your markdown files instantly</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>Use the toolbar above to format your content. The markdown will be generated automatically as you type, and you can toggle the preview to see the final output.</p>
      
      <blockquote>
        <p>This editor supports all standard markdown elements including headers, lists, code blocks, blockquotes, and inline formatting.</p>
      </blockquote>
      
      <h3>Code Examples</h3>
      <p>You can create code blocks with syntax highlighting for various programming languages:</p>
      
      <pre><code class="language-javascript">// Example JavaScript function
function createMarkdown() {
  const content = "Professional content";
  return \`# \${content}\`;
}</code></pre>
      
      <pre><code class="language-python"># Example Python function
def generate_content():
    return "Professional markdown content"
</code></pre>
      
      <h3>Chart Examples</h3>
      <p>You can insert interactive charts using the chart button in the toolbar. Here's an example:</p>
      
             <div data-type="chart" data-chart-type="barchart" data-chart-data='[{"date":"Category 1","value":100},{"date":"Category 2","value":190},{"date":"Category 3","value":150}]' data-chart-x-axis-label="Categories" data-chart-y-axis-label="Values"></div>
      
      <p>Charts support various types including bar charts, line charts, scatter plots, and histograms. Use the chart button to insert your own charts with custom data.</p>
    `,
    onUpdate: ({ editor }) => {
      // Convert HTML to markdown-like format
      const content = editor.getHTML()
      const markdown = htmlToMarkdown(content)
      setMarkdownOutput(markdown)
    },
  })

  const htmlToMarkdown = (html: string): string => {
    // Simple HTML to markdown conversion
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
      .replace(/<ul>(.*?)<\/ul>/gs, '$1\n')
      .replace(/<ol>(.*?)<\/ol>/gs, '$1\n')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<blockquote>(.*?)<\/blockquote>/gs, '> $1\n\n')
      // Handle chart nodes
      .replace(/<div[^>]*data-type="chart"[^>]*data-chart-type="([^"]*)"[^>]*data-chart-data="([^"]*)"[^>]*data-chart-title="([^"]*)"[^>]*><\/div>/g, (_match, chartType, chartData, chartTitle) => {
        return `\n\n### ${chartTitle || 'Chart'}\n\n\`\`\`${chartType}\n${chartData}\n\`\`\`\n\n`
      })
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  }

  const markdownToHtml = (markdown: string): string => {
    // Simple markdown to HTML conversion
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Code blocks with language
      .replace(/```(\w+)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Code blocks without language
      .replace(/```\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Chart blocks (convert to chart nodes)
      .replace(/### (.*?)\n\n```(barchart|linechart|scatterplot|histogram)\n([\s\S]*?)```/g, (_match, title, chartType, chartData) => {
        return `<div data-type="chart" data-chart-type="${chartType}" data-chart-data="${chartData.replace(/"/g, '&quot;')}" data-chart-title="${title.replace(/"/g, '&quot;')}"></div>`
      })
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>')
      // Lists
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
      // Wrap consecutive list items in ul/ol
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Paragraphs (must be last)
      .replace(/^(?!<[h|u|o|b|p|>])(.*$)/gim, '<p>$1</p>')
      // Clean up multiple newlines
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdownOutput], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [markdownOutput])

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
      console.error('Failed to read clipboard:', error)
      // Fallback: just open the dialog
      setShowPasteDialog(true)
    }
  }, [])

  const handleInsertChart = useCallback(() => {
    if (chartData.trim() && editor) {
      console.log('Inserting chart:', { chartType, data: chartData })
      console.log('Editor commands available:', Object.keys(editor.commands))
      
      try {
        // Insert the chart using the Chart extension
        const result = editor.commands.setChart({
          chartType,
          data: chartData,
          xAxisLabel,
          yAxisLabel,
          width: chartWidth,
          height: chartHeight,
        })
        console.log('Chart insertion result:', result)
        
        setChartData('')
        setXAxisLabel('')
        setYAxisLabel('')
        setChartWidth('100%')
        setChartHeight('320px')
        setShowChartDialog(false)
      } catch (error) {
        console.error('Error inserting chart:', error)
      }
    } else {
      console.log('Cannot insert chart:', { chartData: chartData.trim(), editor: !!editor })
    }
  }, [chartData, chartType, xAxisLabel, yAxisLabel, chartWidth, chartHeight, editor])

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-teal-600" />
            </div>
            <H1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Markdown Editor
            </H1>
          </div>
          <P className="text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A rich text editor for creating and editing markdown content with real-time preview and syntax highlighting.
          </P>
        </div>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
          <Link to="/tools">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
        </Button>
      </div>

      <Card className="border border-teal-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-200">
          <div className="flex flex-wrap items-center gap-2">
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
             </div>

            <div className="flex items-center gap-2 ml-auto">
              <ToolbarButton
                onClick={() => setShowPreview(!showPreview)}
                title={showPreview ? "Hide Preview" : "Show Preview"}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </ToolbarButton>
                             <ToolbarButton
                 onClick={handlePasteFromClipboard}
                 title="Paste Markdown from Clipboard"
               >
                 <Clipboard className="h-4 w-4" />
               </ToolbarButton>
               <ToolbarButton
                 onClick={() => setShowChartDialog(true)}
                 title="Insert Chart"
               >
                 <BarChart3 className="h-4 w-4" />
               </ToolbarButton>
              <Button
                onClick={downloadMarkdown}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                title="Download Markdown"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex">
            {/* Editor */}
            <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-6`}>
                                                     <div className="prose prose-sm max-w-none">
                                                             <EditorContent 
                   editor={editor} 
                   className="min-h-[600px]"
                 />
              </div>
             </div>

            {/* Preview */}
            {showPreview && (
              <>
                <Separator orientation="vertical" className="bg-teal-200" />
                <div className="w-1/2 p-6 bg-gradient-to-br from-teal-50 to-blue-50">
                  <div className="mb-4">
                    <H2 className="text-lg font-semibold text-teal-900 mb-2">Markdown Output</H2>
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
        </CardContent>
      </Card>

      <Card className="mt-8 border border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-teal-900">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
                     <ul className="list-disc list-inside space-y-2 text-teal-800 pl-4">
             <li>Use the toolbar to format your text with headers, bold, italic, lists, and more</li>
             <li>Click the clipboard icon to paste markdown content from your clipboard</li>
             <li>Click the chart icon to insert shadcn charts with JSON data</li>
             <li>Toggle the preview to see the generated markdown in real-time</li>
             <li>Download your markdown file when you're ready</li>
             <li>The editor supports code blocks with syntax highlighting for various programming languages</li>
           </ul>
                 </CardContent>
       </Card>

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

export default MarkdownEditorPage
