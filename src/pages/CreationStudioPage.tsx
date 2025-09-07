import { useEffect, useState, useCallback, useRef } from 'react';
import { MarkdownHtmlEditor } from '../components/MarkdownHtmlEditor';
import { FrontMatterPanel } from '../components/FrontMatter/FrontMatterPanel';
import { FrontMatterModal } from '../components/FrontMatter/FrontMatterModal';
import { SaveAsModal } from '../components/SaveAsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TrashModal } from '../components/TrashModal';
import { R2Browser } from '../components/R2/R2Browser';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { apiClient } from '../lib/api';
import { extractFrontMatter, assemble } from '../lib/markdown';
import { Download, Save, AlertTriangle, Maximize, Minimize, FileText } from 'lucide-react';
import { Badge } from '../components/ui/badge';

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
  const [leftHeight, setLeftHeight] = useState<number>(0);
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

  const handleFileSelect = async (key: string) => {
    if (isDirty) {
      setConfirm({
        open: true,
        message: 'You have unsaved changes. Continue without saving?',
        onConfirm: async () => { setConfirm({ open: false, message: '' }); await doLoad(key); },
      });
      return;
    }
    await doLoad(key);
  };

  const doLoad = async (key: string) => {
    try {
      const response = await apiClient.readContent(key);
      if (response.success && response.data) {
        const { attributes, body } = extractFrontMatter(response.data.body);
        setMarkdown(body);
        setFrontmatter(attributes);
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
  };

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

  const handleSave = async (force = false) => {
    if (!currentFile) {
      setIsSaveAsOpen(true);
      return;
    }
    const fullContent = assemble(frontmatter, markdown);
    setSaveStatus('saving');
    const response = await apiClient.writeContent(
      currentFile,
      fullContent,
      force ? undefined : currentEtag
    );
    if (response.success && response.data) {
      setCurrentEtag(response.data.etag);
      setIsDirty(false);
      setSaveStatus('saved');
      setBrowserNonce((n) => n + 1);
      setTimeout(() => setSaveStatus('idle'), 1500);
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
  }, [isDirty, isFullscreen]);

  return (
    <div className="flex flex-col min-h-0 h-full bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950">
      {/* Enhanced Header with Brand Theme */}
      <div className="relative border-b border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
        <div className="relative p-4 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            {/* Enhanced Title with Targeting Theme */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={{fontWeight: 700}}>
                  <span className="bg-gradient-to-r from-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Content Creation Studio
                  </span>
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600 rounded-full mt-1"></div>
              </div>
            </div>
            {/* Enhanced Status Badges */}
            <div className="flex gap-2 items-center">
              {(() => {
                const proxyBase = (import.meta as any).env?.VITE_R2_PROXY_BASE as string | undefined;
                const apiTarget = (import.meta as any).env?.VITE_API_PROXY_TARGET as string | undefined;
                return (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-700"
                      title={proxyBase || 'Reads via /api/content/read'}
                    >
                      <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mr-2"></div>
                      Read: {proxyBase ? 'R2 Proxy' : 'Functions'}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                      title={apiTarget || 'Writes to local Functions'}
                    >
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                      Write: {apiTarget ? 'Prod API' : 'Local API'}
                    </Badge>
                  </>
                );
              })()}
            </div>
            {/* Enhanced File Status */}
            {currentFile && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {currentFile.split('/').pop()} {isDirty && (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">• Unsaved changes</span>
                  )}
                </p>
              </div>
            )}
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
              className="bg-gradient-to-r from-teal-800 to-blue-800 hover:from-teal-900 hover:to-blue-900 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsSaveAsOpen(true)}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            >
              Save As
            </Button>
            <Button
              variant="outline"
              size="sm"
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
            {currentFile && (
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
                className="bg-red-600 hover:bg-red-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setTrashOpen(true)}
              className="border-slate-600 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Trash
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content Area: content browser + front matter define height */}
      <div className="flex-1 p-6 min-h-0" data-content-area>
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
            <div ref={editorHeaderRef} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-t-xl shadow-lg">
              <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 rounded-lg shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white" style={{fontWeight: 700}}>
                    <span className="bg-gradient-to-r from-teal-800 to-blue-800 bg-clip-text text-transparent">
                      Content Editor
                    </span>
                  </h3>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600 rounded-full mt-1"></div>
                </div>
              </div>
            </div>
            {/* Editor Content (dynamically scales to fill available space) */}
            <div
              ref={editorWrapperRef}
              className="relative flex-1 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-x border-b border-slate-200/50 dark:border-slate-700/50 rounded-b-xl shadow-lg"
              style={{
                minHeight: '200px'
              }}
            >
              <div className="h-full overflow-auto">
                <MarkdownHtmlEditor
                  initialMarkdown={markdown}
                  onChange={handleMarkdownChange}
                />
              </div>
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
            // Replace entirely per requirement
            setFrontmatter(resp.data.frontmatter || {});
          }
        }}
      />
      <SaveAsModal
        open={isSaveAsOpen}
        onOpenChange={setIsSaveAsOpen}
        initialDir={(currentFile.split('/')[0] as any) || 'blog'}
        initialName={(currentFile.split('/').pop() || '').replace(/\.md$/, '')}
        onConfirm={async (key) => {
          setCurrentFile(key);
          setIsSaveAsOpen(false);
          await handleSave(true);
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
                <div className="p-3 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white" style={{fontWeight: 700}}>
                    <span className="bg-gradient-to-r from-teal-800 to-blue-800 bg-clip-text text-transparent">
                      Fullscreen Editor
                    </span>
                  </h2>
                  {currentFile && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {currentFile.split('/').pop()} {isDirty && (
                          <span className="text-orange-600 dark:text-orange-400 font-medium">• Unsaved changes</span>
                        )}
                      </p>
                    </div>
                  )}
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
