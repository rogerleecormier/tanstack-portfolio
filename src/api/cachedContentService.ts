import { logger } from '@/utils/logger'
import Fuse, { IFuseOptions } from 'fuse.js'
import { triggerContentStudioRebuild, getCacheStatus } from '@/utils/cacheRebuildService'

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
  readTime?: number
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

  constructor() {
    this.initializeContent()
    this.initializeFuse()
    
    // If initialization failed, log the issue but don't try fallback endpoints that are failing
    if (!this.isReady()) {
      setTimeout(() => {
        if (!this.isReady()) {
          logger.warn('⚠️ Content service still not ready after initialization - some features may be limited')
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
   * Initialize content - KV cache only, no local fallback
   */
  private async initializeContent() {
    try {
      logger.info('🔄 Loading content from KV cache...')

      // Try KV cache first via Pages Function
      try {
        const response = await fetch('/api/content/cache-get')
        if (response.ok) {
          const cacheData = await response.json()
          this.allItems = cacheData.all || []

          // If we got data, process it
          if (this.allItems.length > 0) {
            // Separate by type
            this.portfolioItems = this.allItems.filter(item => item.contentType === 'portfolio')
            this.blogItems = this.allItems.filter(item => item.contentType === 'blog')
            this.projectItems = this.allItems.filter(item => item.contentType === 'project')

            logger.info(`✅ Loaded content from KV cache with ${this.allItems.length} items`)
            return
          } else {
            logger.warn('⚠️ KV cache is empty, will attempt to populate')
          }
        } else {
          // Check if it's a preview environment error
          const isPreview = typeof window !== 'undefined' &&
                           window.location.hostname.includes('pages.dev') &&
                           !window.location.hostname.startsWith('tanstack-portfolio.pages.dev')

          if (isPreview && response.status === 500) {
            logger.warn('⚠️ Preview environment cache-get failed, trying direct worker access...')
            // Try to get cache status from worker directly
            try {
              const workerStatus = await getCacheStatus()
              if (workerStatus?.cache && workerStatus.cache.totalItems > 0) {
                logger.info(`✅ Worker reports ${workerStatus.cache.totalItems} items available - attempting direct access`)
                // For preview, we'll proceed with empty cache but show a helpful message
                // The cache will be populated when the user clicks the force populate button
              }
            } catch (workerError) {
              logger.warn('⚠️ Worker status check also failed:', workerError)
            }
          }
        }
      } catch (error) {
        logger.warn('⚠️ KV cache-get endpoint failed:', error)
      }

      logger.warn('⚠️ KV cache not available, attempting to populate via worker...')

      // Try to populate KV cache using the new worker
      await this.populateKvCacheIfNeeded()

      // Retry fetching after potential population
      try {
        const retryResponse = await fetch('/api/content/cache-get')
        if (retryResponse.ok) {
          const cacheData = await retryResponse.json()
          this.allItems = cacheData.all || []
          
          if (this.allItems.length > 0) {
            this.portfolioItems = this.allItems.filter(item => item.contentType === 'portfolio')
            this.blogItems = this.allItems.filter(item => item.contentType === 'blog')
            this.projectItems = this.allItems.filter(item => item.contentType === 'project')

            logger.info(`✅ Successfully loaded content from KV cache after population: ${this.allItems.length} items`)
            return
          } else {
            logger.warn('⚠️ KV cache still empty after population attempt')
          }
        }
      } catch (error) {
        logger.error('❌ Failed to retry cache-get after population:', error)
      }
      
      // Final fallback: try to get data directly from the worker's cache status
      try {
        logger.info('🔄 Attempting to get cache status from worker as final fallback...')
        const workerStatus = await getCacheStatus()
        if (workerStatus?.cache && workerStatus.cache.totalItems > 0) {
          logger.info(`✅ Worker reports ${workerStatus.cache.totalItems} items available - cache will be populated on next rebuild`)
        } else {
          logger.warn('⚠️ Worker also reports empty cache - content may need to be uploaded to R2')
        }
      } catch (error) {
        logger.error('❌ Failed to get worker status:', error)
      }

      // For preview environments, provide some sample/placeholder content
      const isPreview = typeof window !== 'undefined' &&
                       window.location.hostname.includes('pages.dev') &&
                       !window.location.hostname.startsWith('tanstack-portfolio.pages.dev')

      if (isPreview) {
        logger.info('🔄 Preview environment detected - providing placeholder content for better UX')

        // Add some placeholder content for preview
        this.allItems = [
          {
            id: 'preview-sample-1',
            title: 'Preview Environment - Sample Content',
            description: 'This is sample content shown in preview deployments. The full content cache will be available once populated.',
            contentType: 'blog' as const,
            category: 'Preview',
            tags: ['preview', 'sample'],
            keywords: ['preview', 'sample'],
            content: 'This is placeholder content for the preview environment. The actual content will be loaded once the cache is populated.',
            fileName: 'preview-sample-1.md',
            url: '/blog/preview-sample-1'
          },
          {
            id: 'preview-sample-2',
            title: 'How to Populate Preview Cache',
            description: 'Instructions for populating the preview cache using the Content Studio.',
            contentType: 'portfolio' as const,
            category: 'Preview',
            tags: ['preview', 'instructions'],
            keywords: ['preview', 'cache'],
            content: 'To populate the cache in preview environments: 1. Open Content Studio, 2. Click the Archive button (📦) to force populate, 3. Wait for completion.',
            fileName: 'preview-sample-2.md',
            url: '/portfolio/preview-sample-2'
          }
        ]

        // Separate by type
        this.portfolioItems = this.allItems.filter(item => item.contentType === 'portfolio')
        this.blogItems = this.allItems.filter(item => item.contentType === 'blog')
        this.projectItems = this.allItems.filter(item => item.contentType === 'project')

        logger.info(`✅ Preview environment initialized with ${this.allItems.length} placeholder items`)
        return
      }

      // Set empty arrays for production when nothing works
      this.allItems = []
      this.portfolioItems = []
      this.blogItems = []
      this.projectItems = []

      logger.warn('⚠️ Content service initialized with empty cache - some features may be limited until cache is populated')
    } catch (error) {
      logger.error('❌ Failed to load from KV cache:', error)
      // No fallback - empty arrays only
      this.portfolioItems = []
      this.blogItems = []
      this.projectItems = []
      this.allItems = []

      logger.warn('⚠️ No content available - KV cache is required')
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
   * Attempt to populate KV cache if it's empty using the new cache rebuild worker
   */
  private async populateKvCacheIfNeeded() {
    try {
      logger.info('🔄 Attempting to populate KV cache via worker...')

      // Use the new cache rebuild worker instead of the failing Pages Function
      let result;
      try {
        result = await triggerContentStudioRebuild()
      } catch (workerError) {
        logger.warn('⚠️ Primary cache rebuild worker failed, trying production worker...')
        // If we're in preview environment, try the production worker as fallback
        const isPreview = window.location.hostname.includes('pages.dev') &&
                         !window.location.hostname.startsWith('tanstack-portfolio.pages.dev')
        if (isPreview) {
          logger.info('🔄 Trying production cache rebuild worker...')
          const prodWorkerUrl = 'https://cache-rebuild-worker.rcormier.workers.dev/rebuild'
          const prodResponse = await fetch(prodWorkerUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trigger: 'preview-fallback',
              timestamp: new Date().toISOString()
            })
          })

          if (prodResponse.ok) {
            result = await prodResponse.json()
            logger.info('✅ Production worker fallback successful')
          } else {
            throw new Error('Production worker also failed')
          }
        } else {
          throw workerError
        }
      }

      if (result.success) {
        logger.info(`✅ KV cache populated successfully: ${result.stats?.total || 'unknown'} items`)
      } else {
        logger.warn(`⚠️ Failed to populate KV cache: ${result.error || result.message}`)
      }
    } catch (error) {
      logger.error('❌ Error attempting to populate KV cache:', error)

      // In preview environments, provide helpful guidance
      const isPreview = window.location.hostname.includes('pages.dev') &&
                       !window.location.hostname.startsWith('tanstack-portfolio.pages.dev')
      if (isPreview) {
        logger.info('💡 For preview deployments, cache may need to be populated manually')
        logger.info('💡 Try using the Content Studio cache rebuild button')
      }
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
    return {
      portfolioCount: this.portfolioItems.length,
      blogCount: this.blogItems.length,
      projectCount: this.projectItems.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
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
