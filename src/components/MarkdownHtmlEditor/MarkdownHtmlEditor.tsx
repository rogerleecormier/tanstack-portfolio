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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleLoadExample}>
            <FileText className="h-4 w-4 mr-2" />
            Load Example
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={handleScrollToTop}>
            <ArrowUp className="h-4 w-4 mr-2" />
            Scroll to Top
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 h-full ${showPreview ? 'md:grid-cols-2 grid-cols-1' : 'grid-cols-1'}`}>
        <div className="flex flex-col">
          <div className="h-[70vh] min-h-[300px] border border-border/50 rounded-lg bg-background overflow-auto">
            {activeTab === 'wysiwyg' ? (
              <TipTapEditor initialMarkdown={markdown} onDocChange={handleMarkdownChange} />
            ) : (
              <MarkdownEditor initialMarkdown={markdown} onChange={handleMarkdownChange} />
            )}
          </div>
        </div>
        {showPreview && (
          <div className="flex flex-col">
            <div className="h-[70vh] min-h-[300px] border border-border/50 rounded-lg bg-background overflow-auto relative">
              {isPending && (
                <div className="pointer-events-none absolute top-2 right-3 text-xs text-muted-foreground z-10">Updating�</div>
              )}
              <div className="p-4 prose max-w-none overflow-auto h-full">
                {previewContent}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



