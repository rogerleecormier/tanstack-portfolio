# AI Integration Guide

Comprehensive guide to the AI-powered features integrated throughout the TanStack Portfolio site, including implementation details, configuration, and usage.

## 🤖 Overview

The portfolio site integrates multiple AI-powered features to enhance user experience, content discovery, and form processing:

- **AI Contact Form Analysis**: Intelligent inquiry classification and priority assessment
- **Smart Content Recommendations**: AI-driven content suggestions across all pages
- **AI Portfolio Assistant**: Intelligent portfolio guidance and insights
- **AI Meeting Scheduler**: Enhanced meeting coordination
- **Content Intelligence**: Automated content analysis and optimization

## 🧠 AI Contact Form Analysis

### Overview

The contact form uses Cloudflare AI Workers to automatically analyze and classify incoming inquiries, providing intelligent responses and follow-up questions.

### Features

- **Inquiry Classification**: Automatically categorizes inquiries by type and priority
- **Industry Identification**: Detects industry context from message content
- **Priority Assessment**: AI-powered urgency and importance evaluation
- **Follow-up Questions**: Generates contextually relevant follow-up questions
- **Spam Detection**: Intelligent spam and abuse prevention
- **Response Optimization**: Suggests optimal response strategies

### Implementation

#### Frontend Integration

```typescript
// src/components/ContactAnalysis.tsx
import { analyzeContactForm } from '@/api/contactAnalyzer'

const ContactAnalysis: React.FC<{ analysis: AIAnalysisResult | null }> = ({ analysis }) => {
  // Renders AI analysis results with visual indicators
  // Shows priority levels, industry context, and recommendations
}
```

#### AI Worker Configuration

```javascript
// functions/ai-contact-analyzer.js
const ANALYSIS_SCHEMA = {
  inquiryType: ['consultation', 'project', 'partnership', 'general', 'urgent'],
  priorityLevel: ['high', 'medium', 'low'],
  industry: ['technology', 'healthcare', 'finance', 'manufacturing', 'retail', 'education', 'government', 'nonprofit', 'startup', 'enterprise', 'other'],
  projectScope: ['small', 'medium', 'large', 'enterprise'],
  urgency: ['immediate', 'soon', 'flexible'],
  meetingType: ['consultation', 'project-planning', 'technical-review', 'strategy-session', 'general-discussion']
}
```

#### API Integration

```typescript
// src/api/contactAnalyzer.ts
export async function analyzeContactForm(formData: ContactFormData): Promise<AIAnalysisResult> {
  const response = await fetch(AI_WORKER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  
  if (response.ok) {
    return await response.json()
  }
  
  // Fallback to keyword-based analysis
  return createFallbackAnalysis(formData)
}
```

### Configuration

#### Environment Variables

```bash
# AI Worker endpoint
AI_WORKER_ENDPOINT=https://ai-contact-analyzer.rcormier.workers.dev

# Rate limiting
MAX_RETRIES=2
RETRY_DELAY=1000
```

#### Rate Limiting

```javascript
const RATE_LIMITS = {
  requestsPerMinute: 5,
  requestsPerHour: 20,
  burstLimit: 3
}
```

## 🔍 Smart Content Recommendations

### Overview

The site provides intelligent content recommendations across all pages, suggesting relevant portfolio items, blog posts, and projects based on user context and content analysis.

### Features

- **Context-Aware Suggestions**: Recommendations based on current page content
- **Cross-Content Relationships**: Links between portfolio, blog, and project content
- **Tag-Based Matching**: Intelligent tag correlation and relevance scoring
- **User Behavior Analysis**: Recommendations based on user interaction patterns
- **Content Type Filtering**: Filtered suggestions by content type

### Implementation

#### Recommendation Service

```typescript
// src/api/unifiedSmartRecommendationsService.ts
export class UnifiedSmartRecommendationsService {
  async getRecommendations(request: UnifiedRecommendationsRequest): Promise<UnifiedRecommendationsResponse> {
    const { content, title, tags, contentType, excludeUrl, maxResults = 5 } = request
    
    // Calculate relevance scores for all content items
    const scoredItems = await this.calculateContentRelevance(content, title, tags, contentType)
    
    // Filter and sort by relevance
    const recommendations = scoredItems
      .filter(item => item.url !== excludeUrl)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults)
    
    return {
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    }
  }
}
```

#### Relevance Scoring Algorithm

```typescript
function calculateContentRelevanceScore(
  sourceContent: string,
  sourceTitle: string,
  sourceTags: string[],
  targetItem: SearchItem
): number {
  let score = 0
  
  // 1. Exact tag matches (35% weight)
  const exactTagMatches = sourceTags.filter(sourceTag => 
    targetItem.tags.some(targetTag => 
      targetTag.toLowerCase() === sourceTag.toLowerCase()
    )
  ).length
  
  const exactTagScore = sourceTags.length > 0 ? (exactTagMatches / sourceTags.length) * 0.35 : 0
  score += exactTagScore
  
  // 2. Partial tag matches (30% weight)
  const partialTagMatches = sourceTags.filter(sourceTag => 
    targetItem.tags.some(targetTag => {
      const sourceLower = sourceTag.toLowerCase()
      const targetLower = targetTag.toLowerCase()
      return targetLower.includes(sourceLower) || sourceLower.includes(targetLower)
    })
  ).length
  
  const partialTagScore = sourceTags.length > 0 ? (partialTagMatches / sourceTags.length) * 0.30 : 0
  score += partialTagScore
  
  // 3. Content keyword matches (25% weight)
  // 4. Content type relevance (10% weight)
  
  return Math.min(score, 1)
}
```

#### Component Integration

```typescript
// src/components/UnifiedRelatedContent.tsx
export const UnifiedRelatedContent: React.FC<UnifiedRelatedContentProps> = ({ 
  currentContent, 
  contentType, 
  maxResults = 5 
}) => {
  const [recommendations, setRecommendations] = useState<UnifiedContentItem[]>([])
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      const result = await unifiedSmartRecommendationsService.getRecommendations({
        content: currentContent,
        title: currentContent.title || '',
        tags: currentContent.tags || [],
        contentType,
        excludeUrl: window.location.pathname,
        maxResults
      })
      
      if (result.success) {
        setRecommendations(result.recommendations)
      }
    }
    
    fetchRecommendations()
  }, [currentContent, contentType, maxResults])
  
  return (
    <div className="related-content">
      <h3>Related Content</h3>
      {recommendations.map(item => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  )
}
```

## 🎯 AI Portfolio Assistant

### Overview

The AI Portfolio Assistant provides intelligent guidance and insights about portfolio content, helping users discover relevant information and understand expertise areas.

### Features

- **Portfolio Insights**: AI-generated insights about portfolio capabilities
- **Solution Recommendations**: Intelligent solution suggestions based on user queries
- **Expertise Mapping**: Maps user needs to relevant portfolio areas
- **Trend Analysis**: Identifies emerging trends and opportunities
- **Interactive Guidance**: Conversational interface for portfolio exploration

### Implementation

#### Assistant Component

```typescript
// src/components/AIPortfolioAssistant.tsx
export default function SiteAssistant({ portfolioItems }: SiteAssistantProps) {
  const [userQuery, setUserQuery] = useState('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  
  const generateInsights = (query: string): Recommendation[] => {
    const insights: Recommendation[] = []
    const lowerQuery = query.toLowerCase()
    
    // Portfolio Solutions insights
    if (lowerQuery.includes('devops') || lowerQuery.includes('automation')) {
      insights.push({
        type: 'solution',
        title: 'DevOps & Automation Solutions',
        description: 'I can help you with DevOps transformation, CI/CD pipelines, Azure Functions, and GitHub Actions automation.',
        relatedItems: ['devops', 'ai-automation'],
        confidence: 0.95,
        icon: Code,
        category: 'Technology'
      })
    }
    
    // Leadership insights
    if (lowerQuery.includes('leadership') || lowerQuery.includes('team')) {
      insights.push({
        type: 'solution',
        title: 'Leadership & Team Development',
        description: 'Expertise in cross-functional team management, organizational development, and leadership principles.',
        relatedItems: ['leadership', 'talent', 'culture'],
        confidence: 0.92,
        icon: Users,
        category: 'Leadership'
      })
    }
    
    return insights
  }
  
  return (
    <div className="ai-assistant">
      <input 
        value={userQuery}
        onChange={(e) => setUserQuery(e.target.value)}
        placeholder="Ask about my expertise..."
      />
      {recommendations.map(insight => (
        <InsightCard key={insight.title} insight={insight} />
      ))}
    </div>
  )
}
```

#### Insight Generation

```typescript
interface Recommendation {
  type: 'solution' | 'insight' | 'trend' | 'blog' | 'portfolio'
  title: string
  description: string
  relatedItems: string[]
  confidence: number
  icon: React.ComponentType<{ className?: string }>
  category?: string
}

const generatePortfolioInsights = (portfolioItems: PortfolioItem[]): Recommendation[] => {
  const insights: Recommendation[] = []
  
  // Analyze portfolio items for patterns
  const categories = portfolioItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Generate insights based on category distribution
  Object.entries(categories).forEach(([category, count]) => {
    if (count >= 2) {
      insights.push({
        type: 'insight',
        title: `${category} Expertise`,
        description: `Strong expertise in ${category.toLowerCase()} with ${count} portfolio items.`,
        relatedItems: portfolioItems.filter(item => item.category === category).map(item => item.fileName),
        confidence: Math.min(count / 5, 1), // Normalize confidence
        icon: Target,
        category
      })
    }
  })
  
  return insights
}
```

## 📅 AI Meeting Scheduler

### Overview

The AI Meeting Scheduler enhances meeting coordination by analyzing meeting context and suggesting optimal scheduling options.

### Features

- **Meeting Type Analysis**: Automatically categorizes meeting types
- **Duration Optimization**: Suggests optimal meeting durations
- **Participant Recommendations**: Identifies key stakeholders
- **Agenda Suggestions**: Generates relevant agenda items
- **Follow-up Coordination**: Manages post-meeting actions

### Implementation

```typescript
// src/components/AIMeetingScheduler.tsx
export const AIMeetingScheduler: React.FC = () => {
  const [meetingContext, setMeetingContext] = useState('')
  const [suggestions, setSuggestions] = useState<MeetingSuggestion[]>([])
  
  const analyzeMeetingContext = (context: string): MeetingSuggestion[] => {
    const suggestions: MeetingSuggestion[] = []
    const lowerContext = context.toLowerCase()
    
    if (lowerContext.includes('strategy') || lowerContext.includes('planning')) {
      suggestions.push({
        type: 'strategy-session',
        duration: '90 minutes',
        participants: ['Stakeholders', 'Leadership Team', 'Subject Matter Experts'],
        agenda: [
          'Current State Assessment',
          'Strategic Objectives',
          'Implementation Roadmap',
          'Success Metrics'
        ]
      })
    }
    
    if (lowerContext.includes('technical') || lowerContext.includes('review')) {
      suggestions.push({
        type: 'technical-review',
        duration: '60 minutes',
        participants: ['Technical Team', 'Architects', 'Developers'],
        agenda: [
          'Technical Architecture Review',
          'Code Quality Assessment',
          'Performance Analysis',
          'Security Considerations'
        ]
      })
    }
    
    return suggestions
  }
  
  return (
    <div className="meeting-scheduler">
      <textarea
        value={meetingContext}
        onChange={(e) => setMeetingContext(e.target.value)}
        placeholder="Describe your meeting context..."
      />
      {suggestions.map(suggestion => (
        <MeetingSuggestionCard key={suggestion.type} suggestion={suggestion} />
      ))}
    </div>
  )
}
```

## 📊 Content Intelligence

### Overview

Content Intelligence automatically analyzes and optimizes content across the site, providing insights and recommendations for improvement.

### Features

- **Content Analysis**: Automated content quality assessment
- **SEO Optimization**: Intelligent SEO recommendations
- **Readability Scoring**: Content readability analysis
- **Keyword Optimization**: Keyword density and relevance analysis
- **Content Gap Analysis**: Identifies missing content opportunities

### Implementation

#### Content Analysis Service

```typescript
// src/utils/aiPortfolioUtils.ts
export const analyzeContent = async (content: string): Promise<ContentAnalysis> => {
  const analysis: ContentAnalysis = {
    readability: calculateReadability(content),
    keywordDensity: analyzeKeywordDensity(content),
    seoScore: calculateSEOScore(content),
    suggestions: generateContentSuggestions(content)
  }
  
  return analysis
}

const calculateReadability = (content: string): number => {
  const sentences = content.split(/[.!?]+/).length
  const words = content.split(/\s+/).length
  const syllables = countSyllables(content)
  
  // Flesch Reading Ease formula
  return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
}

const generateContentSuggestions = (content: string): string[] => {
  const suggestions: string[] = []
  
  if (content.length < 300) {
    suggestions.push('Consider adding more detail to improve content depth')
  }
  
  if (!content.includes('#')) {
    suggestions.push('Add headings to improve content structure and SEO')
  }
  
  if (!content.includes('[') || !content.includes(']')) {
    suggestions.push('Include internal links to improve site navigation')
  }
  
  return suggestions
}
```

## 🔧 Configuration & Setup

### AI Worker Deployment

#### Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

#### Worker Configuration

```toml
# wrangler.toml
name = "ai-contact-analyzer"
main = "functions/ai-contact-analyzer.js"
compatibility_date = "2024-01-01"

[ai]
binding = "AI"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.kv_namespaces]]
binding = "RATE_LIMITS"
id = "your-kv-namespace-id"
```

#### Environment Variables

```bash
# Set worker secrets
wrangler secret put AI_API_KEY
wrangler secret put RATE_LIMIT_KEY
wrangler secret put SPAM_DETECTION_KEY
```

### Frontend Configuration

#### Environment Detection

```typescript
// src/config/environment.ts
export const environment = {
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  
  ai: {
    contactAnalyzerEndpoint: import.meta.env.VITE_AI_CONTACT_ENDPOINT || 
      'https://ai-contact-analyzer.rcormier.workers.dev',
    recommendationsEndpoint: import.meta.env.VITE_AI_RECOMMENDATIONS_ENDPOINT,
    maxRetries: 3,
    timeout: 10000
  }
}
```

#### API Configuration

```typescript
// src/api/config.ts
export const AI_API_CONFIG = {
  baseUrl: environment.ai.contactAnalyzerEndpoint,
  timeout: environment.ai.timeout,
  retries: environment.ai.maxRetries,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Portfolio-Site/1.0'
  }
}
```

## 📈 Performance & Monitoring

### AI Response Monitoring

```typescript
// src/utils/logger.ts
export const logAIResponse = (endpoint: string, responseTime: number, success: boolean) => {
  if (environment.isDevelopment()) {
    console.log(`🤖 AI Response: ${endpoint}`, {
      responseTime: `${responseTime}ms`,
      success,
      timestamp: new Date().toISOString()
    })
  }
  
  // In production, send to monitoring service
  if (environment.isProduction()) {
    // Send metrics to Cloudflare Analytics or external service
    sendMetrics({
      type: 'ai_response',
      endpoint,
      responseTime,
      success,
      timestamp: Date.now()
    })
  }
}
```

### Error Handling

```typescript
// src/api/errorHandling.ts
export class AIAnalysisError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'AI_UNAVAILABLE' | 'NETWORK_ERROR' = 'NETWORK_ERROR'
  ) {
    super(message)
    this.name = 'AIAnalysisError'
  }
}

export const handleAIError = (error: unknown): AIAnalysisError => {
  if (error instanceof AIAnalysisError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AIAnalysisError(error.message, 'NETWORK_ERROR')
  }
  
  return new AIAnalysisError('Unknown AI analysis error', 'NETWORK_ERROR')
}
```

## 🚀 Future Enhancements

### Planned AI Features

- **Natural Language Search**: Advanced semantic search capabilities
- **Content Generation**: AI-assisted content creation
- **Personalization**: User-specific content recommendations
- **Predictive Analytics**: User behavior prediction and optimization
- **Multilingual Support**: AI-powered content translation

### Integration Opportunities

- **Chatbot Integration**: Conversational AI interface
- **Voice Search**: Voice-activated content discovery
- **Image Analysis**: AI-powered image recognition and tagging
- **Sentiment Analysis**: User feedback and content sentiment analysis
- **A/B Testing**: AI-optimized content testing

## 📚 Resources

### AI Documentation
- [Cloudflare AI Documentation](https://developers.cloudflare.com/ai/)
- [AI Workers Examples](https://developers.cloudflare.com/workers/examples/ai/)
- [AI Models Reference](https://developers.cloudflare.com/ai/models/)

### Best Practices
- [AI Ethics Guidelines](https://ai.ethics.guide/)
- [Responsible AI Development](https://www.microsoft.com/en-us/ai/responsible-ai)
- [AI Safety Resources](https://futureoflife.org/ai-safety-resources/)

### Tools & Libraries
- [Fuse.js](https://fusejs.io/) - Fuzzy search implementation
- [Gray Matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter parsing
- [TipTap](https://tiptap.dev/) - Rich text editor

---

**This AI integration guide provides comprehensive documentation of all AI-powered features, ensuring optimal implementation and maintenance of intelligent functionality throughout the portfolio site.**
