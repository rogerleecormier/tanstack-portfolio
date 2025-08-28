# Content Management Guide

Comprehensive guide to managing content across the TanStack Portfolio site, including portfolio items, blog posts, projects, and dynamic content loading.

## 📚 Overview

The portfolio site uses a markdown-based content management system with dynamic loading, frontmatter parsing, and intelligent organization. Content is organized into distinct sections with automatic discovery and categorization.

## 🗂️ Content Structure

### Directory Organization

```
src/content/
├── about.md                    # About page content
├── blog/                       # Blog posts
│   ├── pmp-digital-transformation-leadership.md
│   ├── internal-ethos-high-performing-organizations.md
│   ├── military-leadership-be-know-do.md
│   ├── digital-transformation-strategy-governance.md
│   ├── asana-ai-status-reporting.md
│   ├── mkdocs-github-actions-portfolio.md
│   ├── power-automate-workflow-automation.md
│   ├── serverless-ai-workflows-azure-functions.md
│   ├── pmp-agile-methodology-blend.md
│   └── ramp-agents-ai-finance-operations.md
├── portfolio/                  # Portfolio items
│   ├── strategy.md
│   ├── leadership.md
│   ├── culture.md
│   ├── talent.md
│   ├── devops.md
│   ├── saas.md
│   ├── analytics.md
│   ├── risk-compliance.md
│   ├── governance-pmo.md
│   ├── product-ux.md
│   ├── ai-automation.md
│   ├── education-certifications.md
│   ├── projects.md
│   └── capabilities.md
└── projects/                   # Project showcase
    └── project-analysis.md
```

### Content Types

1. **Portfolio Items**: Professional expertise and case studies
2. **Blog Posts**: Technical insights and industry analysis
3. **Projects**: Detailed project showcases and outcomes
4. **About**: Professional background and overview

## 📝 Content Format

### Markdown Structure

All content uses standard markdown with YAML frontmatter for metadata:

```markdown
---
title: "Content Title"
description: "Brief description of the content"
category: "content-category"
tags: ["tag1", "tag2", "tag3"]
date: "2024-01-01"
author: "Author Name"
---

# Main Content Heading

Content body goes here with full markdown support.

## Subsection

- Bullet points
- Code blocks
- Images
- Links

### Code Examples

```javascript
function example() {
  console.log("Hello World");
}
```

## Links and References

[Internal Link](/portfolio/related-item)
[External Link](https://example.com)
```

### Frontmatter Fields

#### Required Fields
- `title`: Content title for display and SEO
- `description`: Brief description for previews and search
- `category`: Content categorization for organization

#### Optional Fields
- `tags`: Array of relevant tags for search and relationships
- `date`: Publication or creation date
- `author`: Content author name
- `image`: Featured image path
- `priority`: Content priority for ordering
- `status`: Content status (draft, published, archived)

## 🔍 Content Discovery

### Dynamic File Loading

The site uses dynamic content discovery to automatically load and organize content:

```typescript
// src/utils/portfolioUtils.ts
async function discoverPortfolioFiles(): Promise<string[]> {
  try {
    // Dynamic discovery using Vite's import.meta.glob
    const portfolioModules = import.meta.glob('../content/portfolio/*.md', { eager: true })
    
    const files = Object.keys(portfolioModules).map(filePath => {
      const fileName = filePath.split('/').pop()?.replace('.md', '') || ''
      return fileName
    })
    
    return files.filter(Boolean)
  } catch (error) {
    console.error('Error discovering portfolio files:', error)
    return []
  }
}
```

### Content Indexing

Content is automatically indexed for search and recommendations:

```typescript
// src/utils/searchData.ts
export const searchData: SearchItem[] = [
  {
    id: 'strategy',
    title: 'Digital Transformation Strategy',
    description: 'Strategic approach to digital transformation and operational excellence',
    content: 'Digital transformation strategy and operational excellence',
    url: '/portfolio/strategy',
    section: 'Strategy',
    headings: [],
    contentType: 'portfolio'
  },
  // ... more content items
]
```

## 📊 Portfolio Management

### Portfolio Categories

Portfolio content is organized into logical categories:

```typescript
// src/utils/portfolioUtils.ts
const categoryMappings: Record<string, { name: string; icon: string; color: string }> = {
  'strategy': { 
    name: 'Strategy & Consulting', 
    icon: 'Target', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
  },
  'leadership': { 
    name: 'Leadership & Culture', 
    icon: 'Users2', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
  },
  'devops': { 
    name: 'Technology & Operations', 
    icon: 'Code', 
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' 
  },
  'ai-automation': { 
    name: 'AI & Automation', 
    icon: 'Brain', 
    color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' 
  }
  // ... more categories
}
```

### Adding Portfolio Items

1. **Create Markdown File**
   ```bash
   # Create new portfolio item
   touch src/content/portfolio/new-expertise.md
   ```

2. **Add Frontmatter**
   ```markdown
   ---
   title: "New Expertise Area"
   description: "Description of expertise and capabilities"
   category: "technology"
   tags: ["expertise", "technology", "innovation"]
   date: "2024-01-01"
   ---
   
   # New Expertise Area
   
   Content describing the expertise...
   ```

3. **Update Router Configuration**
   ```typescript
   // src/router.tsx
   const portfolioPages = [
     // ... existing pages
     'new-expertise'  // Add new slug
   ]
   ```

4. **Add to Search Index**
   ```typescript
   // src/utils/searchData.ts
   {
     id: 'new-expertise',
     title: 'New Expertise Area',
     description: 'Description of expertise and capabilities',
     content: 'Content keywords for search',
     url: '/portfolio/new-expertise',
     section: 'Technology',
     headings: [],
     contentType: 'portfolio'
   }
   ```

## 📝 Blog Management

### Blog Post Structure

Blog posts follow a consistent structure with enhanced metadata:

```markdown
---
title: "Blog Post Title"
description: "Brief description for previews and SEO"
author: "Roger Lee Cormier"
date: "2024-01-01"
tags: ["leadership", "technology", "strategy"]
category: "professional-development"
readTime: "5 min read"
featured: true
---

# Blog Post Title

Introduction paragraph...

## Main Section

Content with markdown support...

### Subsection

- Bullet points
- Code examples
- Images and diagrams

## Conclusion

Summary and next steps...
```

### Blog Features

- **Automatic Date Sorting**: Posts are automatically sorted by date
- **Tag-Based Organization**: Content is organized by relevant tags
- **Related Content**: AI-powered content recommendations
- **Search Integration**: Full-text search across all blog posts
- **RSS Feed**: Automatic RSS feed generation

## 🛠️ Project Showcase

### Project Structure

Projects showcase detailed case studies and outcomes:

```markdown
---
title: "Project Analysis and Outcomes"
description: "Comprehensive analysis of project delivery and results"
category: "project-showcase"
tags: ["project-management", "delivery", "outcomes"]
date: "2024-01-01"
client: "Client Name"
duration: "6 months"
teamSize: "8 people"
technologies: ["Azure", "DevOps", "React"]
---

# Project Analysis and Outcomes

## Project Overview

Project description and objectives...

## Technical Implementation

Details of technical approach...

## Results and Outcomes

Measurable results and impact...
```

## 🔄 Content Updates

### Modifying Existing Content

1. **Edit Markdown File**
   ```bash
   # Edit existing content
   code src/content/portfolio/leadership.md
   ```

2. **Update Frontmatter**
   ```markdown
   ---
   title: "Updated Leadership Title"
   description: "Updated description"
   tags: ["leadership", "team-management", "culture"]
   lastModified: "2024-01-15"
   ---
   ```

3. **Content Changes**
   - Update markdown content
   - Add new sections
   - Modify existing content
   - Update links and references

### Content Versioning

- **Git Version Control**: All content changes are tracked in Git
- **Change History**: Track modifications and updates
- **Rollback Capability**: Revert to previous versions if needed
- **Collaboration**: Multiple authors can contribute content

## 🔍 Search and Discovery

### Search Implementation

The site uses Fuse.js for fuzzy search across all content:

```typescript
// src/utils/searchIndex.ts
import Fuse from 'fuse.js'

const searchOptions = {
  keys: ['title', 'description', 'content', 'tags'],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true
}

export const createSearchIndex = (searchData: SearchItem[]) => {
  return new Fuse(searchData, searchOptions)
}
```

### Search Features

- **Fuzzy Matching**: Handles typos and partial matches
- **Multi-field Search**: Searches across title, description, content, and tags
- **Real-time Results**: Instant search suggestions
- **Content Type Filtering**: Filter results by content type
- **Relevance Scoring**: Results ranked by relevance

## 📱 Content Display

### Responsive Rendering

Content is automatically rendered with responsive design:

```typescript
// src/components/BlogPostWrapper.tsx
export default function BlogPostWrapper() {
  const { slug } = useParams()
  const [content, setContent] = useState<string>('')
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const markdownModule = await import(`../content/blog/${slug}.md?raw`)
        setContent(markdownModule.default)
      } catch (error) {
        console.error('Error loading blog post:', error)
      }
    }
    
    loadContent()
  }, [slug])
  
  return (
    <div className="blog-post">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

### Markdown Components

Custom components for enhanced markdown rendering:

```typescript
// src/components/markdownComponents.tsx
export const markdownComponents = {
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-bold mb-4 text-gray-900" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-semibold mb-3 text-gray-800" {...props}>
      {children}
    </h2>
  ),
  code: ({ children, className, ...props }) => (
    <code className={`bg-gray-100 px-2 py-1 rounded text-sm ${className}`} {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto" {...props}>
      {children}
    </pre>
  )
}
```

## 🔗 Content Relationships

### Cross-Content Linking

Content is automatically linked based on tags and relationships:

```typescript
// src/components/UnifiedRelatedContent.tsx
export const UnifiedRelatedContent: React.FC<UnifiedRelatedContentProps> = ({ 
  currentContent, 
  contentType 
}) => {
  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([])
  
  useEffect(() => {
    const findRelatedContent = async () => {
      const related = await unifiedSmartRecommendationsService.getRecommendations({
        content: currentContent.content,
        title: currentContent.title,
        tags: currentContent.tags,
        contentType,
        excludeUrl: window.location.pathname,
        maxResults: 3
      })
      
      setRelatedContent(related.recommendations)
    }
    
    findRelatedContent()
  }, [currentContent, contentType])
  
  return (
    <div className="related-content">
      <h3>Related Content</h3>
      {relatedContent.map(item => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### Tag-Based Relationships

Tags create automatic content relationships:

```typescript
// src/utils/contentRelationships.ts
export const findRelatedContent = (tags: string[], excludeUrl: string): ContentItem[] => {
  const allContent = [...portfolioItems, ...blogPosts, ...projects]
  
  return allContent
    .filter(item => item.url !== excludeUrl)
    .map(item => ({
      ...item,
      relevanceScore: calculateTagRelevance(tags, item.tags)
    }))
    .filter(item => item.relevanceScore > 0.3)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
}
```

## 📊 Content Analytics

### Content Performance Tracking

Track content engagement and performance:

```typescript
// src/utils/contentAnalytics.ts
export const trackContentView = (contentId: string, contentType: string) => {
  const analytics = {
    contentId,
    contentType,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    referrer: document.referrer
  }
  
  // Send to analytics service
  if (environment.isProduction()) {
    sendAnalytics('content_view', analytics)
  }
  
  // Log in development
  if (environment.isDevelopment()) {
    console.log('Content view tracked:', analytics)
  }
}
```

### Content Metrics

- **View Counts**: Track page views and engagement
- **Time on Page**: Measure content engagement
- **Bounce Rate**: Monitor content effectiveness
- **Search Queries**: Track what users are searching for
- **Popular Content**: Identify high-performing content

## 🔧 Content Tools

### Markdown Editor

Built-in markdown editor for content creation:

```typescript
// src/pages/MarkdownEditorPage.tsx
export default function MarkdownEditorPage() {
  const [showPreview, setShowPreview] = useState(false)
  const [markdownOutput, setMarkdownOutput] = useState('')
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript'
      })
    ],
    content: `# Welcome to the Markdown Editor
    
    Start writing your content here...`,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const markdown = htmlToMarkdown(content)
      setMarkdownOutput(markdown)
    }
  })
  
  return (
    <div className="markdown-editor">
      <div className="toolbar">
        <Button onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff /> : <Eye />} Preview
        </Button>
      </div>
      
      {showPreview ? (
        <div className="preview">
          <ReactMarkdown>{markdownOutput}</ReactMarkdown>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  )
}
```

### Content Validation

Validate content structure and metadata:

```typescript
// src/utils/contentValidation.ts
export const validateContent = (content: string, frontmatter: any): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields
  if (!frontmatter.title) {
    errors.push('Title is required')
  }
  
  if (!frontmatter.description) {
    errors.push('Description is required')
  }
  
  if (!frontmatter.category) {
    errors.push('Category is required')
  }
  
  // Content length
  if (content.length < 100) {
    warnings.push('Content is very short, consider adding more detail')
  }
  
  // Tag validation
  if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
    errors.push('Tags must be an array')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
```

## 🚀 Content Workflow

### Content Creation Process

1. **Planning**
   - Define content purpose and audience
   - Research keywords and topics
   - Plan content structure

2. **Creation**
   - Write content in markdown
   - Add appropriate frontmatter
   - Include relevant tags and categories

3. **Review**
   - Validate content structure
   - Check for typos and errors
   - Verify links and references

4. **Publication**
   - Commit to Git repository
   - Deploy to production
   - Monitor performance

### Content Maintenance

- **Regular Updates**: Keep content current and relevant
- **Link Checking**: Verify internal and external links
- **Performance Monitoring**: Track content engagement
- **SEO Optimization**: Optimize for search engines
- **User Feedback**: Incorporate user suggestions

## 📚 Resources

### Markdown Resources
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown](https://docs.github.com/en/github/writing-on-github)
- [Markdown Tables](https://www.tablesgenerator.com/markdown_tables)

### Content Strategy
- [Content Marketing Institute](https://contentmarketinginstitute.com/)
- [HubSpot Content Strategy](https://blog.hubspot.com/marketing/content-strategy)
- [Content Design Principles](https://www.contentdesign.london/)

### Tools
- [Markdown Editor](https://stackedit.io/)
- [Markdown Preview](https://dillinger.io/)
- [Markdown Lint](https://github.com/DavidAnson/markdownlint)

---

**This content management guide provides comprehensive documentation for managing and organizing content across the portfolio site, ensuring consistent structure and optimal user experience.**
