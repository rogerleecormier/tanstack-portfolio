import { loadPortfolioItems, loadBlogItems, loadProjectItems } from '@/utils/r2PortfolioLoader'

export interface MarkdownContentItem {
  id: string
  title: string
  description: string
  tags: string[]
  url: string
  contentType: 'blog' | 'portfolio' | 'project' | 'about'
  category: string
  content: string
  frontmatter: Record<string, unknown>
  lastModified?: string
  author?: string
  readingTime?: number
}

/**
 * Service for managing markdown content from R2 storage
 */
export class MarkdownContentService {
  /**
   * Get all markdown content items from R2 storage
   */
  async getAllContentItems(): Promise<MarkdownContentItem[]> {
    try {
      console.log('Loading content from R2 storage...')
      
      // Load content from R2 in parallel
      const [portfolioItems, blogItems, projectItems] = await Promise.all([
        loadPortfolioItems(),
        loadBlogItems(),
        loadProjectItems()
      ])

      // Convert portfolio items to search format
      const portfolioContentItems: MarkdownContentItem[] = portfolioItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        url: item.url,
        contentType: 'portfolio' as const,
        category: item.category,
        content: item.content,
        frontmatter: item.frontmatter,
        lastModified: item.date,
        readingTime: this.calculateReadingTime(item.content)
      }))

      // Convert blog items to search format
      const blogContentItems: MarkdownContentItem[] = blogItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        url: item.url,
        contentType: 'blog' as const,
        category: item.category,
        content: item.content,
        frontmatter: item.frontmatter,
        lastModified: item.date,
        readingTime: this.calculateReadingTime(item.content)
      }))

      // Convert project items to search format
      const projectContentItems: MarkdownContentItem[] = projectItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        url: item.url,
        contentType: 'project' as const,
        category: item.category,
        content: item.content,
        frontmatter: item.frontmatter,
        lastModified: item.date,
        readingTime: this.calculateReadingTime(item.content)
      }))

      // Combine all content items
      const allContentItems = [
        ...portfolioContentItems,
        ...blogContentItems,
        ...projectContentItems
      ]

      console.log(`Loaded ${allContentItems.length} content items from R2`)
      return allContentItems

    } catch (error) {
      console.error('Error fetching content items from R2:', error)
      throw error
    }
  }

  /**
   * Calculate reading time for content
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  /**
   * Search content items by query
   */
  async searchContent(query: string): Promise<MarkdownContentItem[]> {
    const allItems = await this.getAllContentItems()
    
    if (!query.trim()) {
      return allItems
    }

    const searchTerm = query.toLowerCase()
    
    return allItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Get content items by type
   */
  async getContentByType(type: 'blog' | 'portfolio' | 'project'): Promise<MarkdownContentItem[]> {
    const allItems = await this.getAllContentItems()
    return allItems.filter(item => item.contentType === type)
  }

  /**
   * Get content items by category
   */
  async getContentByCategory(category: string): Promise<MarkdownContentItem[]> {
    const allItems = await this.getAllContentItems()
    return allItems.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    )
  }

  /**
   * Get content items by tag
   */
  async getContentByTag(tag: string): Promise<MarkdownContentItem[]> {
    const allItems = await this.getAllContentItems()
    return allItems.filter(item => 
      item.tags.some(itemTag => 
        itemTag.toLowerCase() === tag.toLowerCase()
      )
    )
  }
}

