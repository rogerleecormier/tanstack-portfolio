import { useState, useCallback, useRef, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import { Eye, EyeOff, FileText, Trash2 } from 'lucide-react'
import { TipTapEditor } from './TipTapEditor'
import { MarkdownEditor } from './MarkdownEditor'
import { renderMarkdownForPreview } from '../../lib/markdown'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { DUMMY_MARKDOWN } from '../../lib/dummyMarkdown'

interface MarkdownHtmlEditorProps {
  initialMarkdown?: string
  onChange: (markdown: string) => void
}

export function MarkdownHtmlEditor({ initialMarkdown = '', onChange }: MarkdownHtmlEditorProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const [activeTab, setActiveTab] = useState<'wysiwyg' | 'markdown'>('wysiwyg')
  const [showPreview, setShowPreview] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)

  // Update internal markdown state when initialMarkdown prop changes (e.g., when loading a file)
  useEffect(() => {
    setMarkdown(initialMarkdown)
  }, [initialMarkdown])

  // Debounced preview to avoid focus glitches and heavy re-rendering
  const [debouncedMarkdown, isPending] = useDebouncedValue(markdown, 350)

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      setMarkdown(newMarkdown)
      onChange(newMarkdown)
    },
    [onChange]
  )

  const handleLoadExample = useCallback(() => {
    setMarkdown(DUMMY_MARKDOWN)
    onChange(DUMMY_MARKDOWN)
  }, [onChange])

  const handleClear = useCallback(() => {
    setMarkdown('')
    onChange('')
  }, [onChange])


  const previewContent = renderMarkdownForPreview(debouncedMarkdown)

  return (
    <div
      ref={editorRef}
      className="h-full min-h-0 flex flex-col rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm"
    >
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              {/* Editor Mode Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <TabsList className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <TabsTrigger
                    value="wysiwyg"
                    className="data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-colors"
                  >
                    WYSIWYG
                  </TabsTrigger>
                  <TabsTrigger
                    value="markdown"
                    className="data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-colors"
                  >
                    Markdown
                  </TabsTrigger>
                </TabsList>
              </Tabs>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadExample}
                      className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-md"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Example</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>Load example content</TooltipContent>
                  </TooltipPortal>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Clear</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>Clear editor</TooltipContent>
                  </TooltipPortal>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview((v) => !v)}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md"
                    >
                      {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="hidden sm:inline ml-2">{showPreview ? 'Hide' : 'Show'} Preview</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>{showPreview ? 'Hide preview' : 'Show preview'}</TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </div>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 min-h-0 p-4 overflow-visible">
        <div className={`grid gap-6 h-full min-h-0 ${showPreview ? 'md:grid-cols-2 grid-cols-1' : 'grid-cols-1'}`}>
          <div className="flex flex-col min-h-0 min-w-0">
            {/* Editor Container with Enhanced Styling */}
            <div className="flex-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur overflow-visible shadow-sm">
              {/* Editor Mode Indicator */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    {activeTab === 'wysiwyg' ? 'Rich Text Editor' : 'Markdown Editor'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {markdown.length} characters
                </div>
              </div>

              {/* Actual Editor */}
              <div className="h-full overflow-auto">
                {activeTab === 'wysiwyg' ? (
                  <TipTapEditor initialMarkdown={markdown} onDocChange={handleMarkdownChange} />
                ) : (
                  <MarkdownEditor initialMarkdown={markdown} onChange={handleMarkdownChange} />
                )}
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="flex flex-col min-h-0 min-w-0">
              {/* Preview Container with Enhanced Styling */}
              <div className="flex-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur overflow-visible shadow-sm">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      Live Preview
                    </span>
                  </div>
                  {isPending && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 border border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  )}
                </div>

                {/* Preview Content */}
                <div className="h-full overflow-auto">
                  <div className="p-6 prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-a:text-teal-600 hover:prose-a:underline dark:prose-a:text-teal-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-code:text-purple-700 dark:prose-code:text-purple-300 prose-pre:bg-slate-950/90 dark:prose-pre:bg-slate-900/70 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:ring-1 prose-pre:ring-slate-200/20 prose-li:marker:text-slate-400">
                    {previewContent}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


