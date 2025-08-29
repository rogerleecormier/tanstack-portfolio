interface FrontmatterData {
  title: string
  description: string
  author: string
  tags: string[]
  keywords: string[]
  date?: string
  section?: string
  [key: string]: string | string[] | number | boolean | undefined
}

interface ContentAnalysis {
  mainTopic: string
  subtopics: string[]
  tone: 'professional' | 'technical' | 'casual' | 'academic'
  complexity: 'beginner' | 'intermediate' | 'advanced'
  industry: string[]
  technologies: string[]
}

/**
 * Smart frontmatter generator that analyzes content and generates appropriate metadata
 */
export class FrontmatterGenerator {
  private static readonly COMMON_TECHNOLOGIES = [
    'NetSuite', 'Azure', 'AWS', 'Google Cloud', 'Salesforce', 'Power Automate',
    'Asana', 'Smartsheet', 'Box', 'Vena', 'Ramp', 'DevOps', 'SaaS', 'API',
    'React', 'TypeScript', 'Python', 'JavaScript', 'Node.js', 'Cloudflare',
    'PMBOK', 'Agile', 'Scrum', 'Kanban', 'Waterfall', 'Project Management',
    'Digital Transformation', 'ERP', 'Integration', 'Automation', 'Workflow'
  ]

  private static readonly INDUSTRY_KEYWORDS = [
    'finance', 'healthcare', 'technology', 'manufacturing', 'retail', 'education',
    'government', 'nonprofit', 'consulting', 'real estate', 'logistics'
  ]

  private static readonly COMPLEXITY_INDICATORS = {
    beginner: ['introduction', 'overview', 'getting started', 'basics', 'fundamentals'],
    intermediate: ['implementation', 'configuration', 'setup', 'integration', 'workflow'],
    advanced: ['architecture', 'optimization', 'scaling', 'enterprise', 'governance']
  }

  /**
   * Generate frontmatter based on content analysis
   */
  static generateFrontmatter(content: string, contentType: 'blog' | 'portfolio' | 'project'): FrontmatterData {
    const analysis = this.analyzeContent(content)
    const title = this.generateTitle(content, analysis)
    const description = this.generateDescription(content, analysis)
    const tags = this.generateTags(analysis, contentType)
    const keywords = this.generateKeywords(analysis)

    const frontmatter: FrontmatterData = {
      title,
      description,
      author: 'Roger Lee Cormier',
      tags,
      keywords,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      section: analysis.mainTopic
    }

    // Add content-type specific fields
    if (contentType === 'blog') {
      frontmatter.publishedTime = new Date().toISOString()
      frontmatter.readingTime = this.estimateReadingTime(content)
    }

    if (contentType === 'portfolio') {
      frontmatter.expertise = analysis.complexity
      frontmatter.industries = analysis.industry
    }

    if (contentType === 'project') {
      frontmatter.status = 'completed'
      frontmatter.technologies = analysis.technologies
    }

    return frontmatter
  }

  /**
   * Analyze content to extract key information
   */
  private static analyzeContent(content: string): ContentAnalysis {
    const text = content.toLowerCase()
    const words = text.split(/\s+/)

    // Extract main topic from headings
    const headings = content.match(/^#{1,3}\s+(.+)$/gm) || []
    const mainTopic = headings[0]?.replace(/^#{1,3}\s+/, '').trim() || 'Content'

    // Extract subtopics from other headings
    const subtopics = headings.slice(1).map(h => h.replace(/^#{1,3}\s+/, '').trim())

    // Analyze tone and complexity
    const tone = this.analyzeTone(text)
    const complexity = this.analyzeComplexity(text, words)

    // Extract technologies mentioned
    const technologies = this.COMMON_TECHNOLOGIES.filter(tech => 
      text.includes(tech.toLowerCase())
    )

    // Extract industry keywords
    const industry = this.INDUSTRY_KEYWORDS.filter(ind => 
      text.includes(ind)
    )

    return {
      mainTopic,
      subtopics,
      tone,
      complexity,
      industry,
      technologies
    }
  }

  /**
   * Analyze the tone of the content
   */
  private static analyzeTone(text: string): ContentAnalysis['tone'] {
    const technicalWords = ['api', 'integration', 'workflow', 'automation', 'configuration']
    const casualWords = ['awesome', 'cool', 'great', 'amazing', 'fantastic']
    const academicWords = ['research', 'analysis', 'methodology', 'framework', 'theory']

    const technicalCount = technicalWords.filter(word => text.includes(word)).length
    const casualCount = casualWords.filter(word => text.includes(word)).length
    const academicCount = academicWords.filter(word => text.includes(word)).length

    if (academicCount > 3) return 'academic'
    if (technicalCount > 5) return 'technical'
    if (casualCount > 2) return 'casual'
    return 'professional'
  }

  /**
   * Analyze the complexity level of the content
   */
  private static analyzeComplexity(text: string, words: string[]): ContentAnalysis['complexity'] {
    const wordCount = words.length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount

    // Check for complexity indicators
    for (const [level, indicators] of Object.entries(this.COMPLEXITY_INDICATORS)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        return level as ContentAnalysis['complexity']
      }
    }

    // Fallback based on content length and word complexity
    if (wordCount > 1000 || avgWordLength > 8) return 'advanced'
    if (wordCount > 500 || avgWordLength > 7) return 'intermediate'
    return 'beginner'
  }

  /**
   * Generate a compelling title
   */
  private static generateTitle(content: string, analysis: ContentAnalysis): string {
    // Try to extract from first H1
    const h1Match = content.match(/^#\s+(.+)$/m)
    if (h1Match) {
      return h1Match[1].trim()
    }

    // Generate based on main topic and complexity
    const complexityLabel = analysis.complexity === 'advanced' ? 'Advanced' : 
                           analysis.complexity === 'intermediate' ? 'Practical' : 'Essential'
    
    return `${complexityLabel} ${analysis.mainTopic}: ${analysis.subtopics[0] || 'A Comprehensive Guide'}`
  }

  /**
   * Generate a compelling description
   */
  private static generateDescription(content: string, analysis: ContentAnalysis): string {
    // Try to extract from first paragraph
    const firstParagraph = content.match(/<p>(.*?)<\/p>/)?.[1] || 
                          content.match(/^([^#\n]+)/)?.[1] || 
                          ''

    if (firstParagraph && firstParagraph.length > 50 && firstParagraph.length < 200) {
      return firstParagraph.trim()
    }

    // Generate based on analysis
    const industryText = analysis.industry.length > 0 ? ` in ${analysis.industry[0]} environments` : ''
    const techText = analysis.technologies.length > 0 ? ` using ${analysis.technologies.slice(0, 2).join(' and ')}` : ''
    
    return `A comprehensive guide to ${analysis.mainTopic.toLowerCase()}${industryText}${techText}. Perfect for ${analysis.complexity} practitioners looking to enhance their ${analysis.mainTopic.toLowerCase()} capabilities.`
  }

  /**
   * Generate relevant tags
   */
  private static generateTags(analysis: ContentAnalysis, contentType: string): string[] {
    const tags = new Set<string>()

    // Add main topic and subtopics
    tags.add(analysis.mainTopic)
    analysis.subtopics.slice(0, 3).forEach(subtopic => tags.add(subtopic))

    // Add technologies (limit to most relevant)
    analysis.technologies.slice(0, 5).forEach(tech => tags.add(tech))

    // Add industry tags
    analysis.industry.slice(0, 2).forEach(ind => tags.add(ind.charAt(0).toUpperCase() + ind.slice(1)))

    // Add content type specific tags
    if (contentType === 'blog') {
      tags.add('Blog Post')
      tags.add('Professional Development')
    } else if (contentType === 'portfolio') {
      tags.add('Portfolio')
      tags.add('Expertise')
    } else if (contentType === 'project') {
      tags.add('Project')
      tags.add('Case Study')
    }

    // Add complexity tag
    tags.add(analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1))

    return Array.from(tags).slice(0, 8) // Limit to 8 tags
  }

  /**
   * Generate SEO keywords
   */
  private static generateKeywords(analysis: ContentAnalysis): string[] {
    const keywords = new Set<string>()

    // Add main topic variations
    keywords.add(analysis.mainTopic.toLowerCase())
    keywords.add(analysis.mainTopic.toLowerCase().replace(/\s+/g, '-'))
    keywords.add(analysis.mainTopic.toLowerCase().replace(/\s+/g, ''))

    
    // Add technology keywords
    analysis.technologies.forEach(tech => {
      keywords.add(tech.toLowerCase())
      keywords.add(tech.toLowerCase().replace(/\s+/g, '-'))
    })

    // Add industry keywords
    analysis.industry.forEach(ind => {
      keywords.add(ind)
      keywords.add(`${ind} ${analysis.mainTopic.toLowerCase()}`)
    })

    // Add complexity-based keywords
    keywords.add(analysis.complexity)
    keywords.add(`${analysis.complexity} ${analysis.mainTopic.toLowerCase()}`)

    return Array.from(keywords).slice(0, 15) // Limit to 15 keywords
  }

  /**
   * Estimate reading time
   */
  private static estimateReadingTime(content: string): string {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200) // Average reading speed: 200 words per minute
    return `${minutes} min read`
  }

  /**
   * Convert frontmatter to YAML string
   */
  static toYAML(frontmatter: FrontmatterData): string {
    const lines = ['---']
    
    Object.entries(frontmatter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) return
        
        if (typeof value[0] === 'string') {
          // Array of strings
          lines.push(`${key}:`)
          value.forEach(item => lines.push(`  - "${item}"`))
        } else {
          // Array of other types
          lines.push(`${key}: [${value.join(', ')}]`)
        }
      } else if (typeof value === 'string') {
        // String value - wrap in quotes if it contains special characters
        if (value.includes(':') || value.includes('"') || value.includes("'")) {
          lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`)
        } else {
          lines.push(`${key}: "${value}"`)
        }
      } else {
        // Other types
        lines.push(`${key}: ${value}`)
      }
    })
    
    lines.push('---')
    return lines.join('\n')
  }

  /**
   * Validate frontmatter data
   */
  static validateFrontmatter(frontmatter: FrontmatterData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!frontmatter.title || frontmatter.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long')
    }

    if (!frontmatter.description || frontmatter.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long')
    }

    if (!frontmatter.tags || frontmatter.tags.length === 0) {
      errors.push('At least one tag is required')
    }

    if (!frontmatter.keywords || frontmatter.keywords.length === 0) {
      errors.push('At least one keyword is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
