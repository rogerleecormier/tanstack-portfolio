// Smart Contact Analyzer - Keyword-based analysis to reduce AI neuron usage
// This provides AI-like functionality without using Cloudflare AI

export interface SmartContactAnalysis {
  inquiryType: string
  priority: 'high' | 'medium' | 'low'
  industry: string
  recommendedDuration: number
  confidence: number
  shouldScheduleMeeting: boolean
  meetingType: string
  followUpQuestions: string[]
  recommendedContent: Array<{
    id: string
    title: string
    url: string
    contentType: 'blog' | 'portfolio' | 'project'
    relevance: number
  }>
  meetingSuggestions: string[]
  tags: string[]
}

// Keyword mappings for smart analysis
const INQUIRY_TYPE_KEYWORDS = {
  'Project Management': ['project', 'management', 'pmp', 'agile', 'scrum', 'kanban', 'sprint', 'delivery', 'timeline'],
  'Digital Transformation': ['digital', 'transformation', 'modernization', 'legacy', 'migration', 'upgrade'],
  'Leadership & Strategy': ['leadership', 'strategy', 'executive', 'management', 'team', 'culture', 'vision'],
  'Technical Implementation': ['technical', 'implementation', 'development', 'coding', 'programming', 'architecture'],
  'Consulting': ['consulting', 'advisory', 'guidance', 'expertise', 'consultant', 'strategy'],
  'Partnership': ['partnership', 'collaboration', 'joint', 'alliance', 'cooperation'],
  'General Inquiry': ['hello', 'hi', 'contact', 'information', 'general', 'question']
}

const PRIORITY_KEYWORDS = {
  high: ['urgent', 'asap', 'immediate', 'critical', 'emergency', 'deadline', 'pressing'],
  medium: ['soon', 'timeline', 'schedule', 'planning', 'discussion'],
  low: ['general', 'information', 'curious', 'explore', 'learn']
}

const INDUSTRY_KEYWORDS = {
  'Technology': ['tech', 'software', 'saas', 'cloud', 'ai', 'automation', 'digital'],
  'Finance': ['finance', 'banking', 'investment', 'financial', 'money', 'funding'],
  'Healthcare': ['health', 'medical', 'healthcare', 'patient', 'clinical'],
  'Manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'supply chain'],
  'Consulting': ['consulting', 'advisory', 'professional services'],
  'Education': ['education', 'learning', 'training', 'academic', 'university'],
  'Government': ['government', 'public', 'federal', 'state', 'municipal'],
  'Non-Profit': ['non-profit', 'charity', 'foundation', 'social impact'],
  'Other': []
}

const CONTENT_KEYWORDS = {
  'leadership': ['leadership', 'management', 'team', 'culture', 'strategy', 'vision'],
  'project-management': ['project', 'pmp', 'agile', 'scrum', 'delivery', 'timeline'],
  'digital-transformation': ['digital', 'transformation', 'modernization', 'legacy'],
  'devops': ['devops', 'cloud', 'automation', 'ci/cd', 'deployment'],
  'saas': ['saas', 'erp', 'netsuite', 'ramp', 'vena', 'integration'],
  'ai-automation': ['ai', 'automation', 'machine learning', 'artificial intelligence'],
  'analytics': ['analytics', 'data', 'reporting', 'business intelligence', 'dashboard'],
  'risk-compliance': ['risk', 'compliance', 'governance', 'security', 'audit'],
  'governance-pmo': ['governance', 'pmo', 'project management office', 'framework']
}

export class SmartContactAnalyzer {
  private static calculateKeywordMatch(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase()
    const matches = keywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length
    return matches / keywords.length
  }

  private static analyzeInquiryType(message: string): { type: string; confidence: number } {
    let bestMatch = { type: 'General Inquiry', confidence: 0 }
    
    for (const [type, keywords] of Object.entries(INQUIRY_TYPE_KEYWORDS)) {
      const confidence = this.calculateKeywordMatch(message, keywords)
      if (confidence > bestMatch.confidence) {
        bestMatch = { type, confidence }
      }
    }
    
    return bestMatch
  }

  private static analyzePriority(message: string): { priority: 'high' | 'medium' | 'low'; confidence: number } {
    let bestMatch: { priority: 'high' | 'medium' | 'low'; confidence: number } = { priority: 'medium', confidence: 0 }
    
    for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
      const confidence = this.calculateKeywordMatch(message, keywords)
      if (confidence > bestMatch.confidence) {
        bestMatch = { priority: priority as 'high' | 'medium' | 'low', confidence }
      }
    }
    
    return bestMatch
  }

  private static analyzeIndustry(message: string): { industry: string; confidence: number } {
    let bestMatch = { industry: 'Other', confidence: 0 }
    
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
      const confidence = this.calculateKeywordMatch(message, keywords)
      if (confidence > bestMatch.confidence) {
        bestMatch = { industry, confidence }
      }
    }
    
    return bestMatch
  }

  private static shouldScheduleMeeting(inquiryType: string, priority: string, message: string): boolean {
    const lowerMessage = message.toLowerCase()
    
    // Always schedule for high priority
    if (priority === 'high') return true
    
    // Schedule for specific inquiry types that typically need meetings
    if (inquiryType === 'Project Management' || 
        inquiryType === 'Digital Transformation' || 
        inquiryType === 'Consulting' ||
        inquiryType === 'Partnership') {
      return true
    }
    
    // Check for meeting-related keywords
    const meetingKeywords = ['meet', 'call', 'discuss', 'talk', 'schedule', 'appointment', 'consultation']
    const hasMeetingKeywords = meetingKeywords.some(keyword => lowerMessage.includes(keyword))
    
    // Check for project-related keywords that suggest complexity
    const projectKeywords = ['project', 'implementation', 'development', 'strategy', 'planning']
    const hasProjectKeywords = projectKeywords.some(keyword => lowerMessage.includes(keyword))
    
    // Check message length - longer messages often indicate complex inquiries
    const isLongMessage = message.length > 100
    
    return hasMeetingKeywords || (hasProjectKeywords && isLongMessage)
  }

  private static getMeetingType(inquiryType: string, priority: string): string {
    if (priority === 'high') return 'urgent-consultation'
    if (inquiryType === 'Project Management') return 'project-planning'
    if (inquiryType === 'Digital Transformation') return 'strategy-session'
    if (inquiryType === 'Consulting') return 'consultation'
    if (inquiryType === 'Partnership') return 'partnership-discussion'
    if (inquiryType === 'Leadership & Strategy') return 'strategy-session'
    if (inquiryType === 'Technical Implementation') return 'technical-review'
    return 'general-discussion'
  }

  private static generateFollowUpQuestions(message: string, inquiryType: string, industry: string): string[] {
    const questions: string[] = []
    const lowerMessage = message.toLowerCase()
    
    // Analyze what information is missing from the message
    const hasTimeline = /timeline|deadline|schedule|when|time|duration/i.test(lowerMessage)
    const hasTeamSize = /team|team size|developers|staff|people|employees|users/i.test(lowerMessage)
    const hasBudget = /budget|cost|price|investment|funding/i.test(lowerMessage)
    const hasTechnicalDetails = /technology|tech stack|framework|platform|api|database|infrastructure/i.test(lowerMessage)
    const hasBusinessContext = /business|company|industry|sector|market|customers/i.test(lowerMessage)
    const hasSpecificGoals = /goals|objectives|outcomes|results|success|metrics/i.test(lowerMessage)
    const hasCurrentState = /current|existing|legacy|old|now|present/i.test(lowerMessage)
    const hasChallenges = /challenge|problem|issue|pain|difficulty|struggle/i.test(lowerMessage)
    
    // Generate contextual follow-up questions based on missing information
    if (!hasTimeline) {
      questions.push("What's your timeline for this project or initiative?")
    }
    
    if (!hasTeamSize) {
      questions.push("How large is your team or organization?")
    }
    
    if (!hasBudget && (inquiryType === 'Project Management' || inquiryType === 'Digital Transformation')) {
      questions.push("What's your budget range for this initiative?")
    }
    
    if (!hasTechnicalDetails && (inquiryType === 'Technical Implementation' || inquiryType === 'Digital Transformation')) {
      questions.push("What's your current technology stack or platform?")
    }
    
    if (!hasBusinessContext) {
      questions.push("Can you tell me more about your business context and objectives?")
    }
    
    if (!hasSpecificGoals) {
      questions.push("What specific outcomes or results are you looking to achieve?")
    }
    
    if (!hasCurrentState && inquiryType === 'Digital Transformation') {
      questions.push("What's your current state and what challenges are you facing?")
    }
    
    if (!hasChallenges && inquiryType === 'Consulting') {
      questions.push("What specific challenges or pain points are you experiencing?")
    }
    
    // Add industry-specific questions
    if (industry === 'Technology' && !hasTechnicalDetails) {
      questions.push("What technologies or platforms are you currently using?")
    }
    
    if (industry === 'Finance' && !hasBudget) {
      questions.push("What's your investment budget for this initiative?")
    }
    
    // Limit to 3 most relevant questions
    return questions.slice(0, 3)
  }

  private static getRecommendedDuration(inquiryType: string, priority: string): number {
    const baseDurations = {
      'Project Management': 60,
      'Digital Transformation': 90,
      'Leadership & Strategy': 45,
      'Technical Implementation': 60,
      'Consulting': 30,
      'Partnership': 45,
      'General Inquiry': 15
    }
    
    const baseDuration = baseDurations[inquiryType as keyof typeof baseDurations] || 30
    const priorityMultiplier = priority === 'high' ? 1.5 : priority === 'low' ? 0.7 : 1
    
    return Math.round(baseDuration * priorityMultiplier)
  }

  private static getRecommendedContent(message: string): Array<{
    id: string
    title: string
    url: string
    contentType: 'blog' | 'portfolio' | 'project'
    relevance: number
  }> {
    const recommendations: Array<{
      id: string
      title: string
      url: string
      contentType: 'blog' | 'portfolio' | 'project'
      relevance: number
    }> = []
    const lowerMessage = message.toLowerCase()
    
    for (const [contentId, keywords] of Object.entries(CONTENT_KEYWORDS)) {
      const relevance = this.calculateKeywordMatch(lowerMessage, keywords)
      if (relevance > 0.1) { // Only include if there's some relevance
        let contentType: 'blog' | 'portfolio' | 'project' = 'portfolio'
        if (contentId.includes('blog')) {
          contentType = 'blog'
        } else if (contentId.includes('project')) {
          contentType = 'project'
        }
        
        recommendations.push({
          id: contentId,
          title: this.getContentTitle(contentId),
          url: this.getContentUrl(contentId, contentType),
          contentType,
          relevance
        })
      }
    }
    
    // Sort by relevance and return top 3
    return recommendations
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
  }

  private static getContentTitle(contentId: string): string {
    const titles: Record<string, string> = {
      'leadership': 'Technical Project Leadership',
      'project-management': 'Project Management & Delivery',
      'digital-transformation': 'Digital Transformation Strategy',
      'devops': 'Cloud & DevOps Engineering',
      'saas': 'ERP & SaaS Integration',
      'ai-automation': 'AI & Automation',
      'analytics': 'Data Analytics & Business Intelligence',
      'risk-compliance': 'Risk & Compliance Management',
      'governance-pmo': 'Governance & PMO Setup'
    }
    return titles[contentId] || 'Relevant Content'
  }

  private static getContentUrl(contentId: string, contentType: string): string {
    if (contentType === 'blog') {
      return `/blog/${contentId}`
    } else if (contentType === 'project') {
      return `/${contentId}`
    } else {
      return `/${contentId}`
    }
  }

  private static generateMeetingSuggestions(inquiryType: string, priority: string): string[] {
    const suggestions = []
    
    if (priority === 'high') {
      suggestions.push('Schedule an urgent call to discuss immediate needs')
    }
    
    if (inquiryType === 'Project Management') {
      suggestions.push('Review project scope and timeline requirements')
      suggestions.push('Discuss team structure and resource needs')
    } else if (inquiryType === 'Digital Transformation') {
      suggestions.push('Assess current technology landscape')
      suggestions.push('Define transformation roadmap and milestones')
    } else if (inquiryType === 'Leadership & Strategy') {
      suggestions.push('Explore strategic objectives and challenges')
      suggestions.push('Discuss organizational culture and team dynamics')
    }
    
    suggestions.push('Share relevant case studies and examples')
    suggestions.push('Define next steps and action items')
    
    return suggestions
  }

  private static extractTags(message: string): string[] {
    const tags = new Set<string>()
    const lowerMessage = message.toLowerCase()
    
    // Extract common tags based on keywords
    if (lowerMessage.includes('project')) tags.add('project-management')
    if (lowerMessage.includes('leadership')) tags.add('leadership')
    if (lowerMessage.includes('digital')) tags.add('digital-transformation')
    if (lowerMessage.includes('devops')) tags.add('devops')
    if (lowerMessage.includes('saas')) tags.add('saas-integration')
    if (lowerMessage.includes('ai')) tags.add('ai-automation')
    if (lowerMessage.includes('data')) tags.add('analytics')
    if (lowerMessage.includes('risk')) tags.add('risk-compliance')
    if (lowerMessage.includes('governance')) tags.add('governance')
    
    return Array.from(tags)
  }

  static analyzeContact(message: string, name: string, email: string, company?: string): SmartContactAnalysis {
    const fullText = `${message} ${name} ${email} ${company || ''}`.toLowerCase()
    
    const inquiryType = this.analyzeInquiryType(fullText)
    const priority = this.analyzePriority(fullText)
    const industry = this.analyzeIndustry(fullText)
    
    const shouldSchedule = this.shouldScheduleMeeting(inquiryType.type, priority.priority, message)
    const meetingType = this.getMeetingType(inquiryType.type, priority.priority)
    const recommendedDuration = this.getRecommendedDuration(inquiryType.type, priority.priority)
    const recommendedContent = this.getRecommendedContent(fullText)
    const meetingSuggestions = this.generateMeetingSuggestions(inquiryType.type, priority.priority)
    const followUpQuestions = this.generateFollowUpQuestions(message, inquiryType.type, industry.industry)
    const tags = this.extractTags(fullText)
    
    // Calculate overall confidence based on keyword matches
    const confidence = Math.min(
      (inquiryType.confidence + priority.confidence + industry.confidence) / 3,
      0.95
    )
    
    return {
      inquiryType: inquiryType.type,
      priority: priority.priority,
      industry: industry.industry,
      recommendedDuration,
      confidence,
      shouldScheduleMeeting: shouldSchedule,
      meetingType,
      followUpQuestions,
      recommendedContent,
      meetingSuggestions,
      tags
    }
  }
}
