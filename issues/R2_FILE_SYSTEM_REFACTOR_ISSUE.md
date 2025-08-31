# 🔄 R2 File System Refactor: Direct Bucket Integration for Content Creation Studio

## Summary
Refactor the Content Creation Studio's file system to work directly with R2 bucket storage instead of local file operations. This includes implementing file browsing within R2 buckets, opening files with automatic MD-to-HTML conversion, and saving files directly to R2 with frontmatter integration. The system should support content type-based directory organization and intelligent file naming.

## Current Behavior
- **File Operations**: Limited to local file system operations
- **Storage**: No direct R2 bucket integration
- **File Format**: Manual handling of markdown and HTML conversion
- **Frontmatter**: Separate management without automatic file integration
- **Content Organization**: No content type-based directory structure

## Expected Behavior
- **R2 Integration**: Direct file browsing, opening, and saving to R2 buckets
- **Automatic Conversion**: MD-to-HTML rendering when opening files
- **Smart Loading**: Populate HTML editor, markdown editor, live preview, and frontmatter
- **Intelligent Saving**: Auto-save with same filename unless specified otherwise
- **Content Type Management**: Automatic directory organization by content type

## Technical Requirements

### File Browsing & Opening
- **R2 Browser**: Implement file browser for R2 bucket navigation
- **File Selection**: Browse and select files from bucket directories
- **Content Detection**: Automatically detect content type from file path
- **Format Conversion**: Convert markdown to HTML for editor population
- **Multi-Editor Sync**: Load content into all editor modes simultaneously

### File Saving & Management
- **Direct R2 Save**: Save files directly to R2 bucket
- **Frontmatter Integration**: Automatically prepend frontmatter to markdown files
- **Overwrite Protection**: Allow overwriting existing files with confirmation
- **Smart Naming**: Auto-save with original filename unless new name specified
- **Content Type Directories**: Organize files by type (blog, portfolio, page, project)

### Content Type Management
- **Type Selector**: Dropdown for content type selection
- **Directory Mapping**: Automatic base directory assignment by type
- **Path Generation**: Generate appropriate save paths based on content type
- **Validation**: Ensure content type matches file location

## Implementation Details

### R2 Integration Components
```tsx
// New R2 file service
interface R2FileService {
  browseFiles(path: string): Promise<R2FileInfo[]>
  openFile(path: string): Promise<FileContent>
  saveFile(path: string, content: string, frontmatter: FrontmatterData): Promise<void>
  createDirectory(path: string): Promise<void>
  deleteFile(path: string): Promise<void>
}

// File content structure
interface FileContent {
  markdown: string
  html: string
  frontmatter: FrontmatterData
  metadata: {
    path: string
    contentType: string
    lastModified: Date
    size: number
  }
}
```

### Content Type Directory Structure
```
r2-bucket/
├── blog/
│   ├── 2024/
│   └── drafts/
├── portfolio/
│   ├── projects/
│   └── case-studies/
├── pages/
│   ├── about/
│   └── contact/
└── projects/
    ├── active/
    └── archived/
```

### File Opening Workflow
1. **Browse R2**: Navigate bucket directories
2. **Select File**: Choose markdown file to open
3. **Detect Type**: Auto-identify content type from path
4. **Load Content**: Fetch file content from R2
5. **Parse Frontmatter**: Extract and populate frontmatter
6. **Convert MD→HTML**: Render markdown to HTML
7. **Populate Editors**: Load content into all editor modes
8. **Set Content Type**: Update content type selector

### File Saving Workflow
1. **Validate Content**: Ensure all required fields are present
2. **Generate Frontmatter**: Create frontmatter string from data
3. **Assemble Markdown**: Combine frontmatter + content
4. **Determine Path**: Use content type + original path or new path
5. **Save to R2**: Upload file directly to bucket
6. **Update Metadata**: Refresh file information
7. **Confirm Success**: Show save confirmation

## User Experience Improvements

### File Browser Interface
- **Tree View**: Hierarchical directory navigation
- **Search**: Quick file search within buckets
- **Recent Files**: Quick access to recently opened files
- **Favorites**: Bookmark frequently used directories
- **File Preview**: Quick preview of file contents before opening

### Content Type Selector
- **Smart Detection**: Auto-detect type from file path
- **Manual Override**: Allow manual type selection
- **Directory Preview**: Show where file will be saved
- **Validation**: Ensure type matches save location

### Save Dialog Enhancements
- **Filename Suggestion**: Auto-suggest based on title/frontmatter
- **Path Preview**: Show exact save location
- **Overwrite Warning**: Clear indication when overwriting
- **Save Options**: Save as new file vs. overwrite existing

## Technical Considerations

### Performance
- **Lazy Loading**: Load file contents on demand
- **Caching**: Cache frequently accessed files
- **Streaming**: Stream large files for better performance
- **Background Sync**: Save operations in background

### Error Handling
- **Network Issues**: Handle R2 connection problems
- **File Conflicts**: Manage concurrent file access
- **Validation Errors**: Clear error messages for invalid content
- **Save Failures**: Retry mechanisms and user feedback

### Security
- **Access Control**: Validate user permissions for R2 operations
- **File Validation**: Sanitize file contents before saving
- **Path Security**: Prevent directory traversal attacks
- **Content Verification**: Ensure file integrity

## Migration Strategy

### Phase 1: R2 Integration Foundation
- Implement R2 file service
- Create file browser component
- Basic open/save functionality

### Phase 2: Content Type Management
- Add content type selector
- Implement directory organization
- Smart path generation

### Phase 3: Enhanced Workflows
- Automatic MD→HTML conversion
- Multi-editor synchronization
- Advanced save options

### Phase 4: Polish & Optimization
- Performance improvements
- Error handling refinement
- User experience enhancements

## Acceptance Criteria
- [ ] File browser can navigate R2 bucket directories
- [ ] Files can be opened directly from R2 with automatic conversion
- [ ] Content loads into all editor modes (HTML, Markdown, Preview, Frontmatter)
- [ ] Files save directly to R2 with frontmatter integration
- [ ] Content type selector automatically determines save directories
- [ ] Overwrite protection works with clear user confirmation
- [ ] Auto-save uses original filename unless new name specified
- [ ] Performance is acceptable for files up to 10MB
- [ ] Error handling provides clear user feedback
- [ ] Migration from local file system is smooth

## Dependencies
- **R2 SDK**: Cloudflare R2 client integration
- **File Processing**: Enhanced markdown/HTML conversion utilities
- **State Management**: Improved file state handling
- **UI Components**: New file browser and content type interfaces

## Priority
**High** - Core functionality improvement that enables cloud-based content management

---
*Labels: enhancement, refactor, r2-integration, file-system*
*Component: ContentCreationStudio, FileSystem, R2Integration*
*Type: System Refactor*
