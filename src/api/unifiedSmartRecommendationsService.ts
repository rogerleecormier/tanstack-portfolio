// Unified Smart Recommendations Service
// Provides intelligent content recommendations across all content types
// Uses the same markdown indexing logic as the contact form

import { loadMarkdownFiles } from '@/utils/dynamicSearchData'
import type { SearchItem } from '@/types/search'

export interface UnifiedContentItem {
  id: string
  title: string
  description: string
  tags: string[]
  url: string
  contentType: 'blog' | 'portfolio' | 'project' | 'page'
  confidence: number
  category?: string
}

export interface UnifiedRecommendationsRequest {
  content: string
  title: string
  tags?: string[]
  contentType?: 'blog' | 'portfolio' | 'project' | 'page'
  excludeUrl?: string // URL to exclude from recommendations
  maxResults?: number // Maximum number of recommendations to return
}

export interface UnifiedRecommendationsResponse {
  success: boolean
  recommendations: UnifiedContentItem[]
  error?: string
  timestamp: string
}

  // Enhanced content matching algorithm
  function calculateContentRelevanceScore(
    sourceContent: string,
    sourceTitle: string,
    sourceTags: string[],
    targetItem: SearchItem
  ): number {
    try {
      let score = 0
      const sourceText = (sourceContent + ' ' + sourceTitle).toLowerCase()
      const targetTags = targetItem.tags || []
      
      // 1. Exact tag matches (highest weight - 35%)
      const exactTagMatches = sourceTags.filter(sourceTag => 
        targetTags.some(targetTag => 
          targetTag.toLowerCase() === sourceTag.toLowerCase()
        )
      ).length
      
      const exactTagScore = sourceTags.length > 0 ? (exactTagMatches / sourceTags.length) * 0.35 : 0
      score += exactTagScore
      
      // 2. Partial tag matches (30%) - increased weight for better scaling
      const partialTagMatches = sourceTags.filter(sourceTag => 
        targetTags.some(targetTag => {
          const sourceLower = sourceTag.toLowerCase()
          const targetLower = targetTag.toLowerCase()
          return targetLower.includes(sourceLower) || sourceLower.includes(targetLower)
        })
      ).length
      
      const partialTagScore = sourceTags.length > 0 ? (partialTagMatches / sourceTags.length) * 0.30 : 0
      score += partialTagScore
      
      // 3. Content keyword matches (25%) - increased weight and better matching
      let keywordMatches = 0
      
      for (const tag of targetTags) {
        const tagLower = tag.toLowerCase()
        if (sourceText.includes(tagLower)) {
          keywordMatches += 1
        } else {
          // Check for word boundaries and partial matches
          const tagWords = tagLower.split(/[\s-]+/)
          for (const word of tagWords) {
            if (word.length > 2) { // Reduced minimum length for better matching
              try {
                const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                const wordRegex = new RegExp(`\\b${escapedWord}\\b`, 'i')
                if (wordRegex.test(sourceText)) {
                  keywordMatches += 0.5
                }
              } catch (regexError) {
                // Skip this word if regex creation fails
                console.warn('Failed to create regex for word:', word, regexError)
              }
            }
          }
        }
      }
      
      const keywordScore = targetTags.length > 0 ? Math.min(keywordMatches / targetTags.length, 1) * 0.25 : 0
      score += keywordScore
      
      // 4. Content type relevance (15%) - increased bonus for better scaling
      const contentTypeBonus = {
        'portfolio': 0.15,
        'blog': 0.12,
        'project': 0.18,
        'page': 0.08
      }
      
      score += contentTypeBonus[targetItem.contentType] || 0.08
      
      // 5. Content length bonus (10%) - increased for better scaling
      if (sourceContent.length > 100) {
        score += 0.10
      }
      
      // 6. Title similarity bonus (5%) - new scoring dimension
      const titleWords = sourceTitle.toLowerCase().split(/\s+/)
      const targetTitleWords = (targetItem.title || '').toLowerCase().split(/\s+/)
      const titleMatches = titleWords.filter(word => 
        word.length > 3 && targetTitleWords.some(targetWord => 
          targetWord.includes(word) || word.includes(targetWord)
        )
      ).length
      
      const titleScore = titleWords.length > 0 ? (titleMatches / titleWords.length) * 0.05 : 0
      score += titleScore
      
      return Math.min(Math.max(score, 0), 1)
    } catch (error) {
      console.error('Error calculating content relevance score:', error)
      // Return a minimal score instead of failing completely
      return 0.05
    }
  }

// Convert SearchItem to UnifiedContentItem
function convertToUnifiedItem(item: SearchItem, confidence: number): UnifiedContentItem {
  return {
    id: item.id || item.url,
    title: item.title,
    description: item.description || '',
    tags: item.tags || [],
    url: item.url,
    contentType: item.contentType,
    confidence,
    category: item.section
  }
}

class UnifiedSmartRecommendationsService {
  private cachedSearchItems: SearchItem[] = []
  private isInitialized = false

  // Initialize the service by loading markdown files
  private async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      this.cachedSearchItems = await loadMarkdownFiles()
      this.isInitialized = true
      console.log(`Unified recommendations service initialized with ${this.cachedSearchItems.length} items`)
    } catch (error) {
      console.error('Failed to initialize unified recommendations service:', error)
      throw error
    }
  }

  // Get smart recommendations based on content analysis
  async getRecommendations(request: UnifiedRecommendationsRequest): Promise<UnifiedRecommendationsResponse> {
    try {
      await this.initialize()
      
      const { content, title, tags = [], excludeUrl, maxResults = 2 } = request
      
      // Debug logging
      console.log('Recommendations request:', { contentLength: content?.length, title, tags, excludeUrl, maxResults })
      console.log('Available search items:', this.cachedSearchItems.length)
      
      // Validate input
      if (!content || !title) {
        console.log('Invalid input - missing content or title')
        return {
          success: false,
          error: 'Content and title are required',
          recommendations: [],
          timestamp: new Date().toISOString()
        }
      }
      
      // Filter out the current page, About page (homepage), and calculate relevance scores
      const scoredItems = this.cachedSearchItems
        .filter(item => 
          item.url !== excludeUrl && 
          item.url !== '/' && 
          item.url !== '/about' && 
          item.id !== 'about'
        )
        .map(item => ({
          ...item,
          relevance: calculateContentRelevanceScore(content, title, tags, item)
        }))
        .sort((a, b) => b.relevance - a.relevance)
      
      // First try to get items with relevance > 0.1
      let relevantItems = scoredItems.filter(item => item.relevance > 0.1)
      
      // If not enough relevant items, include lower scoring items
      if (relevantItems.length < maxResults) {
        const remainingItems = scoredItems.filter(item => item.relevance <= 0.1)
        relevantItems = [...relevantItems, ...remainingItems.slice(0, maxResults - relevantItems.length)]
      }
      
      // Take the top items
      const finalItems = relevantItems.slice(0, maxResults)
      
      console.log('Scored items:', scoredItems.length, 'total')
      console.log('Relevant items (>0.1):', relevantItems.filter(item => item.relevance > 0.1).length)
      console.log('Top scored items:', finalItems.slice(0, 3).map(item => ({ title: item.title, relevance: item.relevance })))
      
      // Convert to unified format
      const recommendations = finalItems.map(({ relevance, ...item }) =>
        convertToUnifiedItem(item, relevance)
      )
      
      console.log('Final recommendations:', recommendations.length)
      
      return {
        success: true,
        recommendations,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Unified recommendations error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  // Get recommendations by content type
  async getRecommendationsByType(
    contentType: 'blog' | 'portfolio' | 'project' | 'page',
    excludeUrl?: string,
    maxResults: number = 2
  ): Promise<UnifiedRecommendationsResponse> {
    try {
      await this.initialize()
      
      const filteredItems = this.cachedSearchItems
        .filter(item => 
          item.contentType === contentType && 
          item.url !== excludeUrl &&
          item.url !== '/' && 
          item.url !== '/about' && 
          item.id !== 'about'
        )
        .slice(0, maxResults)
        .map(item => convertToUnifiedItem(item, 0.8))
      
      return {
        success: true,
        recommendations: filteredItems,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Type-based recommendations error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  // Get all content items (for debugging/testing)
  async getAllContentItems(): Promise<UnifiedContentItem[]> {
    try {
      await this.initialize()
      
      return this.cachedSearchItems.map(item => 
        convertToUnifiedItem(item, 0.8)
      )
    } catch (error) {
      console.error('Failed to get all content items:', error)
      return []
    }
  }

  // Refresh the content cache
  async refreshCache(): Promise<void> {
    this.isInitialized = false
    this.cachedSearchItems = []
    await this.initialize()
  }
}

export const unifiedSmartRecommendationsService = new UnifiedSmartRecommendationsService()
