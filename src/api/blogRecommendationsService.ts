export interface PortfolioRecommendation {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
}

export interface BlogRecommendationsRequest {
  content: string
  title: string
  tags?: string[]
}

export interface BlogRecommendationsResponse {
  success: boolean
  recommendations: PortfolioRecommendation[]
  timestamp: string
  error?: string
  message?: string
}

class BlogRecommendationsService {
  private baseUrl: string

  constructor() {
    // Use environment variable or fallback to a default endpoint
    this.baseUrl = import.meta.env.VITE_BLOG_RECOMMENDATIONS_URL || 
                   'https://blog-recommendations.your-domain.com'
  }

  async getRecommendations(request: BlogRecommendationsRequest): Promise<BlogRecommendationsResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching blog recommendations:', error)
      throw error
    }
  }

  // Method to validate if the service is available
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      return response.ok
    } catch (error) {
      console.warn('Blog recommendations service health check failed:', error)
      return false
    }
  }

  // Method to get cached recommendations (if implemented)
  async getCachedRecommendations(blogId: string): Promise<PortfolioRecommendation[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/${blogId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.recommendations || null
      }
      return null
    } catch (error) {
      console.warn('Error fetching cached recommendations:', error)
      return null
    }
  }
}

// Export singleton instance
export const blogRecommendationsService = new BlogRecommendationsService()
