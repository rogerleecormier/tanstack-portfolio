import { useState } from 'react';
import { MarkdownHtmlEditor } from '../components/MarkdownHtmlEditor';
import { Button } from '../components/ui/button';
import { Download } from 'lucide-react';
import { ScrollToTop } from '../components/ScrollToTop';

export function MarkdownOnlyPage() {
  const [markdown, setMarkdown] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setIsDirty(true);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDirty(false);
  };

  return (
    <div className='flex h-screen flex-col bg-surface-base'>
      {/* Header with Glassmorphism */}
      <div className='flex items-center justify-between border-b border-surface-elevated/50 bg-surface-base/40 p-4 backdrop-blur-xl'>
        <div>
          <h1 className='text-2xl font-bold text-strategy-gold'>Markdown Editor</h1>
          {isDirty && (
            <p className='text-sm text-text-tertiary'>Unsaved changes</p>
          )}
        </div>
        <div className='flex gap-2'>
          <Button 
            onClick={handleDownload}
            className='border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
          >
            <Download className='mr-2 size-4' />
            Download
          </Button>
        </div>
      </div>

      {/* Editor Area with Glassmorphism */}
      <div className='flex-1 overflow-hidden p-4'>
        <div className='h-full max-h-[calc(100vh-200px)] rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 p-4 shadow-lg backdrop-blur-xl'>
          <MarkdownHtmlEditor
            initialMarkdown={markdown}
            onChange={handleMarkdownChange}
          />
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
