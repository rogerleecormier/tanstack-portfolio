import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { FileManagementService } from '@/utils/fileManagementService'

interface FileSaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  frontmatter: Record<string, unknown>
  markdown: string
  contentType: 'blog' | 'portfolio' | 'project'
  customDirectory: string
  onSaveSuccess: (filePath: string) => void
}

interface FileOption {
  path: string
  name: string
  exists: boolean
  size?: number
  modified?: Date
}

const FileSaveDialog: React.FC<FileSaveDialogProps> = ({
  open,
  onOpenChange,
  frontmatter,
  markdown,
  contentType,
  customDirectory,
  onSaveSuccess
}) => {
  const [filename, setFilename] = useState('')
  const [saveDirectory, setSaveDirectory] = useState(customDirectory)
  const [fileOptions, setFileOptions] = useState<FileOption[]>([])
  const [selectedFileOption, setSelectedFileOption] = useState<FileOption | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [showFileOptions, setShowFileOptions] = useState(false)

  // Wrap fileService in useMemo to prevent recreation on every render
  const fileService = useMemo(() => new FileManagementService(), [])

  // Generate filename from title when component opens
  useEffect(() => {
    if (open && frontmatter?.title && typeof frontmatter.title === 'string') {
      const generatedName = frontmatter.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFilename(generatedName)
    }
  }, [open, frontmatter?.title])

  // Update save directory when customDirectory changes
  useEffect(() => {
    setSaveDirectory(customDirectory)
  }, [customDirectory])

  const searchExistingFiles = useCallback(async () => {
    if (!filename.trim() || !saveDirectory) return

    try {
      const allFiles: FileOption[] = []
      
      // Check if the exact filename exists
      const exactPath = `${saveDirectory}/${filename}.md`
      const exactExists = await fileService.fileExists(exactPath)
      if (exactExists) {
        const fileInfo = await fileService.getFileInfo(exactPath)
        allFiles.push({
          path: exactPath,
          name: `${filename}.md`,
          exists: true,
          size: fileInfo?.size,
          modified: fileInfo?.modified
        })
      }

      // Add the option to create a new file
      allFiles.push({
        path: `${saveDirectory}/${filename}.md`,
        name: `${filename}.md`,
        exists: false
      })

      // Add the option to create with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      allFiles.push({
        path: `${saveDirectory}/${filename}-${timestamp}.md`,
        name: `${filename}-${timestamp}.md`,
        exists: false
      })

      setFileOptions(allFiles)
      setShowFileOptions(true)
    } catch (error) {
      console.error('Error searching for existing files:', error)
    }
  }, [filename, saveDirectory, fileService])

  // Search for existing files when filename changes
  useEffect(() => {
    if (filename.trim() && saveDirectory) {
      const searchTimeout = setTimeout(() => {
        searchExistingFiles()
      }, 500)

      return () => clearTimeout(searchTimeout)
    }
  }, [filename, saveDirectory, searchExistingFiles])

  const handleSave = async () => {
    if (!frontmatter || !markdown.trim() || !filename.trim()) {
      setSaveMessage('Please provide a filename and ensure content is ready.')
      return
    }

    setIsLoading(true)
    setSaveStatus('idle')
    setSaveMessage('')

    try {
      const targetPath = selectedFileOption?.path || `${saveDirectory}/${filename}.md`
      
      // Create the full markdown content with frontmatter
              const result = await fileService.saveFile()
      
      if (result.success) {
        setSaveStatus('success')
        setSaveMessage(result.message || 'File saved successfully!')
        
        // Call the success callback
        onSaveSuccess(targetPath)
        
        // Close dialog after a short delay
        setTimeout(() => {
          onOpenChange(false)
          setSaveStatus('idle')
        }, 2000)
      } else {
        setSaveStatus('error')
        setSaveMessage(result.error || 'Failed to save file')
      }
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }



  const handleFileOptionSelect = (option: FileOption) => {
    setSelectedFileOption(option)
    setFilename(option.name.replace('.md', ''))
  }

  const handleCreateNewFile = () => {
    const newOption: FileOption = {
      path: `${saveDirectory}/${filename}.md`,
      name: `${filename}.md`,
      exists: false
    }
    setSelectedFileOption(newOption)
    setShowFileOptions(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-teal-900 flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Content File
          </DialogTitle>
          <DialogDescription>
            Choose how to save your content. You can overwrite existing files or create new ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Information */}
          <Card className="border border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-teal-900">File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filename" className="text-sm font-medium text-teal-700">
                    Filename *
                  </Label>
                  <Input
                    id="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="e.g., my-awesome-post"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The file will be saved as: {filename}.md
                  </p>
                </div>

                <div>
                  <Label htmlFor="save-directory" className="text-sm font-medium text-teal-700">
                    Save Directory
                  </Label>
                  <Input
                    id="save-directory"
                    value={saveDirectory}
                    onChange={(e) => setSaveDirectory(e.target.value)}
                    placeholder="e.g., src/content/blog"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Content Summary */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-medium text-teal-900 mb-2">Content Summary</h4>
                <div className="text-sm text-teal-800 space-y-1">
                  <p><strong>Content Type:</strong> {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</p>
                  <p><strong>Title:</strong> {typeof frontmatter?.title === 'string' ? frontmatter.title : 'Not set'}</p>
                  <p><strong>Tags:</strong> {Array.isArray(frontmatter?.tags) ? frontmatter.tags.join(', ') : 'Not set'}</p>
                  <p><strong>Content Length:</strong> {markdown.split(/\s+/).length} words</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Options */}
          {showFileOptions && fileOptions.length > 0 && (
            <Card className="border border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-blue-800">
                    Choose how to save your file:
                  </p>
                  
                  {fileOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFileOption?.path === option.path
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                      onClick={() => handleFileOptionSelect(option)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {option.exists ? (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-medium">{option.name}</span>
                          </div>
                          
                          {option.exists && (
                            <Badge variant="secondary" className="text-xs">
                              Existing File
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-gray-600">
                          {option.exists && option.size && (
                            <p>{Math.round(option.size / 1024)} KB</p>
                          )}
                          {option.exists && option.modified && (
                            <p>Modified: {option.modified.toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      
                      {option.exists && (
                        <p className="text-xs text-orange-600 mt-2">
                          ⚠️ This will overwrite the existing file
                        </p>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    onClick={handleCreateNewFile}
                    variant="outline"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Create New File with Different Name
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <Alert className={saveStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {saveStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={saveStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isLoading || !filename.trim() || !frontmatter}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {selectedFileOption?.exists ? 'Overwrite File' : 'Save File'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FileSaveDialog
