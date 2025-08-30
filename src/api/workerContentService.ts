/**
 * Worker Content Service
 * Interfaces with the Cloudflare Worker API for content search and recommendations
 */

export interface WorkerContentItem {
  id: string
  title: string
  description: string
  displayContent: string // Clean text content for display (no emojis, basic markdown cleaning)
  tags: string[]
  url: string
  contentType: 'blog' | 'portfolio' | 'project' | 'page'
  category?: string
  headings?: string[]
  lastModified?: string
}

export interface WorkerSearchRequest {
  query: string
  contentType?: 'blog' | 'portfolio' | 'project' | 'page' | 'all'
  maxResults?: number
  excludeUrl?: string
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
  contentType?: 'blog' | 'portfolio' | 'project' | 'page' | 'all'
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

class WorkerContentService {
  private baseUrl: string

  constructor() {
    // Always use production worker
    this.baseUrl = 'https://content-search.rcormier.workers.dev'
  }

  /**
   * Search content using the worker API
   */
  async searchContent(request: WorkerSearchRequest): Promise<WorkerSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: WorkerSearchResponse = await response.json()
      return data
    } catch (error) {
      console.error('Worker search error:', error)
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
   * Get content recommendations using the worker API
   */
  async getRecommendations(request: WorkerRecommendationsRequest): Promise<WorkerRecommendationsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: WorkerRecommendationsResponse = await response.json()
      return data
    } catch (error) {
      console.error('Worker recommendations error:', error)
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
   * Get related content based on current content
   */
  async getRelatedContent(
    title: string,
    tags: string[] = [],
    contentType?: 'blog' | 'portfolio' | 'project' | 'page',
    excludeUrl?: string,
    maxResults: number = 3
  ): Promise<WorkerContentItem[]> {
    try {
      const response = await this.getRecommendations({
        query: `${title} ${tags.join(' ')}`,
        contentType,
        maxResults,
        excludeUrl,
        tags
      })

      if (response.success) {
        return response.results
      }

      return []
    } catch (error) {
      console.error('Error getting related content:', error)
      return []
    }
  }

  /**
   * Search for content by query
   */
  async searchByQuery(
    query: string,
    contentType?: 'blog' | 'portfolio' | 'project' | 'page' | 'all',
    maxResults: number = 10
  ): Promise<WorkerContentItem[]> {
    try {
      const response = await this.searchContent({
        query,
        contentType,
        maxResults
      })

      if (response.success) {
        return response.results
      }

      return []
    } catch (error) {
      console.error('Error searching content:', error)
      return []
    }
  }

  /**
   * Get content by type
   */
  async getContentByType(
    contentType: 'blog' | 'portfolio' | 'project' | 'page',
    maxResults: number = 20
  ): Promise<WorkerContentItem[]> {
    try {
      const response = await this.searchContent({
        query: '', // Empty query to get all content of type
        contentType,
        maxResults
      })

      if (response.success) {
        return response.results
      }

      return []
    } catch (error) {
      console.error('Error getting content by type:', error)
      return []
    }
  }

  /**
   * Get content by tags
   */
  async getContentByTags(
    tags: string[],
    contentType?: 'blog' | 'portfolio' | 'project' | 'page' | 'all',
    maxResults: number = 10
  ): Promise<WorkerContentItem[]> {
    try {
      const response = await this.searchContent({
        query: tags.join(' '),
        contentType,
        maxResults,
        tags
      })

      if (response.success) {
        return response.results
      }

      return []
    } catch (error) {
      console.error('Error getting content by tags:', error)
      return []
    }
  }
}

// Export singleton instance
export const workerContentService = new WorkerContentService()


