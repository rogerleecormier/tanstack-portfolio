import { loadPortfolioItems, loadBlogItems, loadProjectItems, type PortfolioItem, type BlogItem, type ProjectItem } from '@/utils/r2PortfolioLoader'

export interface WorkerContentItem {
  id: string
  title: string
  description: string
  url: string
  contentType: 'blog' | 'portfolio' | 'project' | 'page'
  category: string
  tags: string[]
  keywords: string[]
  content: string
  relevanceScore?: number
}

export interface WorkerSearchRequest {
  query: string
  contentType?: 'blog' | 'portfolio' | 'project' | 'all'
  maxResults?: number
  tags?: string[]
}

export interface WorkerSearchResponse {
  success: boolean
  results: WorkerContentItem[]
  totalResults: number
  query: string
  timestamp: string
  error?: string
}

export interface WorkerRecommendationsRequest {
  query: string
  contentType?: 'blog' | 'portfolio' | 'project' | 'all'
  maxResults?: number
  excludeUrl?: string
  tags?: string[]
}

export interface WorkerRecommendationsResponse {
  success: boolean
  results: WorkerContentItem[]
  totalResults: number
  query: string
  timestamp: string
  error?: string
}

/**
 * Service for content search and recommendations using R2 storage
 * Replaces the GitHub API-based content-search worker
 */
export class WorkerContentService {
  private portfolioItems: PortfolioItem[] = []
  private blogItems: BlogItem[] = []
  private projectItems: ProjectItem[] = []

  constructor() {
    // Initialize content on service creation
    this.initializeContent()
  }

  /**
   * Initialize content from R2 storage
   */
  private async initializeContent() {
    try {
      // Load all content from R2
      this.portfolioItems = await loadPortfolioItems()
      this.blogItems = await loadBlogItems()
      this.projectItems = await loadProjectItems()
    } catch (error) {
      console.error('Failed to initialize content from R2:', error)
    }
  }

  /**
   * Search content using R2 data
   */
  async searchContent(request: WorkerSearchRequest): Promise<WorkerSearchResponse> {
    try {
      const { query, contentType = 'all', maxResults = 10, tags = [] } = request
      
      // Get all content items based on type
      const allItems: (PortfolioItem | BlogItem | ProjectItem)[] = []
      
      if (contentType === 'all' || contentType === 'portfolio') {
        allItems.push(...this.portfolioItems)
      }
      if (contentType === 'all' || contentType === 'blog') {
        allItems.push(...this.blogItems)
      }
      if (contentType === 'all' || contentType === 'project') {
        allItems.push(...this.projectItems)
      }

      // Search through content
      const results = this.searchItems(allItems, query, tags, maxResults)

      return {
        success: true,
        results: results.map(item => this.convertToWorkerContentItem(item)),
        totalResults: results.length,
        query,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('R2 content search error:', error)
      return {
        success: false,
        results: [],
        totalResults: 0,
        query: request.query,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get content recommendations using R2 data
   */
  async getRecommendations(request: WorkerRecommendationsRequest): Promise<WorkerRecommendationsResponse> {
    try {
      const { query, contentType = 'all', maxResults = 3, excludeUrl, tags = [] } = request
      
      // Get all content items based on type
      let allItems: (PortfolioItem | BlogItem | ProjectItem)[] = []
      
      if (contentType === 'all' || contentType === 'portfolio') {
        allItems.push(...this.portfolioItems)
      }
      if (contentType === 'all' || contentType === 'blog') {
        allItems.push(...this.blogItems)
      }
      if (contentType === 'all' || contentType === 'project') {
        allItems.push(...this.projectItems)
      }

      // Filter out excluded URL
      if (excludeUrl) {
        allItems = allItems.filter(item => item.url !== excludeUrl)
      }

      // Search through content
      const results = this.searchItems(allItems, query, tags, maxResults)

      return {
        success: true,
        results: results.map(item => this.convertToWorkerContentItem(item)),
        totalResults: results.length,
        query,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('R2 content recommendations error:', error)
      return {
        success: false,
        results: [],
        totalResults: 0,
        query: request.query,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Search items using simple text matching
   */
  private searchItems(
    items: (PortfolioItem | BlogItem | ProjectItem)[],
    query: string,
    tags: string[],
    maxResults: number
  ): (PortfolioItem | BlogItem | ProjectItem)[] {
    const queryLower = query.toLowerCase()
    const tagsLower = tags.map(tag => tag.toLowerCase())

    // Score items based on relevance
    const scoredItems = items.map(item => {
      let score = 0
      
      // Title match (highest weight)
      if (item.title.toLowerCase().includes(queryLower)) {
        score += 10
      }
      
      // Description match
      if (item.description.toLowerCase().includes(queryLower)) {
        score += 5
      }
      
      // Content match
      if (item.content.toLowerCase().includes(queryLower)) {
        score += 3
      }
      
      // Tags match
      const itemTags = item.tags.map(tag => tag.toLowerCase())
      const matchingTags = tagsLower.filter(tag => itemTags.includes(tag))
      score += matchingTags.length * 2
      
      // Keywords match
      const itemKeywords = item.keywords.map(keyword => keyword.toLowerCase())
      const matchingKeywords = tagsLower.filter(keyword => itemKeywords.includes(keyword))
      score += matchingKeywords.length * 1.5

      return { item, score }
    })

    // Sort by score and return top results
    return scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ item }) => item)
  }

  /**
   * Convert content item to WorkerContentItem format
   */
  private convertToWorkerContentItem(item: PortfolioItem | BlogItem | ProjectItem): WorkerContentItem {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      contentType: this.getContentType(item),
      category: item.category || 'General',
      tags: item.tags,
      keywords: item.keywords,
      content: item.content,
      relevanceScore: 85 // Default relevance score
    }
  }

  /**
   * Determine content type from item
   */
  private getContentType(item: PortfolioItem | BlogItem | ProjectItem): 'blog' | 'portfolio' | 'project' | 'page' {
    if ('slug' in item) { // Assuming BlogItem has a 'slug' property
      return 'blog'
    } else if (item.url.includes('portfolio')) {
      return 'portfolio'
    } else if (item.url.includes('projects')) {
      return 'project'
    } else {
      return 'page' // Default or for other types
    }
  }

  /**
   * Search by query (legacy method for compatibility)
   */
  async searchByQuery(
    query: string,
    contentType: 'blog' | 'portfolio' | 'project' | 'all' = 'all',
    maxResults: number = 5
  ): Promise<WorkerContentItem[]> {
    const response = await this.searchContent({ query, contentType, maxResults })
    return response.results
  }

  /**
   * Get all content items
   */
  async getAllContent(): Promise<WorkerContentItem[]> {
    const allItems = [...this.portfolioItems, ...this.blogItems, ...this.projectItems]
    return allItems.map(item => this.convertToWorkerContentItem(item))
  }
}

// Export singleton instance
export const workerContentService = new WorkerContentService()


