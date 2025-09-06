import { useState, useCallback } from 'react';
import { MarkdownHtmlEditor } from '../components/MarkdownHtmlEditor';
import { FrontMatterPanel } from '../components/FrontMatter/FrontMatterPanel';
import { R2Browser } from '../components/R2/R2Browser';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { apiClient } from '../lib/api';
import { extractFrontMatter, assemble } from '../lib/markdown';
import { Download, Save, AlertTriangle } from 'lucide-react';

export function CreationStudioPage() {
  const [markdown, setMarkdown] = useState('');
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentEtag, setCurrentEtag] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [conflictModal, setConflictModal] = useState<{
    open: boolean;
    message: string;
    options: Array<{ label: string; action: () => void }>;
  }>({ open: false, message: '', options: [] });

  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setIsDirty(true);
  }, []);

  const handleFrontMatterChange = useCallback((newFrontmatter: Record<string, unknown>) => {
    setFrontmatter(newFrontmatter);
    setIsDirty(true);
  }, []);

  const handleFileSelect = async (key: string) => {
    if (isDirty && !confirm('You have unsaved changes. Continue?')) {
      return;
    }

    try {
      const response = await apiClient.readContent(key);
      if (response.success && response.data) {
        const { attributes, body } = extractFrontMatter(response.data);
        setMarkdown(body);
        setFrontmatter(attributes);
        setCurrentFile(key);
        setCurrentEtag('');
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const handleFileDownload = async (key: string) => {
    try {
      const response = await apiClient.readContent(key);
      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = key.split('/').pop() || 'file.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleSave = async (force = false) => {
    if (!currentFile) {
      const newKey = prompt('Enter file name (without .md extension):');
      if (!newKey) return;
      setCurrentFile(`content/${newKey}.md`);
    }

    const fullContent = assemble(frontmatter, markdown);
    const response = await apiClient.writeContent(
      currentFile,
      fullContent,
      force ? undefined : currentEtag
    );

    if (response.success && response.data) {
      setCurrentEtag(response.data.etag);
      setIsDirty(false);
      alert('File saved successfully!');
    } else if (response.error?.code === 'etag_conflict') {
      setConflictModal({
        open: true,
        message: 'The file has been modified by another user. What would you like to do?',
        options: [
          {
            label: 'Reload and merge',
            action: () => {
              handleFileSelect(currentFile);
              setConflictModal({ open: false, message: '', options: [] });
            },
          },
          {
            label: 'Force save',
            action: () => {
              handleSave(true);
              setConflictModal({ open: false, message: '', options: [] });
            },
          },
          {
            label: 'Save as new file',
            action: () => {
              const newKey = prompt('Enter new file name:');
              if (newKey) {
                setCurrentFile(`content/${newKey}.md`);
                setCurrentEtag('');
                handleSave(true);
              }
              setConflictModal({ open: false, message: '', options: [] });
            },
          },
        ],
      });
    } else {
      alert(`Save failed: ${response.error?.message}`);
    }
  };

  const handleDownload = () => {
    const fullContent = assemble(frontmatter, markdown);
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.split('/').pop() || 'untitled.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Creation Studio</h1>
          {currentFile && (
            <p className="text-sm text-muted-foreground">
              {currentFile} {isDirty && '(unsaved changes)'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => handleSave()}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        <div className="col-span-3 overflow-hidden">
          <R2Browser
            onFileSelect={handleFileSelect}
            onFileDownload={handleFileDownload}
          />
        </div>
        <div className="col-span-6 overflow-hidden">
          <div className="h-full max-h-[calc(100vh-200px)]">
            <MarkdownHtmlEditor
              initialMarkdown={markdown}
              onChange={handleMarkdownChange}
            />
          </div>
        </div>
        <div className="col-span-3 overflow-hidden">
          <FrontMatterPanel
            markdown={markdown}
            onFrontMatterChange={handleFrontMatterChange}
          />
        </div>
      </div>

      <Dialog open={conflictModal.open} onOpenChange={(open) =>
        setConflictModal(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conflict Detected
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertDescription>{conflictModal.message}</AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-end">
            {conflictModal.options.map((option, index) => (
              <Button key={index} onClick={option.action}>
                {option.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
