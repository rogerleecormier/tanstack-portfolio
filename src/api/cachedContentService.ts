import { logger } from '@/utils/logger';
import Fuse, { IFuseOptions } from 'fuse.js';
import {
  triggerContentStudioRebuild,
  getCacheStatus,
} from '@/utils/cacheRebuildService';

export interface CachedContentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  contentType: 'blog' | 'portfolio' | 'project' | 'page';
  category: string;
  tags: string[];
  keywords: string[];
  content: string;
  relevanceScore?: number;
  date?: string;
  fileName: string;
  readTime?: number;
}

export interface CachedSearchRequest {
  query: string;
  contentType?: 'blog' | 'portfolio' | 'project' | 'all';
  maxResults?: number;
  tags?: string[];
}

export interface CachedSearchResponse {
  success: boolean;
  results: CachedContentItem[];
  totalResults: number;
  query: string;
  timestamp: string;
  error?: string;
}

export interface CachedRecommendationsRequest {
  query: string;
  contentType?: 'blog' | 'portfolio' | 'project' | 'all';
  maxResults?: number;
  excludeUrl?: string;
  tags?: string[];
  context?: {
    inquiryType?: string;
    industry?: string;
    projectScope?: string;
    messageType?: string;
    priorityLevel?: string;
  };
}

export interface CachedRecommendationsResponse {
  success: boolean;
  results: CachedContentItem[];
  totalResults: number;
  query: string;
  timestamp: string;
  error?: string;
}

interface CacheData {
  all?: CachedContentItem[];
}

/**
 * Type guard to check if data is valid CacheData
 */
function isCacheData(data: unknown): data is CacheData {
  return (
    typeof data === 'object' &&
    data !== null &&
    (!('all' in data) || Array.isArray((data as CacheData).all))
  );
}

/**
 * Service for content search and recommendations using production KV cache
 * This service exclusively uses the production KV cache via Pages Functions API
 * No local cache files are used - all environments read from production KV
 */
export class CachedContentService {
  private portfolioItems: CachedContentItem[] = [];
  private blogItems: CachedContentItem[] = [];
  private projectItems: CachedContentItem[] = [];
  private allItems: CachedContentItem[] = [];
  private fuse: Fuse<CachedContentItem> | null = null;
  private isFuseInitialized = false;
  private initPromise: Promise<void>;

  constructor() {
    console.log(
      '🚀 CachedContentService constructor called - starting initialization'
    );
    this.initPromise = this.initializeContent();
    void this.initializeFuse();

    // If initialization failed, log the issue but don't try fallback endpoints that are failing
    if (!this.isReady()) {
      setTimeout(() => {
        if (!this.isReady()) {
          logger.warn(
            '⚠️ Content service still not ready after initialization - some features may be limited'
          );
        }
      }, 1000);
    }

    // Add a small delay to ensure initialization is complete
    setTimeout(() => {
      if (this.isReady()) {
        logger.info(
          `✅ Cached content service fully initialized with ${this.allItems.length} items`
        );
      }
    }, 100);
  }

  /**
   * Initialize content - Production KV cache only
   */
  private async initializeContent() {
    try {
      logger.info('🔄 Loading content from production KV cache...');

      // TEMPORARY: Skip Pages Function and go directly to KV worker for testing
      logger.info(
        '🔄 Skipping Pages Function, going directly to KV worker for testing...'
      );

      // Fallback: Use dedicated KV cache get worker for direct KV access
      try {
        logger.info(
          '🔄 Trying direct access to production KV via dedicated cache get worker...'
        );
        const workerResponse = await fetch(
          'https://kv-cache-get.rcormier.workers.dev'
        );
        if (workerResponse.ok) {
          const rawData = (await workerResponse.json()) as CacheData;
          if (isCacheData(rawData)) {
            this.allItems = rawData.all ?? [];

            // If we got data, process it
            if (this.allItems.length > 0) {
              // Separate by type
              this.portfolioItems = this.allItems.filter(
                item => item.contentType === 'portfolio'
              );
              this.blogItems = this.allItems.filter(
                item => item.contentType === 'blog'
              );
              this.projectItems = this.allItems.filter(
                item => item.contentType === 'project'
              );

              logger.info(
                `✅ Loaded content from production KV cache via dedicated worker with ${this.allItems.length} items`
              );
              return;
            }
          } else {
            logger.warn('⚠️ Invalid cache data format from KV worker');
          }
        } else {
          logger.warn(
            `⚠️ KV cache get worker failed: ${workerResponse.status} ${workerResponse.statusText}`
          );
        }
      } catch (error) {
        logger.error('❌ Direct KV worker access failed:', error);
      }

      logger.warn(
        '⚠️ KV cache not available, attempting to populate via worker...'
      );

      // Try to populate KV cache using the new worker
      await this.populateKvCacheIfNeeded();

      // Retry fetching after potential population
      try {
        const retryResponse = await fetch('/api/content/cache-get');
        if (retryResponse.ok) {
          const rawData = (await retryResponse.json()) as CacheData;
          if (isCacheData(rawData)) {
            this.allItems = rawData.all ?? [];

            if (this.allItems.length > 0) {
              this.portfolioItems = this.allItems.filter(
                item => item.contentType === 'portfolio'
              );
              this.blogItems = this.allItems.filter(
                item => item.contentType === 'blog'
              );
              this.projectItems = this.allItems.filter(
                item => item.contentType === 'project'
              );

              logger.info(
                `✅ Successfully loaded content from KV cache after population: ${this.allItems.length} items`
              );
              return;
            } else {
              logger.warn('⚠️ KV cache still empty after population attempt');
            }
          } else {
            logger.warn('⚠️ Invalid cache data format from retry');
          }
        }
      } catch (error) {
        logger.error('❌ Failed to retry cache-get after population:', error);
      }

      // Final fallback: try to get data directly from the worker's cache status
      try {
        logger.info(
          '🔄 Attempting to get cache status from worker as final fallback...'
        );
        const workerStatus = await getCacheStatus();
        if (workerStatus?.cache && workerStatus.cache.totalItems > 0) {
          logger.info(
            `✅ Worker reports ${workerStatus.cache.totalItems} items available - cache will be populated on next rebuild`
          );
        } else {
          logger.warn(
            '⚠️ Worker also reports empty cache - content may need to be uploaded to R2'
          );
        }
      } catch (error) {
        logger.error('❌ Failed to get worker status:', error);
      }

      // Set empty arrays when KV cache is not available
      this.allItems = [];
      this.portfolioItems = [];
      this.blogItems = [];
      this.projectItems = [];

      logger.warn(
        '⚠️ Content service initialized with empty cache - production KV cache may need to be populated'
      );
    } catch (error) {
      logger.error('❌ Failed to load from KV cache:', error);
      // No fallback - empty arrays only
      this.portfolioItems = [];
      this.blogItems = [];
      this.projectItems = [];
      this.allItems = [];

      logger.warn('⚠️ No content available - KV cache is required');
    }

    logger.info(`📁 Portfolio: ${this.portfolioItems.length}`);
    logger.info(`📝 Blog: ${this.blogItems.length}`);
    logger.info(`🚀 Projects: ${this.projectItems.length}`);

    // Initialize Fuse.js after content is loaded
    if (this.allItems.length > 0) {
      this.initializeFuse();
    }
  }

  /**
   * Wait for the service to be ready with content loaded
   * Use this in route loaders to ensure data is available before rendering
   */
  async whenReady(): Promise<void> {
    // If already ready, resolve immediately
    if (this.isReady()) {
      return Promise.resolve();
    }
    
    // Wait for the initialization promise
    await this.initPromise;
    
    // If still not ready after init, poll with timeout
    if (!this.isReady()) {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          logger.warn('⚠️ Cache initialization timeout - proceeding with empty cache');
          resolve(); // Resolve anyway to prevent infinite loading
        }, 10000);
        
        const check = () => {
          if (this.isReady()) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }
  }

  /**
   * Attempt to populate production KV cache if it's empty using the cache rebuild worker
   */
  private async populateKvCacheIfNeeded() {
    try {
      logger.info(
        '🔄 Attempting to populate production KV cache via worker...'
      );

      const result = await triggerContentStudioRebuild();

      if (result.success) {
        logger.info(
          `✅ Production KV cache populated successfully: ${result.stats?.total ?? 'unknown'} items`
        );
      } else {
        logger.warn(
          `⚠️ Failed to populate production KV cache: ${result.error ?? result.message}`
        );
      }
    } catch (error) {
      logger.error(
        '❌ Error attempting to populate production KV cache:',
        error
      );
      logger.info(
        '💡 Try using the Content Studio cache rebuild button to manually populate the cache'
      );
    }
  }

  /**
   * Initialize Fuse.js for semantic search
   */
  private initializeFuse() {
    try {
      if (this.allItems.length === 0) {
        // Wait for content to be initialized
        return;
      }

      // Configure Fuse.js for optimal semantic matching
      const fuseOptions: IFuseOptions<CachedContentItem> = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'content', weight: 0.2 },
          { name: 'tags', weight: 0.15 },
          { name: 'keywords', weight: 0.15 },
          { name: 'category', weight: 0.1 },
        ],
        threshold: 0.3, // Lower threshold for more precise matches
        distance: 100, // Allow for more flexible matching
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 3,
        ignoreLocation: true, // Better for content matching
        useExtendedSearch: true,
      };

      this.fuse = new Fuse(this.allItems, fuseOptions);
      this.isFuseInitialized = true;

      logger.info(
        `✅ Fuse.js semantic search initialized with ${this.allItems.length} items`
      );
    } catch (error) {
      logger.error('❌ Failed to initialize Fuse.js:', error);
    }
  }

  /**
   * Search content using cached data
   */
  searchContent(request: CachedSearchRequest): CachedSearchResponse {
    try {
      const {
        query,
        contentType = 'all',
        maxResults = 10,
        tags = [],
      } = request;

      // Get all content items based on type
      const allItems: CachedContentItem[] = [];

      if (contentType === 'all' || contentType === 'portfolio') {
        allItems.push(...this.portfolioItems);
      }
      if (contentType === 'all' || contentType === 'blog') {
        allItems.push(...this.blogItems);
      }
      if (contentType === 'all' || contentType === 'project') {
        allItems.push(...this.projectItems);
      }

      // Search through content
      const results = this.searchItems(allItems, query, tags, maxResults);

      return {
        success: true,
        results: results.map(item => this.addRelevanceScore(item, query, tags)),
        totalResults: results.length,
        query,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Cached content search error:', error);
      return {
        success: false,
        results: [],
        totalResults: 0,
        query: request.query,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get content recommendations using cached data
   */
  getRecommendations(
    request: CachedRecommendationsRequest
  ): CachedRecommendationsResponse {
    try {
      const {
        query,
        contentType = 'all',
        maxResults = 3,
        excludeUrl,
        tags = [],
      } = request;

      // Get all content items based on type
      let allItems: CachedContentItem[] = [];

      if (contentType === 'all' || contentType === 'portfolio') {
        allItems.push(...this.portfolioItems);
      }
      if (contentType === 'all' || contentType === 'blog') {
        allItems.push(...this.blogItems);
      }
      if (contentType === 'all' || contentType === 'project') {
        allItems.push(...this.projectItems);
      }

      // Filter out excluded URL
      if (excludeUrl) {
        allItems = allItems.filter(item => item.url !== excludeUrl);
      }

      // Search through content
      const results = this.searchItems(allItems, query, tags, maxResults);

      return {
        success: true,
        results: results.map(item => this.addRelevanceScore(item, query, tags)),
        totalResults: results.length,
        query,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Cached content recommendations error:', error);
      return {
        success: false,
        results: [],
        totalResults: 0,
        query: request.query,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
    const queryLower = query.toLowerCase();
    const tagsLower = tags.map(tag => tag.toLowerCase());

    // Score items based on relevance
    const scoredItems = items.map(item => {
      let score = 0;

      // Title match (highest weight)
      if (item.title.toLowerCase().includes(queryLower)) {
        score += 25;
      }

      // Description match
      if (item.description.toLowerCase().includes(queryLower)) {
        score += 15;
      }

      // Content match
      if (item.content.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Tags match (exact matches get higher weight)
      const itemTags = item.tags.map(tag => tag.toLowerCase());
      const matchingTags = tagsLower.filter(tag => itemTags.includes(tag));
      score += matchingTags.length * 12;

      // Keywords match
      const itemKeywords = item.keywords.map(keyword => keyword.toLowerCase());
      const matchingKeywords = tagsLower.filter(keyword =>
        itemKeywords.includes(keyword)
      );
      score += matchingKeywords.length * 8;

      // Category match
      if (item.category.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Partial word matches for better semantic understanding
      const queryWords = queryLower.split(/\s+/);
      queryWords.forEach(word => {
        if (word.length > 2) {
          if (item.title.toLowerCase().includes(word)) score += 5;
          if (item.description.toLowerCase().includes(word)) score += 3;
          if (item.content.toLowerCase().includes(word)) score += 2;
        }
      });

      // Content quality bonus
      if (item.content.length > 200) score += 5;
      if (item.tags.length > 2) score += 3;
      if (item.keywords.length > 2) score += 2;

      return { item, score };
    });

    // Sort by score and return top results
    return scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ item }) => item);
  }

  /**
   * Add relevance score to content item
   */
  private addRelevanceScore(
    item: CachedContentItem,
    query: string,
    tags: string[]
  ): CachedContentItem {
    const queryLower = query.toLowerCase();
    const tagsLower = tags.map(tag => tag.toLowerCase());

    let score = 0;

    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 25;
    }

    // Description match
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 15;
    }

    // Content match
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Tags match (exact matches get higher weight)
    const itemTags = item.tags.map(tag => tag.toLowerCase());
    const matchingTags = tagsLower.filter(tag => itemTags.includes(tag));
    score += matchingTags.length * 12;

    // Keywords match
    const itemKeywords = item.keywords.map(keyword => keyword.toLowerCase());
    const matchingKeywords = tagsLower.filter(keyword =>
      itemKeywords.includes(keyword)
    );
    score += matchingKeywords.length * 8;

    // Category match
    if (item.category.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Partial word matches for better semantic understanding
    const queryWords = queryLower.split(/\s+/);
    queryWords.forEach(word => {
      if (word.length > 2) {
        if (item.title.toLowerCase().includes(word)) score += 5;
        if (item.description.toLowerCase().includes(word)) score += 3;
        if (item.content.toLowerCase().includes(word)) score += 2;
      }
    });

    // Content quality bonus
    if (item.content.length > 200) score += 5;
    if (item.tags.length > 2) score += 3;
    if (item.keywords.length > 2) score += 2;

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

    // Deduplicate tags to prevent duplication in the UI
    const deduplicatedTags = [...new Set(item.tags)];
    const deduplicatedKeywords = [...new Set(item.keywords)];

    return {
      ...item,
      tags: deduplicatedTags,
      keywords: deduplicatedKeywords,
      relevanceScore: normalizedScore,
    };
  }

  /**
   * Get all content items
   */
  getAllContent(): CachedContentItem[] {
    return this.allItems;
  }

  /**
   * Get content by type
   */
  getContentByType(
    contentType: 'blog' | 'portfolio' | 'project'
  ): CachedContentItem[] {
    console.log(`🔍 getContentByType called for: ${contentType}`);
    console.log(
      `📊 Current cache status - Portfolio: ${this.portfolioItems.length}, Blog: ${this.blogItems.length}, Projects: ${this.projectItems.length}`
    );

    // If no items are loaded yet, wait a bit and try again
    if (this.allItems.length === 0) {
      console.log('⏳ Cache is empty, waiting for initialization...');
      void new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      console.log(
        `📊 After wait - Portfolio: ${this.portfolioItems.length}, Blog: ${this.blogItems.length}, Projects: ${this.projectItems.length}`
      );
    }

    switch (contentType) {
      case 'portfolio':
        console.log(
          `📁 Returning ${this.portfolioItems.length} portfolio items`
        );
        return this.portfolioItems;
      case 'blog':
        console.log(`📝 Returning ${this.blogItems.length} blog items`);
        return this.blogItems;
      case 'project':
        console.log(`🚀 Returning ${this.projectItems.length} project items`);
        return this.projectItems;
      default:
        console.log(`❓ Unknown content type: ${String(contentType)}`);
        return [];
    }
  }

  /**
   * Get blog posts in BlogPost format for backward compatibility
   */
  getBlogPosts(): CachedContentItem[] {
    const blogItems = this.getContentByType('blog');

    // Convert CachedContentItem to include calculated fields
    return blogItems.map(item => ({
      ...item,
      readTime: this.calculateReadTime(item.content),
    }));
  }

  /**
   * Calculate reading time from content
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
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
      version: '1.0.0',
    };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.allItems.length > 0;
  }

  /**
   * Force reinitialization of Fuse.js (useful for content updates)
   */
  reinitializeFuse(): void {
    this.isFuseInitialized = false;
    this.fuse = null;
    this.initializeFuse();
  }

  /**
   * Check if Fuse.js semantic search is ready
   */
  isFuseReady(): boolean {
    return this.isFuseInitialized && this.fuse !== null;
  }
}

// Export singleton instance
export const cachedContentService = new CachedContentService();
