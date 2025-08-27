import fm from 'front-matter'

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
  keywords?: string[]
}

export interface BlogFrontmatter {
  title?: string
  description?: string
  tags?: string[]
  date?: string
  author?: string
  keywords?: string[]
  image?: string
  readTime?: number
}

// Calculate reading time based on word count
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Format date for display
export function formatDate(dateString: string): string {
  // Create date and adjust for timezone to ensure it displays as the intended date
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Load all blog posts dynamically from markdown files
export async function loadAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // Dynamically import all markdown files from the blog directory
    const blogModules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default' })
    
    const posts: BlogPost[] = []

    for (const [filePath, importFn] of Object.entries(blogModules)) {
      try {
        // Import the content dynamically
        const content = await importFn() as string
        
        // Extract filename from path
        const fileName = filePath.split('/').pop()?.replace('.md', '')
        if (!fileName) continue

        // Parse frontmatter
        const { attributes, body } = fm(content)
        const frontmatter = attributes as BlogFrontmatter

        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

        // Calculate reading time
        const calculatedReadingTime = calculateReadingTime(cleanedBody)

        // Create blog post
        const post: BlogPost = {
          slug: fileName,
          title: (frontmatter.title as string) || fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: (frontmatter.description as string) || 'No description available',
          date: (frontmatter.date as string) || new Date().toISOString(),
          author: (frontmatter.author as string) || 'Roger Lee Cormier',
          tags: (frontmatter.tags as string[]) || (frontmatter.keywords as string[]) || [],
          readTime: (frontmatter.readTime as number) || calculatedReadingTime,
          content: cleanedBody,
          image: frontmatter.image as string,
          keywords: frontmatter.keywords as string[]
        }

        posts.push(post)
      } catch (error) {
        console.error(`Error loading blog file ${filePath}:`, error)
      }
    }

    // Sort by date (most recent first)
    return posts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch (error) {
    console.error('Error loading blog posts:', error)
    return []
  }
}

// Load a specific blog post by slug
export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // Import the markdown file
    const markdownModule = await import(`../content/blog/${slug}.md?raw`)
    const text = markdownModule.default

    // Parse frontmatter
    const { attributes, body } = fm(text)
    const frontmatter = attributes as BlogFrontmatter

    // Remove import statements from markdown content
    const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

    // Calculate reading time
    const calculatedReadingTime = calculateReadingTime(cleanedBody)

    return {
      slug,
      title: frontmatter.title || 'Untitled',
      description: frontmatter.description || '',
      date: frontmatter.date || new Date().toISOString(),
      author: frontmatter.author || 'Ryan Cormier',
      tags: frontmatter.tags || [],
      readTime: frontmatter.readTime || calculatedReadingTime,
      content: cleanedBody,
      image: frontmatter.image,
      keywords: frontmatter.keywords
    }
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error)
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

// Get all unique tags from blog posts
export function getAllTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>()
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}
