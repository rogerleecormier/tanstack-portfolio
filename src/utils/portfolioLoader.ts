import { logger } from './logger'
import { loadPortfolioItems as loadR2PortfolioItems, loadBlogItems as loadR2BlogItems, loadProjectItems as loadR2ProjectItems, getPortfolioItem as getR2PortfolioItem, getBlogItem as getR2BlogItem, getProjectItem as getR2ProjectItem } from '@/utils/r2PortfolioLoader'

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

// Load all portfolio items from R2 storage
export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    logger.info('🔄 Loading portfolio items from R2 storage...')

    // Use R2 loader instead of GitHub worker
    const r2Items = await loadR2PortfolioItems()
    logger.info(`📁 Found ${r2Items.length} portfolio items from R2`)

    // Convert R2 items to PortfolioItem format
    const items: PortfolioItem[] = r2Items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags,
      category: item.category,
      url: item.url,
      keywords: item.keywords,
      content: item.content,
      date: item.date,
      fileName: item.fileName,
      frontmatter: item.frontmatter
    }))

    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title))

    logger.info(`✅ Successfully loaded ${sortedItems.length} portfolio items from R2`)
    return sortedItems
  } catch (error) {
    logger.error('❌ Failed to load portfolio items from R2:', error)
    throw error
  }
}

// Get a specific portfolio item by ID from R2 storage
export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  try {
    logger.info(`🔄 Loading portfolio item: ${id}`)

    // Use R2 loader instead of GitHub worker
    const item = await getR2PortfolioItem(id)

    if (item) {
      // Convert R2 item to PortfolioItem format
      const portfolioItem: PortfolioItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        category: item.category,
        url: item.url,
        keywords: item.keywords,
        content: item.content,
        date: item.date,
        fileName: item.fileName,
        frontmatter: item.frontmatter
      }

      logger.info(`✅ Successfully loaded portfolio item: ${portfolioItem.title}`)
      return portfolioItem
    }

    logger.warn(`⚠️ Portfolio item not found: ${id}`)
    return null
  } catch (error) {
    logger.error(`❌ Error loading portfolio item ${id} from R2:`, error)
    return null
  }
}

// Load all project items from R2 storage
export async function loadProjectItems(): Promise<ProjectItem[]> {
  try {
    logger.info('🔄 Loading project items from R2 storage...')

    // Use R2 loader instead of GitHub worker
    const r2Items = await loadR2ProjectItems()
    logger.info(`📁 Found ${r2Items.length} project items from R2`)

    // Convert R2 items to ProjectItem format
    const items: ProjectItem[] = r2Items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags,
      category: item.category,
      url: item.url,
      keywords: item.keywords,
      content: item.content,
      date: item.date,
      fileName: item.fileName,
      frontmatter: item.frontmatter
    }))

    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title))

    logger.info(`✅ Successfully loaded ${sortedItems.length} project items from R2`)
    return sortedItems
  } catch (error) {
    logger.error('❌ Failed to load project items from R2:', error)
    throw error
  }
}

// Get a specific project item by ID from R2 storage
export async function getProjectItem(id: string): Promise<ProjectItem | null> {
  try {
    logger.info(`🔄 Loading project item: ${id}`)

    // Use R2 loader instead of GitHub worker
    const item = await getR2ProjectItem(id)

    if (item) {
      // Convert R2 item to ProjectItem format
      const projectItem: ProjectItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        category: item.category,
        url: item.url,
        keywords: item.keywords,
        content: item.content,
        date: item.date,
        fileName: item.fileName,
        frontmatter: item.frontmatter
      }

      logger.info(`✅ Successfully loaded project item: ${projectItem.title}`)
      return projectItem
    }

    logger.warn(`⚠️ Project item not found: ${id}`)
    return null
  } catch (error) {
    logger.error(`❌ Error loading project item ${id} from R2:`, error)
    return null
  }
}

// Load all blog items from R2 storage
export async function loadBlogItems(): Promise<BlogItem[]> {
  try {
    logger.info('🔄 Loading blog items from R2 storage...')

    // Use R2 loader instead of GitHub worker
    const r2Items = await loadR2BlogItems()
    logger.info(`📚 Found ${r2Items.length} blog items from R2`)

    // Convert R2 items to BlogItem format
    const items: BlogItem[] = r2Items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags,
      category: item.category,
      url: item.url,
      keywords: item.keywords,
      content: item.content,
      date: item.date,
      fileName: item.fileName,
      frontmatter: item.frontmatter
    }))

    // Sort by date (most recent first)
    const sortedItems = items.sort((a, b) =>
      new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
    )

    logger.info(`✅ Successfully loaded ${sortedItems.length} blog items from R2`)
    return sortedItems
  } catch (error) {
    logger.error('❌ Failed to load blog items from R2:', error)
    throw error
  }
}

// Get a specific blog item by ID from R2 storage
export async function getBlogItem(id: string): Promise<BlogItem | null> {
  try {
    logger.info(`🔄 Loading blog item: ${id}`)

    // Use R2 loader instead of GitHub worker
    const item = await getR2BlogItem(id)

    if (item) {
      // Convert R2 item to BlogItem format
      const blogItem: BlogItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        category: item.category,
        url: item.url,
        keywords: item.keywords,
        content: item.content,
        date: item.date,
        fileName: item.fileName,
        frontmatter: item.frontmatter
      }

      logger.info(`✅ Successfully loaded blog item: ${blogItem.title}`)
      return blogItem
    }

    logger.warn(`⚠️ Blog item not found: ${id}`)
    return null
  } catch (error) {
    logger.error(`❌ Error loading blog item ${id} from R2:`, error)
    return null
  }
}
