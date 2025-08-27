import fm from 'front-matter'
import { logger } from './logger'

export interface PortfolioItem {
  title: string
  url: string
  description: string
  tags: string[]
  category: string
  fileName: string
  frontmatter: Record<string, unknown>
}

// Define category mappings for display purposes only
const categoryMappings: Record<string, { name: string; icon: string; color: string }> = {
  'strategy': { name: 'Strategy & Consulting', icon: 'Target', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors' },
  'leadership': { name: 'Leadership & Culture', icon: 'Users2', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors' },
  'talent': { name: 'Talent & HR', icon: 'User', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors' },
  'devops': { name: 'Technology & Operations', icon: 'Code', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors' },
  'saas': { name: 'Technology & Operations', icon: 'Code', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors' },
  'analytics': { name: 'Data & Analytics', icon: 'BarChart3', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors' },
  'risk-compliance': { name: 'Risk & Compliance', icon: 'Shield', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors' },
  'governance-pmo': { name: 'Governance & PMO', icon: 'ClipboardList', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors' },
  'product-ux': { name: 'Product & UX', icon: 'Palette', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors' },

  'education-certifications': { name: 'Education & Certifications', icon: 'GraduationCap', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors' },
  'ai-automation': { name: 'AI & Automation', icon: 'Brain', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors' },
  'culture': { name: 'Leadership & Culture', icon: 'Users2', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-gray-800 transition-colors' },
  'capabilities': { name: 'Core Capabilities', icon: 'Zap', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors' },
  'projects': { name: 'Project Portfolio', icon: 'FolderOpen', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors' }
}

// Helper function to generate a human-readable title from filename
function generateTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\b(And|Or|The|In|On|At|To|For|Of|With|By)\b/gi, (match, index) => {
      // Capitalize first word, keep prepositions lowercase for middle words
      if (index === 0) return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
      return match.toLowerCase()
    })
    .replace(/\b\w/g, l => l.toUpperCase()) // Re-capitalize first letter of each word
}

// Helper function to extract description from content
function extractDescriptionFromContent(content: string): string {
  if (!content || !content.trim()) return 'No description available'
  
  // Remove markdown headers and get first meaningful paragraph
  const lines = content.split('\n').filter(line => line.trim())
  let description = ''
  
  for (const line of lines) {
    const cleanLine = line.replace(/^#+\s*/, '').trim()
    if (cleanLine && cleanLine.length > 10 && !cleanLine.startsWith('---')) {
      description = cleanLine
      break
    }
  }
  
  // Limit description length
  if (description.length > 150) {
    description = description.substring(0, 150) + '...'
  }
  
  return description || 'No description available'
}

// Helper function to determine category
function determineCategory(filename: string, frontmatter: Record<string, unknown>): string {
  // First priority: frontmatter category
  if (frontmatter.category && typeof frontmatter.category === 'string') {
    return frontmatter.category
  }
  
  // Second priority: filename mapping
  const filenameWithoutExt = filename.replace('.md', '')
  if (categoryMappings[filenameWithoutExt]) {
    return categoryMappings[filenameWithoutExt].name
  }
  
  // Third priority: infer from filename
  if (filenameWithoutExt.includes('leadership') || filenameWithoutExt.includes('culture')) {
    return 'Leadership & Culture'
  } else if (filenameWithoutExt.includes('tech') || filenameWithoutExt.includes('devops') || filenameWithoutExt.includes('saas')) {
    return 'Technology & Operations'
  } else if (filenameWithoutExt.includes('strategy') || filenameWithoutExt.includes('consulting')) {
    return 'Strategy & Consulting'
  } else if (filenameWithoutExt.includes('ai') || filenameWithoutExt.includes('automation')) {
    return 'AI & Automation'
  }
  
  return 'Other'
}

// Dynamic file discovery - truly dynamic at runtime
async function discoverPortfolioFiles(): Promise<string[]> {
  try {
    // Try to dynamically discover files using a different approach
    logger.portfolioLoading('Attempting dynamic file discovery...')
    
    // Method 1: Try to use dynamic imports with a pattern
    const possibleFiles = [
      'strategy', 'leadership', 'talent', 'devops', 'saas', 'analytics',
      'risk-compliance', 'governance-pmo', 'product-ux',
      'education-certifications', 'ai-automation', 'culture', 'capabilities',
      'projects'
    ]
    
    const discoveredFiles: string[] = []
    
    // Try to dynamically import each potential file
    for (const fileName of possibleFiles) {
      try {
        const module = await import(`../content/portfolio/${fileName}.md?raw`)
        if (module && module.default) {
          discoveredFiles.push(`${fileName}.md`)
          logger.discovered(`${fileName}.md`)
        }
      } catch {
        // File doesn't exist, skip it
        logger.notFound(`${fileName}.md`)
      }
    }
    
    if (discoveredFiles.length > 0) {
      logger.portfolioLoading(`Successfully discovered ${discoveredFiles.length} portfolio files:`, discoveredFiles)
      return discoveredFiles
    }
    
    // Method 2: Fallback to known files if dynamic discovery fails
    logger.portfolioLoading('Dynamic discovery failed, using fallback list')
    return [
      'strategy.md',
      'leadership.md',
      'talent.md',
      'devops.md',
      'saas.md',
      'analytics.md',
      'risk-compliance.md',
      'governance-pmo.md',
      'product-ux.md',
      'education-certifications.md',
      'ai-automation.md',
      'culture.md',
      'capabilities.md',
      'projects.md'
    ]
    
  } catch (error) {
    logger.error('Error in dynamic file discovery:', error)
    // Final fallback
    return [
      'strategy.md',
      'leadership.md',
      'talent.md',
      'devops.md',
      'saas.md',
      'analytics.md',
      'risk-compliance.md',
      'governance-pmo.md',
      'product-ux.md',
      'education-certifications.md',
      'ai-automation.md',
      'culture.md',
      'capabilities.md',
      'projects.md'
    ]
  }
}

// Dynamic blog file discovery
async function discoverBlogFiles(): Promise<string[]> {
  try {
    logger.portfolioLoading('Attempting blog file discovery...')
    
    const possibleBlogFiles = [
      'pmbok-agile-methodology-blend',
      'serverless-ai-workflows-azure-functions',
      'power-automate-workflow-automation',
      'asana-ai-status-reporting',
      'mkdocs-github-actions-portfolio',
      'internal-ethos-high-performing-organizations',
      'digital-transformation-strategy-governance',
      'military-leadership-be-know-do',
      'ramp-agents-ai-finance-operations',
      'pmp-digital-transformation-leadership'
    ]
    
    const discoveredBlogFiles: string[] = []
    
    for (const fileName of possibleBlogFiles) {
      try {
        const module = await import(`../content/blog/${fileName}.md?raw`)
        if (module && module.default) {
          discoveredBlogFiles.push(`${fileName}.md`)
          logger.discovered(`blog: ${fileName}.md`)
        }
      } catch {
        logger.notFound(`blog: ${fileName}.md`)
      }
    }
    
    if (discoveredBlogFiles.length > 0) {
      logger.portfolioLoading(`Successfully discovered ${discoveredBlogFiles.length} blog files:`, discoveredBlogFiles)
      return discoveredBlogFiles
    }
    
    return []
  } catch (error) {
    logger.error('Error in blog file discovery:', error)
    return []
  }
}

// Dynamic project file discovery
async function discoverProjectFiles(): Promise<string[]> {
  try {
    logger.portfolioLoading('Attempting project file discovery...')
    
    const possibleProjectFiles = [
      'project-analysis'
    ]
    
    const discoveredProjectFiles: string[] = []
    
    for (const fileName of possibleProjectFiles) {
      try {
        const module = await import(`../content/projects/${fileName}.md?raw`)
        if (module && module.default) {
          discoveredProjectFiles.push(`${fileName}.md`)
          logger.discovered(`project: ${fileName}.md`)
        }
      } catch {
        logger.notFound(`project: ${fileName}.md`)
      }
    }
    
    if (discoveredProjectFiles.length > 0) {
      logger.portfolioLoading(`Successfully discovered ${discoveredProjectFiles.length} project files:`, discoveredProjectFiles)
      return discoveredProjectFiles
    }
    
    return []
  } catch (error) {
    logger.error('Error in project file discovery:', error)
    return []
  }
}

// Get all discovered content items (portfolio, blog, projects)
export async function getAllContentItems(): Promise<{
  portfolio: string[],
  blog: string[],
  projects: string[]
}> {
  try {
    const [portfolioFiles, blogFiles, projectFiles] = await Promise.all([
      discoverPortfolioFiles(),
      discoverBlogFiles(),
      discoverProjectFiles()
    ])
    
    return {
      portfolio: portfolioFiles,
      blog: blogFiles,
      projects: projectFiles
    }
  } catch (error) {
    logger.error('Error getting all content items:', error)
    return {
      portfolio: [],
      blog: [],
      projects: []
    }
  }
}

// Static portfolio configuration for build time
export const staticPortfolioItems: Omit<PortfolioItem, 'frontmatter'>[] = [
  {
    title: 'Digital Transformation Strategy',
    url: 'strategy',
    description: 'Strategic approach to digital transformation and operational excellence',
    tags: ['strategy', 'consulting', 'digital-transformation'],
    category: 'Strategy & Consulting',
    fileName: 'strategy'
  },
  {
    title: 'Technical Project Leadership',
    url: 'leadership',
    description: 'Leadership approach to technical project management and team development',
    tags: ['leadership', 'culture', 'team-building'],
    category: 'Leadership & Culture',
    fileName: 'leadership'
  },
  {
    title: 'Organizational Strategy & Talent Innovation',
    url: 'talent',
    description: 'Talent development and organizational strategy initiatives',
    tags: ['talent', 'hr', 'organizational-development'],
    category: 'Talent & HR',
    fileName: 'talent'
  },
  {
    title: 'Cloud & DevOps Engineering',
    url: 'devops',
    description: 'Cloud automation and DevOps best practices implementation',
    tags: ['devops', 'cloud', 'automation'],
    category: 'Technology & Operations',
    fileName: 'devops'
  },
  {
    title: 'ERP & SaaS Integration',
    url: 'saas',
    description: 'Enterprise system integration and SaaS platform connectivity',
    tags: ['saas', 'erp', 'integration'],
    category: 'Technology & Operations',
    fileName: 'saas'
  },
  {
    title: 'Data Analytics & Business Intelligence',
    url: 'analytics',
    description: 'Data analytics and business intelligence solutions',
    tags: ['analytics', 'data', 'business-intelligence'],
    category: 'Data & Analytics',
    fileName: 'analytics'
  },
  {
    title: 'Risk Management & Compliance',
    url: 'risk-compliance',
    description: 'Risk management and compliance frameworks',
    tags: ['risk', 'compliance', 'governance'],
    category: 'Risk & Compliance',
    fileName: 'risk-compliance'
  },
  {
    title: 'Governance & PMO',
    url: 'governance-pmo',
    description: 'Project management office and governance structures',
    tags: ['governance', 'pmo', 'project-management'],
    category: 'Governance & PMO',
    fileName: 'governance-pmo'
  },
  {
    title: 'Product & UX Design',
    url: 'product-ux',
    description: 'Product development and user experience design',
    tags: ['product', 'ux', 'design'],
    category: 'Product & UX',
    fileName: 'product-ux'
  },
  {
    title: 'AI & Automation',
    url: 'ai-automation',
    description: 'Artificial intelligence and automation solutions',
    tags: ['ai', 'automation', 'machine-learning'],
    category: 'AI & Automation',
    fileName: 'ai-automation'
  },
  {
    title: 'Culture & Leadership Philosophy',
    url: 'culture',
    description: 'Leadership philosophy and organizational culture development',
    tags: ['culture', 'leadership', 'organizational-development'],
    category: 'Leadership & Culture',
    fileName: 'culture'
  },
  {
    title: 'Core Capabilities',
    url: 'capabilities',
    description: 'Core technical and business capabilities',
    tags: ['capabilities', 'skills', 'expertise'],
    category: 'Core Capabilities',
    fileName: 'capabilities'
  },
  {
    title: 'Project Portfolio',
    url: 'projects',
    description: 'Portfolio of completed projects and case studies',
    tags: ['projects', 'case-studies', 'portfolio'],
    category: 'Project Portfolio',
    fileName: 'projects'
  },
  {
    title: 'Education & Certifications',
    url: 'education-certifications',
    description: 'Educational background and professional certifications',
    tags: ['education', 'certifications', 'professional-development'],
    category: 'Education & Certifications',
    fileName: 'education-certifications'
  }
]

export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  // Only load portfolio items at runtime, not during build
  if (typeof window === 'undefined') {
    // During build/SSR, return static items
    logger.portfolioLoading('Portfolio items loading skipped during build/SSR, using static data')
    return staticPortfolioItems.map(item => ({
      ...item,
      frontmatter: {}
    }))
  }
  
  // At runtime, try to load dynamic content, but fall back to static if needed
  try {
    const items: PortfolioItem[] = []
    
    // Dynamically discover all content files
const [portfolioFiles, blogFiles, projectFiles] = await Promise.all([
  discoverPortfolioFiles(),
  discoverBlogFiles(),
  discoverProjectFiles()
])

logger.contentSummary(portfolioFiles.length, blogFiles.length, projectFiles.length)
    
    if (portfolioFiles.length === 0) {
      logger.warn('No portfolio files discovered, using static data')
      return staticPortfolioItems.map(item => ({
        ...item,
        frontmatter: {}
      }))
    }

    for (const fileName of portfolioFiles) {
      try {
        const fileNameWithoutExt = fileName.replace('.md', '')
        const markdownModule = await import(`../content/portfolio/${fileNameWithoutExt}.md?raw`)
        const text = markdownModule.default

        // Parse frontmatter
        const { attributes, body } = fm(text)
        const frontmatter = attributes as Record<string, unknown>

        // Generate URL from filename
        const url = fileNameWithoutExt

        // Determine category
        const category = determineCategory(fileName, frontmatter)

        // Generate title - prioritize frontmatter, then filename, then fallback
        let title = generateTitleFromFilename(fileName)
        if (frontmatter.title && typeof frontmatter.title === 'string') {
          title = frontmatter.title
        }

        // Generate description - prioritize frontmatter, then content extraction, then fallback
        let description = 'No description available'
        if (frontmatter.description && typeof frontmatter.description === 'string') {
          description = frontmatter.description
        } else if (body && body.trim()) {
          description = extractDescriptionFromContent(body)
        }

        // Extract tags - prioritize frontmatter tags, then keywords, then fallback
        let tags: string[] = []
        if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
          tags = frontmatter.tags.filter(tag => typeof tag === 'string')
        } else if (frontmatter.keywords && Array.isArray(frontmatter.keywords)) {
          tags = frontmatter.keywords.filter(keyword => typeof keyword === 'string')
        } else if (frontmatter.keywords && typeof frontmatter.keywords === 'string') {
          tags = [frontmatter.keywords]
        }

        // Create portfolio item
        const item: PortfolioItem = {
          title,
          url,
          description,
          tags,
          category,
          fileName: fileNameWithoutExt,
          frontmatter
        }

        items.push(item)
      } catch (error) {
        logger.error(`Error loading portfolio file ${fileName}:`, error)
        // Fall back to static item if available
        const staticItem = staticPortfolioItems.find(item => item.fileName === fileName.replace('.md', ''))
        if (staticItem) {
          items.push({
            ...staticItem,
            frontmatter: {}
          })
        }
      }
    }

    // Sort items by category and then by title for consistent display
    return items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.title.localeCompare(b.title)
    })
  } catch (error) {
    logger.error('Error in dynamic portfolio loading, using static data:', error)
    return staticPortfolioItems.map(item => ({
      ...item,
      frontmatter: {}
    }))
  }
}

export function getCategoryColors(): Record<string, string> {
  const colors: Record<string, string> = {}
  Object.values(categoryMappings).forEach(category => {
    colors[category.name] = category.color
  })
  return colors
}
