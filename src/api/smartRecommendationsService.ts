// Smart Content-Based Recommendations Service
// Reads from content front matter for dynamic recommendations

export interface ContentItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  keywords?: string[]
  confidence?: number
  contentType: 'blog' | 'portfolio' | 'project'
  frontMatter?: Record<string, unknown>
}

export interface ContentRecommendationsRequest {
  content: string
  title: string
  tags?: string[]
  contentType?: 'blog' | 'portfolio' | 'project'
}

export interface ContentRecommendationsResponse {
  success: boolean
  recommendations: ContentItem[]
  error?: string
  timestamp: string
}

// Content data from front matter - simplified approach
const CONTENT_ITEMS: ContentItem[] = [
  // Portfolio content
  {
    id: 'strategy',
    title: 'Strategy & Consulting',
    description: 'Strategic planning, digital transformation, and organizational consulting to drive sustainable growth and competitive advantage.',
    tags: ['strategy', 'consulting', 'digital-transformation', 'planning', 'growth', 'business', 'roadmap', 'vision'],
    category: 'Strategy & Consulting',
    url: '/strategy',
    keywords: ['planning', 'transformation', 'growth', 'competitive', 'advantage', 'roadmap'],
    contentType: 'portfolio'
  },
  {
    id: 'leadership',
    title: 'Leadership & Culture',
    description: 'Building high-performing teams through strategic leadership, cultural transformation, and organizational development.',
    tags: ['leadership', 'culture', 'team-building', 'organizational-development', 'change-management', 'management', 'governance'],
    category: 'Leadership & Culture',
    url: '/leadership',
    keywords: ['team', 'organization', 'culture', 'change', 'transformation', 'governance'],
    contentType: 'portfolio'
  },
  {
    id: 'technology',
    title: 'Technology & Operations',
    description: 'Technology strategy, DevOps implementation, infrastructure automation, and operational excellence to accelerate delivery and improve reliability.',
    tags: ['technology', 'operations', 'devops', 'infrastructure', 'automation', 'reliability', 'digital', 'platform'],
    category: 'Technology & Operations',
    url: '/technology',
    keywords: ['development', 'operations', 'infrastructure', 'automation', 'delivery', 'platform'],
    contentType: 'portfolio'
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    description: 'Implementing intelligent automation solutions, AI workflows, and machine learning systems to optimize business processes.',
    tags: ['ai', 'automation', 'machine-learning', 'workflow', 'optimization', 'intelligence', 'artificial-intelligence'],
    category: 'AI & Automation',
    url: '/ai-automation',
    keywords: ['artificial intelligence', 'machine learning', 'workflow', 'process', 'optimization', 'intelligent'],
    contentType: 'portfolio'
  },
  {
    id: 'analytics',
    title: 'Data & Analytics',
    description: 'Data-driven decision making, analytics implementation, and business intelligence to uncover insights and drive growth.',
    tags: ['analytics', 'data', 'business-intelligence', 'insights', 'decision-making', 'metrics', 'reporting'],
    category: 'Data & Analytics',
    url: '/analytics',
    keywords: ['data', 'insights', 'business intelligence', 'metrics', 'decision', 'reporting'],
    contentType: 'portfolio'
  },
  {
    id: 'risk-compliance',
    title: 'Risk & Compliance',
    description: 'Risk management frameworks, compliance programs, and governance structures to protect organizations and ensure regulatory adherence.',
    tags: ['risk', 'compliance', 'governance', 'regulatory', 'protection', 'security', 'audit', 'standards'],
    category: 'Risk & Compliance',
    url: '/risk-compliance',
    keywords: ['risk management', 'compliance', 'regulatory', 'protection', 'security', 'audit'],
    contentType: 'portfolio'
  },
  // Blog content
  {
    id: 'leadership-blog',
    title: 'Leadership Development',
    description: 'Building effective leadership skills and organizational culture for high-performing teams.',
    tags: ['leadership', 'management', 'culture', 'team-building', 'development'],
    category: 'Leadership',
    url: '/blog/leadership',
    keywords: ['leadership', 'management', 'culture', 'team'],
    contentType: 'blog'
  },
  {
    id: 'culture-blog',
    title: 'Organizational Culture',
    description: 'Creating and sustaining positive organizational cultures that drive success and employee engagement.',
    tags: ['culture', 'organization', 'engagement', 'values', 'behaviors'],
    category: 'Culture',
    url: '/blog/culture',
    keywords: ['culture', 'organization', 'engagement'],
    contentType: 'blog'
  },
  {
    id: 'strategy-blog',
    title: 'Strategic Planning',
    description: 'Developing and executing strategic initiatives that align with business objectives and drive growth.',
    tags: ['strategy', 'planning', 'growth', 'business', 'objectives'],
    category: 'Strategy',
    url: '/blog/strategy',
    keywords: ['strategy', 'planning', 'growth'],
    contentType: 'blog'
  },
  {
    id: 'devops-blog',
    title: 'DevOps & Automation',
    description: 'Implementing DevOps practices and automation to improve software delivery and operational efficiency.',
    tags: ['devops', 'automation', 'ci-cd', 'deployment', 'infrastructure'],
    category: 'Technology',
    url: '/blog/devops',
    keywords: ['devops', 'automation', 'deployment'],
    contentType: 'blog'
  },
  // Project content
  {
    id: 'healthbridge',
    title: 'HealthBridge Project',
    description: 'Healthcare technology platform development with focus on patient care and system integration.',
    tags: ['healthcare', 'technology', 'platform', 'integration', 'patient-care'],
    category: 'Healthcare',
    url: '/projects/healthbridge',
    keywords: ['healthcare', 'technology', 'platform'],
    contentType: 'project'
  },
  // Add ERP-related content
  {
    id: 'erp-implementation',
    title: 'ERP Implementation & Integration',
    description: 'Enterprise Resource Planning system implementation, customization, and integration with existing business processes.',
    tags: ['erp', 'enterprise', 'implementation', 'integration', 'business-processes', 'systems'],
    category: 'Technology & Operations',
    url: '/erp-implementation',
    keywords: ['erp', 'enterprise', 'implementation', 'integration', 'business processes'],
    contentType: 'portfolio'
  },
  {
    id: 'erp-blog',
    title: 'ERP Best Practices',
    description: 'Best practices for ERP implementation, customization, and optimization for business efficiency.',
    tags: ['erp', 'best-practices', 'implementation', 'optimization', 'business-efficiency'],
    category: 'Technology',
    url: '/blog/erp-best-practices',
    keywords: ['erp', 'best practices', 'implementation', 'optimization'],
    contentType: 'blog'
  },
  {
    id: 'erp-project',
    title: 'ERP Migration Project',
    description: 'Large-scale ERP migration project involving data migration, process optimization, and user training.',
    tags: ['erp', 'migration', 'data-migration', 'process-optimization', 'training'],
    category: 'Technology',
    url: '/projects/erp-migration',
    keywords: ['erp', 'migration', 'data migration', 'process optimization'],
    contentType: 'project'
  }
]

// Enhanced content matching algorithm with better accuracy
function calculateContentRelevanceScore(
  messageContent: string, 
  messageTitle: string, 
  messageTags: string[], 
  contentItem: ContentItem
): number {
  let score = 0
  const contentLower = (messageContent + ' ' + messageTitle).toLowerCase()
  const allContentTags = [...contentItem.tags, ...(contentItem.keywords || [])]
  
  // 1. Exact tag matches (highest weight - 50%)
  const exactTagMatches = messageTags.filter(messageTag => 
    allContentTags.some(contentTag => 
      contentTag.toLowerCase() === messageTag.toLowerCase()
    )
  ).length
  
  const exactTagScore = messageTags.length > 0 ? (exactTagMatches / messageTags.length) * 0.5 : 0
  score += exactTagScore
  
  // 2. Partial tag matches (30%) - more strict matching
  const partialTagMatches = messageTags.filter(messageTag => 
    allContentTags.some(contentTag => 
      contentTag.toLowerCase().includes(messageTag.toLowerCase()) ||
      messageTag.toLowerCase().includes(contentTag.toLowerCase())
    )
  ).length
  
  const partialTagScore = messageTags.length > 0 ? (partialTagMatches / messageTags.length) * 0.3 : 0
  score += partialTagScore
  
  // 3. Content keyword matches (20%) - exact matches only
  let keywordMatches = 0
  for (const tag of allContentTags) {
    const tagLower = tag.toLowerCase()
    // Only count exact matches or very close matches
    if (contentLower.includes(tagLower)) {
      keywordMatches += 1
    } else {
      // Check for word boundaries to avoid false matches
      const tagWords = tagLower.split(/[\s-]+/)
      for (const word of tagWords) {
        if (word.length > 3) {
          // Use word boundary matching to avoid partial word matches
          const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
          if (wordRegex.test(contentLower)) {
            keywordMatches += 0.5
          }
        }
      }
    }
  }
  
  const keywordScore = allContentTags.length > 0 ? Math.min(keywordMatches / allContentTags.length, 1) * 0.2 : 0
  score += keywordScore
  
  // 4. Content type relevance (small bonus - 2%)
  const contentTypeBonus = {
    'portfolio': 0.02,
    'blog': 0.015,
    'project': 0.025
  }
  
  score += contentTypeBonus[contentItem.contentType] || 0.01
  
  // 5. Content length bonus (small bonus - 1%)
  if (messageContent.length > 100) {
    score += 0.01
  }
  
  // Return raw score without artificial boosting
  return Math.min(Math.max(score, 0), 1)
}

// Generate smart recommendations based on message content analysis
function generateSmartRecommendations(
  messageContent: string, 
  messageTitle: string, 
  messageTags: string[]
): ContentItem[] {
  if (!messageContent || !messageTitle) {
    return []
  }
  
  // Calculate relevance scores for all content items
  const scoredItems = CONTENT_ITEMS.map(item => ({
    ...item,
    relevance: calculateContentRelevanceScore(messageContent, messageTitle, messageTags, item)
  }))
  
  // Filter items with meaningful relevance (higher threshold for accuracy)
  const relevantItems = scoredItems
    .filter(item => item.relevance > 0.15) // Higher threshold for better accuracy
    .sort((a, b) => b.relevance - a.relevance)
  
  // Return only truly relevant items (1-4 based on actual relevance)
  const topItems = relevantItems.slice(0, 4)
  
  // If no relevant items found, return empty array
  if (topItems.length === 0) {
    return []
  }
  
  return topItems.map(({ relevance, ...item }) => ({
    ...item,
    confidence: relevance
  }))
}

class SmartRecommendationsService {
  async getRecommendations(request: ContentRecommendationsRequest): Promise<ContentRecommendationsResponse> {
    try {
      const { content, title, tags = [] } = request
      
      // Validate input
      if (!content || !title) {
        return {
          success: false,
          error: 'Content and title are required',
          recommendations: [],
          timestamp: new Date().toISOString()
        }
      }
      
      // Generate smart recommendations
      const recommendations = generateSmartRecommendations(content, title, tags)
      
      return {
        success: true,
        recommendations,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Smart recommendations error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [],
        timestamp: new Date().toISOString()
      }
    }
  }
  
  // Get all content items
  async getAllContentItems(): Promise<ContentItem[]> {
    return CONTENT_ITEMS.map(item => ({
      ...item,
      confidence: 0.8
    }))
  }
  
  // Get content item by ID
  async getContentItem(id: string): Promise<ContentItem | undefined> {
    const item = CONTENT_ITEMS.find(item => item.id === id)
    return item ? { ...item, confidence: 0.8 } : undefined
  }
  
  // Search content items by query
  async searchContentItems(query: string): Promise<ContentItem[]> {
    if (!query.trim()) return CONTENT_ITEMS.map(item => ({ ...item, confidence: 0.8 }))
    
    const queryLower = query.toLowerCase()
    return CONTENT_ITEMS
      .filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        item.category.toLowerCase().includes(queryLower)
      )
      .map(item => ({ ...item, confidence: 0.8 }))
  }
  
  // Get content by type
  async getContentByType(contentType: 'blog' | 'portfolio' | 'project'): Promise<ContentItem[]> {
    return CONTENT_ITEMS
      .filter(item => item.contentType === contentType)
      .map(item => ({ ...item, confidence: 0.8 }))
  }
}

export const smartRecommendationsService = new SmartRecommendationsService()
