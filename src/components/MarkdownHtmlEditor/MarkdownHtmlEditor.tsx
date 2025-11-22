import { useState, useCallback, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { TooltipPortal } from '@radix-ui/react-tooltip';
import { Eye, EyeOff, FileText, Trash2 } from 'lucide-react';
import { TipTapEditor } from './TipTapEditor';
import { MarkdownEditor } from './MarkdownEditor';
import { renderMarkdownForPreview } from '../../lib/markdown';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import { DUMMY_MARKDOWN } from '../../lib/dummyMarkdown';

interface MarkdownHtmlEditorProps {
  initialMarkdown?: string;
  onChange: (markdown: string) => void;
}

export function MarkdownHtmlEditor({
  initialMarkdown = '',
  onChange,
}: MarkdownHtmlEditorProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [activeTab, setActiveTab] = useState<'wysiwyg' | 'markdown'>('wysiwyg');
  const [showPreview, setShowPreview] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  // Update internal markdown state when initialMarkdown prop changes (e.g., when loading a file)
  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  // Debounced preview to avoid focus glitches and heavy re-rendering
  const [debouncedMarkdown, isPending] = useDebouncedValue(markdown, 350);

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      setMarkdown(newMarkdown);
      onChange(newMarkdown);
    },
    [onChange]
  );

  const handleLoadExample = useCallback(() => {
    setMarkdown(DUMMY_MARKDOWN);
    onChange(DUMMY_MARKDOWN);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setMarkdown('');
    onChange('');
  }, [onChange]);

  const previewContent = renderMarkdownForPreview(debouncedMarkdown);

  return (
    <div
      ref={editorRef}
      className='flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-700/60 dark:bg-slate-900/70'
    >
      {/* Toolbar */}
      <div className='shrink-0 border-b border-slate-200/60 dark:border-slate-700/60'>
        <div className='px-4 py-3'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-4'>
              {/* Editor Mode Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={value => setActiveTab(value as typeof activeTab)}
              >
                <TabsList className='border border-slate-200/60 bg-white/80 dark:border-slate-700/60 dark:bg-slate-800/80'>
                  <TabsTrigger
                    value='wysiwyg'
                    className='transition-colors data-[state=active]:bg-hunter-600 data-[state=active]:text-white'
                  >
                    WYSIWYG
                  </TabsTrigger>
                  <TabsTrigger
                    value='markdown'
                    className='transition-colors data-[state=active]:bg-hunter-600 data-[state=active]:text-white'
                  >
                    Markdown
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-1.5'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleLoadExample}
                    className='rounded-md border-hunter-600 text-hunter-600 hover:bg-hunter-50 dark:hover:bg-hunter-950'
                  >
                    <FileText className='size-4' />
                    <span className='ml-2 hidden sm:inline'>Example</span>
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>Load example content</TooltipContent>
                </TooltipPortal>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleClear}
                    className='rounded-md border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                  >
                    <Trash2 className='size-4' />
                    <span className='ml-2 hidden sm:inline'>Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>Clear editor</TooltipContent>
                </TooltipPortal>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowPreview(v => !v)}
                    className='rounded-md border-slate-600 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-950'
                  >
                    {showPreview ? (
                      <EyeOff className='size-4' />
                    ) : (
                      <Eye className='size-4' />
                    )}
                    <span className='ml-2 hidden sm:inline'>
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>
                    {showPreview ? 'Hide preview' : 'Show preview'}
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className='min-h-0 flex-1 overflow-hidden p-4'>
        <div
          className={`grid h-full min-h-0 gap-6 ${showPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
        >
          <div className='flex min-h-0 min-w-0 flex-col'>
            {/* Editor Container with Enhanced Styling */}
            <div className='flex-1 overflow-hidden rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70'>
              {/* Editor Mode Indicator */}
              <div className='flex items-center justify-between border-b border-slate-200/60 px-4 py-2 dark:border-slate-700/60'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-hunter-600'></div>
                  <span className='text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300'>
                    {activeTab === 'wysiwyg'
                      ? 'Rich Text Editor'
                      : 'Markdown Editor'}
                  </span>
                </div>
                <div className='text-xs text-muted-foreground'>
                  {markdown.length} characters
                </div>
              </div>

              {/* Actual Editor */}
              <div className='h-full overflow-auto'>
                {activeTab === 'wysiwyg' ? (
                  <TipTapEditor
                    initialMarkdown={markdown}
                    onDocChange={handleMarkdownChange}
                  />
                ) : (
                  <MarkdownEditor
                    initialMarkdown={markdown}
                    onChange={handleMarkdownChange}
                  />
                )}
              </div>
            </div>
          </div>

          {showPreview && (
            <div className='flex min-h-0 min-w-0 flex-col'>
              {/* Preview Container with Enhanced Styling */}
              <div className='flex-1 overflow-hidden rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70'>
                {/* Preview Header */}
                <div className='flex items-center justify-between border-b border-slate-200/60 px-4 py-2 dark:border-slate-700/60'>
                  <div className='flex items-center gap-2'>
                    <div className='size-2 rounded-full bg-slate-600'></div>
                    <span className='text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300'>
                      Live Preview
                    </span>
                  </div>
                  {isPending && (
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <div className='size-3 animate-spin rounded-full border border-slate-600 border-t-transparent dark:border-slate-400'></div>
                      Updating...
                    </div>
                  )}
                </div>

                {/* Preview Content */}
                <div className='h-full overflow-auto'>
                  <div className='prose prose-slate max-w-none p-6 dark:prose-invert prose-headings:text-slate-900 prose-a:text-hunter-600 hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-gold-700 prose-pre:rounded-lg prose-pre:bg-slate-950/90 prose-pre:text-slate-100 prose-pre:ring-1 prose-pre:ring-slate-200/20 prose-li:marker:text-slate-400 dark:prose-headings:text-slate-100 dark:prose-a:text-hunter-400 dark:prose-strong:text-slate-100 dark:prose-code:text-gold-300 dark:prose-pre:bg-slate-900/70'>
                    {previewContent}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
