// Smart Tag-Based Recommendations Service
// Replaces AI workers with efficient tag matching and content analysis

export interface PortfolioItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  keywords?: string[]
  confidence?: number
}

export interface BlogRecommendationsRequest {
  content: string
  title: string
  tags?: string[]
}

export interface BlogRecommendationsResponse {
  success: boolean
  recommendations: PortfolioItem[]
  error?: string
  timestamp: string
}

// Portfolio data - Simplified with 6 consistent categories
const PORTFOLIO_ITEMS: Omit<PortfolioItem, 'confidence'>[] = [
  {
    id: 'strategy-consulting',
    title: 'Strategy & Consulting',
    description: 'Strategic planning, digital transformation, and organizational consulting to drive sustainable growth and competitive advantage.',
    tags: ['strategy', 'consulting', 'digital-transformation', 'planning', 'growth', 'business', 'roadmap', 'vision'],
    category: 'Strategy & Consulting',
    url: '/strategy',
    keywords: ['planning', 'transformation', 'growth', 'competitive', 'advantage', 'roadmap']
  },
  {
    id: 'leadership-culture',
    title: 'Leadership & Culture',
    description: 'Building high-performing teams through strategic leadership, cultural transformation, and organizational development.',
    tags: ['leadership', 'culture', 'team-building', 'organizational-development', 'change-management', 'management', 'governance'],
    category: 'Leadership & Culture',
    url: '/leadership',
    keywords: ['team', 'organization', 'culture', 'change', 'transformation', 'governance']
  },
  {
    id: 'technology-operations',
    title: 'Technology & Operations',
    description: 'Technology strategy, DevOps implementation, infrastructure automation, and operational excellence to accelerate delivery and improve reliability.',
    tags: ['technology', 'operations', 'devops', 'infrastructure', 'automation', 'reliability', 'digital', 'platform'],
    category: 'Technology & Operations',
    url: '/technology',
    keywords: ['development', 'operations', 'infrastructure', 'automation', 'delivery', 'platform']
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    description: 'Implementing intelligent automation solutions, AI workflows, and machine learning systems to optimize business processes.',
    tags: ['ai', 'automation', 'machine-learning', 'workflow', 'optimization', 'intelligence', 'artificial-intelligence'],
    category: 'AI & Automation',
    url: '/ai-automation',
    keywords: ['artificial intelligence', 'machine learning', 'workflow', 'process', 'optimization', 'intelligent']
  },
  {
    id: 'data-analytics',
    title: 'Data & Analytics',
    description: 'Data-driven decision making, analytics implementation, and business intelligence to uncover insights and drive growth.',
    tags: ['analytics', 'data', 'business-intelligence', 'insights', 'decision-making', 'metrics', 'reporting'],
    category: 'Data & Analytics',
    url: '/analytics',
    keywords: ['data', 'insights', 'business intelligence', 'metrics', 'decision', 'reporting']
  },
  {
    id: 'risk-compliance',
    title: 'Risk & Compliance',
    description: 'Risk management frameworks, compliance programs, and governance structures to protect organizations and ensure regulatory adherence.',
    tags: ['risk', 'compliance', 'governance', 'regulatory', 'protection', 'security', 'audit', 'standards'],
    category: 'Risk & Compliance',
    url: '/risk-compliance',
    keywords: ['risk management', 'compliance', 'regulatory', 'protection', 'security', 'audit']
  }
]

// Smart tag matching algorithm - completely rewritten for better relevance
function calculateRelevanceScore(blogContent: string, blogTitle: string, blogTags: string[], portfolioItem: Omit<PortfolioItem, 'confidence'>): number {
  let score = 0
  const contentLower = (blogContent + ' ' + blogTitle).toLowerCase()
  const allPortfolioTags = [...portfolioItem.tags, ...(portfolioItem.keywords || [])]
  
  // 1. Direct tag matches (highest weight - 40%)
  const tagMatches = blogTags.filter(blogTag => 
    allPortfolioTags.some(portfolioTag => 
      portfolioTag.toLowerCase().includes(blogTag.toLowerCase()) ||
      blogTag.toLowerCase().includes(portfolioTag.toLowerCase())
    )
  ).length
  
  // Normalize tag matches by total blog tags to avoid bias
  const tagScore = blogTags.length > 0 ? (tagMatches / blogTags.length) * 0.4 : 0
  score += tagScore
  
  // 2. Content keyword matches (30%) - more sophisticated
  let keywordMatches = 0
  for (const tag of allPortfolioTags) {
    const tagLower = tag.toLowerCase()
    // Check for exact matches first
    if (contentLower.includes(tagLower)) {
      keywordMatches += 1
    } else {
      // Check for partial matches and related terms
      const tagWords = tagLower.split(/[\s-]+/)
      for (const word of tagWords) {
        if (word.length > 3 && contentLower.includes(word)) {
          keywordMatches += 0.5
        }
      }
    }
  }
  
  // Normalize keyword matches by total portfolio tags
  const keywordScore = allPortfolioTags.length > 0 ? Math.min(keywordMatches / allPortfolioTags.length, 1) * 0.3 : 0
  score += keywordScore
  
  // 3. Semantic similarity (20%) - expanded concept mapping
  let semanticMatches = 0
  const semanticMappings = {
    // Technology & Development
    'technology': ['digital', 'software', 'development', 'engineering', 'automation', 'ai', 'machine learning'],
    'automation': ['efficiency', 'workflow', 'process', 'streamline', 'optimize', 'ai', 'intelligent'],
    'ai': ['artificial intelligence', 'machine learning', 'intelligent', 'smart', 'automation', 'neural'],
    'cloud': ['azure', 'aws', 'serverless', 'scalable', 'infrastructure', 'platform'],
    'serverless': ['functions', 'scalable', 'event-driven', 'cloud-native', 'microservices'],
    
    // Business & Strategy
    'strategy': ['planning', 'roadmap', 'vision', 'goals', 'objectives', 'direction', 'approach'],
    'leadership': ['management', 'governance', 'direction', 'decision-making', 'team', 'culture'],
    'transformation': ['change', 'modernization', 'evolution', 'improvement', 'innovation', 'digital'],
    'governance': ['compliance', 'risk', 'policies', 'standards', 'oversight', 'management'],
    
    // Operations & Processes
    'operations': ['processes', 'workflows', 'efficiency', 'optimization', 'automation', 'management'],
    'data': ['analytics', 'insights', 'information', 'metrics', 'reporting', 'intelligence'],
    'compliance': ['regulatory', 'standards', 'policies', 'risk', 'governance', 'audit'],
    
    // People & Culture
    'talent': ['people', 'hr', 'recruitment', 'development', 'training', 'capability'],
    'culture': ['values', 'behaviors', 'environment', 'team', 'collaboration', 'engagement']
  }
  
  for (const [portfolioTag, relatedTerms] of Object.entries(semanticMappings)) {
    if (allPortfolioTags.some(tag => tag.toLowerCase().includes(portfolioTag))) {
      for (const relatedTerm of relatedTerms) {
        if (contentLower.includes(relatedTerm)) {
          semanticMatches += 1
          break // Only count once per portfolio tag
        }
      }
    }
  }
  
  // Normalize semantic matches
  const semanticScore = Math.min(semanticMatches / Math.max(allPortfolioTags.length, 1), 1) * 0.2
  score += semanticScore
  
  // 4. Category relevance (10%) - improved matching
  const categoryLower = portfolioItem.category.toLowerCase()
  let categoryScore = 0
  
  // Check if blog tags or content relate to the category
  for (const blogTag of blogTags) {
    if (categoryLower.includes(blogTag.toLowerCase()) || blogTag.toLowerCase().includes(categoryLower)) {
      categoryScore = 0.1
      break
    }
  }
  
  // Also check content for category-related terms
  if (categoryScore === 0) {
    const categoryKeywords = {
      'Strategy & Consulting': ['strategy', 'consulting', 'planning', 'roadmap', 'vision', 'transformation'],
      'Leadership & Culture': ['leadership', 'management', 'culture', 'team', 'governance', 'organizational'],
      'Technology & Operations': ['technology', 'operations', 'automation', 'digital', 'infrastructure', 'devops'],
      'AI & Automation': ['ai', 'automation', 'intelligent', 'machine learning', 'workflow', 'artificial intelligence'],
      'Data & Analytics': ['data', 'analytics', 'insights', 'metrics', 'reporting', 'business intelligence'],
      'Risk & Compliance': ['risk', 'compliance', 'regulatory', 'governance', 'security', 'audit']
    }
    
    const keywords = categoryKeywords[portfolioItem.category as keyof typeof categoryKeywords] || []
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        categoryScore = 0.1
        break
      }
    }
  }
  
  score += categoryScore
  
  // 5. Content length bonus - longer content gets slight bonus for better analysis
  if (blogContent.length > 1000) {
    score += 0.05
  }
  
  // Normalize score to 0-1 range
  return Math.min(Math.max(score, 0), 1)
}

// Generate smart recommendations based on content analysis
function generateSmartRecommendations(blogContent: string, blogTitle: string, blogTags: string[]): PortfolioItem[] {
  if (!blogContent || !blogTitle) {
    return []
  }
  
  // Calculate relevance scores for all portfolio items
  const scoredItems = PORTFOLIO_ITEMS.map(item => ({
    ...item,
    relevance: calculateRelevanceScore(blogContent, blogTitle, blogTags, item)
  }))
  
  // Filter items with meaningful relevance (above threshold)
  const relevantItems = scoredItems
    .filter(item => item.relevance > 0.15) // Increased threshold to 15% for better quality
    .sort((a, b) => b.relevance - a.relevance)
  
  // If we have enough relevant items, return top 2
  if (relevantItems.length >= 2) {
    return relevantItems.slice(0, 2).map(({ relevance, ...item }) => ({
      ...item,
      confidence: relevance
    }))
  }
  
  // If we have 1 relevant item, find a complementary one
  if (relevantItems.length === 1) {
    const complementary = scoredItems
      .filter(item => item.id !== relevantItems[0].id)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 1)
    
    return [
      { ...relevantItems[0], confidence: relevantItems[0].relevance },
      { ...complementary[0], confidence: Math.max(complementary[0].relevance, 0.5) }
    ]
  }
  
  // Fallback: return top 2 by relevance, but ensure variety
  const topByRelevance = scoredItems
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3) // Get top 3 to have variety
  
  // Ensure we don't always return the same items by adding some randomness
  const shuffled = [...topByRelevance].sort(() => Math.random() - 0.5)
  
  return shuffled.slice(0, 2).map(({ relevance, ...item }) => ({
    ...item,
    confidence: Math.max(relevance, 0.5) // Minimum 50% confidence for fallback
  }))
}

class SmartRecommendationsService {
  async getRecommendations(request: BlogRecommendationsRequest): Promise<BlogRecommendationsResponse> {
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
  
  // Get all portfolio items for other uses
  getAllPortfolioItems(): PortfolioItem[] {
    return PORTFOLIO_ITEMS.map(item => ({
      ...item,
      confidence: 0.7 // Default confidence
    }))
  }
  
  // Get portfolio item by ID
  getPortfolioItem(id: string): PortfolioItem | undefined {
    const item = PORTFOLIO_ITEMS.find(item => item.id === id)
    return item ? { ...item, confidence: 0.7 } : undefined
  }
  
  // Search portfolio items by query
  searchPortfolioItems(query: string): PortfolioItem[] {
    if (!query.trim()) return this.getAllPortfolioItems()
    
    const queryLower = query.toLowerCase()
    return PORTFOLIO_ITEMS
      .filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        item.category.toLowerCase().includes(queryLower)
      )
      .map(item => ({ ...item, confidence: 0.7 }))
  }
}

export const smartRecommendationsService = new SmartRecommendationsService()
