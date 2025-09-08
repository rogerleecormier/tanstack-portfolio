import { useState, useEffect, useCallback } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { apiClient } from '../../lib/api'
import { FileText, Download, Search, Folder, ArrowLeft, Loader, Trash2 } from 'lucide-react'

interface R2Object {
  key: string
  size: number
  uploaded: string
  etag: string
}

interface R2BrowserProps {
  onFileSelect: (key: string) => void
  onFileDownload: (key: string) => void
  refreshSignal?: number
  navigateToPrefix?: string
  onPrefixChanged?: (prefix: string) => void
}

export function R2Browser({ onFileSelect, onFileDownload, refreshSignal, navigateToPrefix, onPrefixChanged }: R2BrowserProps) {
  const [objects, setObjects] = useState<R2Object[]>([])
  const [prefixes, setPrefixes] = useState<string[]>([])
  const [currentPrefix, setCurrentPrefix] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cursor, setCursor] = useState<string>()
  const [hasMore, setHasMore] = useState(false)
  const [loadingFile, setLoadingFile] = useState<string | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string>('')

  const loadListing = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const response = await apiClient.listContent(
        currentPrefix,
        reset ? undefined : cursor,
        50
      )
      if (response.success && response.data) {
        const data = response.data as { objects?: unknown[]; prefixes?: unknown[]; cursor?: string }
        if (reset) {
          setObjects((data.objects || []) as R2Object[])
        } else {
          setObjects((prev) => [...prev, ...((data.objects || []) as R2Object[])])
        }
        setPrefixes((data.prefixes || []) as string[])
        setCursor(data.cursor || '')
        setHasMore(!!data.cursor)
      }
    } catch (error) {
      console.error('Failed to load listing:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPrefix, cursor])

  useEffect(() => {
    // whenever prefix changes, reset list
    loadListing(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrefix])

  useEffect(() => {
    if (typeof refreshSignal !== 'undefined') {
      loadListing(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal])

  useEffect(() => {
    if (navigateToPrefix && navigateToPrefix !== currentPrefix) {
      setCurrentPrefix(navigateToPrefix)
      onPrefixChanged?.(navigateToPrefix)
    }
  }, [navigateToPrefix, currentPrefix, onPrefixChanged])

  const filteredObjects = objects.filter((obj) =>
    obj.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleFileClick = async (key: string) => {
    setLoadingFile(key)
    try {
      await onFileSelect(key)
    } finally {
      // Add a small delay to show the loading state briefly
      setTimeout(() => setLoadingFile(null), 300)
    }
  }

  const handleFileDelete = useCallback(async (key: string) => {
    setDeletingFile(key)
    try {
      const response = await apiClient.deleteContentSoft(key)
      if (response.success) {
        // Refresh the listing to remove the deleted file
        await loadListing(true)
      } else {
        console.error('Delete failed:', response.error)
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
    setDeletingFile(null)
    setDeleteDialogOpen(false)
  }, [loadListing])

  const openDeleteDialog = useCallback((key: string) => {
    setFileToDelete(key)
    setDeleteDialogOpen(true)
  }, [])

  return (
    <Card className="flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
      <CardHeader className="flex-shrink-0 relative border-b border-slate-200/60 dark:border-slate-700/60">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg shadow-md">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white" style={{fontWeight: 700}}>
              Content Browser
            </h3>
            <div className="h-0.5 w-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full mt-1"></div>
          </div>
        </CardTitle>
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-slate-200/60 dark:border-slate-700/60 focus:border-teal-500 dark:focus:border-teal-400"
            />
          </div>
          <Button
            onClick={() => loadListing(true)}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-md"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          {currentPrefix && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const parts = currentPrefix.split('/').filter(Boolean)
                parts.pop()
                setCurrentPrefix(parts.length ? parts.join('/') + '/' : '')
              }}
              className="border-slate-600 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Up
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span className="font-medium">{currentPrefix || 'root'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-1 pb-4">
        <div className="space-y-1">
          {prefixes.map((p) => {
            const parts = p.split('/').filter(Boolean)
            const name = parts[parts.length - 1] || p
            return (
              <div
                key={p}
                className="flex items-center justify-between px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-600 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => setCurrentPrefix(p)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-1.5 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 rounded-md">
                    <Folder className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="font-medium text-sm truncate text-slate-800 dark:text-slate-200">{name}</div>
                </div>
              </div>
            )
          })}

          {filteredObjects.map((obj) => (
            <div
              key={obj.key}
              className={`flex items-center justify-between px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                loadingFile === obj.key
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => handleFileClick(obj.key)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  {loadingFile === obj.key && <Loader className="h-3 w-3 animate-spin text-teal-600" />}
                  <div className="p-1 bg-gradient-to-br from-slate-600 to-slate-700 rounded">
                    <FileText className="h-2.5 w-2.5 text-white" />
                  </div>
                  {obj.key.replace(currentPrefix, '')}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatFileSize(obj.size)} • {formatDate(obj.uploaded)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFileDownload(obj.key)
                  }}
                  disabled={loadingFile === obj.key}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDeleteDialog(obj.key)
                  }}
                  disabled={deletingFile === obj.key}
                >
                  {deletingFile === obj.key ? (
                    <Loader className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
          {prefixes.length === 0 && filteredObjects.length === 0 && !loading && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full w-fit mx-auto mb-3">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium">No items found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or navigate to a different folder</p>
            </div>
          )}
          {hasMore && (
            <Button
              variant="outline"
              onClick={() => loadListing()}
              disabled={loading}
              className="w-full mt-3 border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
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
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
              <br />
              <strong className="text-slate-700 dark:text-slate-300">
                {fileToDelete.replace(currentPrefix, '')}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingFile !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleFileDelete(fileToDelete)}
              disabled={deletingFile !== null}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingFile !== null ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete File
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
