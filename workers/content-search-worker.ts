/**
 * Content Search Worker
 * Provides search functionality for content stored in the GitHub repository
 */

interface Env {
  GITHUB_TOKEN: string
  GITHUB_REPO: string
  GITHUB_BRANCH: string
  CONTENT_PATH: string
  GITHUB_API_BASE: string
  CONTENT_CACHE: KVNamespace
}

interface SearchRequest {
  query: string
  contentType?: 'blog' | 'portfolio' | 'project' | 'page' | 'all'
  maxResults?: number
  excludeUrl?: string
  tags?: string[]
}

interface ContentItem {
  id: string
  title: string
  description: string
  content: string // Full content for search purposes
  displayContent: string // Clean content for display (no emojis, markdown)
  tags: string[]
  url: string
  contentType: 'blog' | 'portfolio' | 'project' | 'page'
  category?: string
  headings?: string[]
  searchKeywords?: string[]
  lastModified?: string
}

// SearchResponse interface removed as it's not used

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

interface GitHubTreeResponse {
  sha: string
  url: string
  tree: Array<{
    path: string
    mode: string
    type: string
    sha: string
    size?: number
    url: string
  }>
}

class ContentSearchWorker {
  private env: Env
  private baseUrl: string
  private headers: HeadersInit
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes
  private readonly BATCH_SIZE = 10 // Process files in batches
  private readonly CACHE_KEYS = {
    CONTENT_ITEMS: 'content_items',
    LAST_UPDATE: 'last_update',
    CACHE_METADATA: 'cache_metadata'
  }

  constructor(env: Env) {
    this.env = env
    this.baseUrl = `${env.GITHUB_API_BASE}/repos/${env.GITHUB_REPO}`
    this.headers = {
      'Authorization': `token ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Cloudflare-Worker-Content-Search'
    }
  }

  /**
   * Search content using Fuse.js-like fuzzy matching
   */
  async searchContent(request: SearchRequest): Promise<Response> {
    try {
      const { query, contentType = 'all', maxResults = 10, excludeUrl, tags = [] } = request

      if (!query || query.trim().length < 2) {
        return this.jsonResponse({
          success: false,
          error: 'Search query must be at least 2 characters long'
        }, 400)
      }

      // Get all content items
      const allItems = await this.getAllContentItems()
      
      // Filter by content type if specified
      let filteredItems = allItems
      if (contentType !== 'all') {
        filteredItems = allItems.filter(item => item.contentType === contentType)
      }

      // Filter by tags if specified
      if (tags.length > 0) {
        filteredItems = filteredItems.filter(item => 
          tags.some(tag => 
            item.tags.some(itemTag => 
              itemTag.toLowerCase().includes(tag.toLowerCase()) ||
              tag.toLowerCase().includes(itemTag.toLowerCase())
            )
          )
        )
      }

      // Exclude current URL if specified
      if (excludeUrl) {
        filteredItems = filteredItems.filter(item => item.url !== excludeUrl)
      }

      // Perform fuzzy search
      const results = this.fuzzySearch(query, filteredItems, maxResults)

      // Return clean results for display (no full content)
      const cleanResults = results.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        displayContent: item.displayContent,
        tags: item.tags,
        url: item.url,
        contentType: item.contentType,
        category: item.category,
        headings: item.headings,
        lastModified: item.lastModified
      }))

      return this.jsonResponse({
        success: true,
        results: cleanResults,
        totalResults: cleanResults.length,
        query: query.trim(),
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Search error:', error)
      return this.jsonResponse({
        success: false,
        error: 'Internal server error during search'
      }, 500)
    }
  }

  /**
   * Get content recommendations based on similarity
   */
  async getRecommendations(request: SearchRequest): Promise<Response> {
    try {
      const { query, contentType = 'all', maxResults = 5, excludeUrl, tags = [] } = request

      // Get all content items
      const allItems = await this.getAllContentItems()
      
      // Filter by content type if specified
      let filteredItems = allItems
      if (contentType !== 'all') {
        filteredItems = allItems.filter(item => item.contentType === contentType)
      }

      // Exclude current URL if specified
      if (excludeUrl) {
        filteredItems = filteredItems.filter(item => item.url !== excludeUrl)
      }

      // Calculate similarity scores
      const scoredItems = filteredItems.map(item => {
        const score = this.calculateSimilarityScore(query, tags, item)
        return { ...item, score }
      })

      // Sort by score and return top results
      const results = scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(({ score: _score, ...item }) => item)

      // Return clean results for display (no full content)
      const cleanResults = results.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        displayContent: item.displayContent,
        tags: item.tags,
        url: item.url,
        contentType: item.contentType,
        category: item.category,
        headings: item.headings,
        lastModified: item.lastModified
      }))

      return this.jsonResponse({
        success: true,
        results: cleanResults,
        totalResults: cleanResults.length,
        query: query.trim(),
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Recommendations error:', error)
      return this.jsonResponse({
        success: false,
        error: 'Internal server error during recommendations'
      }, 500)
    }
  }

  /**
   * Pre-warm cache by fetching content in background
   * This can be called to improve response times for subsequent requests
   */
  async prewarmCache(): Promise<void> {
    try {
      console.log('Pre-warming cache...')
      await this.getAllContentItems()
      console.log('Cache pre-warmed successfully')
    } catch (error) {
      console.error('Failed to pre-warm cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ size: number; lastUpdate: string; ttl: number }> {
    try {
      const [contentItems, lastUpdate] = await Promise.all([
        this.env.CONTENT_CACHE.get(this.CACHE_KEYS.CONTENT_ITEMS, 'json'),
        this.env.CONTENT_CACHE.get(this.CACHE_KEYS.LAST_UPDATE, 'text')
      ])
      
      const size = contentItems ? Object.keys(contentItems).length : 0
      const lastUpdateTime = lastUpdate || '1970-01-01T00:00:00.000Z'
      
      console.log(`Cache stats - Size: ${size}, Last Update: ${lastUpdateTime}`)
      
      return {
        size,
        lastUpdate: lastUpdateTime,
        ttl: this.CACHE_TTL
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return {
        size: 0,
        lastUpdate: '1970-01-01T00:00:00.000Z',
        ttl: this.CACHE_TTL
      }
    }
  }

  /**
   * Get cached content items from KV
   */
  private async getCachedContent(): Promise<Record<string, ContentItem> | null> {
    try {
      const cached = await this.env.CONTENT_CACHE.get(this.CACHE_KEYS.CONTENT_ITEMS, 'json')
      return cached as Record<string, ContentItem> | null
    } catch (error) {
      console.error('Error reading from KV cache:', error)
      return null
    }
  }

  /**
   * Set cached content items in KV
   */
  private async setCachedContent(contentItems: ContentItem[]): Promise<void> {
    try {
      const contentMap: Record<string, ContentItem> = {}
      contentItems.forEach(item => {
        contentMap[item.id] = item
      })

      const now = Date.now()
      
      // Store content items and metadata
      await Promise.all([
        this.env.CONTENT_CACHE.put(this.CACHE_KEYS.CONTENT_ITEMS, JSON.stringify(contentMap), {
          expirationTtl: this.CACHE_TTL / 1000 // Convert to seconds
        }),
        this.env.CONTENT_CACHE.put(this.CACHE_KEYS.LAST_UPDATE, now.toString(), {
          expirationTtl: this.CACHE_TTL / 1000
        }),
        this.env.CONTENT_CACHE.put(this.CACHE_KEYS.CACHE_METADATA, JSON.stringify({
          itemCount: contentItems.length,
          lastUpdate: now,
          ttl: this.CACHE_TTL
        }), {
          expirationTtl: this.CACHE_TTL / 1000
        })
      ])

      console.log(`Cached ${contentItems.length} items in KV storage`)
    } catch (error) {
      console.error('Error writing to KV cache:', error)
    }
  }

  /**
   * Check if cache is valid
   */
  private async isCacheValid(): Promise<boolean> {
    try {
      const lastUpdate = await this.env.CONTENT_CACHE.get(this.CACHE_KEYS.LAST_UPDATE, 'text')
      if (!lastUpdate) return false
      
      const lastUpdateTime = parseInt(lastUpdate)
      const now = Date.now()
      
      return (now - lastUpdateTime) < this.CACHE_TTL
    } catch (error) {
      console.error('Error checking cache validity:', error)
      return false
    }
  }

  /**
   * Get all content items from the repository
   */
  private async getAllContentItems(): Promise<ContentItem[]> {
    try {
      // Check if cache is valid
      if (await this.isCacheValid()) {
        const cachedContent = await this.getCachedContent()
        if (cachedContent) {
          const items = Object.values(cachedContent)
          console.log(`Returning ${items.length} cached items from KV storage`)
          return items
        }
      }

      console.log('Cache expired or empty, fetching fresh content...')
      
      // Get the tree for the current branch
      const treeResponse = await fetch(`${this.baseUrl}/git/trees/${this.env.GITHUB_BRANCH}?recursive=1`, {
        headers: this.headers
      })

      if (!treeResponse.ok) {
        throw new Error(`GitHub API error: ${treeResponse.status}`)
      }

      const tree: GitHubTreeResponse = await treeResponse.json()
      
      // Filter markdown files in content directories
      const contentFiles = tree.tree.filter(item => 
        item.type === 'blob' && 
        item.path.endsWith('.md') &&
        (item.path.startsWith(`${this.env.CONTENT_PATH}/blog/`) ||
         item.path.startsWith(`${this.env.CONTENT_PATH}/portfolio/`) ||
         item.path.startsWith(`${this.env.CONTENT_PATH}/projects/`) ||
         item.path.startsWith(`${this.env.CONTENT_PATH}/about.md`))
      )

      console.log(`Found ${contentFiles.length} content files to process`)

      // Process files in batches for better performance
      const contentItems: ContentItem[] = []
      const batches = this.chunkArray(contentFiles, this.BATCH_SIZE)
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} files)`)
        
        // Process batch concurrently
        const batchPromises = batch.map(file => this.processMarkdownFile(file.path))
        const batchResults = await Promise.allSettled(batchPromises)
        
        // Add successful results to results array
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            const item = result.value
            contentItems.push(item)
            console.log(`Processed item: ${item.title} (ID: ${item.id})`)
          } else if (result.status === 'rejected') {
            console.warn(`Failed to process file ${batch[index].path}:`, result.reason)
          }
        })
      }

      // Store in KV cache
      if (contentItems.length > 0) {
        await this.setCachedContent(contentItems)
      }
      
      console.log(`Successfully processed ${contentItems.length} files and cached in KV storage`)
      return contentItems

    } catch (error) {
      console.error('Error fetching content items:', error)
      // Try to return cached items if available, even if expired
      try {
        const cachedContent = await this.getCachedContent()
        if (cachedContent) {
          const items = Object.values(cachedContent)
          console.log(`Returning ${items.length} cached items due to error`)
          return items
        }
      } catch (cacheError) {
        console.error('Error reading from cache during error fallback:', cacheError)
      }
      throw error
    }
  }

  /**
   * Process a markdown file to extract metadata and content
   */
  private async processMarkdownFile(filePath: string): Promise<ContentItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contents/${filePath}?ref=${this.env.GITHUB_BRANCH}`, {
        headers: this.headers
      })

      if (!response.ok) {
        return null
      }

      const file: GitHubFileResponse = await response.json()
      
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
      
      // Extract headings from markdown
      const headings = this.extractHeadings(markdownContent)
      
      // Generate search keywords
      const searchKeywords = this.generateSearchKeywords(frontmatter, markdownContent, headings)

      // Clean up title and description to remove extra quotes and formatting
      const cleanTitle = await this.cleanContentString(frontmatter.title || this.generateTitleFromPath(filePath))
      const cleanDescription = await this.cleanContentString(frontmatter.description || frontmatter.excerpt || '')
      
             // Generate clean text content for display (no emojis, basic markdown cleaning)
       const displayContent = await this.cleanMarkdownContent(markdownContent)

      return {
        id: file.sha,
        title: cleanTitle,
        description: cleanDescription,
        content: markdownContent, // Full content for search
        displayContent, // Clean content for display
        tags: frontmatter.tags || frontmatter.tag || [],
        url,
        contentType,
        category: frontmatter.category || frontmatter.section,
        headings,
        searchKeywords,
        lastModified: file.url
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
          let value = line.substring(colonIndex + 1).trim()
          
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
              value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''))
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
   * Extract headings from markdown content
   */
  private extractHeadings(content: string): string[] {
    const headingRegex = /^#{1,6}\s+(.+)$/gm
    const headings: string[] = []
    let match
    
    while ((match = headingRegex.exec(content)) !== null) {
      // Clean heading text by removing emojis and extra formatting
      const cleanHeading = this.cleanContentString(match[1].trim())
      headings.push(cleanHeading)
    }
    
    return headings
  }

  /**
   * Generate search keywords from content
   */
  private generateSearchKeywords(frontmatter: Record<string, unknown>, content: string, headings: string[]): string[] {
    const keywords = new Set<string>()
    
    // Add tags
    if (frontmatter.tags) {
      if (Array.isArray(frontmatter.tags)) {
        frontmatter.tags.forEach((tag: string) => keywords.add(tag.toLowerCase()))
      } else if (typeof frontmatter.tags === 'string') {
        keywords.add(frontmatter.tags.toLowerCase())
      }
    }
    
    // Add category
    if (frontmatter.category) {
      keywords.add(frontmatter.category.toLowerCase())
    }
    
    // Add headings
    headings.forEach(heading => {
      const words = heading.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.length > 3) {
          keywords.add(word)
        }
      })
    })
    
    // Add key terms from content (first 1000 characters)
    const contentPreview = content.substring(0, 1000).toLowerCase()
    const contentWords = contentPreview.match(/\b\w{4,}\b/g) || []
    contentWords.slice(0, 20).forEach(word => keywords.add(word))
    
    return Array.from(keywords)
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
    const relativePath = filePath.replace(`${this.env.CONTENT_PATH}/`, '')
    
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
  private async cleanContentString(str: string): Promise<string> {
    if (!str) return ''
    
    try {
      // Use the new character parsing utility
      const { parseContentForSearch } = await import('../src/utils/characterParser')
      return parseContentForSearch(str)
    } catch (error) {
      console.error('Error importing character parser, using fallback:', error)
      
      // Fallback to original method
      let cleaned = str.trim()
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1)
      }
      if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.slice(1, -1)
      }
      
      cleaned = cleaned.replace(/["']/g, '').trim()
      return cleaned
    }
  }

  /**
   * Clean markdown content for display by removing emojis but preserving markdown formatting
   */
  private async cleanMarkdownContent(content: string): Promise<string> {
    if (!content) return ''
    
    try {
      // Use the new character parsing utility
      const { parseContentForSearch } = await import('../src/utils/characterParser')
      let cleaned = parseContentForSearch(content)
      
      // Remove emojis (Unicode emoji ranges)
      cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      
      // Clean up whitespace
      cleaned = cleaned
        .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .trim()
      
      // Limit length for display
      if (cleaned.length > 400) {
        cleaned = cleaned.substring(0, 400).trim() + '...'
      }
      
      return cleaned
    } catch (error) {
      console.error('Error importing character parser, using fallback:', error)
      
      // Fallback to original method
      let cleaned = content.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      
      cleaned = cleaned
        .replace(/\n\s*\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (cleaned.length > 400) {
        cleaned = cleaned.substring(0, 400).trim() + '...'
      }
      
      return cleaned
    }
  }

  /**
   * Convert markdown content to HTML for display using unified ecosystem
   */
  private async markdownToHtml(content: string): Promise<string> {
    if (!content) return ''
    
    try {
      // Remove emojis first (Unicode emoji ranges)
      const cleanedContent = content.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      
      // Import unified packages dynamically (Cloudflare Workers don't support top-level imports)
      const { unified } = await import('unified')
      const remarkParse = await import('remark-parse')
      const remarkHtml = await import('remark-html')
      const remarkGfm = await import('remark-gfm')
      
      // Convert markdown to HTML using unified ecosystem
      const result = await unified()
        .use(remarkParse.default)
        .use(remarkGfm.default) // Handles tables, strikethrough, etc.
        .use(remarkHtml.default, {
          // Add CSS classes for styling
          handlers: {
            // Custom handlers for specific elements
            code: (h, node) => {
              if (node.lang) {
                return h(node, 'pre', { class: 'content-code-block' }, [
                  h(node, 'code', { class: `language-${node.lang}` }, node.value)
                ])
              }
              return h(node, 'code', { class: 'inline-code' }, node.value)
            },
            link: (h, node) => {
              return h(node, 'a', { 
                href: node.url, 
                class: 'content-link',
                target: '_blank',
                rel: 'noopener noreferrer'
              }, node.children)
            },
            list: (h, node) => {
              const tag = node.ordered ? 'ol' : 'ul'
              return h(node, tag, { class: 'content-list' }, node.children)
            },
            listItem: (h, node) => {
              return h(node, 'li', { class: 'content-list-item' }, node.children)
            },
            blockquote: (h, node) => {
              return h(node, 'blockquote', { class: 'content-blockquote' }, node.children)
            },
            table: (h, node) => {
              return h(node, 'table', { class: 'content-table' }, node.children)
            },
            tableRow: (h, node) => {
              return h(node, 'tr', { class: 'content-table-row' }, node.children)
            },
            tableCell: (h, node) => {
              const tag = node.header ? 'th' : 'td'
              return h(node, tag, { class: 'content-table-cell' }, node.children)
            },
            heading: (h, node) => {
              return h(node, `h${node.depth}`, { class: 'content-heading' }, node.children)
            }
          }
        })
        .process(cleanedContent)
      
      let html = String(result)
      
      // Limit length for display (count actual text content, not HTML tags)
      const textContent = html.replace(/<[^>]*>/g, '')
      if (textContent.length > 400) {
        // Find a good breaking point near 400 characters, preserving HTML structure
        let currentLength = 0
        let result = ''
        let inTag = false
        let tagBuffer = ''
        
        for (let i = 0; i < html.length; i++) {
          const char = html[i]
          
          if (char === '<') {
            inTag = true
            tagBuffer = char
          } else if (char === '>') {
            inTag = false
            tagBuffer += char
            result += tagBuffer
            tagBuffer = ''
          } else if (inTag) {
            tagBuffer += char
          } else {
            // Count actual text characters
            if (currentLength < 400) {
              result += char
              currentLength++
            } else {
              // Find a good breaking point (end of word)
              if (char === ' ' || char === '\n') {
                result += '...'
                break
              }
              result += char
            }
          }
        }
        
        // Close any unclosed tags
        if (inTag && tagBuffer) {
          result += tagBuffer
        }
        
        html = result
      }
      
      return html
      
    } catch (error) {
      console.error('Error converting markdown to HTML:', error)
      // Fallback to basic text extraction if conversion fails
      return this.extractTextFallback(content)
    }
  }
  
  /**
   * Fallback method to extract plain text if markdown conversion fails
   */
  private extractTextFallback(content: string): string {
    if (!content) return ''
    
    // Remove emojis
    let cleaned = content.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    
    // Basic markdown removal
    cleaned = cleaned
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/~~(.*?)~~/g, '$1') // Strikethrough
      .replace(/^#{1,6}\s+/gm, '') // Headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      .replace(/^\s*[-*+]\s+/gm, '') // List items
      .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
      .replace(/^\s*>\s+/gm, '') // Blockquotes
      .replace(/^\s*\|.*\|.*$/gm, '') // Tables
      .replace(/^\s*---\s*$/gm, '') // Horizontal rules
      .replace(/^\s*```[\s\S]*?```\s*$/gm, '') // Code blocks
    
    // Clean up whitespace
    cleaned = cleaned
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Limit length
    if (cleaned.length > 400) {
      cleaned = cleaned.substring(0, 400).trim() + '...'
    }
    
    return cleaned
  }

  /**
   * Split array into chunks for batch processing
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * Clear all cached content from KV storage
   */
  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        this.env.CONTENT_CACHE.delete(this.CACHE_KEYS.CONTENT_ITEMS),
        this.env.CONTENT_CACHE.delete(this.CACHE_KEYS.LAST_UPDATE),
        this.env.CONTENT_CACHE.delete(this.CACHE_KEYS.CACHE_METADATA)
      ])
      console.log('KV cache cleared successfully')
    } catch (error) {
      console.error('Error clearing KV cache:', error)
    }
  }

  /**
   * Perform fuzzy search using a simplified algorithm
   */
  private fuzzySearch(query: string, items: ContentItem[], maxResults: number): ContentItem[] {
    const lowerQuery = query.toLowerCase()
    const scoredItems = items.map(item => {
      let score = 0
      
      // Title match (highest weight)
      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 100
      }
      
      // Description match
      if (item.description.toLowerCase().includes(lowerQuery)) {
        score += 50
      }
    
      // Tag matches
      const tagMatches = item.tags.filter(tag => 
        tag.toLowerCase().includes(lowerQuery)
      ).length
      score += tagMatches * 30
      
      // Content keyword matches
      const keywordMatches = item.searchKeywords.filter(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      ).length
      score += keywordMatches * 20
      
      // Heading matches
      const headingMatches = item.headings.filter(heading => 
        heading.toLowerCase().includes(lowerQuery)
      ).length
      score += headingMatches * 25
      
      // Content preview match
      if (item.content.toLowerCase().includes(lowerQuery)) {
        score += 10
      }
      
      return { ...item, score }
    })
    
    return scoredItems
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ score: _score, ...item }) => item)
  }

  /**
   * Calculate similarity score for recommendations
   */
  private calculateSimilarityScore(query: string, tags: string[], item: ContentItem): number {
    let score = 0
    
    // Tag similarity
    const tagMatches = tags.filter(tag => 
      item.tags.some(itemTag => 
        itemTag.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(itemTag.toLowerCase())
      )
    ).length
    
    score += (tagMatches / Math.max(tags.length, 1)) * 50
    
    // Content similarity
    const queryWords = query.toLowerCase().split(/\s+/)
    const contentText = `${item.title} ${item.description} ${item.content}`.toLowerCase()
    
    const wordMatches = queryWords.filter(word => 
      word.length > 2 && contentText.includes(word)
    ).length
    
    score += (wordMatches / Math.max(queryWords.length, 1)) * 30
    
    // Category similarity
    if (item.category && tags.some(tag => 
      item.category?.toLowerCase().includes(tag.toLowerCase())
    )) {
      score += 20
    }
    
    return Math.min(score, 100)
  }

  /**
   * Create a JSON response
   */
  private jsonResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Validate GitHub token
    if (!env.GITHUB_TOKEN) {
      console.error('GitHub token not configured')
      return new Response(JSON.stringify({
        success: false,
        error: 'GitHub token not configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    console.log('GitHub token configured, processing request...')
    
    const searchWorker = new ContentSearchWorker(env)
    const url = new URL(request.url)
    const path = url.pathname

    // Helper method for JSON responses
    const jsonResponse = (data: unknown, status: number = 200): Response => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    try {
      // Route requests to appropriate handlers
      if (path === '/api/search' && request.method === 'POST') {
        const body: SearchRequest = await request.json()
        return await searchWorker.searchContent(body)
      }
      
      if (path === '/api/recommendations' && request.method === 'POST') {
        const body: SearchRequest = await request.json()
        return await searchWorker.getRecommendations(body)
      }

      // Cache management endpoints
      if (path === '/api/cache/stats' && request.method === 'GET') {
        const stats = await searchWorker.getCacheStats()
        return jsonResponse({
          success: true,
          stats,
          timestamp: new Date().toISOString()
        })
      }

      if (path === '/api/cache/prewarm' && request.method === 'POST') {
        // Pre-warm cache in background
        searchWorker.prewarmCache().catch(error => 
          console.error('Background cache pre-warming failed:', error)
        )
        
        return jsonResponse({
          success: true,
          message: 'Cache pre-warming started in background',
          timestamp: new Date().toISOString()
        })
      }

      if (path === '/api/cache/clear' && request.method === 'POST') {
        // Clear cache (useful for testing)
        await searchWorker.clearCache()
        
        return jsonResponse({
          success: true,
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        })
      }

      // Default response for unknown endpoints
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })

    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
  }
}
