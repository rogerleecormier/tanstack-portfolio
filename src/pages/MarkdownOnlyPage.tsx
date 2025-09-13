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
    <div className='flex h-screen flex-col'>
      <div className='flex items-center justify-between border-b p-4'>
        <div>
          <h1 className='text-2xl font-bold'>Markdown Editor</h1>
          {isDirty && (
            <p className='text-sm text-muted-foreground'>Unsaved changes</p>
          )}
        </div>
        <div className='flex gap-2'>
          <Button onClick={handleDownload}>
            <Download className='mr-2 size-4' />
            Download
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden p-4'>
        <div className='h-full max-h-[calc(100vh-200px)]'>
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
