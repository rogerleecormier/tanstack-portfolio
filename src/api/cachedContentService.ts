import { logger } from '@/utils/logger'
import Fuse, { IFuseOptions } from 'fuse.js'

// Import cached content data for local/dev
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
  context?: {
    inquiryType?: string
    industry?: string
    projectScope?: string
    messageType?: string
    priorityLevel?: string
  }
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
 * In production, fetches from KV via API endpoint; in dev/local uses local files
 */
export class CachedContentService {
  private portfolioItems: CachedContentItem[] = []
  private blogItems: CachedContentItem[] = []
  private projectItems: CachedContentItem[] = []
  private allItems: CachedContentItem[] = []
  private fuse: Fuse<CachedContentItem> | null = null
  private isFuseInitialized = false
  private isProduction = import.meta.env.MODE === 'production'

  constructor() {
    this.initializeContent()
    this.initializeFuse()
    
    // If initialization failed, try fallback after a short delay
    if (!this.isReady()) {
      setTimeout(() => {
        if (!this.isReady()) {
          this.fallbackInitialize()
        }
      }, 1000)
    }
    
    // Add a small delay to ensure initialization is complete
    setTimeout(() => {
      if (this.isReady()) {
        logger.info(`✅ Cached content service fully initialized with ${this.allItems.length} items`)
      }
    }, 100)
  }

  /**
   * Initialize content - always try KV cache first, fallback to local files
   */
  private async initializeContent() {
    try {
      // Always try KV cache first, even in development
      const response = await fetch('/api/content/cache-get')
      if (response.ok) {
        const cacheData = await response.json()
        this.allItems = cacheData.all || []
        // Separate by type
        this.portfolioItems = this.allItems.filter(item => item.contentType === 'portfolio')
        this.blogItems = this.allItems.filter(item => item.contentType === 'blog')
        this.projectItems = this.allItems.filter(item => item.contentType === 'project')

        logger.info(`✅ Loaded content from KV cache with ${this.allItems.length} items`)
      } else {
        logger.warn('⚠️ KV cache not available, attempting to populate and retry...')

        // Try to populate KV cache if it's empty
        await this.populateKvCacheIfNeeded()

        // Retry fetching after potential population
        const retryResponse = await fetch('/api/content/cache-get')
        if (retryResponse.ok) {
          const cacheData = await retryResponse.json()
          this.allItems = cacheData.all || []
          this.portfolioItems = this.allItems.filter(item => item.contentType === 'portfolio')
          this.blogItems = this.allItems.filter(item => item.contentType === 'blog')
          this.projectItems = this.allItems.filter(item => item.contentType === 'project')

          logger.info(`✅ Successfully loaded content from KV cache after population: ${this.allItems.length} items`)
        } else {
          throw new Error('KV cache still unavailable after population attempt')
        }
      }
    } catch (error) {
      logger.warn('⚠️ Failed to load from KV cache, using local files as fallback:', error)

      // Fallback to local files if KV is not available
      try {
        this.portfolioItems = portfolioItems as CachedContentItem[]
        this.blogItems = blogItems as CachedContentItem[]
        this.projectItems = projectItems as CachedContentItem[]
        this.allItems = contentCache.all as CachedContentItem[]

        logger.info(`✅ Fallback: Loaded local content with ${this.allItems.length} items`)
      } catch (fallbackError) {
        logger.error('❌ Fallback to local files also failed:', fallbackError)
        // Empty arrays as final fallback
        this.portfolioItems = []
        this.blogItems = []
        this.projectItems = []
        this.allItems = []
      }
    }

    logger.info(`📁 Portfolio: ${this.portfolioItems.length}`)
    logger.info(`📝 Blog: ${this.blogItems.length}`)
    logger.info(`🚀 Projects: ${this.projectItems.length}`)

    // Initialize Fuse.js after content is loaded
    if (this.allItems.length > 0) {
      this.initializeFuse()
    }
  }

  /**
   * Attempt to populate KV cache if it's empty (for development)
   */
  private async populateKvCacheIfNeeded() {
    try {
      logger.info('🔄 Attempting to populate KV cache from local data...')

      // Try to trigger cache rebuild via API
      const rebuildResponse = await fetch('/api/content/rebuild-cache-kv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (rebuildResponse.ok) {
        const result = await rebuildResponse.json()
        logger.info(`✅ KV cache populated successfully: ${result.totalItems} items`)
      } else {
        logger.warn('⚠️ Failed to populate KV cache via API')
      }
    } catch (error) {
      logger.error('❌ Error attempting to populate KV cache:', error)
    }
  }

  /**
   * Initialize Fuse.js for semantic search
   */
  private async initializeFuse() {
    try {
      if (this.allItems.length === 0) {
        // Wait for content to be initialized
        return
      }

      // Configure Fuse.js for optimal semantic matching
      const fuseOptions: IFuseOptions<CachedContentItem> = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'content', weight: 0.2 },
          { name: 'tags', weight: 0.15 },
          { name: 'keywords', weight: 0.15 },
          { name: 'category', weight: 0.1 }
        ],
        threshold: 0.3, // Lower threshold for more precise matches
        distance: 100, // Allow for more flexible matching
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 3,
        ignoreLocation: true, // Better for content matching
        useExtendedSearch: true
      }

      this.fuse = new Fuse(this.allItems, fuseOptions)
      this.isFuseInitialized = true
      
      logger.info(`✅ Fuse.js semantic search initialized with ${this.allItems.length} items`)
    } catch (error) {
      logger.error('❌ Failed to initialize Fuse.js:', error)
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
        score += 25
      }
      
      // Description match
      if (item.description.toLowerCase().includes(queryLower)) {
        score += 15
      }
      
      // Content match
      if (item.content.toLowerCase().includes(queryLower)) {
        score += 10
      }
      
      // Tags match (exact matches get higher weight)
      const itemTags = item.tags.map(tag => tag.toLowerCase())
      const matchingTags = tagsLower.filter(tag => itemTags.includes(tag))
      score += matchingTags.length * 12
      
      // Keywords match
      const itemKeywords = item.keywords.map(keyword => keyword.toLowerCase())
      const matchingKeywords = tagsLower.filter(keyword => itemKeywords.includes(keyword))
      score += matchingKeywords.length * 8
      
      // Category match
      if (item.category.toLowerCase().includes(queryLower)) {
        score += 10
      }
      
      // Partial word matches for better semantic understanding
      const queryWords = queryLower.split(/\s+/)
      queryWords.forEach(word => {
        if (word.length > 2) {
          if (item.title.toLowerCase().includes(word)) score += 5
          if (item.description.toLowerCase().includes(word)) score += 3
          if (item.content.toLowerCase().includes(word)) score += 2
        }
      })
      
      // Content quality bonus
      if (item.content.length > 200) score += 5
      if (item.tags.length > 2) score += 3
      if (item.keywords.length > 2) score += 2

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
    
    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 25
    }
    
    // Description match
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 15
    }
    
    // Content match
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 10
    }
    
    // Tags match (exact matches get higher weight)
    const itemTags = item.tags.map(tag => tag.toLowerCase())
    const matchingTags = tagsLower.filter(tag => itemTags.includes(tag))
    score += matchingTags.length * 12
    
    // Keywords match
    const itemKeywords = item.keywords.map(keyword => keyword.toLowerCase())
    const matchingKeywords = tagsLower.filter(keyword => itemKeywords.includes(keyword))
    score += matchingKeywords.length * 8
    
    // Category match
    if (item.category.toLowerCase().includes(queryLower)) {
      score += 10
    }
    
    // Partial word matches for better semantic understanding
    const queryWords = queryLower.split(/\s+/)
    queryWords.forEach(word => {
      if (word.length > 2) {
        if (item.title.toLowerCase().includes(word)) score += 5
        if (item.description.toLowerCase().includes(word)) score += 3
        if (item.content.toLowerCase().includes(word)) score += 2
      }
    })
    
    // Content quality bonus
    if (item.content.length > 200) score += 5
    if (item.tags.length > 2) score += 3
    if (item.keywords.length > 2) score += 2
    
    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, Math.max(0, Math.round(score)))
    
    // Deduplicate tags to prevent duplication in the UI
    const deduplicatedTags = [...new Set(item.tags)]
    const deduplicatedKeywords = [...new Set(item.keywords)]
    
    return {
      ...item,
      tags: deduplicatedTags,
      keywords: deduplicatedKeywords,
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
   * Get blog posts in BlogPost format for backward compatibility
   */
  async getBlogPosts(): Promise<CachedContentItem[]> {
    const blogItems = await this.getContentByType('blog')

    // Convert CachedContentItem to include calculated fields
    return blogItems.map(item => ({
      ...item,
      readTime: this.calculateReadTime(item.content)
    }))
  }

  /**
   * Calculate reading time from content
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
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

  /**
   * Force reinitialization of Fuse.js (useful for content updates)
   */
  async reinitializeFuse(): Promise<void> {
    this.isFuseInitialized = false
    this.fuse = null
    await this.initializeFuse()
  }

  /**
   * Check if Fuse.js semantic search is ready
   */
  isFuseReady(): boolean {
    return this.isFuseInitialized && this.fuse !== null
  }
}

// Export singleton instance
export const cachedContentService = new CachedContentService()
