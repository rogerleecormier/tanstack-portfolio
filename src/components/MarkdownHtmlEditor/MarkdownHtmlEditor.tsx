import { useState, useCallback, useRef } from 'react'
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
    <div ref={editorRef} className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="wysiwyg">WYSIWYG</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadExample}
            className="hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Load Example
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScrollToTop}
            className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-all duration-200"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Scroll to Top
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
            className="hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-300 transition-all duration-200"
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 h-full ${showPreview ? 'md:grid-cols-2 grid-cols-1' : 'grid-cols-1'}`}>
        <div className="flex flex-col">
          <div className="h-[70vh] min-h-[300px] border border-teal-200/50 dark:border-teal-700/50 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-auto">
            {activeTab === 'wysiwyg' ? (
              <TipTapEditor initialMarkdown={markdown} onDocChange={handleMarkdownChange} />
            ) : (
              <MarkdownEditor initialMarkdown={markdown} onChange={handleMarkdownChange} />
            )}
          </div>
        </div>
        {showPreview && (
          <div className="flex flex-col">
            <div className="h-[70vh] min-h-[300px] border border-blue-200/50 dark:border-blue-700/50 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-auto relative">
              {isPending && (
                <div className="pointer-events-none absolute top-3 right-3 text-xs text-teal-600 dark:text-teal-400 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-md backdrop-blur-sm z-10 border border-teal-200/30 dark:border-teal-700/30">Updating...</div>
              )}
              <div className="p-6 prose prose-slate dark:prose-invert max-w-none overflow-auto h-full prose-headings:text-teal-700 dark:prose-headings:text-teal-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-100">
                {previewContent}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



