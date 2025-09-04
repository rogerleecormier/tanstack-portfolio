import fm from 'gray-matter'
import { logger } from './logger'
import { loadBlogItems, getBlogItem } from '@/utils/r2PortfolioLoader'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date?: string
  author: string
  tags: string[]
  readTime: number
  content: string
  image?: string
  keywords: string[]
}

export interface BlogFrontmatter {
  title?: string
  description?: string
  date?: string
  author?: string
  tags?: string[]
  readTime?: number
  image?: string
  keywords?: string[]
}

// Calculate reading time based on content length
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Format date for display
export function formatDate(dateString: string | undefined): string {
  try {
    // Handle undefined, null, or empty date strings
    if (!dateString || dateString.trim() === '') {
      return 'Date not available'
    }

    // Parse the date string directly without adding time to avoid timezone issues
    // Split the date string to get year, month, day
    const [year, month, day] = dateString.split('-').map(Number)
    
    // Check if we have valid year, month, day
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      logger.warn(`⚠️ Invalid date format: ${dateString}`)
      return 'Date not available'
    }

    // Create date using UTC to avoid timezone shifts
    const date = new Date(Date.UTC(year, month - 1, day))
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      logger.warn(`⚠️ Invalid date: ${dateString}`)
      return 'Date not available'
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    logger.error(`❌ Error formatting date: ${dateString}`, error)
    return 'Date not available'
  }
}

// Load all blog posts from R2 storage
export async function loadAllBlogPosts(): Promise<BlogPost[]> {
  try {
    logger.info('🔄 Loading blog posts from R2 storage...')
    
    // Use R2 loader instead of GitHub worker
    const blogItems = await loadBlogItems()
    logger.info(`📚 Found ${blogItems.length} blog items from R2`)
    
    const posts: BlogPost[] = []

    // Convert R2 blog items to BlogPost format
    for (const item of blogItems) {
      try {
        logger.info(`🔄 Processing blog item: ${item.title}`)
        
        // Parse frontmatter from the content
        const { data, content } = fm(item.content)
        const frontmatter = data as BlogFrontmatter
        
        logger.info(`📝 Frontmatter parsed:`, frontmatter)
        logger.info(`📅 Frontmatter date type: ${typeof frontmatter.date}, value: ${frontmatter.date}`)
        logger.info(`📅 Frontmatter date exists: ${!!frontmatter.date}`)
        logger.info(`📄 Content preview: ${item.content.substring(0, 200)}...`)
        logger.info(`📄 Body preview: ${content.substring(0, 200)}...`)

        // Remove import statements from markdown content
        const cleanedBody = content.replace(/^import\s+.*$/gm, '').trim()

        // Calculate reading time
        const calculatedReadingTime = calculateReadingTime(cleanedBody)

        // Extract slug from filename
        const slug = item.fileName.replace('.md', '')

        // Create blog post
        const post: BlogPost = {
          slug,
          title: (frontmatter.title as string) || item.title,
          description: (frontmatter.description as string) || item.description,
          date: item.date || frontmatter.date as string, // Use date from R2 loader first
          author: (frontmatter.author as string) || 'Roger Lee Cormier',
          tags: (frontmatter.tags as string[]) || (frontmatter.keywords as string[]) || item.tags,
          readTime: (frontmatter.readTime as number) || calculatedReadingTime,
          content: cleanedBody,
          image: frontmatter.image as string,
          keywords: (frontmatter.keywords as string[]) || item.keywords
        }

        logger.info(`📅 Final post date: ${post.date}`)
        posts.push(post)
        logger.info(`✅ Successfully loaded blog post: ${post.title}`)
      } catch (error) {
        logger.error(`❌ Exception processing blog item ${item.title}:`, error)
      }
    }

    // Sort by date (most recent first)
    const sortedPosts = posts.sort((a, b) => {
      try {
        // Handle posts without dates by putting them at the end
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        
        // Parse dates using UTC to avoid timezone shifts
        const [yearA, monthA, dayA] = a.date!.split('-').map(Number)
        const [yearB, monthB, dayB] = b.date!.split('-').map(Number)
        
        const dateA = new Date(Date.UTC(yearA, monthA - 1, dayA))
        const dateB = new Date(Date.UTC(yearB, monthB - 1, dayB))
        
        // Handle invalid dates by putting them at the end
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0
        if (isNaN(dateA.getTime())) return 1
        if (isNaN(dateB.getTime())) return -1
        
        return dateB.getTime() - dateA.getTime()
      } catch (error) {
        logger.error('❌ Error sorting blog posts by date:', error)
        return 0
      }
    })

    logger.info(`✅ Successfully loaded ${sortedPosts.length} blog posts from R2`)
    return sortedPosts
  } catch (error) {
    logger.error('❌ Failed to load blog posts from R2:', error)
    throw error
  }
}

// Load a specific blog post by slug from R2 storage
export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    logger.info(`🔄 Loading blog post: ${slug}`)
    
    // Use R2 loader instead of GitHub worker
    const item = await getBlogItem(slug)
    
    if (item) {
      // Parse frontmatter from the content
      const { data, content } = fm(item.content)
      const frontmatter = data as BlogFrontmatter

      // Remove import statements from markdown content
      const cleanedBody = content.replace(/^import\s+.*$/gm, '').trim()

      // Calculate reading time
      const calculatedReadingTime = calculateReadingTime(cleanedBody)

      const blogPost: BlogPost = {
        slug,
        title: frontmatter.title || item.title,
        description: frontmatter.description || item.description,
        date: item.date || frontmatter.date || 'Date not available',
        author: frontmatter.author || 'Roger Lee Cormier',
        tags: frontmatter.tags || item.tags,
        readTime: frontmatter.readTime || calculatedReadingTime,
        content: cleanedBody,
        image: frontmatter.image,
        keywords: frontmatter.keywords || item.keywords
      }
      
      logger.info(`✅ Successfully loaded blog post: ${blogPost.title}`)
      return blogPost
    }
    
    logger.warn(`⚠️ Blog post not found: ${slug}`)
    return null
  } catch (error) {
    logger.error(`❌ Error loading blog post ${slug} from R2:`, error)
    return null
  }
}

// Get recent blog posts (default: 5)
export async function getRecentBlogPosts(limit: number = 5): Promise<BlogPost[]> {
  const allPosts = await loadAllBlogPosts()
  return allPosts.slice(0, limit)
}

// Search blog posts
export function searchBlogPosts(posts: BlogPost[], query: string): BlogPost[] {
  if (!query.trim()) return posts

  const searchTerm = query.toLowerCase()
  return posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm) ||
    post.description.toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}

// Filter blog posts by tags
export function filterBlogPostsByTags(posts: BlogPost[], tags: string[]): BlogPost[] {
  if (tags.length === 0) return posts

  return posts.filter(post =>
    tags.some(tag => post.tags.includes(tag))
  )
}

// Get all unique tags from blog posts (alias for compatibility)
export function getAllTags(posts: BlogPost[]): string[] {
  const allTags = posts.flatMap(post => post.tags)
  return [...new Set(allTags)].sort()
}

// Get all unique tags from blog posts (new name)
export function getAllBlogTags(posts: BlogPost[]): string[] {
  const allTags = posts.flatMap(post => post.tags)
  return [...new Set(allTags)].sort()
}

// Get blog posts by tag
export function getBlogPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter(post => post.tags.includes(tag))
}

// Get blog posts by author
export function getBlogPostsByAuthor(posts: BlogPost[], author: string): BlogPost[] {
  return posts.filter(post => post.author.toLowerCase().includes(author.toLowerCase()))
}

// Get blog posts by date range
export function getBlogPostsByDateRange(posts: BlogPost[], startDate: Date, endDate: Date): BlogPost[] {
  return posts.filter(post => {
    if (!post.date) return false
    const postDate = new Date(post.date)
    return postDate >= startDate && postDate <= endDate
  })
}

// Get blog posts by keyword
export function getBlogPostsByKeyword(posts: BlogPost[], keyword: string): BlogPost[] {
  const searchTerm = keyword.toLowerCase()
  return posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm) ||
    post.description.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm) ||
    post.keywords.some(k => k.toLowerCase().includes(searchTerm))
  )
}
