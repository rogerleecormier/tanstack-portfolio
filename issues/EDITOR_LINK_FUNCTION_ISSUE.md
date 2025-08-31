# 🔗 Editor Link Function: Add Link Insertion and Management to Content Creation Studio

## Summary
Add comprehensive link functionality to the Content Creation Studio editor, including link insertion, editing, validation, and management. Implement both inline link creation and link editing capabilities with support for external URLs, internal references, and link styling. Provide a user-friendly link dialog for URL input and link text customization.

## Current Behavior
- **No Link Function**: Editor lacks built-in link insertion functionality
- **Manual HTML**: Users must manually write HTML anchor tags
- **No Link Management**: No way to edit, update, or remove existing links
- **No Validation**: No URL validation or link integrity checking
- **Limited Styling**: Links don't inherit consistent styling from the editor theme

## Expected Behavior
- **Link Insertion**: Easy-to-use link insertion button in toolbar
- **Link Dialog**: User-friendly dialog for URL and link text input
- **Link Editing**: Ability to edit existing links inline
- **Link Validation**: URL validation and link integrity checking
- **Consistent Styling**: Links follow editor theme and styling guidelines
- **Link Management**: Tools to manage and organize links within content

## Technical Requirements

### Link Insertion System
- **Toolbar Button**: Prominent link button in editor toolbar
- **Link Dialog**: Modal dialog for link creation and editing
- **URL Input**: Text input for URL with validation
- **Link Text**: Customizable link display text
- **Target Options**: Support for internal/external links and new tab opening

### Link Management Features
- **Inline Editing**: Click existing links to edit them
- **Link Removal**: Easy deletion of unwanted links
- **Link Validation**: Check link validity and accessibility
- **Link Styling**: Consistent visual appearance across all links
- **Link Tracking**: Monitor link usage and status

### Link Types Support
- **External URLs**: Full URL support with protocol validation
- **Internal References**: Anchor links within the same document
- **Relative Paths**: Support for relative file and page references
- **Email Links**: Mailto link support for contact information
- **Phone Links**: Tel link support for phone numbers

## Implementation Details

### Link Toolbar Button
```tsx
// Link button in editor toolbar
<Tooltip>
  <TooltipTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowLinkDialog(true)}
      className="h-8 w-8 p-0 hover:bg-teal-100"
      disabled={!editor.can().setLink()}
    >
      <Link className="w-4 h-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Insert Link</TooltipContent>
</Tooltip>

// Link button state management
const isLinkActive = editor.isActive('link')
const canSetLink = editor.can().setLink()

// Conditional button styling
<Button
  variant={isLinkActive ? "default" : "ghost"}
  size="sm"
  onClick={() => setShowLinkDialog(true)}
  className={`h-8 w-8 p-0 ${isLinkActive ? 'bg-teal-100 text-teal-900' : 'hover:bg-teal-100'}`}
>
  <Link className="w-4 h-4" />
</Button>
```

### Link Dialog Component
```tsx
// Link dialog interface
interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editor: Editor
  initialUrl?: string
  initialText?: string
}

// Link dialog state
const [url, setUrl] = useState(initialUrl || '')
const [linkText, setLinkText] = useState(initialText || '')
const [openInNewTab, setOpenInNewTab] = useState(false)
const [isValidUrl, setIsValidUrl] = useState(true)

// Link dialog component
const LinkDialog = ({ open, onOpenChange, editor, initialUrl, initialText }: LinkDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
          <DialogDescription>
            Add a link to your content with custom text and options.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setIsValidUrl(validateUrl(e.target.value))
              }}
              placeholder="https://example.com or #section-id"
              className={`${!isValidUrl ? 'border-red-500' : 'border-teal-200'} focus:border-teal-400`}
            />
            {!isValidUrl && (
              <p className="text-sm text-red-500 mt-1">
                Please enter a valid URL or internal reference
              </p>
            )}
          </div>
          
          {/* Link Text Input */}
          <div>
            <Label htmlFor="linkText">Link Text</Label>
            <Input
              id="linkText"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Display text for the link"
              className="border-teal-200 focus:border-teal-400"
            />
          </div>
          
          {/* Link Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newTab"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
            />
            <Label htmlFor="newTab">Open in new tab</Label>
          </div>
          
          {/* Link Preview */}
          {url && linkText && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Preview:</p>
              <a 
                href={url} 
                target={openInNewTab ? "_blank" : "_self"}
                rel={openInNewTab ? "noopener noreferrer" : ""}
                className="text-teal-600 hover:text-teal-800 underline"
              >
                {linkText}
              </a>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInsertLink}
            disabled={!url || !linkText || !isValidUrl}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Insert Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Link Insertion Logic
```tsx
// Handle link insertion
const handleInsertLink = () => {
  if (!url || !linkText || !isValidUrl) return
  
  try {
    // Insert or update link in editor
    if (editor.isActive('link')) {
      // Update existing link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ 
          href: url,
          target: openInNewTab ? '_blank' : undefined,
          rel: openInNewTab ? 'noopener noreferrer' : undefined
        })
        .run()
    } else {
      // Insert new link
      editor
        .chain()
        .focus()
        .setLink({ 
          href: url,
          target: openInNewTab ? '_blank' : undefined,
          rel: openInNewTab ? 'noopener noreferrer' : undefined
        })
        .run()
    }
    
    // Close dialog and show success
    onOpenChange(false)
    showNotification('Link inserted successfully!', 'success')
    
  } catch (error) {
    logger.error('Error inserting link:', error)
    showNotification('Failed to insert link. Please try again.', 'error')
  }
}

// URL validation function
const validateUrl = (url: string): boolean => {
  if (!url) return false
  
  // Check for internal references (anchor links)
  if (url.startsWith('#')) return true
  
  // Check for email links
  if (url.startsWith('mailto:')) return true
  
  // Check for phone links
  if (url.startsWith('tel:')) return true
  
  // Check for valid URLs
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
```

### Link Extension Configuration
```tsx
// Enhanced link extension configuration
import Link from '@tiptap/extension-link'

const CustomLinkExtension = Link.configure({
  openOnClick: true,
  linkOnPaste: true,
  autolink: true,
  protocols: ['http', 'https', 'mailto', 'tel'],
  HTMLAttributes: {
    class: 'text-teal-600 hover:text-teal-800 underline decoration-2 underline-offset-2 transition-colors duration-200',
    rel: 'noopener noreferrer',
  },
  validate: (href) => {
    // Custom validation logic
    return validateUrl(href)
  },
  onUpdate: ({ attrs }) => {
    // Handle link updates
    logger.info('Link updated:', attrs)
  },
})

// Add to editor extensions
const editor = useEditor({
  extensions: [
    StarterKit,
    // ... other extensions
    CustomLinkExtension,
  ],
  // ... other config
})
```

### Link Editing and Management
```tsx
// Inline link editing
const handleLinkClick = (event: React.MouseEvent) => {
  const target = event.target as HTMLElement
  
  if (target.tagName === 'A') {
    event.preventDefault()
    
    // Extract link information
    const href = target.getAttribute('href') || ''
    const text = target.textContent || ''
    const targetBlank = target.getAttribute('target') === '_blank'
    
    // Open link dialog with existing data
    setInitialLinkData({ url: href, text, openInNewTab: targetBlank })
    setShowLinkDialog(true)
  }
}

// Link removal
const removeLink = () => {
  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .unsetLink()
    .run()
    
  showNotification('Link removed successfully!', 'success')
}

// Link context menu
const LinkContextMenu = ({ linkElement, onEdit, onRemove }: LinkContextMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
        <MoreHorizontal className="w-3 h-3" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={onEdit}>
        <Edit className="w-4 h-4 mr-2" />
        Edit Link
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onRemove} className="text-red-600">
        <Trash2 className="w-4 h-4 mr-2" />
        Remove Link
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
```

## User Experience Improvements

### Link Creation Workflow
- **One-Click Insertion**: Single click to open link dialog
- **Smart Defaults**: Auto-populate link text from selected content
- **Real-time Preview**: See link appearance before insertion
- **Validation Feedback**: Immediate feedback on URL validity

### Link Management
- **Inline Editing**: Click links to edit them directly
- **Context Menus**: Right-click for link options
- **Bulk Operations**: Select multiple links for batch operations
- **Link History**: Track recently used URLs

### Accessibility Features
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard support for link operations
- **Focus Management**: Proper focus handling in link dialogs
- **Link Descriptions**: Optional link descriptions for better accessibility

## Technical Considerations

### Performance
- **Lazy Loading**: Load link dialog only when needed
- **Debounced Validation**: Debounce URL validation for better performance
- **Link Caching**: Cache recently used URLs for faster access
- **Memory Management**: Clean up link-related resources

### Security
- **URL Sanitization**: Sanitize URLs to prevent XSS attacks
- **Protocol Validation**: Restrict allowed URL protocols
- **Link Validation**: Validate links before insertion
- **External Link Handling**: Proper handling of external links

### Data Persistence
- **Link Storage**: Store link data in content structure
- **Link Metadata**: Track link creation and modification dates
- **Link Analytics**: Monitor link usage and performance
- **Backup & Restore**: Preserve links during content operations

## Migration Strategy

### Phase 1: Basic Link Functionality
- Implement link insertion button
- Create basic link dialog
- Add URL validation
- Test link creation

### Phase 2: Enhanced Link Features
- Add link editing capabilities
- Implement link removal
- Add link styling
- Improve user experience

### Phase 3: Advanced Link Management
- Add link context menus
- Implement bulk operations
- Add link analytics
- Performance optimization

### Phase 4: Polish & Enhancement
- Add accessibility features
- Implement link templates
- Add link suggestions
- User testing and refinement

## Acceptance Criteria
- [ ] Link insertion button is available in editor toolbar
- [ ] Link dialog allows URL and text input with validation
- [ ] Links can be inserted into editor content successfully
- [ ] Existing links can be edited inline
- [ ] Links can be removed from content
- [ ] URL validation works correctly for various link types
- [ ] Links follow consistent styling guidelines
- [ ] Link dialog is accessible via keyboard navigation
- [ ] Link operations work in both HTML and Markdown modes
- [ ] Performance is not impacted by link functionality

## Dependencies
- **TipTap Link Extension**: Core link functionality
- **UI Components**: Dialog, input, and button components
- **Validation Utilities**: URL validation and sanitization
- **State Management**: React state for link dialog and operations
- **Styling System**: Consistent link appearance and theme integration

## Priority
**Medium** - Enhances content creation capabilities and user experience

---
*Labels: enhancement, editor-features, link-management*
*Component: ContentCreationStudio, LinkDialog, LinkExtension*
*Type: Feature Enhancement*
