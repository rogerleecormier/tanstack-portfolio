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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';
import { apiClient } from '../lib/api';
import { extractFrontMatter, assemble } from '../lib/markdown';
import {
  Download,
  Save,
  AlertTriangle,
  Maximize,
  Minimize,
  FileText,
  Plus,
  SaveIcon,
  Trash2,
  RefreshCw,
  Archive,
  Database,
} from 'lucide-react';
import {
  triggerContentStudioRebuild,
  triggerManualRebuild,
  getEnhancedCacheStatus,
} from '../utils/cacheRebuildService';

// Helper function to format relative time
function getRelativeTimeString(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

export function CreationStudioPage() {
  const [markdown, setMarkdown] = useState('');
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentEtag, setCurrentEtag] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [isFrontmatterModalOpen, setIsFrontmatterModalOpen] = useState(false);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    message: string;
    onConfirm?: () => void;
  }>({ open: false, message: '' });
  const [trashOpen, setTrashOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [conflictModal, setConflictModal] = useState<{
    open: boolean;
    message: string;
    options: Array<{ label: string; action: () => void }>;
  }>({ open: false, message: '', options: [] });
  const [browserNonce, setBrowserNonce] = useState(0);
  // Start with a reasonable height to avoid initial reflow pushing the footer
  const [leftHeight, setLeftHeight] = useState<number>(720);
  const [hydrating, setHydrating] = useState(true);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [shouldRebuildCache, setShouldRebuildCache] = useState(false);
  const [cacheRebuildStatus, setCacheRebuildStatus] = useState<
    'idle' | 'rebuilding' | 'completed' | 'error'
  >('idle');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [cacheStatus, setCacheStatus] = useState<{
    lastUpdated: string;
    totalItems: number;
    trigger?: string;
  } | null>(null);
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

  // Load cache status on mount and refresh periodically
  useEffect(() => {
    const loadCacheStatus = async () => {
      try {
        const status = await getEnhancedCacheStatus();
        if (status?.cache) {
          setCacheStatus({
            lastUpdated: status.cache.lastUpdated,
            totalItems: status.cache.totalItems,
            trigger: status.cache.trigger,
          });
        }
      } catch (error) {
        console.error('Failed to load cache status:', error);
      }
    };

    // Load immediately
    loadCacheStatus();

    // Refresh every 30 seconds to keep relative time accurate
    const interval = setInterval(loadCacheStatus, 30000);

    return () => clearInterval(interval);
  }, []);

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

  const handleFrontMatterChange = useCallback(
    (newFrontmatter: Record<string, unknown>) => {
      setFrontmatter(newFrontmatter);
      setIsDirty(true);
    },
    []
  );

  const doLoad = useCallback(
    async (key: string) => {
      try {
        const response = await apiClient.readContent(key);
        if (response.success && response.data) {
          const { attributes, body } = extractFrontMatter(response.data.body);

          // Convert any Date objects to strings to prevent React rendering errors
          const processedAttributes = Object.entries(attributes).reduce(
            (acc, [key, value]) => {
              acc[key] =
                value instanceof Date
                  ? value.toISOString().split('T')[0]
                  : value;
              return acc;
            },
            {} as Record<string, unknown>
          );

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
    },
    [measureHeights]
  );

  const handleFileSelect = useCallback(
    async (key: string) => {
      if (isDirty) {
        setConfirm({
          open: true,
          message: 'You have unsaved changes. Continue without saving?',
          onConfirm: async () => {
            setConfirm({ open: false, message: '' });
            await doLoad(key);
          },
        });
        return;
      }
      await doLoad(key);
    },
    [isDirty, doLoad]
  );

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

  const handleSave = useCallback(
    async (force = false, fileKey?: string) => {
      const keyToUse = fileKey || currentFile;
      if (!keyToUse) {
        setIsSaveAsOpen(true);
        return;
      }
      const fullContent = assemble(frontmatter, markdown);
      setSaveStatus('saving');

      // Track the content we're about to save
      const contentChanged = fullContent !== lastSavedContent;
      const isNewFile = !currentFile && fileKey;
      const response = await apiClient.writeContent(
        keyToUse,
        fullContent,
        force ? undefined : currentEtag
      );
      if (response.success && response.data) {
        setCurrentEtag(response.data.etag);
        setIsDirty(false);
        setSaveStatus('saved');
        setBrowserNonce(n => n + 1);
        // Update current file if a new key was provided
        if (fileKey) {
          setCurrentFile(fileKey);
        }
        setTimeout(() => setSaveStatus('idle'), 1500);

        // Update last saved content for change detection
        setLastSavedContent(fullContent);

        // Smart cache rebuild suggestions
        const shouldSuggestRebuild =
          isNewFile ||
          (contentChanged && keyToUse.includes('blog/')) ||
          keyToUse.includes('portfolio/');

        // Trigger cache rebuild if requested or auto-suggested for new/important content
        const isAutoRebuild = !shouldRebuildCache && shouldSuggestRebuild;
        if (shouldRebuildCache || isAutoRebuild) {
          setCacheRebuildStatus('rebuilding');
          try {
            const cacheResponse = await triggerContentStudioRebuild();
            if (cacheResponse.success) {
              setCacheRebuildStatus('completed');
              console.log(
                `✅ Cache rebuilt successfully${isAutoRebuild ? ' (auto-triggered)' : ''}`
              );
              console.log(
                `📊 Total items: ${cacheResponse.stats?.total || 'unknown'}`
              );

              // Update cache status with enhanced data
              const enhancedStatus = await getEnhancedCacheStatus();
              if (enhancedStatus?.cache) {
                setCacheStatus({
                  lastUpdated: enhancedStatus.cache.lastUpdated,
                  totalItems: enhancedStatus.cache.totalItems,
                  trigger: enhancedStatus.cache.trigger,
                });
              } else if (cacheResponse.stats) {
                setCacheStatus({
                  lastUpdated: cacheResponse.timestamp,
                  totalItems: cacheResponse.stats.total,
                  trigger: cacheResponse.trigger,
                });
              }

              // Auto-uncheck the rebuild cache option after successful rebuild (only for manual rebuilds)
              if (!isAutoRebuild) {
                setShouldRebuildCache(false);
              }
            } else {
              setCacheRebuildStatus('error');
              console.error(
                '❌ Cache rebuild failed:',
                cacheResponse.error || cacheResponse.message
              );
            }
          } catch (error) {
            setCacheRebuildStatus('error');
            console.error('❌ Cache rebuild error:', error);
          }
          // Reset cache rebuild status after 3 seconds
          setTimeout(() => setCacheRebuildStatus('idle'), 3000);
        }
      } else if (
        response.error?.code === 'etag_conflict' ||
        response.error?.code === 'HTTP_409'
      ) {
        setConflictModal({
          open: true,
          message:
            'The file has been modified by another user. What would you like to do?',
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
    },
    [
      currentFile,
      currentEtag,
      frontmatter,
      markdown,
      handleFileSelect,
      shouldRebuildCache,
      lastSavedContent,
    ]
  );

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

  // Calculate scrollbar width once on mount
  useEffect(() => {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.width = '100px';
    outer.style.height = '100px';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '100%';
    outer.appendChild(inner);
    const width = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);
    setScrollbarWidth(width);
  }, []);

  // Apply scrollbar compensation for any modal open
  const anyModalOpen =
    isFrontmatterModalOpen ||
    isSaveAsOpen ||
    confirm.open ||
    trashOpen ||
    conflictModal.open ||
    isFullscreen;
  useEffect(() => {
    if (anyModalOpen && scrollbarWidth > 0) {
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }
  }, [anyModalOpen, scrollbarWidth]);

  return (
    <div className='flex h-full min-h-0 flex-col bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950'>
      {/* Enhanced Header with Brand Theme */}
      <div className='relative border-b border-teal-200 bg-white/80 backdrop-blur-sm dark:border-teal-800 dark:bg-slate-900/80'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>
        <div className='relative flex items-center justify-between p-4'>
          <div className='flex flex-col gap-2'>
            {/* Enhanced Title with Targeting Theme */}
            <div className='flex items-center gap-4'>
              <div className='rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 p-3 shadow-lg'>
                <FileText className='size-6 text-white' />
              </div>
              <div>
                <h1
                  className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white'
                  style={{ fontWeight: 700 }}
                >
                  Content Creation Studio
                </h1>
                <div className='mt-1 h-1 w-32 rounded-full bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600'></div>
              </div>
            </div>
            {/* Enhanced File Status - Always present to prevent layout shifts */}
            <div className='flex min-h-[20px] items-center gap-2'>
              {currentFile ? (
                <>
                  <div className='size-1.5 rounded-full bg-orange-500'></div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    <span className='font-medium'>Currently Editing:</span>{' '}
                    {currentFile}{' '}
                    {isDirty && (
                      <span className='font-medium text-orange-600 dark:text-orange-400'>
                        • Unsaved changes
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <div className='size-1.5 rounded-full bg-slate-300'></div>
              )}
            </div>
          </div>
          <div className='flex items-center gap-1'>
            {/* File Operations Group */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    if (isDirty) {
                      setConfirm({
                        open: true,
                        message:
                          'You have unsaved changes. Start a new document?',
                        onConfirm: () => {
                          setConfirm({ open: false, message: '' });
                          setMarkdown('');
                          setFrontmatter({});
                          setCurrentFile('');
                          setCurrentEtag('');
                          setIsDirty(true);
                        },
                      });
                    } else {
                      setMarkdown('');
                      setFrontmatter({});
                      setCurrentFile('');
                      setCurrentEtag('');
                      setIsDirty(true);
                    }
                  }}
                  className='border-slate-600 text-slate-600 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                >
                  <Plus className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Document</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleDownload}
                  className='border-teal-600 text-teal-600 transition-all duration-200 hover:bg-teal-50 dark:hover:bg-teal-950'
                >
                  <Download className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download File</TooltipContent>
            </Tooltip>

            <Separator orientation='vertical' className='mx-1 h-6' />

            {/* Save & Cache Operations Group */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleSave()}
                  size='sm'
                  className='border-0 bg-teal-600 px-3 text-white shadow-lg transition-all duration-200 hover:bg-teal-700 hover:shadow-xl'
                >
                  <Save className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                    ? 'Saved!'
                    : 'Save Document'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsSaveAsOpen(true)}
                  className='border-teal-600 text-teal-600 transition-all duration-200 hover:bg-teal-50 dark:hover:bg-teal-950'
                >
                  <SaveIcon className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save As New File</TooltipContent>
            </Tooltip>

            {/* Cache Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800'>
                  <Checkbox
                    id='rebuild-cache'
                    checked={shouldRebuildCache}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      setShouldRebuildCache(checked === true)
                    }
                    className='size-3 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600'
                  />
                  <Database className='size-3 text-slate-600 dark:text-slate-400' />
                  {cacheRebuildStatus !== 'idle' && (
                    <RefreshCw
                      className={`size-3 ${
                        cacheRebuildStatus === 'rebuilding'
                          ? 'animate-spin text-orange-500'
                          : cacheRebuildStatus === 'completed'
                            ? 'text-green-500'
                            : 'text-red-500'
                      }`}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className='text-sm'>
                  <div className='font-medium'>Rebuild Cache on Save</div>
                  <div className='mt-1 text-xs opacity-80'>
                    Updates search and navigation cache using production KV
                  </div>
                  <div className='mt-1 text-xs text-blue-500'>
                    Works in: Localhost, Preview & Production
                  </div>
                  {cacheStatus && (
                    <div className='mt-1 border-t pt-1 text-xs text-slate-400'>
                      Current: {cacheStatus.totalItems} items •{' '}
                      {getRelativeTimeString(cacheStatus.lastUpdated)}
                    </div>
                  )}
                  {cacheRebuildStatus === 'rebuilding' && (
                    <div className='mt-1 text-xs text-orange-500'>
                      Building...
                    </div>
                  )}
                  {cacheRebuildStatus === 'completed' && (
                    <div className='mt-1 text-xs text-green-500'>Complete</div>
                  )}
                  {cacheRebuildStatus === 'error' && (
                    <div className='mt-1 text-xs text-red-500'>Failed</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={async () => {
                    setCacheRebuildStatus('rebuilding');
                    try {
                      const cacheResponse = await triggerManualRebuild();
                      if (cacheResponse.success) {
                        setCacheRebuildStatus('completed');

                        // Update cache status with enhanced data
                        const enhancedStatus = await getEnhancedCacheStatus();
                        if (enhancedStatus?.cache) {
                          setCacheStatus({
                            lastUpdated: enhancedStatus.cache.lastUpdated,
                            totalItems: enhancedStatus.cache.totalItems,
                            trigger: enhancedStatus.cache.trigger,
                          });
                        } else if (cacheResponse.stats) {
                          setCacheStatus({
                            lastUpdated: cacheResponse.timestamp,
                            totalItems: cacheResponse.stats.total,
                            trigger: cacheResponse.trigger,
                          });
                        }
                      } else {
                        setCacheRebuildStatus('error');
                      }
                    } catch {
                      setCacheRebuildStatus('error');
                    }
                    setTimeout(() => setCacheRebuildStatus('idle'), 3000);
                  }}
                  disabled={cacheRebuildStatus === 'rebuilding'}
                  className='size-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700'
                >
                  <RefreshCw
                    className={`size-4 ${cacheRebuildStatus === 'rebuilding' ? 'animate-spin' : ''}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className='text-center'>
                  <div className='font-medium'>Rebuild Cache Manually</div>
                  <div className='mt-1 text-xs text-slate-500'>
                    Force refresh of search and navigation cache using
                    production KV
                  </div>
                  <div className='mt-1 text-xs text-blue-500'>
                    Works in: Localhost, Preview & Production
                  </div>
                  {cacheStatus && (
                    <div className='mt-1 border-t pt-1 text-xs text-slate-400'>
                      <div>{cacheStatus.totalItems} items</div>
                      <div>
                        Updated{' '}
                        {new Date(cacheStatus.lastUpdated).toLocaleDateString()}{' '}
                        at{' '}
                        {new Date(cacheStatus.lastUpdated).toLocaleTimeString()}
                      </div>
                      {cacheStatus.trigger && (
                        <div className='mt-1 text-slate-500'>
                          Trigger: {cacheStatus.trigger}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            <Separator orientation='vertical' className='mx-1 h-6' />

            {/* Management Operations Group */}
            {currentFile ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={async () => {
                      setConfirm({
                        open: true,
                        message: `Move to trash?\n${currentFile}`,
                        onConfirm: async () => {
                          setConfirm({ open: false, message: '' });
                          const res =
                            await apiClient.deleteContentSoft(currentFile);
                          if (res.success) {
                            setMarkdown('');
                            setFrontmatter({});
                            setCurrentFile('');
                            setCurrentEtag('');
                            setIsDirty(false);
                            setBrowserNonce(n => n + 1);
                          }
                        },
                      });
                    }}
                    className='border-0 bg-red-600 shadow-lg transition-all duration-200 hover:bg-red-700 hover:shadow-xl'
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete File</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled
                    className='cursor-not-allowed border-red-200 text-red-400 opacity-50'
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>No file selected</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setTrashOpen(true)}
                  className='border-slate-600 text-slate-600 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                >
                  <Archive className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Archive/Trash</TooltipContent>
            </Tooltip>

            <Separator orientation='vertical' className='mx-1 h-6' />

            {/* Layout Operations Group */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className='border-orange-600 text-orange-600 transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-950'
                >
                  {isFullscreen ? (
                    <Minimize className='size-4' />
                  ) : (
                    <Maximize className='size-4' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      {/* Main Content Area: content browser + front matter define height */}
      <div className='min-h-[70vh] flex-1 px-0 py-6' data-content-area>
        <div className='grid grid-cols-12 items-start gap-6'>
          {/* Left Panel - Content Browser & Frontmatter */}
          <div
            ref={leftColRef}
            className='col-span-12 flex min-h-0 flex-col gap-6 lg:col-span-4'
          >
            <div className='overflow-hidden'>
              <R2Browser
                refreshSignal={browserNonce}
                onFileSelect={handleFileSelect}
                onFileDownload={handleFileDownload}
              />
            </div>
            <div className='overflow-hidden'>
              <FrontMatterPanel
                markdown={assemble(frontmatter, markdown)}
                onFrontMatterChange={handleFrontMatterChange}
                onEdit={() => setIsFrontmatterModalOpen(true)}
              />
            </div>
          </div>
          {/* Right Panel - Main Editor (dynamically scales to match left panel height) */}
          <div
            className='col-span-12 flex min-h-0 flex-col lg:col-span-8'
            style={{ height: leftHeight ? `${leftHeight}px` : 'auto' }}
          >
            {/* Editor Header */}
            <div
              ref={editorHeaderRef}
              className='rounded-t-xl border border-slate-200/50 bg-white/90 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/90'
            >
              <div className='flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700'>
                <div className='rounded-lg bg-gradient-to-br from-teal-600 to-blue-600 p-2'>
                  <FileText className='size-5 text-white' />
                </div>
                <div>
                  <h3
                    className='text-lg font-bold text-slate-900 dark:text-white'
                    style={{ fontWeight: 700 }}
                  >
                    Content Editor
                  </h3>
                  <div className='mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600'></div>
                </div>
              </div>
            </div>
            {/* Editor Content (dynamically scales to fill available space) */}
            <div
              ref={editorWrapperRef}
              className='relative flex-1 overflow-hidden rounded-b-xl border-x border-b border-slate-200/50 bg-white/90 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/90'
              style={{
                minHeight: '200px',
              }}
            >
              {hydrating ? (
                <div className='space-y-3 p-4'>
                  <Skeleton className='h-8 w-1/3' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-5/6' />
                  <Skeleton className='h-4 w-2/3' />
                  <Skeleton className='h-64 w-full' />
                </div>
              ) : (
                <div className='h-full overflow-auto'>
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
        onSave={updated => {
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
        initialDir={
          (currentFile.split('/')[0] as 'blog' | 'portfolio' | 'projects') ||
          'blog'
        }
        initialName={(currentFile.split('/').pop() || '').replace(/\.md$/, '')}
        onConfirm={async key => {
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
        onRestored={() => setBrowserNonce(n => n + 1)}
      />
      <Dialog
        open={conflictModal.open}
        onOpenChange={open => setConflictModal(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='size-5' />
              Conflict Detected
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertDescription>{conflictModal.message}</AlertDescription>
          </Alert>
          <div className='flex justify-end gap-2'>
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
        <DialogContent className='size-full max-h-[95vh] max-w-[95vw] bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 p-0 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950'>
          <div className='flex h-full flex-col'>
            {/* Enhanced Header with Brand Theme */}
            <div className='relative flex items-center justify-between border-b border-teal-200 bg-white/90 p-6 backdrop-blur-sm dark:border-teal-800 dark:bg-slate-900/90'>
              <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>
              <div className='relative flex items-center gap-4'>
                <div className='rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 p-3 shadow-lg'>
                  <FileText className='size-6 text-white' />
                </div>
                <div>
                  <h2
                    className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'
                    style={{ fontWeight: 700 }}
                  >
                    Fullscreen Editor
                  </h2>
                  <div className='mt-1 flex min-h-[20px] items-center gap-2'>
                    {currentFile ? (
                      <>
                        <div className='size-1.5 rounded-full bg-orange-500'></div>
                        <p className='text-sm text-slate-600 dark:text-slate-400'>
                          {currentFile}{' '}
                          {isDirty && (
                            <span className='font-medium text-orange-600 dark:text-orange-400'>
                              • Unsaved changes
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <div className='size-1.5 rounded-full bg-slate-300'></div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsFullscreen(false)}
                className='relative z-10 gap-2 border-orange-600 text-orange-600 shadow-md transition-all duration-200 hover:bg-orange-50 hover:shadow-lg dark:hover:bg-orange-950'
              >
                <Minimize className='size-4' />
                Return to Studio
              </Button>
            </div>
            {/* Enhanced Editor Content */}
            <div className='flex-1 overflow-hidden p-2'>
              <div className='h-full rounded-xl border border-slate-200/50 bg-white/90 shadow-lg backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/90'>
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
