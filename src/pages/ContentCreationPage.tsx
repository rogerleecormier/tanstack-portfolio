import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import FileSaveDialog from '@/components/FileSaveDialog'

import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, FileText, Briefcase, FolderOpen, FolderOpen as FolderOpenIcon, Maximize2, Minimize2, Layout, Eye, EyeOff } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { H1 } from '@/components/ui/typography'
// Lazy load ContentCreationStudio for code splitting
const ContentCreationStudio = React.lazy(() => import('@/components/ContentCreationStudio'))



import FileBrowser from '@/components/FileBrowser'
import { FileManagementService } from '@/utils/fileManagementService'
import { logger } from '@/utils/logger'
import { markdownToHtml } from '@/utils/markdownConverter'

interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
}

interface FrontmatterData {
  title: string
  description: string
  author: string
  tags: string[]
  keywords: string[]
  date?: string
  section?: string
  [key: string]: string | string[] | number | boolean | undefined
}

const ContentCreationPage: React.FC = () => {
  // Default directories for each content type
  const getDefaultDirectory = (type: string) => {
    switch (type) {
      case 'blog': return 'src/content/blog'
      case 'portfolio': return 'src/content/portfolio'
      case 'project': return 'src/content/projects'
      default: return 'src/content'
    }
  }

  const [contentType, setContentType] = useState<'blog' | 'portfolio' | 'project'>('blog')
  const [content, setContent] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [frontmatter, setFrontmatter] = useState<FrontmatterData | null>(null)
  const [showFrontmatterEditor, setShowFrontmatterEditor] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [customDirectory, setCustomDirectory] = useState(getDefaultDirectory('blog'))

  
  // File management state
  const [currentFilePath, setCurrentFilePath] = useState<string>('')
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [showFileBrowser, setShowFileBrowser] = useState(false)
  const [currentDirectory, setCurrentDirectory] = useState(getDefaultDirectory('blog'))
  const [isLoadingFile, setIsLoadingFile] = useState(false)
  const [showFileLoadedNotification, setShowFileLoadedNotification] = useState(false)
  const [loadedFileName, setLoadedFileName] = useState('')
  
  // Layout state
  const [isFullWidth, setIsFullWidth] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  
  // File service instance
  const fileService = useMemo(() => new FileManagementService(), [])

  // Handle content changes from the editor - updated for ContentCreationStudio
  const handleContentChange = useCallback((html: string, markdown: string, frontmatter: FrontmatterData) => {
    setContent(html)
    setMarkdown(markdown)
    if (frontmatter) {
      setFrontmatter(frontmatter)
    }
  }, [])



  // Update frontmatter field
  const updateFrontmatterField = (field: string, value: string | string[]) => {
    if (!frontmatter) return
    
    setFrontmatter(prev => {
      if (!prev) return prev
      
      if (field === 'tags' || field === 'keywords') {
        // Handle array fields
        const arrayValue = typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : value
        return { ...prev, [field]: arrayValue }
      }
      
      return { ...prev, [field]: value }
    })
  }

  // Add tag/keyword
  const addTag = (field: 'tags' | 'keywords', value: string) => {
    if (!value.trim()) return
    
    updateFrontmatterField(field, [...(frontmatter?.[field] || []), value.trim()])
  }

  // Remove tag/keyword
  const removeTag = (field: 'tags' | 'keywords', index: number) => {
    if (!frontmatter) return
    
    const newArray = [...(frontmatter[field] || [])]
    newArray.splice(index, 1)
    updateFrontmatterField(field, newArray)
  }

  // Helper functions
  const parseMarkdownFile = (content: string): { frontmatter: FrontmatterData; markdown: string } => {
    // Split content by --- delimiters to find frontmatter
    const parts = content.split('---')
    
    // If we have at least 3 parts (before first ---, frontmatter, after second ---), we have frontmatter
    if (parts.length >= 3) {
      try {
        logger.debug('Frontmatter detected, parsing YAML...')
        // The frontmatter is in parts[1], the markdown content starts from parts[2]
        const yamlContent = parts[1].trim()
        const markdownContent = parts.slice(2).join('---').trim() // Rejoin in case there are more --- in the content
        
        logger.debug('YAML content:', yamlContent)
        logger.debug('Markdown content length:', markdownContent.length)
        
        // Enhanced YAML parsing with better field extraction
        const frontmatterData: FrontmatterData = {
          title: '',
          description: '',
          author: 'Roger Lee Cormier',
          tags: [],
          keywords: [],
          date: new Date().toISOString().split('T')[0]
        }
        
        // Extract basic fields with improved regex patterns
        const titleMatch = yamlContent.match(/^title:\s*["']?([^"\n]+)["']?/m)
        if (titleMatch) frontmatterData.title = titleMatch[1].trim()
        
        const descMatch = yamlContent.match(/^description:\s*["']?([^"\n]+)["']?/m)
        if (descMatch) frontmatterData.description = descMatch[1].trim()
        
        const authorMatch = yamlContent.match(/^author:\s*["']?([^"\n]+)["']?/m)
        if (authorMatch) frontmatterData.author = authorMatch[1].trim()
        
        const dateMatch = yamlContent.match(/^date:\s*["']?([^"\n]+)["']?/m)
        if (dateMatch) frontmatterData.date = dateMatch[1].trim()
        
        // Enhanced array field parsing for tags
        const tagsMatch = yamlContent.match(/^tags:\s*\[([^\]]+)\]/m)
        if (tagsMatch) {
          // Handle array format: ["tag1", "tag2"]
          frontmatterData.tags = tagsMatch[1]
            .split(',')
            .map(tag => tag.trim().replace(/["']/g, ''))
            .filter(Boolean)
        } else {
          // Handle list format: tags:\n  - tag1\n  - tag2
          const tagsListMatch = yamlContent.match(/^tags:\s*\n((?:\s*-\s*[^\n]+\n?)+)/m)
          if (tagsListMatch) {
            frontmatterData.tags = tagsListMatch[1]
              .split('\n')
              .map(line => line.match(/^\s*-\s*["']?([^"\n]+)["']?/)?.[1])
              .filter(Boolean) as string[]
          }
        }
        
        // Enhanced array field parsing for keywords
        const keywordsMatch = yamlContent.match(/^keywords:\s*\[([^\]]+)\]/m)
        if (keywordsMatch) {
          // Handle array format: ["keyword1", "keyword2"]
          frontmatterData.keywords = keywordsMatch[1]
            .split(',')
            .map(keyword => keyword.trim().replace(/["']/g, ''))
            .filter(Boolean)
        } else {
          // Handle list format: keywords:\n  - keyword1\n  - keyword2
          const keywordsListMatch = yamlContent.match(/^keywords:\s*\n((?:\s*-\s*[^\n]+\n?)+)/m)
          if (keywordsListMatch) {
            frontmatterData.keywords = keywordsListMatch[1]
              .split('\n')
              .map(line => line.match(/^\s*-\s*["']?([^"\n]+)["']?/)?.[1])
              .filter(Boolean) as string[]
          }
        }
        
        // Extract additional fields that might be present
        const sectionMatch = yamlContent.match(/^section:\s*["']?([^"\n]+)["']?/m)
        if (sectionMatch) frontmatterData.section = sectionMatch[1].trim()
        
        const readingTimeMatch = yamlContent.match(/^readingTime:\s*["']?([^"\n]+)["']?/m)
        if (readingTimeMatch) frontmatterData.readingTime = readingTimeMatch[1].trim()
        
        const expertiseMatch = yamlContent.match(/^expertise:\s*["']?([^"\n]+)["']?/m)
        if (expertiseMatch) frontmatterData.expertise = expertiseMatch[1].trim()
        
        const statusMatch = yamlContent.match(/^status:\s*["']?([^"\n]+)["']?/m)
        if (statusMatch) frontmatterData.status = statusMatch[1].trim()
        
        // Handle technologies field (could be string or array)
        const technologiesMatch = yamlContent.match(/^technologies:\s*\[([^\]]+)\]/m)
        if (technologiesMatch) {
          frontmatterData.technologies = technologiesMatch[1]
            .split(',')
            .map(tech => tech.trim().replace(/["']/g, ''))
            .filter(Boolean)
        } else {
          const technologiesStringMatch = yamlContent.match(/^technologies:\s*["']?([^"\n]+)["']?/m)
          if (technologiesStringMatch) {
            frontmatterData.technologies = technologiesStringMatch[1]
              .split(',')
              .map(tech => tech.trim())
              .filter(Boolean)
          }
        }
        
        logger.debug('Parsed frontmatter data:', frontmatterData)
        
        // Return the raw markdown content without any normalization
        return { frontmatter: frontmatterData, markdown: markdownContent }
      } catch (error) {
        console.error('Error parsing frontmatter:', error)
      }
    }
    
    logger.debug('No frontmatter detected, treating as plain markdown')
    // Fallback: treat entire content as markdown, but try to extract title from first heading
    const titleMatch = content.match(/^#\s+(.+?)(?:\n|$)/m)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
    
    return {
      frontmatter: {
        title: title,
        description: 'No description available',
        author: 'Roger Lee Cormier',
        tags: [],
        keywords: [],
        date: new Date().toISOString().split('T')[0]
      },
      markdown: content
    }
  }

  const clearEditor = () => {
    setContent('')
    setMarkdown('')
    setFrontmatter(null)
    setCurrentFilePath('')
    setIsEditingExisting(false)
  }

  // File management functions
  const handleFileSelect = useCallback(async (file: FileItem) => {
    try {
      setIsLoadingFile(true)
      logger.debug('🚀 Starting file load process')
      logger.debug('📁 File details:', {
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size
      })
      
      logger.debug('🔍 Calling fileService.readFile with path:', file.path)
      const fileContent = await fileService.readFile({ filePath: file.path })
      
      logger.debug('📡 File service response:', {
        success: fileContent.success,
        hasContent: !!fileContent.content,
        contentLength: fileContent.content?.length || 0,
        error: fileContent.error
      })
      
      if (fileContent.content) {
        logger.debug('✅ File content loaded successfully')
        logger.debug('📊 Content preview:', fileContent.content.substring(0, 200) + '...')
        
        // Parse the content to separate frontmatter and markdown
        logger.debug('🔍 Parsing markdown file...')
        const { frontmatter: parsedFrontmatter, markdown: parsedMarkdown } = parseMarkdownFile(fileContent.content)
        
        logger.debug('📋 Parsed frontmatter:', parsedFrontmatter)
        logger.debug('📝 Parsed markdown length:', parsedMarkdown.length)
        
        // Set the states in the correct order to ensure proper flow
        logger.debug('🔄 Setting component states...')
        setFrontmatter(parsedFrontmatter)
        setMarkdown(parsedMarkdown)
        
        // Convert markdown to HTML for proper table rendering in the editor
        logger.debug('🔄 Converting markdown to HTML...')
        const htmlContent = markdownToHtml(parsedMarkdown)
        setContent(htmlContent)
        
        // Update file-related states
        setCurrentFilePath(file.path)
        setIsEditingExisting(true)

        // Update directory to match file location
        const fileDir = file.path.split('/').slice(0, -1).join('/')
        logger.debug('📂 Setting directory to:', fileDir)
        setCustomDirectory(fileDir)
        setCurrentDirectory(fileDir)
        
        // Close file browser
        setShowFileBrowser(false)
        
        // Show success message
        logger.debug('✅ File loaded successfully, all states updated')
        
        // Auto-show frontmatter editor if frontmatter is incomplete
        if (!parsedFrontmatter.title || !parsedFrontmatter.description || parsedFrontmatter.tags.length === 0) {
          logger.debug('⚠️ Frontmatter incomplete, will show editor')
          setTimeout(() => {
            setShowFrontmatterEditor(true)
          }, 500)
        }
        
        // Show success notification
        setLoadedFileName(file.name)
        setShowFileLoadedNotification(true)
        setTimeout(() => setShowFileLoadedNotification(false), 3000)
      } else {
        logger.error('❌ File content is empty or undefined')
        logger.error('📡 File service response:', fileContent)
        alert('File content is empty. Please try again.')
      }
    } catch (error) {
      logger.error('💥 Error loading file:', error)
      console.error('Error loading file:', error)
      alert('Error loading file. Please try again.')
    } finally {
      setIsLoadingFile(false)
      logger.debug('🏁 File load process completed')
    }
  }, [fileService])

  const handleFileCreate = useCallback(async (path: string) => {
    try {
      const result = await fileService.createItem(path, 'file', '')
      if (result.success) {
        // Navigate to the new file's directory
        const fileDir = path.split('/').slice(0, -1).join('/')
        setCurrentDirectory(fileDir)
        setCustomDirectory(fileDir)
      } else {
        alert(`Error creating file: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating file:', error)
      alert('Error creating file. Please try again.')
    }
  }, [fileService])

  const handleFileDelete = useCallback(async (path: string) => {
    try {
      const result = await fileService.deleteItem(path)
      if (result.success) {
        // If we're editing the deleted file, clear the editor
        if (path === currentFilePath) {
          clearEditor()
        }
      } else {
        alert(`Error deleting file: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file. Please try again.')
    }
  }, [currentFilePath, fileService])

  const handlePathChange = useCallback((path: string) => {
    setCurrentDirectory(path)
  }, [])

  // Update current directory for file browser when content type changes
  useEffect(() => {
    // Only update current directory for file browser, ContentCreationStudio handles customDirectory
    setCurrentDirectory(getDefaultDirectory(contentType))
  }, [contentType])

  return (
    <div className={`w-full ${isFullWidth ? 'px-4' : 'px-4 max-w-7xl mx-auto'}`}>
          {/* Modern Header with Controls */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 mb-6 -mx-4 px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Title and Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <H1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      Content Creation Studio
                    </H1>
                    {isEditingExisting && currentFilePath && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-800">
                          Editing: {currentFilePath.split('/').pop()}
                        </Badge>
                        <span className="text-xs text-gray-500 font-mono">
                          {currentFilePath}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center gap-3">
                {/* Layout Controls */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={showPreview ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="h-8 px-3"
                  >
                    {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span className="ml-2 text-xs">Preview</span>
                  </Button>
                  <Button
                    variant={isFullWidth ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsFullWidth(!isFullWidth)}
                    className="h-8 px-3"
                  >
                    {isFullWidth ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    <span className="ml-2 text-xs">Full Width</span>
                  </Button>
                </div>

                {/* Back Button */}
                <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <Link to="/protected">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* File Loaded Notification */}
          {showFileLoadedNotification && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">File loaded successfully!</p>
                    <p className="text-sm text-green-700">
                      <strong>{loadedFileName}</strong> has been loaded into the editor
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileLoadedNotification(false)}
                  className="text-green-700 hover:text-green-800 hover:bg-green-100"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Main Content Area - Dual Pane Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Content Type & Settings */}
            <div className="col-span-3 space-y-6">
              {/* Content Type Selection */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Layout className="h-5 w-5 text-teal-600" />
                    Content Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="blog"
                        name="contentType"
                        value="blog"
                        checked={contentType === 'blog'}
                        onChange={(e) => setContentType(e.target.value as 'blog' | 'portfolio' | 'project')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <Label htmlFor="blog" className="flex items-center gap-2 cursor-pointer text-sm">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Blog Post
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="portfolio"
                        name="contentType"
                        value="portfolio"
                        checked={contentType === 'portfolio'}
                        onChange={(e) => setContentType(e.target.value as 'blog' | 'portfolio' | 'project')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <Label htmlFor="portfolio" className="flex items-center gap-2 cursor-pointer text-sm">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        Portfolio Page
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="project"
                        name="contentType"
                        value="project"
                        checked={contentType === 'project'}
                        onChange={(e) => setContentType(e.target.value as 'blog' | 'portfolio' | 'project')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <Label htmlFor="project" className="flex items-center gap-2 cursor-pointer text-sm">
                        <FolderOpen className="h-4 w-4 text-purple-600" />
                        Project
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  {/* Directory Settings */}
                  <div className="space-y-2">
                    <Label htmlFor="directory" className="text-sm font-medium text-gray-700">
                      Save Directory
                    </Label>
                    <Input
                      id="directory"
                      value={customDirectory}
                      onChange={(e) => setCustomDirectory(e.target.value)}
                      placeholder="e.g., src/content/blog"
                      className="text-sm border-gray-200 focus:border-teal-400 focus:ring-teal-400"
                    />
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowFileBrowser(true)}
                      variant="outline"
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                      disabled={isLoadingFile}
                    >
                      <FolderOpenIcon className="h-4 w-4 mr-2" />
                      {isLoadingFile ? 'Loading...' : 'Browse Files'}
                    </Button>
                    
                    <Button
                      onClick={() => setShowSaveDialog(true)}
                      disabled={!frontmatter || !markdown.trim()}
                      variant="outline"
                      className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isEditingExisting ? 'Save Changes' : 'Save File'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Frontmatter Preview */}
              {frontmatter && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-900">Frontmatter Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title</Label>
                      <p className="text-sm text-gray-900 font-medium mt-1">{frontmatter.title}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</Label>
                      <p className="text-sm text-gray-900 mt-1">{frontmatter.description}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[...new Set(frontmatter.tags)].map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-teal-100 text-teal-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Keywords</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {frontmatter.keywords?.slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {keyword}
                          </Badge>
                        ))}
                        {frontmatter.keywords && frontmatter.keywords.length > 5 && (
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                            +{frontmatter.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>

            {/* Main Editor Area - Dual Pane */}
            <div className="col-span-9">
              {isLoadingFile ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-teal-700 font-medium text-lg">Loading file...</p>
                    <p className="text-sm text-gray-500 mt-2">Parsing frontmatter and content</p>
                  </div>
                </div>
              ) : (
                <Suspense fallback={<div>Loading Content Creation Studio...</div>}>
                  <ContentCreationStudio
                    key={currentFilePath || 'new-content'}
                    initialContent={content || `# Start Writing Your Content

Welcome to the Content Creation Studio! Use the toolbar above to format your content with headers, bold, italic, lists, and more.

## Table Support

You can create tables using the table button in the toolbar or by typing markdown:

| Feature | Description | Status |
|---------|-------------|---------|
| Tables | Full table support with editing | ✅ |
| Charts | Interactive chart insertion | ✅ |
| Code | Syntax highlighting | ✅ |
| Lists | Bullet and numbered lists | ✅ |

## Getting Started

1. Use the toolbar for formatting
2. Click the table icon to insert tables
3. Click the chart icon to add charts
4. Use the Frontmatter button in the toolbar to edit metadata
5. Save your content`}
                    onContentChange={handleContentChange}
                    showPreview={showPreview}
                    showToolbar={true}
                    minHeight="800px"
                    contentType={contentType}
                    onDirectoryChange={(directory) => setCustomDirectory(directory)}
                  />
                </Suspense>
              )}
            </div>
          </div>

          {/* Frontmatter Editor Dialog */}
          <Dialog open={showFrontmatterEditor} onOpenChange={setShowFrontmatterEditor}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-teal-900">Edit Frontmatter</DialogTitle>
                <DialogDescription>
                  Configure the metadata for your content including title, description, tags, and other properties.
                </DialogDescription>
              </DialogHeader>
              
              {frontmatter && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-teal-700">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={frontmatter.title}
                        onChange={(e) => updateFrontmatterField('title', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="author" className="text-sm font-medium text-teal-700">
                        Author
                      </Label>
                      <Input
                        id="author"
                        value={frontmatter.author}
                        onChange={(e) => updateFrontmatterField('author', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-teal-700">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={frontmatter.description}
                      onChange={(e) => updateFrontmatterField('description', e.target.value)}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-sm font-medium text-teal-700">Tags *</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new tag..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag('tags', (e.target as HTMLInputElement).value)
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => {
                            const input = document.getElementById('new-tag') as HTMLInputElement
                            if (input?.value) {
                              addTag('tags', input.value)
                              input.value = ''
                            }
                          }}
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(frontmatter.tags)].map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              onClick={() => removeTag('tags', index)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <Label className="text-sm font-medium text-teal-700">Keywords *</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="new-keyword"
                          placeholder="Add new keyword..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag('keywords', (e.target as HTMLInputElement).value)
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => {
                            const input = document.getElementById('new-keyword') as HTMLInputElement
                            if (input?.value) {
                              addTag('keywords', input.value)
                              input.value = ''
                            }
                          }}
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {frontmatter.keywords?.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {keyword}
                            <button
                              onClick={() => removeTag('keywords', index)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Content Type Specific Fields */}
                  {contentType === 'blog' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date" className="text-sm font-medium text-teal-700">
                          Publication Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={frontmatter.date}
                          onChange={(e) => updateFrontmatterField('date', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="readingTime" className="text-sm font-medium text-teal-700">
                          Reading Time
                        </Label>
                        <Input
                          id="readingTime"
                          value={String(frontmatter.readingTime || '')}
                          onChange={(e) => updateFrontmatterField('readingTime', e.target.value)}
                          placeholder="e.g., 5 min read"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'portfolio' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expertise" className="text-sm font-medium text-teal-700">
                          Expertise Level
                        </Label>
                        <select
                          id="expertise"
                          value={String(frontmatter.expertise || '')}
                          onChange={(e) => updateFrontmatterField('expertise', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                        >
                          <option value="">Select expertise level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="section" className="text-sm font-medium text-teal-700">
                          Section
                        </Label>
                        <Input
                          id="section"
                          value={frontmatter.section || ''}
                          onChange={(e) => updateFrontmatterField('section', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'project' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status" className="text-sm font-medium text-teal-700">
                          Project Status
                        </Label>
                        <select
                          id="status"
                          value={String(frontmatter.status || '')}
                          onChange={(e) => updateFrontmatterField('status', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                        >
                          <option value="">Select status</option>
                          <option value="planning">Planning</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="technologies" className="text-sm font-medium text-teal-700">
                          Technologies
                        </Label>
                        <Input
                          id="technologies"
                          value={Array.isArray(frontmatter.technologies) ? frontmatter.technologies.join(', ') : ''}
                          onChange={(e) => updateFrontmatterField('technologies', e.target.value)}
                          placeholder="e.g., React, TypeScript, Azure"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowFrontmatterEditor(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setShowFrontmatterEditor(false)
                        setShowSaveDialog(true)
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Continue to Save
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* File Browser Dialog */}
          <Dialog open={showFileBrowser} onOpenChange={setShowFileBrowser}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-teal-900">File Browser</DialogTitle>
                <DialogDescription>
                  Browse, create, and manage content files in your project directories.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-6 h-[70vh]">
                {/* File Browser */}
                <div className="w-1/2">
                  <FileBrowser
                    currentPath={currentDirectory}
                    onPathChange={handlePathChange}
                    onFileSelect={handleFileSelect}
                    onFileCreate={handleFileCreate}
                    onFileDelete={handleFileDelete}
                    currentEditingFile={currentFilePath}
                    isLoadingFile={isLoadingFile}
                  />
                </div>
                
                {/* File Info */}
                <div className="w-1/2 space-y-4">
                  <Card className="border border-teal-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-teal-900">File Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Current Directory</Label>
                        <p className="text-sm text-gray-900 font-mono">{currentDirectory}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Content Type</Label>
                        <p className="text-sm text-gray-900 capitalize">{contentType}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Default Directory</Label>
                        <p className="text-sm text-gray-900 font-mono">{getDefaultDirectory(contentType)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-teal-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-teal-900">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        onClick={() => {
                          setCustomDirectory(currentDirectory)
                          setShowFileBrowser(false)
                        }}
                        variant="outline"
                        className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        Use This Directory
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setCurrentDirectory(getDefaultDirectory(contentType))
                          setCustomDirectory(getDefaultDirectory(contentType))
                        }}
                        variant="ghost"
                        className="w-full text-teal-700 hover:bg-teal-50"
                      >
                        Reset to Default
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* File Save Dialog */}
          <FileSaveDialog
            open={showSaveDialog}
            onOpenChange={setShowSaveDialog}
            frontmatter={frontmatter || {}}
            markdown={markdown}
            contentType={contentType}
            customDirectory={customDirectory}
            onSaveSuccess={(filePath) => {
              setCurrentFilePath(filePath)
              setIsEditingExisting(true)
            }}
          />
        </div>
  )
}

export default ContentCreationPage
