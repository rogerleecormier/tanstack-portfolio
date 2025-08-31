import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Plus, 
  FileText, 
  FolderOpen, 
  Settings, 
  Calendar,
  Clock,
  User,
  Tag,
  Hash,
  Target,
  Code,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

import { FrontmatterGenerator } from '@/utils/frontmatterGenerator'
import { logger } from '@/utils/logger'

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
  const handleFieldChange = useCallback((key: string, value: string | string[] | number | boolean) => {
    const updated = { ...localFrontmatter, [key]: value }
    setLocalFrontmatter(updated)
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => !error.includes(key)))
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
    
    try {
      const generated = FrontmatterGenerator.generateFrontmatter(content, contentType)
      setLocalFrontmatter(generated)
      setValidationErrors([])
    } catch (error) {
      logger.error('Failed to generate frontmatter:', error)
    }
  }, [contentType, content])

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

  // Cancel changes
  const handleCancel = useCallback(() => {
    setLocalFrontmatter(frontmatter)
    setValidationErrors([])
    onOpenChange(false)
  }, [frontmatter, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-teal-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Frontmatter Manager
          </DialogTitle>
          <DialogDescription>
            Configure the metadata for your content including title, description, tags, and other properties.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Title *
              </Label>
              <Input
                id="title"
                value={localFrontmatter.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="mt-1"
                placeholder="Enter content title"
              />
            </div>
            
            <div>
              <Label htmlFor="author" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Author
              </Label>
              <Input
                id="author"
                value={localFrontmatter.author}
                onChange={(e) => handleFieldChange('author', e.target.value)}
                className="mt-1"
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-teal-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description *
            </Label>
            <Textarea
              id="description"
              value={localFrontmatter.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="mt-1 min-h-[80px]"
              placeholder="Enter content description"
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium text-teal-700 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags *
            </Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      if (input.value.trim()) {
                        const currentTags = (localFrontmatter.tags || [])
                        handleFieldChange('tags', [...currentTags, input.value.trim()])
                        input.value = ''
                      }
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    const input = document.getElementById('new-tag') as HTMLInputElement
                    if (input?.value.trim()) {
                      const currentTags = (localFrontmatter.tags || [])
                      handleFieldChange('tags', [...currentTags, input.value.trim()])
                      input.value = ''
                    }
                  }}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(localFrontmatter.tags || []).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveArrayItem('tags', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <Label className="text-sm font-medium text-teal-700 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Keywords *
            </Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  id="new-keyword"
                  placeholder="Add new keyword..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      if (input.value.trim()) {
                        const currentKeywords = (localFrontmatter.keywords || [])
                        handleFieldChange('keywords', [...currentKeywords, input.value.trim()])
                        input.value = ''
                      }
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    const input = document.getElementById('new-keyword') as HTMLInputElement
                    if (input?.value.trim()) {
                      const currentKeywords = (localFrontmatter.keywords || [])
                      handleFieldChange('keywords', [...currentKeywords, input.value.trim()])
                      input.value = ''
                    }
                  }}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(localFrontmatter.keywords || []).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {keyword}
                    <button
                      onClick={() => handleRemoveArrayItem('keywords', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
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
                <Label htmlFor="date" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Publication Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={localFrontmatter.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="readingTime" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reading Time
                </Label>
                <Input
                  id="readingTime"
                  value={String(localFrontmatter.readingTime || '')}
                  onChange={(e) => handleFieldChange('readingTime', e.target.value)}
                  placeholder="e.g., 5 min read"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {contentType === 'portfolio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expertise" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Expertise Level
                </Label>
                <select
                  id="expertise"
                  value={String(localFrontmatter.expertise || '')}
                  onChange={(e) => handleFieldChange('expertise', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:border-teal-400"
                >
                  <option value="">Select expertise level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="section" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Section
                </Label>
                <Input
                  id="section"
                  value={localFrontmatter.section || ''}
                  onChange={(e) => handleFieldChange('section', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Leadership, DevOps, Analytics"
                />
              </div>
            </div>
          )}

          {contentType === 'project' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Project Status
                </Label>
                <select
                  id="status"
                  value={String(localFrontmatter.status || '')}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
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
                <Label htmlFor="technologies" className="text-sm font-medium text-teal-700 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Technologies
                </Label>
                <Input
                  id="technologies"
                  value={Array.isArray(localFrontmatter.technologies) ? localFrontmatter.technologies.join(', ') : ''}
                  onChange={(e) => handleFieldChange('technologies', e.target.value)}
                  placeholder="e.g., React, TypeScript, Azure"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-900">Please fix the following errors:</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              Cancel
            </Button>
            
            {onGenerateFromContent && (
              <Button
                onClick={handleGenerateFromContent}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate from Content
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FrontmatterManager