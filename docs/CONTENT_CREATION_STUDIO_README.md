# Content Creation Studio

A comprehensive, modern content creation platform that provides dual HTML/Markdown editing capabilities with advanced features for creating rich, interactive content.

## 🚀 Features

### Dual Editing Modes

- **HTML Editor**: Rich text editor with WYSIWYG interface
- **Markdown Editor**: Pure markdown syntax editing
- **Seamless Switching**: Toggle between modes with automatic content conversion
- **Live Preview**: Real-time preview of content in both modes

### Advanced Content Features

- **Rich Text Formatting**: Bold, italic, headings, lists, blockquotes
- **Code Blocks**: Syntax-highlighted code blocks with language support
- **Links**: Internal and external link management
- **Images**: Image insertion and management

### Table Support

- **Interactive Tables**: Create and edit tables with rich text formatting
- **Sortable Tables**: Shadcn-style sortable data tables
- **Rich Cell Content**: Bold, italic, code, and links within table cells
- **Table Builder**: Visual table creation with customizable rows and columns
- **Markdown Export**: Tables automatically convert to markdown format

### Chart Creation

- **Multiple Chart Types**: Bar charts, line charts, pie charts
- **Interactive Charts**: Shadcn chart components with hover effects
- **Data Validation**: JSON data validation and error handling
- **Customizable**: Axis labels, titles, dimensions
- **Markdown Integration**: Charts stored as markdown code blocks

### Frontmatter Management

- **Smart Frontmatter**: AI-powered frontmatter generation from content
- **Content-Type Specific**: Different fields for blog, portfolio, and project content
- **Validation**: Built-in validation with error reporting
- **Rich Metadata**: Tags, keywords, dates, authors, and custom fields
- **YAML Export**: Frontmatter exported in YAML format

### Modern UI/UX

- **Brand-Consistent Design**: Teal-blue color scheme matching your site
- **Responsive Layout**: Works on all device sizes
- **Keyboard Shortcuts**: Quick access to common actions
- **Tooltips**: Helpful guidance for all features
- **Dark Mode Support**: Automatic dark mode detection

## 🛠️ Technical Architecture

### Core Components

- **ContentCreationStudio**: Main editor component
- **FrontmatterManager**: Frontmatter editing and management
- **EnhancedMarkdownConverter**: Bidirectional markdown/HTML conversion
- **EnhancedTableParser**: Advanced table parsing and rendering

### Extensions & Integrations

- **TipTap Editor**: Modern, extensible rich text editor
- **Shadcn UI**: Consistent, accessible UI components
- **Chart Extensions**: Custom chart rendering capabilities
- **Table Extensions**: Enhanced table functionality

### Data Flow

1. **Content Input**: User creates content in HTML or Markdown mode
2. **Auto-Save**: Content automatically saves and syncs between modes
3. **Conversion**: Seamless conversion between HTML and Markdown
4. **Export**: Content exported with proper frontmatter and formatting

## 📖 Usage Guide

### Getting Started

1. **Import the Component**:

```tsx
import ContentCreationStudio from '@/components/ContentCreationStudio';
```

2. **Basic Usage**:

```tsx
<ContentCreationStudio
  initialContent='<h1>Hello World</h1>'
  contentType='blog'
  onContentChange={(html, markdown, frontmatter) => {
    console.log('Content updated:', { html, markdown, frontmatter });
  }}
/>
```

### Content Types

#### Blog Content

- **Fields**: Title, description, author, tags, keywords, date, published time, reading time
- **Features**: SEO optimization, reading time calculation, publication scheduling

#### Portfolio Content

- **Fields**: Title, description, author, tags, keywords, date, expertise level, industries
- **Features**: Skill categorization, industry targeting, expertise demonstration

#### Project Content

- **Fields**: Title, description, author, tags, keywords, date, status, technologies
- **Features**: Project tracking, technology stack, status management

### Keyboard Shortcuts

- **Ctrl/Cmd + T**: Insert table
- **Ctrl/Cmd + Shift + C**: Insert chart
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y**: Redo

### Table Creation

1. **Click Table Button**: Use the table button in the toolbar
2. **Configure Table**: Set rows, columns, and header options
3. **Edit Content**: Click on cells to edit with rich text formatting
4. **Export**: Tables automatically convert to markdown format

### Chart Creation

1. **Click Chart Button**: Use the chart button in the toolbar
2. **Select Type**: Choose from bar, line, or pie charts
3. **Enter Data**: Provide JSON data in the specified format
4. **Customize**: Set titles, labels, and dimensions
5. **Insert**: Chart is inserted and rendered immediately

### Frontmatter Management

1. **Open Frontmatter**: Click the frontmatter button
2. **Edit Fields**: Modify metadata fields as needed
3. **Generate**: Use AI-powered generation from content
4. **Validate**: Check for errors and fix issues
5. **Save**: Changes are applied to the content

## 🔧 Configuration

### Props

| Prop                 | Type     | Default   | Description                              |
| -------------------- | -------- | --------- | ---------------------------------------- |
| `initialContent`     | string   | ''        | Initial content to display               |
| `initialFrontmatter` | object   | {}        | Initial frontmatter data                 |
| `contentType`        | string   | undefined | Type of content (blog/portfolio/project) |
| `showPreview`        | boolean  | false     | Whether to show preview panel            |
| `showToolbar`        | boolean  | true      | Whether to show editing toolbar          |
| `minHeight`          | string   | '600px'   | Minimum height of editor                 |
| `onContentChange`    | function | undefined | Callback when content changes            |
| `onDirectoryChange`  | function | undefined | Callback when directory changes          |

### Styling

The component uses your existing design system:

- **Colors**: Teal-blue color scheme from your CSS variables
- **Components**: Shadcn UI components for consistency
- **Typography**: Tailwind Typography plugin for content styling
- **Responsive**: Mobile-first responsive design

## 📁 File Structure

```
src/
├── components/
│   ├── ContentCreationStudio.tsx      # Main editor component
│   ├── FrontmatterManager.tsx         # Frontmatter management
│   └── ui/                           # Shadcn UI components
├── utils/
│   ├── enhancedMarkdownConverter.ts   # Markdown/HTML conversion
│   ├── enhancedTableParser.ts         # Table parsing and rendering
│   └── frontmatterGenerator.ts        # AI frontmatter generation
└── extensions/                        # TipTap editor extensions
    ├── ChartExtension.tsx             # Chart rendering
    └── SortableTableExtension.tsx     # Sortable table support
```

## 🚀 Migration from Old Editor

### What's New

- **Dual Mode Editing**: Switch between HTML and Markdown seamlessly
- **Enhanced Tables**: Rich text formatting within table cells
- **Chart Support**: Interactive chart creation and rendering
- **Smart Frontmatter**: AI-powered metadata generation
- **Modern UI**: Streamlined, brand-consistent interface

### What's Replaced

- **Old MarkdownEditor**: Replaced by ContentCreationStudio
- **Basic Table Support**: Enhanced with rich text and sorting
- **Manual Frontmatter**: Automated with smart generation
- **Simple Preview**: Live preview with dual mode support

### Migration Steps

1. **Replace Import**:

```tsx
// Old
import MarkdownEditor from '@/components/MarkdownEditor';

// New
import ContentCreationStudio from '@/components/ContentCreationStudio';
```

2. **Update Props**:

```tsx
// Old
<MarkdownEditor
  initialContent={content}
  onContentChange={handleChange}
/>

// New
<ContentCreationStudio
  initialContent={content}
  contentType="blog"
  onContentChange={(html, markdown, frontmatter) => {
    handleChange(html, markdown, frontmatter)
  }}
/>
```

3. **Handle New Callbacks**:

```tsx
const handleContentChange = (
  html: string,
  markdown: string,
  frontmatter: any
) => {
  // Handle HTML content
  setHtmlContent(html);

  // Handle Markdown content
  setMarkdownContent(markdown);

  // Handle frontmatter
  setFrontmatter(frontmatter);
};
```

## 🎯 Best Practices

### Content Creation

- **Use HTML Mode**: For visual editing and immediate feedback
- **Use Markdown Mode**: For precise control and version control
- **Leverage Tables**: Use tables for structured data presentation
- **Add Charts**: Include charts for data visualization
- **Manage Frontmatter**: Keep metadata up-to-date and accurate

### Performance

- **Auto-Save**: Enable auto-save for real-time content synchronization
- **Preview Mode**: Use preview mode sparingly on large documents
- **Image Optimization**: Optimize images before insertion
- **Chart Data**: Keep chart datasets reasonable in size

### Accessibility

- **Alt Text**: Always provide alt text for images
- **Table Headers**: Use proper table headers for screen readers
- **Color Contrast**: Ensure sufficient color contrast in content
- **Keyboard Navigation**: Test all features with keyboard only

## 🔮 Future Enhancements

### Planned Features

- **Collaborative Editing**: Real-time collaboration support
- **Version Control**: Git integration for content history
- **Template System**: Pre-built content templates
- **Advanced Charts**: More chart types and customization options
- **Media Library**: Integrated media management
- **Export Options**: PDF, Word, and other format exports

### Integration Opportunities

- **CMS Integration**: Headless CMS compatibility
- **API Support**: REST and GraphQL APIs
- **Plugin System**: Extensible plugin architecture
- **Themes**: Customizable editor themes
- **Analytics**: Content performance tracking

## 🐛 Troubleshooting

### Common Issues

#### Content Not Saving

- Check `onContentChange` callback implementation
- Verify auto-save is enabled
- Check browser console for errors

#### Tables Not Rendering

- Ensure table data is properly formatted
- Check for missing table extensions
- Verify CSS classes are loaded

#### Charts Not Displaying

- Validate JSON data format
- Check chart extension installation
- Verify chart component dependencies

#### Frontmatter Errors

- Check required field validation
- Ensure proper data types
- Verify frontmatter generator is working

### Debug Mode

Enable debug logging:

```tsx
<ContentCreationStudio
  debug={true}
  // ... other props
/>
```

### Support

For issues and questions:

1. Check the browser console for error messages
2. Verify all dependencies are installed
3. Test with minimal content to isolate issues
4. Check component prop documentation

## 📚 Examples

### Blog Post Creation

```tsx
<ContentCreationStudio
  contentType='blog'
  initialContent='# My Blog Post\n\nThis is the content...'
  onContentChange={(html, markdown, frontmatter) => {
    // Save to blog system
    saveBlogPost({ html, markdown, frontmatter });
  }}
/>
```

### Portfolio Project

```tsx
<ContentCreationStudio
  contentType='project'
  initialFrontmatter={{
    title: 'Project Name',
    status: 'completed',
    technologies: ['React', 'TypeScript'],
  }}
  onContentChange={handleProjectUpdate}
/>
```

### Data Table Creation

```tsx
// In HTML mode, use the table button to create:
// - Sortable tables with rich text
// - Customizable headers and rows
// - Automatic markdown export
```

This Content Creation Studio provides a powerful, flexible foundation for all your content creation needs, with modern features that make creating rich, interactive content simple and enjoyable.
