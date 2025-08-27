import type { SearchItem } from '../types/search'

interface MarkdownFile {
  path: string
  content: string
  frontmatter?: Record<string, string | string[]>
}

// Function to extract text content from markdown
export const extractTextFromMarkdown = (markdown: string): string => {
  return markdown
    // Remove frontmatter
    .replace(/^---[\s\S]*?---/, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    // Remove headers but keep the text
    .replace(/#{1,6}\s+/g, '')
    // Remove links but keep the text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// Function to extract headings from markdown (only h2 level)
export const extractHeadingsFromMarkdown = (markdown: string): string[] => {
  // Only match ## headings (h2), not # headings (h1)
  const headingRegex = /^#{2}\s+(.+)$/gm
  const headings: string[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push(match[1].trim())
  }

  return headings
}

// Function to extract frontmatter
export const extractFrontmatter = (markdown: string): Record<string, string | string[]> => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/
  const match = markdown.match(frontmatterRegex)
  
  if (!match) return {}
  
  const frontmatterText = match[1]
  const frontmatter: Record<string, string | string[]> = {}
  
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '')
      if (key && value) {
        frontmatter[key] = value
      }
    }
  })
  
  return frontmatter
}

// Function to convert markdown files to search items
export const convertMarkdownToSearchItems = (markdownFiles: MarkdownFile[]): SearchItem[] => {
  return markdownFiles.map((file, index) => {
    const frontmatter = extractFrontmatter(file.content)
    const textContent = extractTextFromMarkdown(file.content)
    const headings = extractHeadingsFromMarkdown(file.content)
    
    // Extract filename without extension
    const filename = file.path.split('/').pop()?.replace('.md', '') || `page-${index}`
    
    // Determine content type and URL based on file path
    let contentType: 'blog' | 'portfolio' | 'project' | 'page' = 'page'
    let url = `/${filename}`
    
    if (file.path.includes('/blog/')) {
      contentType = 'blog'
      url = `/blog/${filename}`
    } else if (file.path.includes('/portfolio/')) {
      contentType = 'portfolio'
      url = `/portfolio/${filename}`
    } else if (file.path.includes('/projects/')) {
      contentType = 'project'
      url = `/projects/${filename}`
    }
    
    // Use frontmatter title if available, otherwise use capitalized filename
    const title = (Array.isArray(frontmatter.title) ? frontmatter.title[0] : frontmatter.title) || filename.charAt(0).toUpperCase() + filename.slice(1)
    
    // Use frontmatter description if available
    const description = (Array.isArray(frontmatter.description) ? frontmatter.description[0] : frontmatter.description) || ''
    
    // Extract section from frontmatter or use filename
    const section = (Array.isArray(frontmatter.section) ? frontmatter.section[0] : frontmatter.section) || filename.charAt(0).toUpperCase() + filename.slice(1)
    
    return {
      id: `page-${filename}`,
      title,
      content: textContent,
      description, // Add description field
      url,
      section,
      headings,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []),
      contentType
    }
  })
}