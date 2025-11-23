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
    <Card className='flex flex-col border border-gold-500/20 bg-hunter-900/30 shadow-sm backdrop-blur-xl dark:border-gold-500/20 dark:bg-hunter-900/30'>
      <CardHeader className='relative shrink-0 border-b border-gold-500/10 dark:border-gold-500/10'>
        <CardTitle className='flex items-center gap-3'>
          <div className='rounded-lg bg-hunter-900/60 p-2 shadow-md ring-1 ring-gold-500/20 backdrop-blur-md'>
            <FileText className='size-5 text-gold-400' />
          </div>
          <div>
            <h3
              className='text-lg font-semibold text-white dark:text-gold-400'
              style={{ fontWeight: 700 }}
            >
              Content Browser
            </h3>
            <div className='mt-1 h-0.5 w-16 rounded-full bg-gold-500/60'></div>
          </div>
        </CardTitle>
        <div className='mt-4 flex gap-3'>
          <div className='relative flex-1'>
            <Search className='text-grey-400 absolute left-3 top-1/2 size-4 -translate-y-1/2' />
            <Input
              placeholder='Search files...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='border-gold-500/20 pl-9 focus:border-gold-500/50 dark:border-gold-500/20 dark:focus:border-gold-500/50'
            />
          </div>
          <Button
            onClick={() => void loadListing(true)}
            disabled={loading}
            className='border-0 bg-gold-600 text-white shadow-md transition-all duration-200 hover:bg-gold-700'
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Enhanced Navigation */}
        <div className='mt-3 flex items-center gap-3 border-t border-gold-500/10 pt-3 dark:border-gold-500/10'>
          {currentPrefix && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const parts = currentPrefix.split('/').filter(Boolean);
                parts.pop();
                setCurrentPrefix(parts.length ? parts.join('/') + '/' : '');
              }}
              className='border-gold-600/30 text-gold-600 transition-all duration-200 hover:bg-hunter-900/40 dark:hover:bg-hunter-900/30'
            >
              <ArrowLeft className='mr-1 size-4' /> Up
            </Button>
          )}
          <div className='text-grey-600 dark:text-grey-400 flex items-center gap-2 text-sm'>
            <div className='size-1.5 rounded-full bg-gold-500/60'></div>
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
                className='flex cursor-pointer items-center justify-between rounded-lg border border-gold-500/20 px-3 py-2.5 shadow-sm transition-all duration-200 hover:border-gold-500/50 hover:bg-hunter-900/40 hover:shadow-md dark:border-gold-500/20 dark:hover:border-gold-500/50 dark:hover:bg-hunter-900/30'
                onClick={() => setCurrentPrefix(p)}
              >
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                  <div className='rounded-md bg-hunter-900/60 p-1.5 ring-1 ring-gold-500/20 backdrop-blur-md'>
                    <Folder className='size-3.5 text-gold-400' />
                  </div>
                  <div className='text-grey-200 dark:text-grey-300 truncate text-sm font-medium'>
                    {name}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredObjects.map(obj => (
            <div
              key={obj.key}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gold-500/20 ${
                loadingFile === obj.key
                  ? 'border-gold-500/50 bg-hunter-900/40 dark:border-gold-500/50 dark:bg-hunter-900/30'
                  : 'border-gold-500/20 hover:border-gold-500/50 hover:bg-hunter-900/40 dark:hover:border-gold-500/50 dark:hover:bg-hunter-900/20'
              }`}
              onClick={() => void handleFileClick(obj.key)}
            >
              <div className='min-w-0 flex-1'>
                <div className='text-grey-200 dark:text-grey-300 flex items-center gap-2 truncate text-sm font-medium'>
                  {loadingFile === obj.key && (
                    <Loader className='size-3 animate-spin text-gold-600' />
                  )}
                  <div className='rounded bg-hunter-900/60 p-1 ring-1 ring-gold-500/20 backdrop-blur-md'>
                    <FileText className='size-2.5 text-gold-400' />
                  </div>
                  {obj.key.replace(currentPrefix, '')}
                </div>
                <div className='text-grey-500 dark:text-grey-400 mt-0.5 text-xs'>
                  {formatFileSize(obj.size)} • {formatDate(obj.uploaded)}
                </div>
              </div>
              <div className='flex gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='size-7 p-0 hover:bg-hunter-900/40 dark:hover:bg-hunter-900/30'
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
              <div className='text-grey-500 dark:text-grey-400 py-8 text-center'>
                <div className='mx-auto mb-3 w-fit rounded-full bg-hunter-900/40 p-3 backdrop-blur-md'>
                  <FileText className='size-6 text-gold-400' />
                </div>
                <p className='text-sm font-medium'>No items found</p>
                <p className='text-grey-400 dark:text-grey-500 mt-1 text-xs'>
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
              <strong className='text-grey-300 dark:text-grey-200'>
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
