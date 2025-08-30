/**
 * Markdown Content Service
 * Fetches and parses markdown files directly from the GitHub repository
 */

export interface MarkdownContentItem {
  id: string
  title: string
  description: string
  tags: string[]
  url: string
  contentType: 'blog' | 'portfolio' | 'project' | 'page'
  category?: string
  excerpt?: string
  date?: string
  author?: string
  lastModified: string
  // Full content for Fuse.js search (not displayed)
  content: string
}

export interface SearchResult {
  item: MarkdownContentItem
  score: number
  refIndex: number
}

interface GitHubTreeItem {
  type: string
  path: string
  sha: string
  url: string
  mode: string
  size?: number
}

interface GitHubFileResponse {
  content: string
  encoding: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  _links: {
    self: string
    git: string
    html: string
  }
}

class MarkdownContentService {
  private baseUrl = 'https://api.github.com/repos/rogerleecormier/tanstack-portfolio-content'
  private headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Search-App'
  }

  /**
   * Get all markdown content items from the repository
   */
  async getAllContentItems(): Promise<MarkdownContentItem[]> {
    try {
      // Get the tree for the main branch
      const treeResponse = await fetch(`${this.baseUrl}/git/trees/main?recursive=1`, {
        headers: this.headers
      })

      if (!treeResponse.ok) {
        throw new Error(`GitHub API error: ${treeResponse.status}`)
      }

      const tree = await treeResponse.json()
      
      // Filter markdown files in content directories
      const contentFiles = tree.tree.filter((item: GitHubTreeItem) => 
        item.type === 'blob' && 
        item.path.endsWith('.md') &&
        (item.path.startsWith('src/content/blog/') ||
         item.path.startsWith('src/content/portfolio/') ||
         item.path.startsWith('src/content/projects/') ||
         item.path === 'src/content/about.md')
      )

      console.log(`Found ${contentFiles.length} content files to process`)

      // Process files in batches for better performance
      const contentItems: MarkdownContentItem[] = []
      const batchSize = 5
      
      for (let i = 0; i < contentFiles.length; i += batchSize) {
        const batch = contentFiles.slice(i, i + batchSize)
        const batchPromises = batch.map((file: GitHubTreeItem) => this.processMarkdownFile(file.path))
        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            contentItems.push(result.value)
          } else if (result.status === 'rejected') {
            console.warn(`Failed to process file ${batch[index].path}:`, result.reason)
          }
        })
      }

      return contentItems

    } catch (error) {
      console.error('Error fetching content items:', error)
      throw error
    }
  }

  /**
   * Process a markdown file to extract metadata and content
   */
  private async processMarkdownFile(filePath: string): Promise<MarkdownContentItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contents/${filePath}?ref=main`, {
        headers: this.headers
      })

      if (!response.ok) {
        return null
      }

      const file = await response.json() as GitHubFileResponse
      
      if (file.encoding !== 'base64') {
        return null
      }

      const content = atob(file.content)
      
      // Extract frontmatter and content
      const { frontmatter, content: markdownContent } = this.parseFrontmatter(content)
      
      // Determine content type from path
      const contentType = this.getContentTypeFromPath(filePath)
      
      // Generate URL from path
      const url = this.generateUrlFromPath(filePath)
      
      // Clean up title and description
      const cleanTitle = this.cleanContentString(String(frontmatter.title || this.generateTitleFromPath(filePath)))
      const cleanDescription = this.cleanContentString(String(frontmatter.description || frontmatter.excerpt || ''))
      
      // Process tags
      const tags = this.processTags((frontmatter.tags as string[] | string) || (frontmatter.tag as string[] | string) || [], contentType)

      return {
        id: file.sha,
        title: cleanTitle,
        description: cleanDescription,
        tags,
        url,
        contentType,
        category: String(frontmatter.category || frontmatter.section || ''),
        excerpt: String(frontmatter.excerpt || ''),
        date: String(frontmatter.date || ''),
        author: String(frontmatter.author || ''),
        lastModified: file.url,
        content: markdownContent // Full content for search
      }

    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
      return null
    }
  }

  /**
   * Parse frontmatter from markdown content
   */
  private parseFrontmatter(content: string): { frontmatter: Record<string, unknown>, content: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
    const match = content.match(frontmatterRegex)
    
    if (!match) {
      return { frontmatter: {}, content }
    }

    const [, frontmatterStr, markdownContent] = match
    
    try {
      const frontmatter: Record<string, unknown> = {}
      const lines = frontmatterStr.split('\n')
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim()
          let value: string | string[] = line.substring(colonIndex + 1).trim()
          
          // Remove surrounding quotes from string values
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1)
          }
          
          // Handle array values
          if (value.startsWith('[') && value.endsWith(']')) {
            try {
              value = JSON.parse(value)
            } catch {
              // If JSON parsing fails, split by comma
              if (typeof value === 'string') {
                value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/"/g, ''))
              }
            }
          }
          
          frontmatter[key] = value
        }
      }
      
      return { frontmatter, content: markdownContent }
    } catch (error) {
      console.warn('Failed to parse frontmatter:', error)
      return { frontmatter: {}, content }
    }
  }

  /**
   * Process and enhance tags based on content type
   */
  private processTags(tags: string[] | string, contentType: string): string[] {
    let processedTags: string[] = []
    
    // Convert to array if it's a string
    if (typeof tags === 'string') {
      processedTags = [tags]
    } else if (Array.isArray(tags)) {
      processedTags = [...tags]
    }

    // Add content type as a tag
    processedTags.push(contentType)

    // Add category-based tags
    if (contentType === 'blog') {
      processedTags.push('article', 'post')
    } else if (contentType === 'portfolio') {
      processedTags.push('skill', 'expertise')
    } else if (contentType === 'project') {
      processedTags.push('work', 'case-study')
    }

    // Remove duplicates and clean
    return [...new Set(processedTags)].map(tag => tag.toLowerCase().trim())
  }

  /**
   * Determine content type from file path
   */
  private getContentTypeFromPath(filePath: string): 'blog' | 'portfolio' | 'project' | 'page' {
    if (filePath.includes('/blog/')) return 'blog'
    if (filePath.includes('/portfolio/')) return 'portfolio'
    if (filePath.includes('/projects/')) return 'project'
    return 'page'
  }

  /**
   * Generate URL from file path
   */
  private generateUrlFromPath(filePath: string): string {
    const relativePath = filePath.replace('src/content/', '')
    
    if (relativePath === 'about.md') {
      return '/about'
    }
    
    if (relativePath.startsWith('blog/')) {
      const slug = relativePath.replace('blog/', '').replace('.md', '')
      return `/blog/${slug}`
    }
    
    if (relativePath.startsWith('portfolio/')) {
      const slug = relativePath.replace('portfolio/', '').replace('.md', '')
      return `/portfolio/${slug}`
    }
    
    if (relativePath.startsWith('projects/')) {
      const slug = relativePath.replace('projects/', '').replace('.md', '')
      return `/projects/${slug}`
    }
    
    return `/${relativePath.replace('.md', '')}`
  }

  /**
   * Generate title from file path if no title in frontmatter
   */
  private generateTitleFromPath(filePath: string): string {
    const fileName = filePath.split('/').pop() || ''
    return fileName.replace('.md', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Clean content string by removing extra quotes and formatting
   */
  private cleanContentString(str: string): string {
    if (!str) return ''
    
    // Remove surrounding quotes
    let cleaned = str.trim()
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1)
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1)
    }
    
    // Remove any remaining quotes and clean up whitespace
    cleaned = cleaned.replace(/["']/g, '').trim()
    
    return cleaned
  }
}

// Export singleton instance
export const markdownContentService = new MarkdownContentService()
