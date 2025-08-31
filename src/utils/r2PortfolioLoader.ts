import fm from 'front-matter'
import { logger } from './logger'
import { getPortfolioUrl, getBlogUrl, getProjectUrl } from '@/config/r2Config'

export interface PortfolioItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  keywords: string[]
  content: string
  date?: string
  fileName: string
  frontmatter: Record<string, unknown>
}

export interface BlogItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  keywords: string[]
  content: string
  date?: string
  fileName: string
  frontmatter: Record<string, unknown>
}

export interface ProjectItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  keywords: string[]
  content: string
  date?: string
  fileName: string
  frontmatter: Record<string, unknown>
}

// Portfolio files available in R2
const PORTFOLIO_FILES = [
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

// Blog files available in R2
const BLOG_FILES = [
  'pmbok-agile-methodology-blend.md',
  'serverless-ai-workflows-azure-functions.md',
  'power-automate-workflow-automation.md',
  'asana-ai-status-reporting.md',
  'mkdocs-github-actions-portfolio.md',
  'internal-ethos-high-performing-organizations.md',
  'digital-transformation-strategy-governance.md',
  'military-leadership-be-know-do.md',
  'ramp-agents-ai-finance-operations.md',
  'pmp-digital-transformation-leadership.md'
]

// Project files available in R2
const PROJECT_FILES = [
  'project-analysis.md'
]

// Helper function to determine category from tags and filename
function getCategoryFromTags(tags: string[], fileName: string): string {
  const tagString = tags.join(' ').toLowerCase()
  const fileNameLower = fileName.toLowerCase()
  
  // Strategy & Consulting
  if (tagString.includes('strategy') || tagString.includes('consulting') || 
      fileNameLower.includes('strategy') || fileNameLower.includes('governance')) {
    return 'Strategy & Consulting'
  }
  
  // Leadership & Culture
  if (tagString.includes('leadership') || tagString.includes('culture') || 
      tagString.includes('talent') || tagString.includes('team') ||
      fileNameLower.includes('leadership') || fileNameLower.includes('culture') ||
      fileNameLower.includes('talent')) {
    return 'Leadership & Culture'
  }
  
  // Technology & Operations
  if (tagString.includes('devops') || tagString.includes('technology') || 
      tagString.includes('saas') || tagString.includes('automation') ||
      fileNameLower.includes('devops') || fileNameLower.includes('saas') ||
      fileNameLower.includes('ai-automation')) {
    return 'Technology & Operations'
  }
  
  // Data & Analytics
  if (tagString.includes('analytics') || tagString.includes('data') || 
      tagString.includes('insights') || fileNameLower.includes('analytics')) {
    return 'Data & Analytics'
  }
  
  // Risk & Compliance
  if (tagString.includes('risk') || tagString.includes('compliance') || 
      tagString.includes('governance') || fileNameLower.includes('risk-compliance')) {
    return 'Risk & Compliance'
  }
  
  // Product & UX
  if (tagString.includes('product') || tagString.includes('ux') || 
      tagString.includes('design') || fileNameLower.includes('product-ux')) {
    return 'Product & UX'
  }
  
  // Education & Certifications
  if (tagString.includes('education') || tagString.includes('certification') ||
      fileNameLower.includes('education-certifications')) {
    return 'Education & Certifications'
  }
  
  // AI & Automation
  if (tagString.includes('ai') || tagString.includes('artificial intelligence') ||
      fileNameLower.includes('ai-automation')) {
    return 'AI & Automation'
  }
  
  // Project Portfolio
  if (fileNameLower.includes('projects') || fileNameLower.includes('project-analysis')) {
    return 'Project Portfolio'
  }
  
  // Default category
  return 'Strategy & Consulting'
}

// Load portfolio items directly from R2
export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    logger.info('🔄 Loading portfolio items from Cloudflare R2...')
    
    const items: PortfolioItem[] = []
    
    // Load each portfolio file from R2
    for (const fileName of PORTFOLIO_FILES) {
      try {
        const fileUrl = getPortfolioUrl(fileName)
        logger.info(`📖 Fetching: ${fileUrl}`)
        
        const response = await fetch(fileUrl)
        
        if (!response.ok) {
          logger.warn(`⚠️ Failed to fetch ${fileName}: ${response.status}`)
          continue
        }
        
        const content = await response.text()
        
        if (!content || content.trim().length === 0) {
          logger.warn(`⚠️ Empty content for ${fileName}`)
          continue
        }
        
        // Parse frontmatter
        const { attributes, body } = fm(content)
        const frontmatter = attributes as Record<string, unknown>
        
        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
        
        const tags = (frontmatter.tags as string[]) || []
        const keywords = (frontmatter.keywords as string[]) || []
        
        // Extract filename for ID and URL
        const fileNameWithoutExt = fileName.replace('.md', '')
        
        // Create portfolio item
        const item: PortfolioItem = {
          id: fileNameWithoutExt,
          title: (frontmatter.title as string) || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: (frontmatter.description as string) || 'No description available',
          tags: [...tags, ...keywords],
          category: getCategoryFromTags(tags, fileNameWithoutExt),
          url: `portfolio/${fileNameWithoutExt}`,
          keywords,
          content: cleanedBody,
          date: frontmatter.date as string,
          fileName: fileNameWithoutExt,
          frontmatter
        }
        
        items.push(item)
        logger.info(`✅ Loaded portfolio item: ${item.title}`)
        
      } catch (error) {
        logger.error(`❌ Error loading portfolio file ${fileName}:`, error)
      }
    }
    
    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title))
    
    logger.info(`🎉 Successfully loaded ${sortedItems.length} portfolio items from R2`)
    return sortedItems
    
  } catch (error) {
    logger.error('❌ Error loading portfolio items from R2:', error)
    return []
  }
}

// Load blog items directly from R2
export async function loadBlogItems(): Promise<BlogItem[]> {
  try {
    logger.info('🔄 Loading blog items from Cloudflare R2...')
    
    const items: BlogItem[] = []
    
    // Load each blog file from R2
    for (const fileName of BLOG_FILES) {
      try {
        const fileUrl = getBlogUrl(fileName)
        logger.info(`📖 Fetching: ${fileUrl}`)
        
        const response = await fetch(fileUrl)
        
        if (!response.ok) {
          logger.warn(`⚠️ Failed to fetch ${fileName}: ${response.status}`)
          continue
        }
        
        const content = await response.text()
        
        if (!content || content.trim().length === 0) {
          logger.warn(`⚠️ Empty content for ${fileName}`)
          continue
        }
        
        // Parse frontmatter
        const { attributes, body } = fm(content)
        const frontmatter = attributes as Record<string, unknown>
        
        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
        
        const tags = (frontmatter.tags as string[]) || []
        const keywords = (frontmatter.keywords as string[]) || []
        
        // Extract filename for ID and URL
        const fileNameWithoutExt = fileName.replace('.md', '')
        
        // Create blog item
        const item: BlogItem = {
          id: fileNameWithoutExt,
          title: (frontmatter.title as string) || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: (frontmatter.description as string) || 'No description available',
          tags: [...tags, ...keywords],
          category: getCategoryFromTags(tags, fileNameWithoutExt),
          url: `blog/${fileNameWithoutExt}`,
          keywords,
          content: cleanedBody,
          date: frontmatter.date as string,
          fileName: fileNameWithoutExt,
          frontmatter
        }
        
        items.push(item)
        logger.info(`✅ Loaded blog item: ${item.title}`)
        
      } catch (error) {
        logger.error(`❌ Error loading blog file ${fileName}:`, error)
      }
    }
    
    // Sort by date (newest first)
    const sortedItems = items.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return 0
    })
    
    logger.info(`🎉 Successfully loaded ${sortedItems.length} blog items from R2`)
    return sortedItems
    
  } catch (error) {
    logger.error('❌ Error loading blog items from R2:', error)
    return []
  }
}

// Load project items directly from R2
export async function loadProjectItems(): Promise<ProjectItem[]> {
  try {
    logger.info('🔄 Loading project items from Cloudflare R2...')
    
    const items: ProjectItem[] = []
    
    // Load each project file from R2
    for (const fileName of PROJECT_FILES) {
      try {
        const fileUrl = getProjectUrl(fileName)
        logger.info(`📖 Fetching: ${fileUrl}`)
        
        const response = await fetch(fileUrl)
        
        if (!response.ok) {
          logger.warn(`⚠️ Failed to fetch ${fileName}: ${response.status}`)
          continue
        }
        
        const content = await response.text()
        
        if (!content || content.trim().length === 0) {
          logger.warn(`⚠️ Empty content for ${fileName}`)
          continue
        }
        
        // Parse frontmatter
        const { attributes, body } = fm(content)
        const frontmatter = attributes as Record<string, unknown>
        
        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
        
        const tags = (frontmatter.tags as string[]) || []
        const keywords = (frontmatter.keywords as string[]) || []
        
        // Extract filename for ID and URL
        const fileNameWithoutExt = fileName.replace('.md', '')
        
        // Create project item
        const item: ProjectItem = {
          id: fileNameWithoutExt,
          title: (frontmatter.title as string) || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: (frontmatter.description as string) || 'No description available',
          tags: [...tags, ...keywords],
          category: getCategoryFromTags(tags, fileNameWithoutExt),
          url: `projects/${fileNameWithoutExt}`,
          keywords,
          content: cleanedBody,
          date: frontmatter.date as string,
          fileName: fileNameWithoutExt,
          frontmatter
        }
        
        items.push(item)
        logger.info(`✅ Loaded project item: ${item.title}`)
        
      } catch (error) {
        logger.error(`❌ Error loading project file ${fileName}:`, error)
      }
    }
    
    logger.info(`🎉 Successfully loaded ${items.length} project items from R2`)
    return items
    
  } catch (error) {
    logger.error('❌ Error loading project items from R2:', error)
    return []
  }
}

// Get a specific portfolio item by filename
export async function getPortfolioItem(fileName: string): Promise<PortfolioItem | null> {
  try {
    const fileUrl = getPortfolioUrl(`${fileName}.md`)
    logger.info(`📖 Fetching portfolio item: ${fileUrl}`)
    
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      logger.warn(`⚠️ Failed to fetch portfolio item ${fileName}: ${response.status}`)
      return null
    }
    
    const content = await response.text()
    
    if (!content || content.trim().length === 0) {
      logger.warn(`⚠️ Empty content for portfolio item ${fileName}`)
      return null
    }
    
    // Parse frontmatter
    const { attributes, body } = fm(content)
    const frontmatter = attributes as Record<string, unknown>
    
    // Remove import statements from markdown content
    const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
    
    const tags = (frontmatter.tags as string[]) || []
    const keywords = (frontmatter.keywords as string[]) || []
    
    // Create portfolio item
    const item: PortfolioItem = {
      id: fileName,
      title: (frontmatter.title as string) || fileName.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: (frontmatter.description as string) || 'No description available',
      tags: [...tags, ...keywords],
      category: getCategoryFromTags(tags, fileName),
      url: `portfolio/${fileName}`,
      keywords,
      content: cleanedBody,
      date: frontmatter.date as string,
      fileName,
      frontmatter
    }
    
    logger.info(`✅ Loaded portfolio item: ${item.title}`)
    return item
    
  } catch (error) {
    logger.error(`❌ Error loading portfolio item ${fileName}:`, error)
    return null
  }
}

// Get a specific blog item by filename
export async function getBlogItem(fileName: string): Promise<BlogItem | null> {
  try {
    const fileUrl = getBlogUrl(`${fileName}.md`)
    logger.info(`📖 Fetching blog item: ${fileUrl}`)
    
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      logger.warn(`⚠️ Failed to fetch blog item ${fileName}: ${response.status}`)
      return null
    }
    
    const content = await response.text()
    
    if (!content || content.trim().length === 0) {
      logger.warn(`⚠️ Empty content for blog item ${fileName}`)
      return null
    }
    
    // Parse frontmatter
    const { attributes, body } = fm(content)
    const frontmatter = attributes as Record<string, unknown>
    
    // Remove import statements from markdown content
    const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
    
    const tags = (frontmatter.tags as string[]) || []
    const keywords = (frontmatter.keywords as string[]) || []
    
    // Create blog item
    const item: BlogItem = {
      id: fileName,
      title: (frontmatter.title as string) || fileName.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: (frontmatter.description as string) || 'No description available',
      tags: [...tags, ...keywords],
      category: getCategoryFromTags(tags, fileName),
      url: `blog/${fileName}`,
      keywords,
      content: cleanedBody,
      date: frontmatter.date as string,
      fileName,
      frontmatter
    }
    
    logger.info(`✅ Loaded blog item: ${item.title}`)
    return item
    
  } catch (error) {
    logger.error(`❌ Error loading blog item ${fileName}:`, error)
    return null
  }
}

// Get a specific project item by filename
export async function getProjectItem(fileName: string): Promise<ProjectItem | null> {
  try {
    const fileUrl = getProjectUrl(`${fileName}.md`)
    logger.info(`📖 Fetching project item: ${fileUrl}`)
    
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      logger.warn(`⚠️ Failed to fetch project item ${fileName}: ${response.status}`)
      return null
    }
    
    const content = await response.text()
    
    if (!content || content.trim().length === 0) {
      logger.warn(`⚠️ Empty content for project item ${fileName}`)
      return null
    }
    
    // Parse frontmatter
    const { attributes, body } = fm(content)
    const frontmatter = attributes as Record<string, unknown>
    
    // Remove import statements from markdown content
    const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
    
    const tags = (frontmatter.tags as string[]) || []
    const keywords = (frontmatter.keywords as string[]) || []
    
    // Create project item
    const item: ProjectItem = {
      id: fileName,
      title: (frontmatter.title as string) || fileName.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: (frontmatter.description as string) || 'No description available',
      tags: [...tags, ...keywords],
      category: getCategoryFromTags(tags, fileName),
      url: `projects/${fileName}`,
      keywords,
      content: cleanedBody,
      date: frontmatter.date as string,
      fileName,
      frontmatter
    }
    
    logger.info(`✅ Loaded project item: ${item.title}`)
    return item
    
  } catch (error) {
    logger.error(`❌ Error loading project item ${fileName}:`, error)
    return null
  }
}

// Get category colors for UI display
export function getCategoryColors(): Record<string, string> {
  return {
    'Strategy & Consulting': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors',
    'Leadership & Culture': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors',
    'Technology & Operations': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors',
    'Data & Analytics': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors',
    'Risk & Compliance': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors',
    'Product & UX': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors',
    'Education & Certifications': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors',
    'AI & Automation': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors',
    'Project Portfolio': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'
  }
}
