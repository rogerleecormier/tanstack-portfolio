import fm from 'front-matter'
import { logger } from './logger'
import { loadBlogItems, getBlogItem } from '@/utils/r2PortfolioLoader'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
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
export function formatDate(dateString: string): string {
  // Create date and adjust for timezone to ensure it displays as the intended date
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
        const { attributes, body } = fm(item.content)
        const frontmatter = attributes as BlogFrontmatter
        
        logger.info(`📝 Frontmatter parsed:`, frontmatter)

        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

        // Calculate reading time
        const calculatedReadingTime = calculateReadingTime(cleanedBody)

        // Extract slug from filename
        const slug = item.fileName.replace('.md', '')

        // Create blog post
        const post: BlogPost = {
          slug,
          title: (frontmatter.title as string) || item.title,
          description: (frontmatter.description as string) || item.description,
          date: (frontmatter.date as string) || new Date().toISOString(),
          author: (frontmatter.author as string) || 'Roger Lee Cormier',
          tags: (frontmatter.tags as string[]) || (frontmatter.keywords as string[]) || item.tags,
          readTime: (frontmatter.readTime as number) || calculatedReadingTime,
          content: cleanedBody,
          image: frontmatter.image as string,
          keywords: (frontmatter.keywords as string[]) || item.keywords
        }

        posts.push(post)
        logger.info(`✅ Successfully loaded blog post: ${post.title}`)
      } catch (error) {
        logger.error(`❌ Exception processing blog item ${item.title}:`, error)
      }
    }

    // Sort by date (most recent first)
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

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
      const { attributes, body } = fm(item.content)
      const frontmatter = attributes as BlogFrontmatter

      // Remove import statements from markdown content
      const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

      // Calculate reading time
      const calculatedReadingTime = calculateReadingTime(cleanedBody)

      const blogPost: BlogPost = {
        slug,
        title: frontmatter.title || item.title,
        description: frontmatter.description || item.description,
        date: frontmatter.date || item.date || new Date().toISOString(),
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
