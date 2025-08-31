import { logger } from '@/utils/logger'

// Import cached content data
import contentCache from '@/data/content-cache.json'
import portfolioItems from '@/data/portfolio-items.json'
import blogItems from '@/data/blog-items.json'
import projectItems from '@/data/project-items.json'

export interface CachedContentItem {
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
  date?: string
  fileName: string
}

export interface CachedSearchRequest {
  query: string
  contentType?: 'blog' | 'portfolio' | 'project' | 'all'
  maxResults?: number
  tags?: string[]
}

export interface CachedSearchResponse {
  success: boolean
  results: CachedContentItem[]
  totalResults: number
  query: string
  timestamp: string
  error?: string
}

export interface CachedRecommendationsRequest {
  query: string
  contentType?: 'blog' | 'portfolio' | 'project' | 'all'
  maxResults?: number
  excludeUrl?: string
  tags?: string[]
}

export interface CachedRecommendationsResponse {
  success: boolean
  results: CachedContentItem[]
  totalResults: number
  query: string
  timestamp: string
  error?: string
}

/**
 * Service for content search and recommendations using pre-built cache
 * This replaces the R2-based service for better performance
 */
export class CachedContentService {
  private portfolioItems: CachedContentItem[] = []
  private blogItems: CachedContentItem[] = []
  private projectItems: CachedContentItem[] = []
  private allItems: CachedContentItem[] = []

  constructor() {
    this.initializeContent()
    
    // If initialization failed, try fallback after a short delay
    if (!this.isReady()) {
      setTimeout(() => {
        if (!this.isReady()) {
          this.fallbackInitialize()
        }
      }, 1000)
    }
  }

  /**
   * Initialize content from cached JSON files
   */
  private initializeContent() {
    try {
      // Load content from cached JSON files
      this.portfolioItems = portfolioItems as CachedContentItem[]
      this.blogItems = blogItems as CachedContentItem[]
      this.projectItems = projectItems as CachedContentItem[]
      this.allItems = contentCache.all as CachedContentItem[]

      logger.info(`✅ Cached content service initialized with ${this.allItems.length} items`)
      logger.info(`📁 Portfolio: ${this.portfolioItems.length}`)
      logger.info(`📝 Blog: ${this.blogItems.length}`)
      logger.info(`🚀 Projects: ${this.projectItems.length}`)
    } catch (error) {
      logger.error('❌ Failed to initialize cached content service:', error)
      // Fallback to empty arrays
      this.portfolioItems = []
      this.blogItems = []
      this.projectItems = []
      this.allItems = []
    }
  }

  /**
   * Fallback method to initialize content if JSON files are not available
   */
  private async fallbackInitialize() {
    try {
      logger.info('🔄 Attempting fallback content initialization...')
      
      // Try to fetch content from R2 as fallback
      const response = await fetch('/api/content/fallback')
      if (response.ok) {
        const fallbackData = await response.json()
        this.portfolioItems = fallbackData.portfolio || []
        this.blogItems = fallbackData.blog || []
        this.projectItems = fallbackData.projects || []
        this.allItems = fallbackData.all || []
        
        logger.info(`✅ Fallback initialization successful with ${this.allItems.length} items`)
      }
    } catch (error) {
      logger.error('❌ Fallback initialization failed:', error)
    }
  }

  /**
   * Search content using cached data
   */
  async searchContent(request: CachedSearchRequest): Promise<CachedSearchResponse> {
    try {
      const { query, contentType = 'all', maxResults = 10, tags = [] } = request
      
      // Get all content items based on type
      const allItems: CachedContentItem[] = []
      
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
        results: results.map(item => this.addRelevanceScore(item, query, tags)),
        totalResults: results.length,
        query,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Cached content search error:', error)
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
   * Get content recommendations using cached data
   */
  async getRecommendations(request: CachedRecommendationsRequest): Promise<CachedRecommendationsResponse> {
    try {
      const { query, contentType = 'all', maxResults = 3, excludeUrl, tags = [] } = request
      
      // Get all content items based on type
      let allItems: CachedContentItem[] = []
      
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
        results: results.map(item => this.addRelevanceScore(item, query, tags)),
        totalResults: results.length,
        query,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Cached content recommendations error:', error)
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
   * Search items using enhanced text matching and relevance scoring
   */
  private searchItems(
    items: CachedContentItem[],
    query: string,
    tags: string[],
    maxResults: number
  ): CachedContentItem[] {
    const queryLower = query.toLowerCase()
    const tagsLower = tags.map(tag => tag.toLowerCase())

    // Score items based on relevance
    const scoredItems = items.map(item => {
      let score = 0
      
      // Title match (highest weight)
      if (item.title.toLowerCase().includes(queryLower)) {
        score += 15
      }
      
      // Description match
      if (item.description.toLowerCase().includes(queryLower)) {
        score += 8
      }
      
      // Content match
      if (item.content.toLowerCase().includes(queryLower)) {
        score += 5
      }
      
      // Tags match (high weight for exact matches)
      const itemTags = item.tags.map(tag => tag.toLowerCase())
      const matchingTags = tagsLower.filter(tag => itemTags.includes(tag))
      score += matchingTags.length * 10
      
      // Keywords match
      const itemKeywords = item.keywords.map(keyword => keyword.toLowerCase())
      const matchingKeywords = tagsLower.filter(keyword => itemKeywords.includes(keyword))
      score += matchingKeywords.length * 8

      // Category match
      if (item.category.toLowerCase().includes(queryLower)) {
        score += 6
      }

      // Partial word matches
      const queryWords = queryLower.split(/\s+/)
      queryWords.forEach(word => {
        if (word.length > 2) {
          if (item.title.toLowerCase().includes(word)) score += 3
          if (item.description.toLowerCase().includes(word)) score += 2
          if (item.content.toLowerCase().includes(word)) score += 1
        }
      })

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
   * Add relevance score to content item
   */
  private addRelevanceScore(item: CachedContentItem, query: string, tags: string[]): CachedContentItem {
    const queryLower = query.toLowerCase()
    const tagsLower = tags.map(tag => tag.toLowerCase())
    
    let score = 0
    
    // Title match
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 15
    }
    
    // Description match
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 8
    }
    
    // Tags match
    const itemTags = item.tags.map(tag => tag.toLowerCase())
    const matchingTags = tagsLower.filter(tag => itemTags.includes(tag))
    score += matchingTags.length * 10
    
    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, Math.max(0, Math.round((score / 50) * 100)))
    
    return {
      ...item,
      relevanceScore: normalizedScore
    }
  }

  /**
   * Get all content items
   */
  async getAllContent(): Promise<CachedContentItem[]> {
    return this.allItems
  }

  /**
   * Get content by type
   */
  async getContentByType(contentType: 'blog' | 'portfolio' | 'project'): Promise<CachedContentItem[]> {
    switch (contentType) {
      case 'portfolio':
        return this.portfolioItems
      case 'blog':
        return this.blogItems
      case 'project':
        return this.projectItems
      default:
        return []
    }
  }

  /**
   * Get content metadata
   */
  getContentMetadata() {
    return contentCache.metadata
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.allItems.length > 0
  }
}

// Export singleton instance
export const cachedContentService = new CachedContentService()
