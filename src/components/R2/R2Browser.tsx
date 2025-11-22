import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { apiClient } from '../../lib/api';
import {
  FileText,
  Download,
  Search,
  Folder,
  ArrowLeft,
  Loader,
  Trash2,
} from 'lucide-react';

interface R2Object {
  key: string;
  size: number;
  uploaded: string;
  etag: string;
}

interface R2BrowserProps {
  onFileSelect: (key: string) => void;
  onFileDownload: (key: string) => void;
  refreshSignal?: number;
  navigateToPrefix?: string;
  onPrefixChanged?: (prefix: string) => void;
}

export function R2Browser({
  onFileSelect,
  onFileDownload,
  refreshSignal,
  navigateToPrefix,
  onPrefixChanged,
}: R2BrowserProps) {
  const [objects, setObjects] = useState<R2Object[]>([]);
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(false);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string>('');

  const loadListing = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const response = await apiClient.listContent(
          currentPrefix,
          reset ? undefined : cursor,
          50
        );
        if (response.success && response.data) {
          const data = response.data as {
            objects?: unknown[];
            prefixes?: unknown[];
            cursor?: string;
          };
          if (reset) {
            setObjects((data.objects ?? []) as R2Object[]);
          } else {
            setObjects(prev => [
              ...prev,
              ...((data.objects ?? []) as R2Object[]),
            ]);
          }
          setPrefixes((data.prefixes ?? []) as string[]);
          setCursor(data.cursor ?? '');
          setHasMore(!!data.cursor);
        }
      } catch (error) {
        console.error('Failed to load listing:', error);
      } finally {
        setLoading(false);
      }
    },
    [currentPrefix, cursor]
  );

  useEffect(() => {
    // whenever prefix changes, reset list
    void loadListing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrefix]);

  useEffect(() => {
    if (typeof refreshSignal !== 'undefined') {
      void loadListing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  useEffect(() => {
    if (navigateToPrefix && navigateToPrefix !== currentPrefix) {
      setCurrentPrefix(navigateToPrefix);
      onPrefixChanged?.(navigateToPrefix);
    }
  }, [navigateToPrefix, currentPrefix, onPrefixChanged]);

  const filteredObjects = objects.filter(obj =>
    obj.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleFileClick = (key: string) => {
    setLoadingFile(key);
    try {
      onFileSelect(key);
    } finally {
      // Add a small delay to show the loading state briefly
      setTimeout(() => setLoadingFile(null), 300);
    }
  };

  const handleFileDelete = useCallback(
    async (key: string) => {
      setDeletingFile(key);
      try {
        const response = await apiClient.deleteContentSoft(key);
        if (response.success) {
          // Refresh the listing to remove the deleted file
          await loadListing(true);
        } else {
          console.error('Delete failed:', response.error);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
      setDeletingFile(null);
      setDeleteDialogOpen(false);
    },
    [loadListing]
  );

  const openDeleteDialog = useCallback((key: string) => {
    setFileToDelete(key);
    setDeleteDialogOpen(true);
  }, []);

  return (
    <Card className='flex flex-col border border-indigo-200/60 bg-gradient-to-br from-white/70 to-indigo-50/70 shadow-sm backdrop-blur dark:border-indigo-800/60 dark:bg-gradient-to-br dark:from-slate-900/70 dark:to-indigo-950/70'>
      <CardHeader className='relative shrink-0 border-b border-indigo-200/60 dark:border-indigo-800/60'>
        <CardTitle className='flex items-center gap-3'>
          <div className='rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 p-2 shadow-md'>
            <FileText className='size-5 text-white' />
          </div>
          <div>
            <h3
              className='text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent'
              style={{ fontWeight: 700 }}
            >
              Content Browser
            </h3>
            <div className='mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-slate-500'></div>
          </div>
        </CardTitle>
        <div className='mt-4 flex gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
            <Input
              placeholder='Search files...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='border-indigo-200/60 pl-9 focus:border-indigo-500 dark:border-indigo-800/60 dark:focus:border-indigo-400'
            />
          </div>
          <Button
            onClick={() => void loadListing(true)}
            disabled={loading}
            className='border-0 bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all duration-200'
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Enhanced Navigation */}
        <div className='mt-3 flex items-center gap-3 border-t border-indigo-200/60 pt-3 dark:border-indigo-800/60'>
          {currentPrefix && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const parts = currentPrefix.split('/').filter(Boolean);
                parts.pop();
                setCurrentPrefix(parts.length ? parts.join('/') + '/' : '');
              }}
              className='border-indigo-600 text-indigo-600 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-950'
            >
              <ArrowLeft className='mr-1 size-4' /> Up
            </Button>
          )}
          <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
            <div className='size-1.5 rounded-full bg-indigo-500'></div>
            <span className='font-medium'>{currentPrefix || 'root'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4 pt-1'>
        <div className='space-y-1'>
          {prefixes.map(p => {
            const parts = p.split('/').filter(Boolean);
            const name = parts[parts.length - 1] ?? p;
            return (
              <div
                key={p}
                className='flex cursor-pointer items-center justify-between rounded-lg border border-indigo-200/60 px-3 py-2.5 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md dark:border-indigo-800/60 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/30'
                onClick={() => setCurrentPrefix(p)}
              >
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                  <div className='rounded-md bg-gradient-to-br from-indigo-700 to-indigo-800 p-1.5 dark:from-indigo-600 dark:to-indigo-700'>
                    <Folder className='size-3.5 text-white' />
                  </div>
                  <div className='truncate text-sm font-medium text-slate-800 dark:text-slate-200'>
                    {name}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredObjects.map(obj => (
            <div
              key={obj.key}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-indigo-800/60 ${
                loadingFile === obj.key
                  ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/30'
                  : 'border-indigo-200/60 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20'
              }`}
              onClick={() => void handleFileClick(obj.key)}
            >
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2 truncate text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {loadingFile === obj.key && (
                    <Loader className='size-3 animate-spin text-indigo-600' />
                  )}
                  <div className='rounded bg-gradient-to-br from-indigo-600 to-indigo-700 p-1'>
                    <FileText className='size-2.5 text-white' />
                  </div>
                  {obj.key.replace(currentPrefix, '')}
                </div>
                <div className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                  {formatFileSize(obj.size)} • {formatDate(obj.uploaded)}
                </div>
              </div>
              <div className='flex gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='size-7 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                  onClick={e => {
                    e.stopPropagation();
                    onFileDownload(obj.key);
                  }}
                  disabled={loadingFile === obj.key}
                >
                  <Download className='size-3' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='size-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                  onClick={e => {
                    e.stopPropagation();
                    openDeleteDialog(obj.key);
                  }}
                  disabled={deletingFile === obj.key}
                >
                  {deletingFile === obj.key ? (
                    <Loader className='size-3 animate-spin' />
                  ) : (
                    <Trash2 className='size-3' />
                  )}
                </Button>
              </div>
            </div>
          ))}
          {prefixes.length === 0 &&
            filteredObjects.length === 0 &&
            !loading && (
              <div className='py-8 text-center text-slate-500 dark:text-slate-400'>
                <div className='mx-auto mb-3 w-fit rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-3 dark:from-slate-800 dark:to-slate-700'>
                  <FileText className='size-6 text-slate-400' />
                </div>
                <p className='text-sm font-medium'>No items found</p>
                <p className='mt-1 text-xs text-slate-400 dark:text-slate-500'>
                  Try adjusting your search or navigate to a different folder
                </p>
              </div>
            )}
          {hasMore && (
            <Button
              variant='outline'
              onClick={() => void loadListing()}
              disabled={loading}
              className='mt-3 w-full border-hunter-600 text-hunter-600 shadow-md transition-all duration-200 hover:bg-hunter-50 hover:shadow-lg dark:hover:bg-hunter-950'
            >
              {loading ? (
                <>
                  <Loader className='mr-2 size-4 animate-spin' />
                  Loading...
                </>
              ) : (
                'Load More Files'
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Trash2 className='size-5 text-red-500' />
              Delete File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
              <br />
              <strong className='text-slate-700 dark:text-slate-300'>
                {fileToDelete.replace(currentPrefix, '')}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingFile !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleFileDelete(fileToDelete)}
              disabled={deletingFile !== null}
              className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
            >
              {deletingFile !== null ? (
                <>
                  <Loader className='mr-2 size-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 size-4' />
                  Delete File
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
