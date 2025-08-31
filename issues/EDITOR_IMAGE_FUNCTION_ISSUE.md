# 🖼️ Editor Image Function: Add Image Insertion, Resize, and Nested Text Capabilities

## Summary
Add comprehensive image functionality to the Content Creation Studio editor, including image insertion, resizing, alt text management, and nested text capabilities. Implement both drag-and-drop image uploads and URL-based image insertion with advanced resizing controls. Support markdown image syntax with nested text rendering and provide a user-friendly image management interface.

## Current Behavior
- **No Image Function**: Editor lacks built-in image insertion functionality
- **Manual HTML**: Users must manually write HTML img tags
- **No Resize Controls**: No way to resize or adjust image dimensions
- **No Alt Text**: No built-in alt text management for accessibility
- **Limited Markdown**: No markdown image syntax with nested text support
- **No Image Management**: No tools to organize or manage inserted images

## Expected Behavior
- **Image Insertion**: Easy-to-use image insertion button and drag-and-drop support
- **Resize Capabilities**: Interactive resize handles and dimension controls
- **Alt Text Management**: Built-in alt text input and management
- **Markdown Support**: Full markdown image syntax with nested text rendering
- **Image Optimization**: Automatic image sizing and format optimization
- **Image Library**: Organized image management and reuse capabilities

## Technical Requirements

### Image Insertion System
- **Toolbar Button**: Prominent image button in editor toolbar
- **Drag & Drop**: Support for dragging images directly into editor
- **URL Input**: Text input for image URL insertion
- **File Upload**: Local file upload with preview
- **Image Validation**: File type and size validation

### Image Resize Capabilities
- **Interactive Handles**: Drag handles for resizing images
- **Aspect Ratio**: Maintain aspect ratio with shift key
- **Dimension Inputs**: Manual width/height input fields
- **Responsive Sizing**: Percentage and pixel-based sizing options
- **Preview Mode**: Real-time preview of resize changes

### Markdown Image Support
- **Markdown Syntax**: Support for `![alt](url)` syntax
- **Nested Text**: Text rendering within markdown image blocks
- **Inline Images**: Support for inline image placement
- **Block Images**: Support for block-level image placement
- **Caption Support**: Image captions and descriptions

### Image Management Features
- **Alt Text Editor**: Built-in alt text input and management
- **Image Library**: Organized collection of used images in R2 bucket
- **Image Storage**: Images stored in `assets/images` section of R2 bucket
- **Image Optimization**: Automatic sizing and format optimization
- **Image Metadata**: Track image usage and properties
- **Bulk Operations**: Manage multiple images simultaneously

## Implementation Details

### Image Toolbar Button
```tsx
// Image button in editor toolbar
<Tooltip>
  <TooltipTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowImageDialog(true)}
      className="h-8 w-8 p-0 hover:bg-teal-100"
      disabled={!editor.can().setImage()}
    >
      <Image className="w-4 h-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Insert Image</TooltipContent>
</Tooltip>

// Image button state management
const isImageActive = editor.isActive('image')
const canSetImage = editor.can().setImage()

// Conditional button styling
<Button
  variant={isImageActive ? "default" : "ghost"}
  size="sm"
  onClick={() => setShowImageDialog(true)}
  className={`h-8 w-8 p-0 ${isImageActive ? 'bg-teal-100 text-teal-900' : 'hover:bg-teal-100'}`}
>
  <Image className="w-4 h-4" />
</Button>
```

### Image Dialog Component
```tsx
// Image dialog interface
interface ImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editor: Editor
  initialUrl?: string
  initialAlt?: string
  initialWidth?: number
  initialHeight?: number
}

// Image dialog state
const [imageUrl, setImageUrl] = useState(initialUrl || '')
const [altText, setAltText] = useState(initialAlt || '')
const [width, setWidth] = useState(initialWidth || 400)
const [height, setHeight] = useState(initialHeight || 300)
const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
const [isValidUrl, setIsValidUrl] = useState(true)
const [isLoading, setIsLoading] = useState(false)

// Image dialog component
const ImageDialog = ({ open, onOpenChange, editor, initialUrl, initialAlt, initialWidth, initialHeight }: ImageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Add an image to your content with custom sizing and alt text.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Image Input */}
          <div className="space-y-4">
            {/* URL Input */}
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setIsValidUrl(validateImageUrl(e.target.value))
                }}
                placeholder="https://example.com/image.jpg"
                className={`${!isValidUrl ? 'border-red-500' : 'border-teal-200'} focus:border-teal-400`}
              />
              {!isValidUrl && (
                <p className="text-sm text-red-500 mt-1">
                  Please enter a valid image URL
                </p>
              )}
            </div>
            
            {/* File Upload */}
            <div>
              <Label htmlFor="fileUpload">Or Upload File</Label>
              <Input
                id="fileUpload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="border-teal-200 focus:border-teal-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports: JPG, PNG, GIF, WebP (Max: 5MB)
              </p>
            </div>
            
            {/* Alt Text Input */}
            <div>
              <Label htmlFor="altText">Alt Text</Label>
              <Textarea
                id="altText"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="border-teal-200 focus:border-teal-400"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Important for screen readers and SEO
              </p>
            </div>
          </div>
          
          {/* Right Column - Image Preview and Sizing */}
          <div className="space-y-4">
            {/* Image Preview */}
            {imageUrl && (
              <div className="border border-gray-200 rounded-lg p-4">
                <Label>Preview</Label>
                <div className="mt-2 relative">
                  <img
                    src={imageUrl}
                    alt={altText || 'Image preview'}
                    className="max-w-full h-auto rounded border"
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                      <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Size Controls */}
            <div className="space-y-3">
              <Label>Image Size</Label>
              
              {/* Aspect Ratio Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintainAspectRatio"
                  checked={maintainAspectRatio}
                  onCheckedChange={setMaintainAspectRatio}
                />
                <Label htmlFor="maintainAspectRatio">Maintain aspect ratio</Label>
              </div>
              
              {/* Width and Height Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => {
                      const newWidth = parseInt(e.target.value) || 0
                      setWidth(newWidth)
                      if (maintainAspectRatio && initialWidth && initialHeight) {
                        setHeight(Math.round((newWidth * initialHeight) / initialWidth))
                      }
                    }}
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => {
                      const newHeight = parseInt(e.target.value) || 0
                      setHeight(newHeight)
                      if (maintainAspectRatio && initialWidth && initialHeight) {
                        setWidth(Math.round((newHeight * initialWidth) / initialHeight))
                      }
                    }}
                    className="border-teal-200 focus:border-teal-400"
                  />
                </div>
              </div>
              
              {/* Responsive Options */}
              <div className="space-y-2">
                <Label>Responsive Options</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWidth(400)}
                    className="text-xs"
                  >
                    Small
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWidth(600)}
                    className="text-xs"
                  >
                    Medium
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWidth(800)}
                    className="text-xs"
                  >
                    Large
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWidth(100)}
                    className="text-xs"
                  >
                    100%
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInsertImage}
            disabled={!imageUrl || !isValidUrl || isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Image Insertion Logic
```tsx
// Handle image insertion
const handleInsertImage = () => {
  if (!imageUrl || !isValidUrl) return
  
  try {
    // Insert image into editor
    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl,
        alt: altText,
        width: width,
        height: height,
        title: altText
      })
      .run()
    
    // Close dialog and show success
    onOpenChange(false)
    showNotification('Image inserted successfully!', 'success')
    
  } catch (error) {
    logger.error('Error inserting image:', error)
    showNotification('Failed to insert image. Please try again.', 'error')
  }
}

// Handle file upload
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    setIsLoading(true)
    
    // Validate file type and size
    if (!validateImageFile(file)) {
      showNotification('Invalid file type or size', 'error')
      return
    }
    
    // Upload file to R2 bucket assets/images section
const uploadedUrl = await uploadImageFile(file, 'assets/images')
    
    // Set image URL and extract dimensions
    setImageUrl(uploadedUrl)
    
    // Get image dimensions
    const dimensions = await getImageDimensions(uploadedUrl)
    setWidth(dimensions.width)
    setHeight(dimensions.height)
    
    // Set initial dimensions for aspect ratio calculation
    setInitialDimensions(dimensions)
    
    showNotification('Image uploaded successfully!', 'success')
    
  } catch (error) {
    logger.error('Error uploading image:', error)
    showNotification('Failed to upload image', 'error')
  } finally {
    setIsLoading(false)
  }
}

// Image validation functions
const validateImageUrl = (url: string): boolean => {
  if (!url) return false
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize
}
```

### Image Extension Configuration
```tsx
// Enhanced image extension configuration
import Image from '@tiptap/extension-image'

const CustomImageExtension = Image.configure({
  inline: true,
  allowBase64: true,
  HTMLAttributes: {
    class: 'max-w-full h-auto rounded-lg shadow-sm border border-gray-200',
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 400,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: 300,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
      alt: {
        default: '',
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => {
          if (!attributes.alt) return {}
          return { alt: attributes.alt }
        },
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) return {}
          return { title: attributes.title }
        },
      },
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
      updateImage: (options) => ({ commands, state }) => {
        const { selection } = state
        const { $from } = selection
        
        if ($from.node().type.name === this.name) {
          return commands.updateAttributes(this.name, options)
        }
        
        return false
      },
    }
  },
})

// Add to editor extensions
const editor = useEditor({
  extensions: [
    StarterKit,
    // ... other extensions
    CustomImageExtension,
  ],
  // ... other config
})
```

### Image Resize Component
```tsx
// Image resize component
const ResizableImage = ({ src, alt, width, height, onResize }: ResizableImageProps) => {
  const [isResizing, setIsResizing] = useState(false)
  const [currentWidth, setCurrentWidth] = useState(width)
  const [currentHeight, setCurrentHeight] = useState(height)
  const [aspectRatio, setAspectRatio] = useState(width / height)
  
  const imageRef = useRef<HTMLImageElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', handleResizeEnd)
  }
  
  // Handle resize
  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !imageRef.current || !resizeRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const newWidth = e.clientX - rect.left
    const newHeight = newWidth / aspectRatio
    
    setCurrentWidth(Math.max(100, newWidth))
    setCurrentHeight(Math.max(75, newHeight))
  }
  
  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', handleResizeEnd)
    
    // Call resize callback
    onResize({
      width: Math.round(currentWidth),
      height: Math.round(currentHeight)
    })
  }
  
  return (
    <div className="relative inline-block group">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        width={currentWidth}
        height={currentHeight}
        className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
        draggable={false}
      />
      
      {/* Resize handles */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-teal-400 rounded-lg pointer-events-none">
        <div
          ref={resizeRef}
          className="absolute bottom-0 right-0 w-4 h-4 bg-teal-500 rounded-full cursor-se-resize pointer-events-auto"
          onMouseDown={handleResizeStart}
        />
      </div>
      
      {/* Size indicator */}
      {isResizing && (
        <div className="absolute top-0 left-0 bg-teal-600 text-white text-xs px-2 py-1 rounded">
          {Math.round(currentWidth)} × {Math.round(currentHeight)}
        </div>
      )}
    </div>
  )
}
```

### Markdown Image Support
```tsx
// Markdown image rendering with nested text
const MarkdownImageRenderer = ({ node, children }: MarkdownImageRendererProps) => {
  const { src, alt, title, width, height } = node.attrs
  
  return (
    <div className="my-4">
      <ResizableImage
        src={src}
        alt={alt}
        width={width || 400}
        height={height || 300}
        onResize={handleImageResize}
      />
      
      {/* Nested text support */}
      {children && (
        <div className="mt-2 prose prose-sm text-gray-600">
          {children}
        </div>
      )}
      
      {/* Caption */}
      {title && (
        <p className="mt-2 text-sm text-gray-500 text-center italic">
          {title}
        </p>
      )}
    </div>
  )
}

// Markdown image syntax support
const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g

const parseMarkdownImages = (markdown: string): string => {
  return markdown.replace(markdownImageRegex, (match, alt, src, title) => {
    const imageNode = {
      type: 'image',
      attrs: {
        src,
        alt: alt || '',
        title: title || '',
        width: 400,
        height: 300
      }
    }
    
    return JSON.stringify(imageNode)
  })
}
```

### Drag and Drop Support
```tsx
// Drag and drop image handling
const handleDrop = (event: React.DragEvent) => {
  event.preventDefault()
  
  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length > 0) {
    handleImageFiles(imageFiles)
  }
}

const handleDragOver = (event: React.DragEvent) => {
  event.preventDefault()
  event.currentTarget.classList.add('border-teal-400', 'bg-teal-50')
}

const handleDragLeave = (event: React.DragEvent) => {
  event.currentTarget.classList.remove('border-teal-400', 'bg-teal-50')
}

// Editor drop zone
<div
  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors"
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
>
  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <p className="text-gray-600 mb-2">
    Drop images here to insert them
  </p>
  <p className="text-sm text-gray-500">
    Supports JPG, PNG, GIF, WebP (Max: 5MB)
  </p>
</div>
```

## User Experience Improvements

### Image Insertion Workflow
- **Multiple Input Methods**: URL input, file upload, and drag-and-drop
- **Real-time Preview**: See image before insertion
- **Smart Defaults**: Auto-populate dimensions and alt text
- **Validation Feedback**: Immediate feedback on file types and sizes

### Image Management
- **Interactive Resizing**: Drag handles for easy resizing
- **Aspect Ratio Control**: Maintain proportions or free resize
- **Responsive Options**: Quick size presets and percentage sizing
- **Alt Text Management**: Built-in accessibility features

### Markdown Integration
- **Full Markdown Support**: Complete markdown image syntax
- **Nested Text Rendering**: Text content within image blocks
- **Caption Support**: Image descriptions and titles
- **Inline and Block**: Flexible image placement options

## Technical Considerations

### Storage & Infrastructure
- **R2 Bucket Storage**: Images stored in `assets/images` section of Cloudflare R2 bucket
- **Organized Structure**: Maintain folder hierarchy for different content types
- **CDN Integration**: Leverage R2's global CDN for fast image delivery
- **Backup & Versioning**: R2 bucket provides reliable storage and versioning

### Performance
- **Lazy Loading**: Load images only when needed
- **Image Optimization**: Automatic format and size optimization
- **Caching**: Cache image metadata and dimensions
- **Memory Management**: Clean up image resources

### Accessibility
- **Alt Text**: Required alt text input and validation
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard support for image operations
- **Focus Management**: Proper focus handling in image dialogs

### Security
- **File Validation**: Strict file type and size validation
- **URL Sanitization**: Sanitize image URLs to prevent XSS
- **Upload Limits**: Enforce file size and type restrictions
- **External Image Handling**: Proper handling of external image sources

## Migration Strategy

### Phase 1: Basic Image Functionality
- Implement image insertion button and dialog
- Add URL-based image insertion
- Create basic image rendering
- Integrate with R2 bucket `assets/images` storage
- Test image insertion and storage

### Phase 2: Resize and Management
- Add interactive resize capabilities
- Implement dimension controls
- Add alt text management
- Improve user experience

### Phase 3: Advanced Features
- Add drag-and-drop support
- Implement file upload functionality to R2 bucket
- Add markdown image syntax
- Performance optimization with R2 CDN integration

### Phase 4: Polish & Enhancement
- Add image library features
- Implement bulk operations
- Add accessibility features
- User testing and refinement

## Acceptance Criteria
- [ ] Image insertion button is available in editor toolbar
- [ ] Image dialog allows URL input and file upload
- [ ] Images can be resized with interactive handles
- [ ] Alt text can be added and managed
- [ ] Drag-and-drop image insertion works
- [ ] Markdown image syntax is supported
- [ ] Nested text rendering works within image blocks
- [ ] Image dimensions can be manually adjusted
- [ ] Aspect ratio can be maintained or overridden
- [ ] Images are properly stored in R2 bucket `assets/images` section
- [ ] Performance is not impacted by image functionality
- [ ] R2 CDN integration provides fast image delivery

## Dependencies
- **TipTap Image Extension**: Core image functionality
- **UI Components**: Dialog, input, button, and resize components
- **File Upload**: Image file handling and validation with R2 integration
- **Image Processing**: Dimension extraction and optimization
- **Markdown Parser**: Image syntax parsing and rendering
- **R2 Storage**: Cloudflare R2 bucket for image storage in `assets/images` section

## Priority
**Medium** - Enhances content creation capabilities and user experience

---
*Labels: enhancement, editor-features, image-management, markdown-support*
*Component: ContentCreationStudio, ImageDialog, ResizableImage, MarkdownImageRenderer*
*Type: Feature Enhancement*
