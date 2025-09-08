import { useEffect, useState, useCallback, useRef } from 'react';
import { MarkdownHtmlEditor } from '../components/MarkdownHtmlEditor';
import { FrontMatterPanel } from '../components/FrontMatter/FrontMatterPanel';
import { FrontMatterModal } from '../components/FrontMatter/FrontMatterModal';
import { SaveAsModal } from '../components/SaveAsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TrashModal } from '../components/TrashModal';
import { R2Browser } from '../components/R2/R2Browser';
import { Button } from '../components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { apiClient } from '../lib/api';
import { extractFrontMatter, assemble } from '../lib/markdown';
import { Download, Save, AlertTriangle, Maximize, Minimize, FileText, Plus, SaveIcon, Trash2 } from 'lucide-react';

export function CreationStudioPage() {
  const [markdown, setMarkdown] = useState('');
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentEtag, setCurrentEtag] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [isFrontmatterModalOpen, setIsFrontmatterModalOpen] = useState(false);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; message: string; onConfirm?: () => void }>({ open: false, message: '' });
  const [trashOpen, setTrashOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [conflictModal, setConflictModal] = useState<{
    open: boolean;
    message: string;
    options: Array<{ label: string; action: () => void }>;
  }>({ open: false, message: '', options: [] });
  const [browserNonce, setBrowserNonce] = useState(0);
  // Start with a reasonable height to avoid initial reflow pushing the footer
  const [leftHeight, setLeftHeight] = useState<number>(720);
  const [hydrating, setHydrating] = useState(true);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const editorHeaderRef = useRef<HTMLDivElement | null>(null);
  const editorWrapperRef = useRef<HTMLDivElement | null>(null);

  const measureHeights = useCallback(() => {
    const leftCol = leftColRef.current;

    if (leftCol) {
      // Get the actual combined height of content browser + front matter
      const leftColHeight = leftCol.getBoundingClientRect().height;

      // The editor should match the full height of the left column content
      setLeftHeight(Math.floor(leftColHeight));
    } else {
      // Fallback value
      setLeftHeight(400);
    }
  }, []);

  useEffect(() => {
    measureHeights();
    // Allow one frame for layout, then end hydration skeleton
    requestAnimationFrame(() => setHydrating(false));
    const onResize = () => measureHeights();
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | undefined;
    if ('ResizeObserver' in window && leftColRef.current) {
      ro = new ResizeObserver(() => measureHeights());
      ro.observe(leftColRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, [measureHeights]);

  // Re-measure heights when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      measureHeights();
    }, 100); // Small delay to allow DOM updates
    return () => clearTimeout(timeoutId);
  }, [frontmatter, markdown, measureHeights]);

  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown);
    setIsDirty(true);
  }, []);

  const handleFrontMatterChange = useCallback((newFrontmatter: Record<string, unknown>) => {
    setFrontmatter(newFrontmatter);
    setIsDirty(true);
  }, []);

  const doLoad = useCallback(async (key: string) => {
    try {
      const response = await apiClient.readContent(key);
      if (response.success && response.data) {
        const { attributes, body } = extractFrontMatter(response.data.body);

        // Convert any Date objects to strings to prevent React rendering errors
        const processedAttributes = Object.entries(attributes).reduce((acc, [key, value]) => {
          acc[key] = value instanceof Date ? value.toISOString().split('T')[0] : value;
          return acc;
        }, {} as Record<string, unknown>);

        setMarkdown(body);
        setFrontmatter(processedAttributes);
        setCurrentFile(key);
        setCurrentEtag(response.data.etag);
        setIsDirty(false);
        // wait a frame to ensure layout updated, then measure
        requestAnimationFrame(() => {
          // A second tick to ensure fonts/layout settle
          setTimeout(measureHeights, 0);
        });
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  }, [measureHeights]);

  const handleFileSelect = useCallback(async (key: string) => {
    if (isDirty) {
      setConfirm({
        open: true,
        message: 'You have unsaved changes. Continue without saving?',
        onConfirm: async () => { setConfirm({ open: false, message: '' }); await doLoad(key); },
      });
      return;
    }
    await doLoad(key);
  }, [isDirty, doLoad]);

  const handleFileDownload = async (key: string) => {
    try {
      const response = await apiClient.readContent(key);
      if (response.success && response.data) {
        const blob = new Blob([response.data.body], { type: 'text/markdown' });
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

  const handleSave = useCallback(async (force = false, fileKey?: string) => {
    const keyToUse = fileKey || currentFile;
    if (!keyToUse) {
      setIsSaveAsOpen(true);
      return;
    }
    const fullContent = assemble(frontmatter, markdown);
    setSaveStatus('saving');
    const response = await apiClient.writeContent(
      keyToUse,
      fullContent,
      force ? undefined : currentEtag
    );
    if (response.success && response.data) {
      setCurrentEtag(response.data.etag);
      setIsDirty(false);
      setSaveStatus('saved');
      setBrowserNonce((n) => n + 1);
      // Update current file if a new key was provided
      if (fileKey) {
        setCurrentFile(fileKey);
      }
      setTimeout(() => setSaveStatus('idle'), 1500);
    } else if (response.error?.code === 'etag_conflict' || response.error?.code === 'HTTP_409') {
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
              setIsSaveAsOpen(true);
              setConflictModal({ open: false, message: '', options: [] });
            },
          },
        ],
      });
    } else {
      console.error('Save failed', response.error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [currentFile, currentEtag, frontmatter, markdown, handleFileSelect]);

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

  // Unsaved-changes guard, Ctrl+S shortcut, and Escape key for fullscreen
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDirty, isFullscreen, handleSave]);

  return (
    <div className="flex flex-col min-h-0 h-full bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950">
      {/* Enhanced Header with Brand Theme */}
      <div className="relative border-b border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
        <div className="relative p-4 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            {/* Enhanced Title with Targeting Theme */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{fontWeight: 700}}>
                  Content Creation Studio
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600 rounded-full mt-1"></div>
              </div>
            </div>
            {/* Enhanced File Status - Always present to prevent layout shifts */}
            <div className="flex items-center gap-2 min-h-[20px]">
              {currentFile ? (
                <>
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Currently Editing:</span> {currentFile} {isDirty && (
                      <span className="text-orange-600 dark:text-orange-400 font-medium">• Unsaved changes</span>
                    )}
                  </p>
                </>
              ) : (
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (isDirty) {
                  setConfirm({
                    open: true,
                    message: 'You have unsaved changes. Start a new document?',
                    onConfirm: () => {
                      setConfirm({ open: false, message: '' });
                      setMarkdown('');
                      setFrontmatter({});
                      setCurrentFile('');
                      setCurrentEtag('');
                      setIsDirty(true);
                    }
                  });
                } else {
                  setMarkdown('');
                  setFrontmatter({});
                  setCurrentFile('');
                  setCurrentEtag('');
                  setIsDirty(true);
                }
              }}
              className="border-slate-600 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => handleSave()}
              className="bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[80px]"
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="min-w-[50px] text-center">
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSaveAsOpen(true)}
              className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all duration-200"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              Save As
            </Button>
            <div className="min-w-[70px]">
              {currentFile ? (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    setConfirm({
                      open: true,
                      message: `Move to trash?\n${currentFile}`,
                      onConfirm: async () => {
                        setConfirm({ open: false, message: '' });
                        const res = await apiClient.deleteContentSoft(currentFile);
                        if (res.success) {
                          setMarkdown('');
                          setFrontmatter({});
                          setCurrentFile('');
                          setCurrentEtag('');
                          setIsDirty(false);
                          setBrowserNonce((n) => n + 1);
                        }
                      }
                    })
                  }}
                  className="bg-red-600 hover:bg-red-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="border-red-200 text-red-400 cursor-not-allowed opacity-50 w-full"
                  title="No file selected"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setTrashOpen(true)}
              className="border-slate-600 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Trash
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content Area: content browser + front matter define height */}
      <div className="flex-1 py-6 px-0 min-h-[70vh]" data-content-area>
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Panel - Content Browser & Frontmatter */}
          <div ref={leftColRef} className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0">
            <div className="overflow-hidden">
              <R2Browser
                refreshSignal={browserNonce}
                onFileSelect={handleFileSelect}
                onFileDownload={handleFileDownload}
              />
            </div>
            <div className="overflow-hidden">
              <FrontMatterPanel
                markdown={assemble(frontmatter, markdown)}
                onFrontMatterChange={handleFrontMatterChange}
                onEdit={() => setIsFrontmatterModalOpen(true)}
              />
            </div>
          </div>
          {/* Right Panel - Main Editor (dynamically scales to match left panel height) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0" style={{ height: leftHeight ? `${leftHeight}px` : 'auto' }}>
            {/* Editor Header */}
            <div ref={editorHeaderRef} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-t-xl">
              <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{fontWeight: 700}}>
                    Content Editor
                  </h3>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600 rounded-full mt-1"></div>
                </div>
              </div>
            </div>
            {/* Editor Content (dynamically scales to fill available space) */}
            <div
              ref={editorWrapperRef}
              className="relative flex-1 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-x border-b border-slate-200/50 dark:border-slate-700/50 rounded-b-xl"
              style={{
                minHeight: '200px'
              }}
            >
              {hydrating ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <MarkdownHtmlEditor
                    initialMarkdown={markdown}
                    onChange={handleMarkdownChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <FrontMatterModal
        open={isFrontmatterModalOpen}
        onOpenChange={setIsFrontmatterModalOpen}
        value={frontmatter}
        onCancel={() => setIsFrontmatterModalOpen(false)}
        onSave={(updated) => {
          setFrontmatter(updated);
          setIsFrontmatterModalOpen(false);
          setIsDirty(true);
        }}
        onGenerate={async () => {
          const resp = await apiClient.generateFrontmatter(markdown);
          if (resp.success && resp.data) {
            return resp.data.frontmatter || {};
          }
          return undefined;
        }}
      />
      <SaveAsModal
        open={isSaveAsOpen}
        onOpenChange={setIsSaveAsOpen}
        initialDir={(currentFile.split('/')[0] as 'blog' | 'portfolio' | 'projects') || 'blog'}
        initialName={(currentFile.split('/').pop() || '').replace(/\.md$/, '')}
        onConfirm={async (key) => {
          setCurrentFile(key);
          setIsSaveAsOpen(false);
          await handleSave(true, key);
        }}
      />
      <ConfirmDialog
        open={confirm.open}
        message={confirm.message}
        onCancel={() => setConfirm({ open: false, message: '' })}
        onConfirm={() => confirm.onConfirm?.()}
      />
      <TrashModal
        open={trashOpen}
        onOpenChange={setTrashOpen}
        onRestored={() => setBrowserNonce((n) => n + 1)}
      />
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
      {/* Fullscreen Editor Modal with Brand Theme */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950">
          <div className="flex flex-col h-full">
            {/* Enhanced Header with Brand Theme */}
            <div className="relative flex items-center justify-between p-6 border-b border-teal-200 dark:border-teal-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" style={{fontWeight: 700}}>
                    Fullscreen Editor
                  </h2>
                  <div className="flex items-center gap-2 mt-1 min-h-[20px]">
                    {currentFile ? (
                      <>
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {currentFile} {isDirty && (
                            <span className="text-orange-600 dark:text-orange-400 font-medium">• Unsaved changes</span>
                          )}
                        </p>
                      </>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="relative z-10 gap-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Minimize className="h-4 w-4" />
                Return to Studio
              </Button>
            </div>
            {/* Enhanced Editor Content */}
            <div className="flex-1 overflow-hidden p-2">
              <div className="h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-lg">
                <MarkdownHtmlEditor
                  initialMarkdown={markdown}
                  onChange={handleMarkdownChange}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreationStudioPage;
