import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp,
  FolderOpen,
  File,
  MoreHorizontal
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { logger } from '@/utils/logger'

interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
}

interface FileBrowserProps {
  currentPath: string
  onPathChange: (path: string) => void
  onFileSelect: (file: FileItem) => void
  onFileCreate: (path: string) => void
  onFileDelete: (path: string) => void
  className?: string
  currentEditingFile?: string
  isLoadingFile?: boolean
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  currentPath,
  onPathChange,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  className = '',
  currentEditingFile,
  isLoadingFile = false
}) => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [createType, setCreateType] = useState<'file' | 'directory'>('file')
  const [isLoading, setIsLoading] = useState(false)

  // Simulate file system operations
  const loadDirectory = useCallback(async (path: string) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would make an API call to the server
      // For now, we'll simulate the file system structure
      const mockFiles = await simulateFileSystem(path)
      setFiles(mockFiles)
    } catch (error) {
      console.error('Error loading directory:', error)
      setFiles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const simulateFileSystem = async (path: string): Promise<FileItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const basePath = 'src/content'
    const relativePath = path.replace(basePath, '').replace(/^\/+/, '')
    
    if (relativePath === '') {
      // Root content directory
      return [
        { name: 'about.md', path: `${basePath}/about.md`, type: 'file' as const, size: 3900, modified: new Date() },
        { name: 'blog', path: `${basePath}/blog`, type: 'directory' as const },
        { name: 'portfolio', path: `${basePath}/portfolio`, type: 'directory' as const },
        { name: 'projects', path: `${basePath}/projects`, type: 'directory' as const }
      ]
    } else if (relativePath === 'blog') {
      return [
        { name: 'pmbok-agile-methodology-blend.md', path: `${basePath}/blog/pmbok-agile-methodology-blend.md`, type: 'file' as const, size: 5800, modified: new Date() },
        { name: 'serverless-ai-workflows-azure-functions.md', path: `${basePath}/blog/serverless-ai-workflows-azure-functions.md`, type: 'file' as const, size: 6400, modified: new Date() },
        { name: 'power-automate-workflow-automation.md', path: `${basePath}/blog/power-automate-workflow-automation.md`, type: 'file' as const, size: 5600, modified: new Date() },
        { name: 'asana-ai-status-reporting.md', path: `${basePath}/blog/asana-ai-status-reporting.md`, type: 'file' as const, size: 6600, modified: new Date() },
        { name: 'mkdocs-github-actions-portfolio.md', path: `${basePath}/blog/mkdocs-github-actions-portfolio.md`, type: 'file' as const, size: 4400, modified: new Date() },
        { name: 'internal-ethos-high-performing-organizations.md', path: `${basePath}/blog/internal-ethos-high-performing-organizations.md`, type: 'file' as const, size: 7900, modified: new Date() },
        { name: 'digital-transformation-strategy-governance.md', path: `${basePath}/blog/digital-transformation-strategy-governance.md`, type: 'file' as const, size: 7900, modified: new Date() },
        { name: 'military-leadership-be-know-do.md', path: `${basePath}/blog/military-leadership-be-know-do.md`, type: 'file' as const, size: 8300, modified: new Date() },
        { name: 'ramp-agents-ai-finance-operations.md', path: `${basePath}/blog/ramp-agents-ai-finance-operations.md`, type: 'file' as const, size: 5700, modified: new Date() },
        { name: 'pmp-digital-transformation-leadership.md', path: `${basePath}/blog/pmp-digital-transformation-leadership.md`, type: 'file' as const, size: 7900, modified: new Date() }
      ]
    } else if (relativePath === 'portfolio') {
      return [
        { name: 'strategy.md', path: `${basePath}/portfolio/strategy.md`, type: 'file' as const, size: 4500, modified: new Date() },
        { name: 'leadership.md', path: `${basePath}/portfolio/leadership.md`, type: 'file' as const, size: 5200, modified: new Date() },
        { name: 'devops.md', path: `${basePath}/portfolio/devops.md`, type: 'file' as const, size: 4800, modified: new Date() },
        { name: 'ai-automation.md', path: `${basePath}/portfolio/ai-automation.md`, type: 'file' as const, size: 6100, modified: new Date() },
        { name: 'culture.md', path: `${basePath}/portfolio/culture.md`, type: 'file' as const, size: 3900, modified: new Date() },
        { name: 'talent.md', path: `${basePath}/portfolio/talent.md`, type: 'file' as const, size: 4200, modified: new Date() },
        { name: 'governance-pmo.md', path: `${basePath}/portfolio/governance-pmo.md`, type: 'file' as const, size: 5500, modified: new Date() },
        { name: 'risk-compliance.md', path: `${basePath}/portfolio/risk-compliance.md`, type: 'file' as const, size: 4800, modified: new Date() },
        { name: 'saas.md', path: `${basePath}/portfolio/saas.md`, type: 'file' as const, size: 5200, modified: new Date() },
        { name: 'product-ux.md', path: `${basePath}/portfolio/product-ux.md`, type: 'file' as const, size: 4600, modified: new Date() },
        { name: 'analytics.md', path: `${basePath}/portfolio/analytics.md`, type: 'file' as const, size: 4100, modified: new Date() },
        { name: 'capabilities.md', path: `${basePath}/portfolio/capabilities.md`, type: 'file' as const, size: 3800, modified: new Date() },
        { name: 'education-certifications.md', path: `${basePath}/portfolio/education-certifications.md`, type: 'file' as const, size: 4400, modified: new Date() },
        { name: 'HealthBridge.md', path: `${basePath}/portfolio/HealthBridge.md`, type: 'file' as const, size: 5100, modified: new Date() }
      ]
    } else if (relativePath === 'projects') {
      return [
        { name: 'project-analysis.md', path: `${basePath}/projects/project-analysis.md`, type: 'file' as const, size: 6200, modified: new Date() }
      ]
    }
    
    return []
  }

  useEffect(() => {
    loadDirectory(currentPath)
  }, [currentPath, loadDirectory])

  const handleDirectoryClick = (dir: FileItem) => {
    const newPath = dir.path
    onPathChange(newPath)
    
    // Toggle expansion state
    const newExpanded = new Set(expandedDirs)
    if (newExpanded.has(newPath)) {
      newExpanded.delete(newPath)
    } else {
      newExpanded.add(newPath)
    }
    setExpandedDirs(newExpanded)
  }

  const handleFileClick = (file: FileItem) => {
    logger.debug('🖱️ File clicked in FileBrowser:', {
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      isLoadingFile,
      currentEditingFile
    })
    
    if (file.type === 'file' && !isLoadingFile) {
      logger.debug('✅ Calling onFileSelect callback')
      onFileSelect(file)
    } else {
      logger.debug('❌ File click ignored:', {
        reason: file.type === 'file' ? 'isLoadingFile is true' : 'not a file',
        isLoadingFile,
        fileType: file.type
      })
    }
  }

  const handleCreateItem = () => {
    if (!newFileName.trim()) return
    
    const fullPath = `${currentPath}/${newFileName.trim()}`
    onFileCreate(fullPath)
    setNewFileName('')
    setShowCreateDialog(false)
    
    // Reload directory to show new item
    loadDirectory(currentPath)
  }

  const handleDeleteItem = (item: FileItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onFileDelete(item.path)
      // Reload directory to reflect changes
      loadDirectory(currentPath)
    }
  }

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/')
    if (parentPath && parentPath !== 'src') {
      onPathChange(parentPath)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className={className}>
      <Card className="border border-teal-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            File Browser
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Path Navigation */}
        <div className="px-4 py-2 bg-gray-50 border-b border-teal-200">
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateUp}
              disabled={currentPath === 'src/content'}
              className="h-6 px-2 text-xs"
            >
              <ArrowUp className="h-3 w-3 mr-1" />
              Up
            </Button>
            <span className="text-gray-600">Path:</span>
            <span className="font-mono text-teal-700">{currentPath}</span>
          </div>
        </div>

        {/* File List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading...
            </div>
          ) : files.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No files in this directory
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {files.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${
                    item.type === 'file' ? 'hover:bg-blue-50' : ''
                  } ${
                    currentEditingFile === item.path ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => item.type === 'directory' ? handleDirectoryClick(item) : handleFileClick(item)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.type === 'directory' ? (
                      <Folder className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : item.name.endsWith('.md') ? (
                      <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <File className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {item.name}
                        </span>
                        {item.type === 'file' && item.name.endsWith('.md') && (
                          <Badge variant="outline" className="text-xs">
                            Markdown
                          </Badge>
                        )}
                      </div>
                      {item.type === 'file' && (
                        <div className="text-xs text-gray-500">
                          {item.size && formatFileSize(item.size)}
                          {item.modified && ` • ${formatDate(item.modified)}`}
                          {item.name.endsWith('.md') && (
                            <span className="ml-2 text-blue-600 font-medium">Markdown</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isLoadingFile && currentEditingFile === item.path && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    {item.type === 'directory' && (
                      <span className="text-gray-400">
                        {expandedDirs.has(item.path) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {item.type === 'file' && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleFileClick(item)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(item)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Create New Item Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-teal-900">Create New {createType === 'file' ? 'File' : 'Directory'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-teal-700">
              {createType === 'file' ? 'File' : 'Directory'} Name
            </label>
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder={createType === 'file' ? 'my-file.md' : 'my-directory'}
              className="border-teal-200 focus:border-teal-400"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-teal-700">Type</label>
            <div className="flex gap-2">
              <Button
                variant={createType === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCreateType('file')}
                className={createType === 'file' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              >
                <File className="h-4 w-4 mr-1" />
                File
              </Button>
              <Button
                variant={createType === 'directory' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCreateType('directory')}
                className={createType === 'directory' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              >
                <Folder className="h-4 w-4 mr-1" />
                Directory
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateItem}
              disabled={!newFileName.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}

export default FileBrowser
