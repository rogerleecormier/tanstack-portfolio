import { useState, useCallback, useRef, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Eye, EyeOff, FileText, Trash2, ArrowUp } from 'lucide-react'
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

  const handleScrollToTop = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [])

  const previewContent = renderMarkdownForPreview(debouncedMarkdown)

  return (
    <div
      ref={editorRef}
      className="h-full min-h-0 flex flex-col bg-gradient-to-br from-slate-50/50 via-teal-50/30 to-blue-50/50 dark:from-slate-900/50 dark:via-teal-900/20 dark:to-blue-900/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
    >
      {/* Enhanced Toolbar with Brand Theme */}
      <div className="flex-shrink-0 border-b border-teal-200/30 dark:border-teal-700/30 bg-gradient-to-r from-teal-50/40 to-blue-50/40 dark:from-teal-900/30 dark:to-blue-900/30 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Editor Mode Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <TabsList className="bg-white/80 dark:bg-slate-800/80 border border-teal-200/50 dark:border-teal-700/50">
                  <TabsTrigger
                    value="wysiwyg"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-200"
                  >
                    WYSIWYG
                  </TabsTrigger>
                  <TabsTrigger
                    value="markdown"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-200"
                  >
                    Markdown
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-teal-200/30 dark:border-teal-700/30">
                <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-teal-700 dark:text-teal-300">Live Editor</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadExample}
                className="hover:bg-teal-100/80 hover:text-teal-700 dark:hover:bg-teal-800/50 dark:hover:text-teal-300 transition-all duration-200 rounded-lg border border-transparent hover:border-teal-200/50 dark:hover:border-teal-700/50"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Load Example</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="hover:bg-red-100/80 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-all duration-200 rounded-lg border border-transparent hover:border-red-200/50 dark:hover:border-red-700/50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleScrollToTop}
                className="hover:bg-blue-100/80 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 transition-all duration-200 rounded-lg border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Top</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview((v) => !v)}
                className="hover:bg-purple-100/80 hover:text-purple-700 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 transition-all duration-200 rounded-lg border border-transparent hover:border-purple-200/50 dark:hover:border-purple-700/50"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 min-h-0 p-4">
        <div className={`grid gap-6 h-full min-h-0 ${showPreview ? 'md:grid-cols-2 grid-cols-1' : 'grid-cols-1'}`}>
          <div className="flex flex-col min-h-0 min-w-0">
            {/* Editor Container with Enhanced Styling */}
            <div className="flex-1 border border-teal-200/50 dark:border-teal-700/50 rounded-xl bg-gradient-to-br from-white/90 to-slate-50/50 dark:from-slate-800/90 dark:to-slate-900/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
              {/* Editor Mode Indicator */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-teal-200/30 dark:border-teal-700/30 bg-gradient-to-r from-teal-50/30 to-blue-50/30 dark:from-teal-900/20 dark:to-blue-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full"></div>
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                    {activeTab === 'wysiwyg' ? 'Rich Text Editor' : 'Markdown Editor'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
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
              <div className="flex-1 border border-blue-200/50 dark:border-blue-700/50 rounded-xl bg-gradient-to-br from-white/90 to-slate-50/50 dark:from-slate-800/90 dark:to-slate-900/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-blue-200/30 dark:border-blue-700/30 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      Live Preview
                    </span>
                  </div>
                  {isPending && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <div className="w-3 h-3 border border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  )}
                </div>

                {/* Preview Content */}
                <div className="h-full overflow-auto">
                  <div className="p-6 prose prose-slate dark:prose-invert max-w-none prose-headings:text-blue-700 dark:prose-headings:text-blue-300 prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-code:text-purple-700 dark:prose-code:text-purple-300 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800">
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



