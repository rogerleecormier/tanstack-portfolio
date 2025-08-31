import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target, 
  Code, 
  BarChart3,
  ArrowRight,
  Sparkles,
  X,
  BookOpen,
  MessageSquare,
  Globe
} from 'lucide-react'
import { PortfolioItem } from '@/utils/portfolioLoader'
import { workerContentService } from '@/api/workerContentService'



interface Recommendation {
  type: 'solution' | 'insight' | 'trend' | 'blog' | 'portfolio'
  title: string
  description: string
  relatedItems: string[]
  confidence: number
  icon: React.ComponentType<{ className?: string }>
  category?: string
}

interface ContentRecommendation {
  type: 'content'
  title: string
  description: string
  url: string
  contentType: 'blog' | 'portfolio' | 'project' | 'page'
  confidence: number
  icon: React.ComponentType<{ className?: string }>
  category?: string
}

interface SiteAssistantProps {
  portfolioItems: PortfolioItem[]
}

export default function SiteAssistant({ portfolioItems }: SiteAssistantProps) {
  const [userQuery, setUserQuery] = useState('')
  const [recommendations, setRecommendations] = useState<(Recommendation | ContentRecommendation)[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)

  // Get content recommendations from worker API
  const getContentRecommendations = useCallback(async (query: string): Promise<ContentRecommendation[]> => {
    try {
      // Use the updated content search worker for actual relevance scores
      const response = await fetch('https://content-search.rcormier.workers.dev/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          contentType: 'all', // Get cross-content type recommendations
          maxResults: 3,
          tags: []
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.results && data.results.length > 0) {
          return data.results.map((item: { title: string; description: string; url: string; contentType: string; relevanceScore?: number }) => ({
            type: 'content' as const,
            title: item.title,
            description: item.description,
            url: item.url,
            contentType: item.contentType,
            confidence: (item.relevanceScore || 0) / 100, // Convert percentage to decimal
            icon: BookOpen,
            category: item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)
          }))
        }
      }
      
      // Fallback to old service if new API fails
      const contentItems = await workerContentService.searchByQuery(query, 'all', 3)
      
      return contentItems.map(item => ({
        type: 'content' as const,
        title: item.title,
        description: item.description,
        url: item.url,
        contentType: item.contentType,
        confidence: 0.65, // Lower confidence for fallback content
        icon: BookOpen,
        category: item.category || 'Content'
      }))
    } catch (error) {
      console.error('Error getting content recommendations:', error)
      return []
    }
  }, [])

  // Enhanced insights based on comprehensive site knowledge
  const generateInsights = (query: string): Recommendation[] => {
    const insights: Recommendation[] = []
    const lowerQuery = query.toLowerCase()

    // Portfolio Solutions insights
    if (lowerQuery.includes('devops') || lowerQuery.includes('automation') || lowerQuery.includes('cloud') || lowerQuery.includes('ci/cd')) {
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

    if (lowerQuery.includes('leadership') || lowerQuery.includes('team') || lowerQuery.includes('culture') || lowerQuery.includes('management')) {
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

    if (lowerQuery.includes('strategy') || lowerQuery.includes('planning') || lowerQuery.includes('transformation') || lowerQuery.includes('consulting')) {
      insights.push({
        type: 'solution',
        title: 'Strategic Planning & Digital Transformation',
        description: 'Comprehensive strategy consulting with focus on process modernization and measurable business outcomes.',
        relatedItems: ['strategy', 'governance-pmo'],
        confidence: 0.90,
        icon: Target,
        category: 'Strategy'
      })
    }

    if (lowerQuery.includes('analytics') || lowerQuery.includes('data') || lowerQuery.includes('insights') || lowerQuery.includes('dashboard')) {
      insights.push({
        type: 'solution',
        title: 'Data-Driven Decision Making',
        description: 'Analytics solutions for delivery risk identification and cross-functional coordination through dashboards.',
        relatedItems: ['analytics', 'ai-automation'],
        confidence: 0.88,
        icon: BarChart3,
        category: 'Analytics'
      })
    }

    // Blog Post Insights
    if (lowerQuery.includes('blog') || lowerQuery.includes('article') || lowerQuery.includes('read') || lowerQuery.includes('content')) {
      insights.push({
        type: 'blog',
        title: 'DevOps Automation Blog Series',
        description: 'I have detailed blog posts about getting started with DevOps automation, including practical implementation guides.',
        relatedItems: ['blog'],
        confidence: 0.85,
        icon: BookOpen,
        category: 'Content'
      })
    }

    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence') || lowerQuery.includes('machine learning') || lowerQuery.includes('automation')) {
      insights.push({
        type: 'trend',
        title: 'Enhanced Operations with Automation',
        description: 'Automation is transforming how we approach operations and decision-making. Check out our automation solutions and related blog content.',
        relatedItems: ['ai-automation', 'analytics', 'blog'],
        confidence: 0.93,
        icon: Brain,
        category: 'Technology'
      })
    }

    if (lowerQuery.includes('risk') || lowerQuery.includes('compliance') || lowerQuery.includes('governance') || lowerQuery.includes('audit')) {
      insights.push({
        type: 'solution',
        title: 'Risk Management & Compliance',
        description: 'Our approach embeds controls directly into workflows for automatic audit evidence and compliance management.',
        relatedItems: ['risk-compliance', 'governance-pmo'],
        confidence: 0.87,
        icon: TrendingUp,
        category: 'Compliance'
      })
    }

    if (lowerQuery.includes('project') || lowerQuery.includes('method') || lowerQuery.includes('analysis') || lowerQuery.includes('methodology') || lowerQuery.includes('budget') || lowerQuery.includes('complexity')) {
      insights.push({
        type: 'solution',
        title: 'Project Method Analysis & Budget Planning',
        description: 'Comprehensive project methodology analysis including budget tiers, complexity assessment, and delivery risk evaluation.',
        relatedItems: ['project-analysis'],
        confidence: 0.89,
        icon: BarChart3,
        category: 'Project Management'
      })
    }

    // Site Navigation Insights
    if (lowerQuery.includes('contact') || lowerQuery.includes('reach') || lowerQuery.includes('get in touch') || lowerQuery.includes('hire')) {
      insights.push({
        type: 'insight',
        title: 'Get in Touch',
        description: 'Ready to discuss your project? I offer comprehensive consulting across strategy, technology, and leadership.',
        relatedItems: ['contact'],
        confidence: 0.95,
        icon: MessageSquare,
        category: 'Contact'
      })
    }

    if (lowerQuery.includes('about') || lowerQuery.includes('who') || lowerQuery.includes('background') || lowerQuery.includes('experience')) {
      insights.push({
        type: 'insight',
        title: 'About My Background',
        description: 'I bring military leadership experience, technical expertise, and proven results in organizational transformation.',
        relatedItems: ['about'],
        confidence: 0.90,
        icon: Globe,
        category: 'About'
      })
    }

    // If no specific matches, provide contextual recommendations
    if (insights.length === 0) {
      insights.push({
        type: 'insight',
        title: 'Comprehensive Solution Portfolio',
        description: 'I offer solutions across strategy, technology, leadership, and operations. What specific challenge are you looking to solve?',
        relatedItems: ['strategy', 'leadership', 'devops', 'analytics'],
        confidence: 0.75,
        icon: Lightbulb,
        category: 'General'
      })
    }

    return insights
  }

  const handleQuerySubmit = async () => {
    if (!userQuery.trim()) return

    setIsAnalyzing(true)
    
    try {
      // Get both static insights and content recommendations
      const [insights, contentRecs] = await Promise.all([
        Promise.resolve(generateInsights(userQuery)),
        getContentRecommendations(userQuery)
      ])
      
      // Combine insights and content recommendations
      const allRecommendations = [...insights, ...contentRecs]
      setRecommendations(allRecommendations)
    } catch (error) {
      console.error('Error getting recommendations:', error)
      // Fallback to just insights
      const insights = generateInsights(userQuery)
      setRecommendations(insights)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleItemSelect = (itemSlug: string, recommendation?: Recommendation | ContentRecommendation) => {
    // Handle content recommendations
    if (recommendation && recommendation.type === 'content') {
      const contentRec = recommendation as ContentRecommendation
      window.location.href = contentRec.url
      return
    }
    
    // Handle static recommendations
    if (itemSlug === 'blog') {
      window.location.href = '/blog'
    } else if (itemSlug === 'contact') {
      window.location.href = '/contact'
    } else if (itemSlug === 'about') {
      window.location.href = '/'
    } else {
      // Check if this is a project item
      if (itemSlug === 'project-analysis') {
        window.location.href = '/projects/project-analysis'
        return
      }
      
      // Check if this is a portfolio item
      const item = portfolioItems.find(i => i.fileName === itemSlug)
      if (item) {
        // Navigate directly to portfolio URLs
        window.location.href = `/portfolio/${itemSlug}`
      }
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 dark:bg-green-50 dark:text-green-800'
    if (confidence >= 0.8) return 'brand-bg-secondary text-blue-800 dark:bg-blue-50 dark:text-blue-800'
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-50 dark:text-yellow-800'
    return 'brand-bg-primary text-teal-800 dark:bg-teal-50 dark:text-teal-800'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solution': return 'brand-bg-primary text-teal-800 dark:bg-teal-50 dark:text-teal-800'
      case 'blog': return 'bg-purple-100 text-purple-800 dark:bg-purple-50 dark:text-purple-800'
      case 'trend': return 'bg-orange-100 text-orange-800 dark:bg-orange-50 dark:text-orange-800'
      case 'insight': return 'brand-bg-secondary text-blue-800 dark:bg-blue-50 dark:text-blue-800'
      case 'content': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-50 dark:text-indigo-800'
      default: return 'brand-bg-primary text-teal-800 dark:bg-teal-50 dark:text-teal-800'
    }
  }

  if (!showAssistant) {
    return (
      <Button
        onClick={() => setShowAssistant(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
      >
        <Brain className="w-6 h-6 text-white" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] overflow-hidden">
      <Card className="shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600" />
              <CardTitle className="text-lg">Site Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAssistant(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Ask me about solutions, blog posts, or get personalized recommendations
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Query Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="What can I help you with today?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="min-h-[80px] resize-none"
            />
                         <Button
               onClick={handleQuerySubmit}
               disabled={isAnalyzing || !userQuery.trim()}
               className="w-full brand-button-primary"
             >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Insights
                </>
              )}
            </Button>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Recommendations
              </h4>
              {recommendations.map((rec, index) => {
                const IconComponent = rec.icon
                return (
                                     <div key={index} className="p-3 border rounded-lg brand-bg-primary dark:bg-teal-50/20">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-sm">{rec.title}</h5>
                                                     <Badge variant="secondary" className={`text-xs ${getConfidenceColor(rec.confidence)}`}>
                             {Math.round(rec.confidence * 100)}% match
                           </Badge>
                           <Badge variant="secondary" className={`text-xs ${getTypeColor(rec.type)}`}>
                             {rec.type}
                           </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {rec.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {rec.type === 'content' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleItemSelect('', rec)}
                              className="text-xs h-6 px-2"
                            >
                              {rec.contentType === 'blog' ? 'Read Article' :
                               rec.contentType === 'portfolio' ? 'View Portfolio' :
                               rec.contentType === 'project' ? 'View Project' :
                               'View Content'}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          ) : (
                            rec.relatedItems.map((itemSlug) => (
                              <Button
                                key={itemSlug}
                                variant="outline"
                                size="sm"
                                onClick={() => handleItemSelect(itemSlug)}
                                className="text-xs h-6 px-2"
                              >
                                {itemSlug === 'blog' ? 'Read Blog' :
                                 itemSlug === 'contact' ? 'Contact Me' :
                                 itemSlug === 'about' ? 'About Me' :
                                 itemSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserQuery('I need help with DevOps and automation')}
                className="text-xs h-8"
              >
                DevOps Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserQuery('Show me your blog posts about automation')}
                className="text-xs h-8"
              >
                Read Blog
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserQuery('Tell me about your leadership experience')}
                className="text-xs h-8"
              >
                Leadership
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserQuery('How can I contact you?')}
                className="text-xs h-8"
              >
                Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
