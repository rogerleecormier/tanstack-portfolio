# Content Creation Studio

A comprehensive, modern content creation platform that provides dual HTML/Markdown editing capabilities with advanced features for creating rich, interactive content. Built with TipTap editor, integrated with Cloudflare R2 storage, and powered by AI-driven frontmatter generation.

## 🚀 Features

### Dual Editing Modes

- **TipTap HTML Editor**: Rich text editor with WYSIWYG interface using TipTap framework
- **Markdown Editor**: Pure markdown syntax editing with real-time conversion
- **Seamless Conversion**: Automatic bidirectional conversion between HTML and Markdown
- **Live Preview**: Real-time preview of content with proper sanitization
- **Debounced Updates**: Optimized performance with 300ms debouncing

### Advanced Content Features

- **Rich Text Formatting**: Bold, italic, strikethrough, headings (H1-H3), lists, blockquotes
- **Code Blocks**: Syntax-highlighted code blocks with language support
- **Links**: Interactive link management with URL validation
- **Images**: Image insertion and management with URL support
- **Horizontal Rules**: Visual content separators
- **Table Support**: Interactive tables with resizable columns and rich cell content

### AI-Powered Frontmatter Generation

- **Smart AI Models**: Uses Cloudflare AI with multiple model selection (8B, 70B, 405B)
- **Content Complexity Analysis**: Automatically selects optimal AI model based on content complexity
- **Intelligent Caching**: KV-based caching for similar content to improve performance
- **Fallback Generation**: Heuristic-based frontmatter generation when AI is unavailable
- **Varied Output**: Multiple generation attempts with different personas and styles
- **Content Analysis**: Analyzes length, structure, technical terms, code blocks, links, and images

### R2 Bucket Integration

- **Cloudflare R2 Storage**: Direct integration with R2 bucket for content persistence
- **Content Browser**: File browser with search, navigation, and management capabilities
- **Soft Delete**: Files moved to trash instead of permanent deletion
- **ETag Support**: Optimistic concurrency control for collaborative editing
- **CORS Proxy**: R2 content proxy worker for seamless content delivery
- **Directory Structure**: Organized content in blog/, portfolio/, and projects/ directories

### Cache Management

- **Smart Cache Rebuilds**: Automatic cache rebuilding for search and navigation
- **Production KV Integration**: Uses production Cloudflare KV for cache storage
- **Manual Triggers**: Manual cache rebuild options with status monitoring
- **Enhanced Status**: Real-time cache status with item counts and last updated times
- **Multi-Environment**: Works across localhost, preview, and production environments

### Modern UI/UX

- **Brand-Consistent Design**: Teal-blue color scheme matching your site's aesthetic
- **Responsive Layout**: Adaptive layout that works on all device sizes
- **Keyboard Shortcuts**: Ctrl/Cmd+S for save, Escape for fullscreen exit
- **Tooltips**: Comprehensive guidance for all features and actions
- **Dark Mode Support**: Automatic dark mode detection and theming
- **Loading States**: Skeleton loading and progress indicators
- **Conflict Resolution**: ETag-based conflict detection and resolution options

## 🛠️ Technical Architecture

### Core Components

- **CreationStudioPage**: Main page component orchestrating the entire studio
- **MarkdownHtmlEditor**: TipTap-based editor with HTML/Markdown conversion
- **TipTapEditor**: Core TipTap editor implementation with toolbar
- **FrontMatterPanel**: Frontmatter display and management panel
- **FrontMatterModal**: Modal for editing frontmatter with AI generation
- **R2Browser**: File browser for R2 bucket content management
- **SaveAsModal**: Modal for saving content with directory selection

### Extensions & Integrations

- **TipTap Extensions**: StarterKit, Table, TableRow, TableHeader, TableCell, Image
- **Shadcn UI**: Consistent, accessible UI components throughout
- **Unified Markdown Pipeline**: remark-parse, remark-gfm, rehype-raw, rehype-sanitize
- **Front-matter Package**: YAML frontmatter parsing and serialization
- **Cloudflare Workers**: AI generation, R2 proxy, cache management

### Data Flow

1. **Content Input**: User creates content using TipTap editor
2. **Real-time Conversion**: HTML content automatically converts to Markdown
3. **Debounced Updates**: Changes are debounced (300ms) to prevent excessive updates
4. **R2 Storage**: Content is persisted to Cloudflare R2 bucket with ETag support
5. **Cache Management**: Content changes trigger smart cache rebuilds
6. **AI Frontmatter**: Content analysis triggers AI-powered frontmatter generation
7. **Conflict Resolution**: ETag-based optimistic concurrency control

### Cloudflare Integration

- **R2 Bucket**: `tanstack-portfolio-r2` for content storage
- **R2 Proxy Worker**: `r2-content-proxy.rcormier.workers.dev` for CORS handling
- **AI Generator Worker**: `ai-generator.rcormier.workers.dev` for frontmatter generation
- **Cache Rebuild Worker**: `cache-rebuild-worker.rcormier.workers.dev` for cache management
- **KV Cache Worker**: `kv-cache-get.rcormier.workers.dev` for cache retrieval

## 📖 Usage Guide

### Getting Started

The Content Creation Studio is accessed through the `/creation-studio` route and provides a complete content management interface.

### Main Interface

The studio is organized into three main sections:

1. **Left Panel**: Content browser and frontmatter management
2. **Right Panel**: Main editor with TipTap interface
3. **Header**: File operations, save controls, and cache management

### Content Types

The studio supports three main content types organized in R2 bucket directories:

#### Blog Content (`blog/`)

- **Fields**: Title, description, author, tags, date, draft status
- **Features**: SEO optimization, reading time calculation, publication scheduling
- **AI Generation**: Optimized for blog post metadata and engagement

#### Portfolio Content (`portfolio/`)

- **Fields**: Title, description, author, tags, date, layout, draft status
- **Features**: Professional presentation, skill demonstration
- **AI Generation**: Focused on professional achievements and capabilities

#### Project Content (`projects/`)

- **Fields**: Title, description, author, tags, date, status, technologies
- **Features**: Project tracking, technology stack documentation
- **AI Generation**: Emphasizes technical details and project outcomes

### Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save current document
- **Escape**: Exit fullscreen mode
- **Tab**: Navigate through form elements
- **Enter**: Add new tags in frontmatter modal

### File Operations

1. **New Document**: Click the "+" button to start a new document
2. **Open File**: Click on any file in the content browser
3. **Save Document**: Use Ctrl/Cmd+S or click the save button
4. **Save As**: Click the save icon to save with a new name/location
5. **Download**: Click the download button to save locally
6. **Delete**: Click the trash button to move to trash

### Content Editing

1. **Rich Text Editing**: Use the TipTap toolbar for formatting
2. **Table Creation**: Click the table button to insert a 3x3 table
3. **Link Management**: Click the link button and enter URL
4. **Image Insertion**: Click the image button and enter image URL
5. **Code Blocks**: Click the code button for syntax-highlighted code
6. **Lists**: Use bullet list or ordered list buttons

### Frontmatter Management

1. **View Frontmatter**: Frontmatter is displayed in the left panel
2. **Edit Frontmatter**: Click the "Edit" button to open the modal
3. **AI Generation**: Click "Generate with AI" for automatic frontmatter
4. **Manual Editing**: Modify title, description, tags, date, and author
5. **Tag Management**: Add/remove tags with the tag input field
6. **Draft Toggle**: Check/uncheck the draft status

### Cache Management

1. **Auto Rebuild**: Check "Rebuild Cache on Save" for automatic updates
2. **Manual Rebuild**: Click the refresh button for immediate cache update
3. **Cache Status**: View current cache status and item counts
4. **Smart Triggers**: Cache rebuilds automatically for blog/portfolio content

## 🔧 Configuration

### Environment Variables

The Content Creation Studio requires several environment variables for full functionality:

```bash
# R2 Proxy Worker URL
VITE_R2_PROXY_BASE=https://r2-content-proxy.rcormier.workers.dev

# AI Generator Worker URL
VITE_AI_WORKER_URL=https://ai-generator.rcormier.workers.dev

# Cache Rebuild API Key (optional)
VITE_REBUILD_API_KEY=your_api_key_here
```

### R2 Bucket Configuration

The studio integrates with Cloudflare R2 bucket with the following structure:

```
tanstack-portfolio-r2/
├── blog/           # Blog posts
├── portfolio/      # Portfolio items
├── projects/       # Project documentation
└── trash/          # Soft-deleted files
```

### AI Model Configuration

The AI frontmatter generator uses three Cloudflare AI models:

- **Fast Model**: `@cf/meta/llama-3.1-8b-instruct` (simple content)
- **Balanced Model**: `@cf/meta/llama-3.1-70b-instruct` (medium complexity)
- **Advanced Model**: `@cf/meta/llama-3.1-405b-instruct` (complex content)

### Styling

The component uses your existing design system:

- **Colors**: Teal-blue color scheme from your CSS variables
- **Components**: Shadcn UI components for consistency
- **Typography**: Tailwind Typography plugin for content styling
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Automatic dark mode detection and theming

## 📁 File Structure

```
src/
├── pages/
│   └── CreationStudioPage.tsx         # Main studio page component
├── components/
│   ├── MarkdownHtmlEditor/
│   │   └── TipTapEditor.tsx          # Core TipTap editor implementation
│   ├── FrontMatter/
│   │   ├── FrontMatterPanel.tsx      # Frontmatter display panel
│   │   └── FrontMatterModal.tsx      # Frontmatter editing modal
│   ├── R2/
│   │   └── R2Browser.tsx             # R2 bucket file browser
│   ├── SaveAsModal.tsx               # Save as modal component
│   └── ui/                           # Shadcn UI components
├── lib/
│   ├── api.ts                        # API client for R2 and workers
│   ├── markdown.ts                   # Markdown processing utilities
│   └── htmlToMarkdown.ts             # HTML to Markdown conversion
├── utils/
│   └── cacheRebuildService.ts        # Cache management utilities
└── workers/
    ├── ai-generator.ts               # AI frontmatter generation worker
    ├── r2-content-proxy.ts           # R2 content proxy worker
    └── cache-rebuild-worker.ts       # Cache rebuild worker
```

## 🚀 Key Features

### AI-Powered Frontmatter Generation

The studio includes a sophisticated AI system for generating frontmatter:

- **Smart Model Selection**: Automatically chooses the best AI model based on content complexity
- **Content Analysis**: Analyzes length, structure, technical terms, code blocks, links, and images
- **Multiple Personas**: Uses different writing styles and approaches for varied output
- **Intelligent Caching**: Caches similar content to improve performance
- **Fallback Generation**: Heuristic-based generation when AI is unavailable

### R2 Bucket Integration

Seamless integration with Cloudflare R2 for content storage:

- **Direct Storage**: Content is stored directly in R2 bucket
- **CORS Handling**: R2 proxy worker handles CORS issues
- **File Management**: Browse, search, and manage files through the interface
- **Soft Delete**: Files are moved to trash instead of permanent deletion
- **ETag Support**: Optimistic concurrency control for collaborative editing

### Advanced Cache Management

Intelligent cache rebuilding system:

- **Smart Triggers**: Automatically rebuilds cache for important content changes
- **Production KV**: Uses production Cloudflare KV for cache storage
- **Status Monitoring**: Real-time cache status and statistics
- **Multi-Environment**: Works across localhost, preview, and production
- **Manual Controls**: Manual cache rebuild options with progress tracking

### Modern Editor Experience

Built with TipTap for a modern editing experience:

- **Rich Text Editing**: Full WYSIWYG editing with toolbar
- **Real-time Conversion**: Automatic HTML to Markdown conversion
- **Debounced Updates**: Optimized performance with 300ms debouncing
- **Keyboard Shortcuts**: Standard shortcuts for save, fullscreen, etc.
- **Responsive Design**: Works on all device sizes

## 🎯 Best Practices

### Content Creation

- **Use Rich Text Editor**: Leverage the TipTap editor for visual editing
- **AI Frontmatter**: Use AI generation for consistent, optimized metadata
- **Organize Content**: Use appropriate directories (blog/, portfolio/, projects/)
- **Draft Status**: Use draft status for work-in-progress content
- **Regular Saves**: Save frequently to avoid data loss

### Performance

- **Debounced Updates**: The editor uses 300ms debouncing for optimal performance
- **Cache Management**: Enable auto-rebuild for important content changes
- **Image Optimization**: Optimize images before insertion
- **Content Size**: Keep individual documents reasonable in size

### AI Frontmatter Generation

- **Content Quality**: Write clear, descriptive content for better AI analysis
- **Review Generated Content**: Always review and edit AI-generated frontmatter
- **Tag Management**: Use relevant, descriptive tags for better categorization
- **Consistent Naming**: Use consistent naming conventions for better organization

### R2 Storage

- **File Organization**: Use clear, descriptive filenames
- **Directory Structure**: Follow the established directory structure
- **Soft Delete**: Use soft delete to recover accidentally deleted files
- **ETag Management**: Be aware of ETag conflicts when editing collaboratively

## 🐛 Troubleshooting

### Common Issues

#### Content Not Saving

- Check R2 proxy worker connectivity
- Verify ETag conflicts and resolve if needed
- Check browser console for API errors
- Ensure proper authentication if required

#### AI Frontmatter Generation Failing

- Check AI worker URL configuration
- Verify Cloudflare AI binding is available
- Check content complexity and try simpler content
- Review browser console for AI worker errors

#### R2 Browser Not Loading

- Verify R2 proxy worker is running
- Check CORS configuration
- Ensure proper bucket permissions
- Check network connectivity

#### Cache Rebuild Issues

- Verify cache rebuild worker is accessible
- Check KV permissions and configuration
- Review worker logs for errors
- Try manual cache rebuild

### Debug Mode

Enable debug logging by checking browser console for detailed error messages and API responses.

### Support

For issues and questions:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test with minimal content to isolate issues
4. Check Cloudflare worker logs for backend issues
5. Verify R2 bucket permissions and configuration

## 📚 Examples

### Creating a Blog Post

1. **Navigate to Content Creation Studio**: Go to `/creation-studio`
2. **Start New Document**: Click the "+" button to create a new document
3. **Choose Directory**: Select `blog/` directory when saving
4. **Write Content**: Use the TipTap editor to write your blog post
5. **Generate Frontmatter**: Click "Edit" in the frontmatter panel, then "Generate with AI"
6. **Review and Edit**: Review the AI-generated frontmatter and make adjustments
7. **Save Document**: Use Ctrl/Cmd+S or click the save button
8. **Enable Cache Rebuild**: Check "Rebuild Cache on Save" for automatic updates

### Creating a Portfolio Item

1. **Start New Document**: Click the "+" button for a new document
2. **Choose Directory**: Select `portfolio/` directory when saving
3. **Write Content**: Describe your project, achievements, or skills
4. **Use Rich Formatting**: Add headings, lists, and links to showcase your work
5. **Generate Frontmatter**: Use AI generation for professional metadata
6. **Add Tags**: Include relevant tags for categorization
7. **Set Draft Status**: Use draft status for work-in-progress items
8. **Save and Publish**: Save when ready to publish

### Managing Content

1. **Browse Files**: Use the content browser to navigate your files
2. **Search Content**: Use the search bar to find specific files
3. **Edit Files**: Click on any file to open it in the editor
4. **Delete Files**: Use the trash button to soft-delete files
5. **Restore Files**: Access the trash to restore deleted files
6. **Download Files**: Use the download button to save files locally

### Cache Management

1. **Auto Rebuild**: Enable "Rebuild Cache on Save" for automatic updates
2. **Manual Rebuild**: Click the refresh button for immediate cache updates
3. **Monitor Status**: Check cache status and item counts in the header
4. **Smart Triggers**: Cache rebuilds automatically for important content changes

This Content Creation Studio provides a powerful, flexible foundation for all your content creation needs, with modern features that make creating rich, interactive content simple and enjoyable. The integration with Cloudflare R2, AI-powered frontmatter generation, and intelligent cache management make it a comprehensive solution for content management.
