import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, FileText, Briefcase, FolderOpen, Settings, FolderOpen as FolderOpenIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { H1, P } from '@/components/ui/typography'
import MarkdownEditor from '@/components/MarkdownEditor'
import { FrontmatterGenerator } from '@/utils/frontmatterGenerator'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import FileBrowser from '@/components/FileBrowser'
import FileService, { FileItem } from '@/utils/fileService'
import { logger } from '@/utils/logger'
import { markdownToHtml } from '@/utils/markdownConverter'

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
  const [contentType, setContentType] = useState<'blog' | 'portfolio' | 'project'>('blog')
  const [content, setContent] = useState('')
  const [markdown, setMarkdown] = useState('')
  const [frontmatter, setFrontmatter] = useState<FrontmatterData | null>(null)
  const [showFrontmatterEditor, setShowFrontmatterEditor] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filename, setFilename] = useState('')
  const [customDirectory, setCustomDirectory] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // File management state
  const [currentFilePath, setCurrentFilePath] = useState<string>('')
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [showFileBrowser, setShowFileBrowser] = useState(false)
  const [currentDirectory, setCurrentDirectory] = useState('src/content')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isLoadingFile, setIsLoadingFile] = useState(false)
  const [showFileLoadedNotification, setShowFileLoadedNotification] = useState(false)
  const [loadedFileName, setLoadedFileName] = useState('')
  
  // File service instance
  const fileService = FileService.getInstance()

  // Default directories for each content type
  const getDefaultDirectory = (type: string) => {
    switch (type) {
      case 'blog': return 'src/content/blog'
      case 'portfolio': return 'src/content/portfolio'
      case 'project': return 'src/content/projects'
      default: return 'src/content'
    }
  }

  // Generate filename from title
  const generateFilename = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

    // Handle content changes from the editor - exactly like MarkdownEditorPage
  const handleContentChange = useCallback((html: string, markdown: string) => {
    setContent(html)
    setMarkdown(markdown)
  }, [])

         // Generate frontmatter automatically
   const generateFrontmatter = useCallback(async () => {
     // Use markdown state for frontmatter generation
     if (!markdown.trim()) {
       alert('Please add some content before generating frontmatter.')
       return
     }

    setIsGenerating(true)
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
               const generated = FrontmatterGenerator.generateFrontmatter(markdown, contentType)
      setFrontmatter(generated)
      
      // Auto-generate filename from title
      if (generated.title) {
        setFilename(generateFilename(generated.title))
      }
      
      setShowFrontmatterEditor(true)
    } catch (error) {
      console.error('Error generating frontmatter:', error)
      alert('Error generating frontmatter. Please try again.')
    } finally {
      setIsGenerating(false)
    }
     }, [markdown, contentType])

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
     setFilename('')
     setSaveStatus('idle')
   }

  // File management functions
  const handleFileSelect = useCallback(async (file: FileItem) => {
    try {
      setIsLoadingFile(true)
      logger.debug('Loading file:', file.path)
      const fileContent = await fileService.readFile(file.path)
      if (fileContent.content) {
        logger.debug('File content loaded, length:', fileContent.content.length)
        logger.debug('Raw file content:', fileContent.content.substring(0, 200) + '...')
        
        // Parse the content to separate frontmatter and markdown
        const { frontmatter: parsedFrontmatter, markdown: parsedMarkdown } = parseMarkdownFile(fileContent.content)
        
        logger.debug('Parsed frontmatter:', parsedFrontmatter)
        logger.debug('Parsed markdown:', parsedMarkdown)
        logger.debug('Markdown length:', parsedMarkdown.length)
        
                 // Set the states in the correct order to ensure proper flow
         setFrontmatter(parsedFrontmatter)
         setMarkdown(parsedMarkdown)
         // Convert markdown to HTML for proper table rendering in the editor
         const htmlContent = markdownToHtml(parsedMarkdown)
         setContent(htmlContent)
        
        // Update file-related states
        setCurrentFilePath(file.path)
        setIsEditingExisting(true)
        setFilename(file.name.replace('.md', ''))
        
        // Update directory to match file location
        const fileDir = file.path.split('/').slice(0, -1).join('/')
        setCustomDirectory(fileDir)
        setCurrentDirectory(fileDir)
        
        // Close file browser
        setShowFileBrowser(false)
        
        // Show success message
        logger.debug('File loaded successfully, states updated')
        
        // Auto-show frontmatter editor if frontmatter is incomplete
        if (!parsedFrontmatter.title || !parsedFrontmatter.description || parsedFrontmatter.tags.length === 0) {
          setTimeout(() => {
            setShowFrontmatterEditor(true)
          }, 500)
        }
        
        // Show success notification
        setLoadedFileName(file.name)
        setShowFileLoadedNotification(true)
        setTimeout(() => setShowFileLoadedNotification(false), 3000)
      }
    } catch (error) {
      console.error('Error loading file:', error)
      alert('Error loading file. Please try again.')
    } finally {
      setIsLoadingFile(false)
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



     // Save the file
   const saveFile = useCallback(async () => {
     if (!frontmatter || !markdown.trim()) {
       alert('Please generate frontmatter and add content before saving.')
       return
     }

    const validation = FrontmatterGenerator.validateFrontmatter(frontmatter)
    if (!validation.isValid) {
      alert(`Frontmatter validation failed:\n${validation.errors.join('\n')}`)
      return
    }

    try {
      setIsSaving(true)
      setSaveStatus('idle')
      
      // Create the full markdown content with frontmatter
      const frontmatterYAML = FrontmatterGenerator.toYAML(frontmatter)
      const fullContent = `${frontmatterYAML}\n\n${markdown}`

      // Determine the file path
      const targetPath = isEditingExisting && currentFilePath 
        ? currentFilePath 
        : `${customDirectory || getDefaultDirectory(contentType)}/${filename}.md`

      // Save the file using the file service
      const result = await fileService.writeFile(targetPath, fullContent)
      
      if (result.success) {
        setSaveStatus('success')
        setCurrentFilePath(targetPath)
        setIsEditingExisting(true)
        
        // Show success message
        setTimeout(() => {
          alert(`File saved successfully to: ${targetPath}`)
          setSaveStatus('idle')
        }, 500)
        
        setShowSaveDialog(false)
      } else {
        setSaveStatus('error')
        alert(`Error saving file: ${result.error}`)
      }
    } catch (error) {
      setSaveStatus('error')
      console.error('Error saving file:', error)
      alert('Error saving file. Please try again.')
    } finally {
      setIsSaving(false)
    }
     }, [frontmatter, markdown, filename, customDirectory, contentType, isEditingExisting, currentFilePath, fileService])



  // Update default directory when content type changes
  useEffect(() => {
    if (!customDirectory) {
      setCustomDirectory(getDefaultDirectory(contentType))
    }
    // Also update current directory for file browser
    setCurrentDirectory(getDefaultDirectory(contentType))
  }, [contentType, customDirectory])

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="max-w-4xl mx-auto">
                         <div className="flex items-center justify-center gap-4 mb-6">
               <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                 <FileText className="h-6 w-6 text-teal-600" />
               </div>
               <div className="text-center">
                 <H1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                   Content Creation Studio
                 </H1>
                 {isEditingExisting && currentFilePath && (
                   <div className="mt-2 flex items-center justify-center gap-2">
                     <Badge variant="secondary" className="text-xs">
                       Editing: {currentFilePath.split('/').pop()}
                     </Badge>
                     <span className="text-sm text-gray-600">
                       {currentFilePath}
                     </span>
                   </div>
                 )}
               </div>
             </div>
            <P className="text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Create professional blog posts, portfolio pages, and project documentation with AI-powered frontmatter generation.
            </P>
          </div>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
            <Link to="/protected">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Protected Area
            </Link>
          </Button>
        </div>

        {/* File Loaded Notification */}
        {showFileLoadedNotification && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Content Type & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Content Type Selection */}
            <Card className="border border-teal-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-teal-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Content Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="blog"
                      name="contentType"
                      value="blog"
                      checked={contentType === 'blog'}
                      onChange={(e) => setContentType(e.target.value as 'blog' | 'portfolio' | 'project')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="blog" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Blog Post
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="portfolio"
                      name="contentType"
                      value="portfolio"
                      checked={contentType === 'portfolio'}
                      onChange={(e) => setContentType(e.target.value as 'blog' | 'portfolio' | 'project')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="portfolio" className="flex items-center gap-2 cursor-pointer">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      Portfolio Page
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="project"
                      name="contentType"
                      value="project"
                      checked={contentType === 'project'}
                      onChange={(e) => setContentType(e.target.value as 'blog' | 'portfolio' | 'project')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="project" className="flex items-center gap-2 cursor-pointer">
                      <FolderOpen className="h-4 w-4 text-purple-600" />
                      Project
                    </Label>
                  </div>
                </div>

                <Separator />

                {/* Directory Settings */}
                <div className="space-y-2">
                  <Label htmlFor="directory" className="text-sm font-medium text-teal-700">
                    Save Directory
                  </Label>
                  <Input
                    id="directory"
                    value={customDirectory}
                    onChange={(e) => setCustomDirectory(e.target.value)}
                    placeholder="e.g., src/content/blog"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Default: {getDefaultDirectory(contentType)}
                  </p>
                </div>

                <Separator />

                                 {/* Actions */}
                 <div className="space-y-2">
                   <Button
                     onClick={() => setShowFileBrowser(true)}
                     variant="outline"
                     className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                     disabled={isLoadingFile}
                   >
                     <FolderOpenIcon className="h-4 w-4 mr-2" />
                     {isLoadingFile ? 'Loading...' : 'Browse Files'}
                   </Button>
                   
                                       <Button
                      onClick={generateFrontmatter}
                      disabled={isGenerating || !markdown.trim()}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    >
                     {isGenerating ? 'Generating...' : 'Generate Frontmatter'}
                   </Button>
                   
                   <Button
                     onClick={() => setShowSaveDialog(true)}
                     disabled={!frontmatter || !markdown.trim()}
                     variant="outline"
                     className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                   >
                     <Save className="h-4 w-4 mr-2" />
                     {isEditingExisting ? 'Save Changes' : 'Save File'}
                   </Button>

                   
                   
                   
                 </div>
              </CardContent>
            </Card>

            {/* Frontmatter Preview */}
            {frontmatter && (
              <Card className="border border-teal-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-teal-900">Frontmatter Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Title</Label>
                    <p className="text-sm text-gray-900 font-medium">{frontmatter.title}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Description</Label>
                    <p className="text-sm text-gray-900">{frontmatter.description}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {frontmatter.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Keywords</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {frontmatter.keywords?.slice(0, 5).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {frontmatter.keywords && frontmatter.keywords.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{frontmatter.keywords.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="border border-teal-200">
              <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-200">
                <CardTitle className="text-teal-900">
                  {contentType === 'blog' && 'Blog Post Editor'}
                  {contentType === 'portfolio' && 'Portfolio Page Editor'}
                  {contentType === 'project' && 'Project Documentation Editor'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingFile ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                      <p className="text-teal-700 font-medium">Loading file...</p>
                      <p className="text-sm text-gray-500 mt-2">Parsing frontmatter and content</p>
                    </div>
                  </div>
                ) : (
                                     <MarkdownEditor
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
4. Generate frontmatter when ready
5. Save your content`}
                     onContentChange={handleContentChange}
                     showToolbar={true}
                     minHeight="800px"
                   />
                )}
              </CardContent>
            </Card>
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
                      {frontmatter.tags?.map((tag, index) => (
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

         {/* Save Dialog */}
         <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
           <DialogContent className="max-w-2xl">
             <DialogHeader>
               <DialogTitle className="text-teal-900">
                 {isEditingExisting ? 'Save Changes' : 'Save Content File'}
               </DialogTitle>
               <DialogDescription>
                 {isEditingExisting 
                   ? 'Save your changes to the existing file.' 
                   : 'Choose a filename and directory to save your new content file.'
                 }
               </DialogDescription>
             </DialogHeader>
             
             <div className="space-y-4">
               {!isEditingExisting && (
                 <>
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
                       value={customDirectory}
                       onChange={(e) => setCustomDirectory(e.target.value)}
                       placeholder="e.g., src/content/blog"
                       className="mt-1"
                     />
                     <p className="text-xs text-gray-500 mt-1">
                       Recommended: {getDefaultDirectory(contentType)}
                     </p>
                   </div>
                 </>
               )}

               {isEditingExisting && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <h4 className="font-medium text-blue-900 mb-2">Editing Existing File</h4>
                   <div className="text-sm text-blue-800 space-y-1">
                     <p><strong>File:</strong> {currentFilePath}</p>
                     <p><strong>Directory:</strong> {customDirectory}</p>
                     <p className="text-xs">Changes will be saved to the existing file.</p>
                   </div>
                 </div>
               )}

               <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                 <h4 className="font-medium text-teal-900 mb-2">File Summary</h4>
                 <div className="text-sm text-teal-800 space-y-1">
                   <p><strong>Content Type:</strong> {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</p>
                   <p><strong>Title:</strong> {frontmatter?.title || 'Not set'}</p>
                   <p><strong>Tags:</strong> {frontmatter?.tags?.join(', ') || 'Not set'}</p>
                   <p><strong>Content Length:</strong> {markdown.split(/\s+/).length} words</p>
                 </div>
               </div>

               <div className="flex justify-end gap-2">
                 <Button
                   variant="outline"
                   onClick={() => setShowSaveDialog(false)}
                 >
                   Cancel
                 </Button>
                 <Button
                   onClick={saveFile}
                   disabled={isSaving}
                   className="bg-teal-600 hover:bg-teal-700 text-white"
                 >
                   {isSaving ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                       Saving...
                     </>
                   ) : (
                     <>
                       <Save className="h-4 w-4 mr-2" />
                       {isEditingExisting ? 'Save Changes' : 'Save File'}
                     </>
                   )}
                 </Button>
               </div>

               {/* Save Status */}
               {saveStatus === 'success' && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                   <p className="text-sm text-green-800">✅ File saved successfully!</p>
                 </div>
               )}
               
               {saveStatus === 'error' && (
                 <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                   <p className="text-sm text-red-800">❌ Error saving file. Please try again.</p>
                 </div>
               )}
             </div>
           </DialogContent>
         </Dialog>
      </div>
    </ProtectedRoute>
  )
}

export default ContentCreationPage
