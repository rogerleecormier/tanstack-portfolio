import { logger } from './logger'

// Import cached content data
import contentCache from '@/data/content-cache.json'

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

// Files are now dynamically discovered from cache - no more hardcoded lists!


// Load portfolio items from cache (dynamically discovered)
export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    logger.info('🔄 Loading portfolio items from cache...')

    const cachedPortfolioItems = contentCache.portfolio || []
    logger.info(`📚 Found ${cachedPortfolioItems.length} portfolio items in cache`)

    const items: PortfolioItem[] = []

    // Convert cached items to PortfolioItem format
    for (const cachedItem of cachedPortfolioItems) {
      try {
        // Create portfolio item from cached data
        const item: PortfolioItem = {
          id: cachedItem.id,
          title: cachedItem.title,
          description: cachedItem.description,
          tags: cachedItem.tags || [],
          category: cachedItem.category,
          url: cachedItem.url,
          keywords: cachedItem.keywords || [],
          content: cachedItem.content,
          date: cachedItem.date,
          fileName: cachedItem.fileName,
          frontmatter: {} // Frontmatter not stored in cache
        }

        items.push(item)
        logger.info(`✅ Loaded cached portfolio item: ${item.title}`)

      } catch (error) {
        logger.error(`❌ Error processing cached portfolio item ${cachedItem.id}:`, error)
      }
    }

    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title))

    logger.info(`🎉 Successfully loaded ${sortedItems.length} portfolio items from cache`)
    return sortedItems

  } catch (error) {
    logger.error('❌ Error loading portfolio items from cache:', error)
    return []
  }
}

// Load blog items from cache (dynamically discovered)
export async function loadBlogItems(): Promise<BlogItem[]> {
  try {
    logger.info('🔄 Loading blog items from cache...')

    const cachedBlogItems = contentCache.blog || []
    logger.info(`📚 Found ${cachedBlogItems.length} blog items in cache`)

    const items: BlogItem[] = []

    // Convert cached items to BlogItem format
    for (const cachedItem of cachedBlogItems) {
      try {
        // Create blog item from cached data
        const item: BlogItem = {
          id: cachedItem.id,
          title: cachedItem.title,
          description: cachedItem.description,
          tags: cachedItem.tags || [],
          category: cachedItem.category,
          url: cachedItem.url,
          keywords: cachedItem.keywords || [],
          content: cachedItem.content,
          date: cachedItem.date,
          fileName: cachedItem.fileName,
          frontmatter: {} // Frontmatter not stored in cache, but we can parse it if needed
        }

        items.push(item)
        logger.info(`✅ Loaded cached blog item: ${item.title}`)

      } catch (error) {
        logger.error(`❌ Error processing cached blog item ${cachedItem.id}:`, error)
      }
    }

    logger.info(`🎉 Successfully loaded ${items.length} blog items from cache`)
    return items

  } catch (error) {
    logger.error('❌ Error loading blog items from cache:', error)
    return []
  }
}

// Load project items from cache (dynamically discovered)
export async function loadProjectItems(): Promise<ProjectItem[]> {
  try {
    logger.info('🔄 Loading project items from cache...')

    const cachedProjectItems = contentCache.projects || []
    logger.info(`📚 Found ${cachedProjectItems.length} project items in cache`)

    const items: ProjectItem[] = []

    // Convert cached items to ProjectItem format
    for (const cachedItem of cachedProjectItems) {
      try {
        // Create project item from cached data
        const item: ProjectItem = {
          id: cachedItem.id,
          title: cachedItem.title,
          description: cachedItem.description,
          tags: cachedItem.tags || [],
          category: cachedItem.category,
          url: cachedItem.url,
          keywords: cachedItem.keywords || [],
          content: cachedItem.content,
          date: cachedItem.date,
          fileName: cachedItem.fileName,
          frontmatter: {} // Frontmatter not stored in cache
        }

        items.push(item)
        logger.info(`✅ Loaded cached project item: ${item.title}`)

      } catch (error) {
        logger.error(`❌ Error processing cached project item ${cachedItem.id}:`, error)
      }
    }

    logger.info(`🎉 Successfully loaded ${items.length} project items from cache`)
    return items

  } catch (error) {
    logger.error('❌ Error loading project items from cache:', error)
    return []
  }
}

// Get a specific portfolio item by filename from cache
export async function getPortfolioItem(fileName: string): Promise<PortfolioItem | null> {
  try {
    logger.info(`🔍 Looking for portfolio item: ${fileName} in cache`)

    const cachedPortfolioItems = contentCache.portfolio || []
    const cachedItem = cachedPortfolioItems.find(item => item.fileName === fileName)

    if (!cachedItem) {
      logger.warn(`⚠️ Portfolio item ${fileName} not found in cache`)
      return null
    }

    // Create portfolio item from cached data
    const item: PortfolioItem = {
      id: cachedItem.id,
      title: cachedItem.title,
      description: cachedItem.description,
      tags: cachedItem.tags || [],
      category: cachedItem.category,
      url: cachedItem.url,
      keywords: cachedItem.keywords || [],
      content: cachedItem.content,
      fileName: cachedItem.fileName,
      frontmatter: {} // Frontmatter not stored in cache
    }

    logger.info(`✅ Found portfolio item in cache: ${item.title}`)
    return item

  } catch (error) {
    logger.error(`❌ Error loading portfolio item ${fileName} from cache:`, error)
    return null
  }
}

// Get a specific blog item by filename from cache
export async function getBlogItem(fileName: string): Promise<BlogItem | null> {
  try {
    logger.info(`🔍 Looking for blog item: ${fileName} in cache`)

    const cachedBlogItems = contentCache.blog || []
    const cachedItem = cachedBlogItems.find(item => item.fileName === fileName)

    if (!cachedItem) {
      logger.warn(`⚠️ Blog item ${fileName} not found in cache`)
      return null
    }

    // Create blog item from cached data
    const item: BlogItem = {
      id: cachedItem.id,
      title: cachedItem.title,
      description: cachedItem.description,
      tags: cachedItem.tags || [],
      category: cachedItem.category,
      url: cachedItem.url,
      keywords: cachedItem.keywords || [],
      content: cachedItem.content,
      fileName: cachedItem.fileName,
      frontmatter: {} // Frontmatter not stored in cache
    }

    logger.info(`✅ Found blog item in cache: ${item.title}`)
    return item

  } catch (error) {
    logger.error(`❌ Error loading blog item ${fileName} from cache:`, error)
    return null
  }
}

// Get a specific project item by filename from cache
export async function getProjectItem(fileName: string): Promise<ProjectItem | null> {
  try {
    logger.info(`🔍 Looking for project item: ${fileName} in cache`)

    const cachedProjectItems = contentCache.projects || []
    const cachedItem = cachedProjectItems.find(item => item.fileName === fileName)

    if (!cachedItem) {
      logger.warn(`⚠️ Project item ${fileName} not found in cache`)
      return null
    }

    // Create project item from cached data
    const item: ProjectItem = {
      id: cachedItem.id,
      title: cachedItem.title,
      description: cachedItem.description,
      tags: cachedItem.tags || [],
      category: cachedItem.category,
      url: cachedItem.url,
      keywords: cachedItem.keywords || [],
      content: cachedItem.content,
      fileName: cachedItem.fileName,
      frontmatter: {} // Frontmatter not stored in cache
    }

    logger.info(`✅ Found project item in cache: ${item.title}`)
    return item

  } catch (error) {
    logger.error(`❌ Error loading project item ${fileName} from cache:`, error)
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
