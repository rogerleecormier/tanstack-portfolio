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
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Load all blog posts
export async function loadAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // In a real implementation, this would dynamically import all markdown files
    // For now, we'll return the known blog post
    const posts: BlogPost[] = [
      {
        slug: 'getting-started-with-devops-automation',
        title: 'Getting Started with DevOps Automation: A Practical Guide',
        description: 'Learn the fundamentals of DevOps automation and how to implement CI/CD pipelines that will transform your development workflow.',
        date: '2024-01-15',
        author: 'Ryan Cormier',
        tags: ['DevOps', 'Automation', 'CI/CD', 'GitHub Actions', 'Azure'],
        readTime: 8,
        content: ''
      }
    ]

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
      content: cleanedBody
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
