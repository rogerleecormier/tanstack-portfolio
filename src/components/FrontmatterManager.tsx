import React, { useState, useCallback, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Minus, 
  Save, 
  Settings, 
  FileText, 
  Calendar, 
  User, 
  Tags, 
  Hash, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

import { FrontmatterGenerator } from '@/utils/frontmatterGenerator'

export interface FrontmatterData {
  title: string
  description: string
  author: string
  tags: string[]
  keywords: string[]
  date?: string
  section?: string
  publishedTime?: string
  readingTime?: string
  expertise?: string
  industries?: string[]
  status?: string
  technologies?: string[]
  [key: string]: string | string[] | number | boolean | undefined
}

interface FrontmatterManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  frontmatter: FrontmatterData
  onFrontmatterChange: (frontmatter: FrontmatterData) => void
  contentType?: 'blog' | 'portfolio' | 'project'
  content?: string
  onGenerateFromContent?: () => void
}

const FrontmatterManager: React.FC<FrontmatterManagerProps> = ({
  open,
  onOpenChange,
  frontmatter,
  onFrontmatterChange,
  contentType,
  content,
  onGenerateFromContent
}) => {
  const [localFrontmatter, setLocalFrontmatter] = useState<FrontmatterData>(frontmatter)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Update local state when prop changes
  useEffect(() => {
    setLocalFrontmatter(frontmatter)
  }, [frontmatter])

  // Validate frontmatter data
  const validateFrontmatter = useCallback((data: FrontmatterData): string[] => {
    const errors: string[] = []

    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long')
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long')
    }

    if (!data.author || data.author.trim().length < 2) {
      errors.push('Author must be at least 2 characters long')
    }

    if (!data.tags || data.tags.length === 0) {
      errors.push('At least one tag is required')
    }

    if (!data.keywords || data.keywords.length === 0) {
      errors.push('At least one keyword is required')
    }

    if (data.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(data.date)) {
        errors.push('Date must be in YYYY-MM-DD format')
      }
    }

    return errors
  }, [])

  // Handle field changes
  const handleFieldChange = useCallback((key: string, value: any) => {
    const updated = { ...localFrontmatter, [key]: value }
    setLocalFrontmatter(updated)
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => !error.includes(key)))
  }, [localFrontmatter])

  // Handle array field changes (tags, keywords, etc.)
  const handleArrayFieldChange = useCallback((key: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    handleFieldChange(key, items)
  }, [handleFieldChange])

  // Add item to array field
  const handleAddArrayItem = useCallback((key: string, value: string) => {
    if (!value.trim()) return
    
    const currentItems = (localFrontmatter[key] as string[]) || []
    const updated = { ...localFrontmatter, [key]: [...currentItems, value.trim()] }
    setLocalFrontmatter(updated)
  }, [localFrontmatter])

  // Remove item from array field
  const handleRemoveArrayItem = useCallback((key: string, index: number) => {
    const currentItems = (localFrontmatter[key] as string[]) || []
    const updated = { ...localFrontmatter, [key]: currentItems.filter((_, i) => i !== index) }
    setLocalFrontmatter(updated)
  }, [localFrontmatter])

  // Generate frontmatter from content
  const handleGenerateFromContent = useCallback(async () => {
    if (!contentType || !content) return
    
    setIsGenerating(true)
    try {
      const generated = FrontmatterGenerator.generateFrontmatter(content, contentType)
      setLocalFrontmatter(generated)
      setValidationErrors([])
      
      if (onGenerateFromContent) {
        onGenerateFromContent()
      }
    } catch (error) {
      console.error('Failed to generate frontmatter:', error)
      setValidationErrors(['Failed to generate frontmatter from content'])
    } finally {
      setIsGenerating(false)
    }
  }, [contentType, content, onGenerateFromContent])

  // Save changes
  const handleSave = useCallback(() => {
    const errors = validateFrontmatter(localFrontmatter)
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    onFrontmatterChange(localFrontmatter)
    onOpenChange(false)
  }, [localFrontmatter, validateFrontmatter, onFrontmatterChange, onOpenChange])

  // Reset to original values
  const handleReset = useCallback(() => {
    setLocalFrontmatter(frontmatter)
    setValidationErrors([])
  }, [frontmatter])

  // Get field display value for array fields
  const getArrayFieldDisplayValue = useCallback((key: string): string => {
    const items = (localFrontmatter[key] as string[]) || []
    return items.join(', ')
  }, [localFrontmatter])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Frontmatter Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Validation Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-700 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential metadata for your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={localFrontmatter.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Enter content title"
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="author" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Author *
                  </Label>
                  <Input
                    id="author"
                    value={localFrontmatter.author}
                    onChange={(e) => handleFieldChange('author', e.target.value)}
                    placeholder="Enter author name"
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={localFrontmatter.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Enter content description"
                  className="min-h-[80px] border-teal-200 focus:border-teal-400"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={localFrontmatter.date || ''}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="section" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Section
                  </Label>
                  <Input
                    id="section"
                    value={localFrontmatter.section || ''}
                    onChange={(e) => handleFieldChange('section', e.target.value)}
                    placeholder="Enter section name"
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="w-5 h-5" />
                Tags & Keywords
              </CardTitle>
              <CardDescription>
                Help categorize and discover your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tags" className="flex items-center gap-2">
                  <Tags className="w-4 h-4" />
                  Tags *
                </Label>
                <div className="space-y-2">
                  <Input
                    id="tags"
                    value={getArrayFieldDisplayValue('tags')}
                    onChange={(e) => handleArrayFieldChange('tags', e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="border-teal-200 focus:border-teal-400"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(localFrontmatter.tags || []).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-800">
                        {tag}
                        <button
                          onClick={() => handleRemoveArrayItem('tags', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="keywords" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Keywords *
                </Label>
                <div className="space-y-2">
                  <Input
                    id="keywords"
                    value={getArrayFieldDisplayValue('keywords')}
                    onChange={(e) => handleArrayFieldChange('keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="border-teal-200 focus:border-teal-400"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(localFrontmatter.keywords || []).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {keyword}
                        <button
                          onClick={() => handleRemoveArrayItem('keywords', index)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Type Specific Fields */}
          {contentType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Specific
                </CardTitle>
                <CardDescription>
                  Additional fields specific to {contentType} content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contentType === 'blog' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="publishedTime">Published Time</Label>
                        <Input
                          id="publishedTime"
                          type="datetime-local"
                          value={localFrontmatter.publishedTime || ''}
                          onChange={(e) => handleFieldChange('publishedTime', e.target.value)}
                          className="border-teal-200 focus:border-teal-400"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="readingTime">Reading Time (minutes)</Label>
                        <Input
                          id="readingTime"
                          type="number"
                          min="1"
                          value={localFrontmatter.readingTime || ''}
                          onChange={(e) => handleFieldChange('readingTime', e.target.value)}
                          className="border-teal-200 focus:border-teal-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {contentType === 'portfolio' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expertise">Expertise Level</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {localFrontmatter.expertise || 'Select expertise level'}
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleFieldChange('expertise', 'beginner')}>
                              Beginner
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFieldChange('expertise', 'intermediate')}>
                              Intermediate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFieldChange('expertise', 'advanced')}>
                              Advanced
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div>
                        <Label htmlFor="industries">Industries</Label>
                        <Input
                          id="industries"
                          value={getArrayFieldDisplayValue('industries')}
                          onChange={(e) => handleArrayFieldChange('industries', e.target.value)}
                          placeholder="industry1, industry2, industry3"
                          className="border-teal-200 focus:border-teal-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {contentType === 'project' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Project Status</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {localFrontmatter.status || 'Select status'}
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleFieldChange('status', 'planning')}>
                              Planning
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFieldChange('status', 'in-progress')}>
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFieldChange('status', 'completed')}>
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFieldChange('status', 'on-hold')}>
                              On Hold
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div>
                        <Label htmlFor="technologies">Technologies</Label>
                        <Input
                          id="technologies"
                          value={getArrayFieldDisplayValue('technologies')}
                          onChange={(e) => handleArrayFieldChange('technologies', e.target.value)}
                          placeholder="tech1, tech2, tech3"
                          className="border-teal-200 focus:border-teal-400"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-gray-300"
              >
                Reset
              </Button>
              
              {contentType && content && (
                <Button
                  variant="outline"
                  onClick={handleGenerateFromContent}
                  disabled={isGenerating}
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate from Content'}
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FrontmatterManager