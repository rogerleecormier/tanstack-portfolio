import fm from 'front-matter'

export interface PortfolioItem {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
  keywords?: string[]
  content: string
  date?: string
}

// Map portfolio files to categories based on content analysis and specific file mappings
const getCategoryFromTags = (tags: string[], fileName: string): string => {
  const tagString = tags.join(' ').toLowerCase()
  
  // Specific file-based mappings for better categorization
  const fileCategoryMap: Record<string, string> = {
    'strategy': 'Strategy & Consulting',
    'leadership': 'Leadership & Culture',
    'culture': 'Leadership & Culture',
    'talent': 'Leadership & Culture',
    'devops': 'Technology & Operations',
    'saas': 'Technology & Operations',
    'product-ux': 'Technology & Operations',
    'analytics': 'Data & Analytics',
    'ai-automation': 'AI & Automation',
    'risk-compliance': 'Risk & Compliance',
    'governance-pmo': 'Leadership & Culture',
    'education-certifications': 'Leadership & Culture',
    'projects': 'Strategy & Consulting',
    'capabilities': 'Strategy & Consulting'
  }
  
  // Check file-based mapping first
  if (fileCategoryMap[fileName]) {
    return fileCategoryMap[fileName]
  }
  
  // Fallback to tag-based analysis
  if (tagString.includes('strategy') || tagString.includes('vision') || tagString.includes('transformation') || tagString.includes('portfolio')) {
    return 'Strategy & Consulting'
  }
  if (tagString.includes('leadership') || tagString.includes('culture') || tagString.includes('talent') || tagString.includes('education')) {
    return 'Leadership & Culture'
  }
  if (tagString.includes('technology') || tagString.includes('devops') || tagString.includes('infrastructure') || tagString.includes('product') || tagString.includes('ux')) {
    return 'Technology & Operations'
  }
  if (tagString.includes('ai') || tagString.includes('automation') || tagString.includes('intelligence') || tagString.includes('machine learning')) {
    return 'AI & Automation'
  }
  if (tagString.includes('analytics') || tagString.includes('data') || tagString.includes('insights') || tagString.includes('business intelligence')) {
    return 'Data & Analytics'
  }
  if (tagString.includes('risk') || tagString.includes('compliance') || tagString.includes('security') || tagString.includes('governance')) {
    return 'Risk & Compliance'
  }
  
  // Default category
  return 'Strategy & Consulting'
}

// Load all portfolio items dynamically from markdown files
export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    // Dynamically import all markdown files from the portfolio directory
    const portfolioModules = import.meta.glob('../content/portfolio/*.md', { query: '?raw', import: 'default' })
    
    const items: PortfolioItem[] = []

    for (const [filePath, importFn] of Object.entries(portfolioModules)) {
      try {
        // Import the content dynamically
        const content = await importFn() as string
        
        // Extract filename from path
        const fileName = filePath.split('/').pop()?.replace('.md', '')
        if (!fileName) continue

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
          title: (frontmatter.title as string) || fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: (frontmatter.description as string) || 'No description available',
          tags: [...tags, ...keywords],
          category: getCategoryFromTags(tags, fileName),
          url: `portfolio/${fileName}`,
          keywords,
          content: cleanedBody,
          date: frontmatter.date as string | undefined
        }

        items.push(item)
      } catch (error) {
        console.error(`Error loading portfolio file ${filePath}:`, error)
      }
    }

    // Sort by title for consistent ordering
    return items.sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    console.error('Error loading portfolio items:', error)
    return []
  }
}

// Load a specific portfolio item by id
export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  try {
    // Import the markdown file
    const markdownModule = await import(`../content/portfolio/${id}.md?raw`)
    const text = markdownModule.default

    // Parse frontmatter
    const { attributes, body } = fm(text)
    const frontmatter = attributes as Record<string, unknown>

    // Remove import statements from markdown content
    const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

    const tags = (frontmatter.tags as string[]) || []
    const keywords = (frontmatter.keywords as string[]) || []

    return {
      id,
      title: (frontmatter.title as string) || 'Untitled',
      description: (frontmatter.description as string) || '',
      tags: [...tags, ...keywords],
      category: getCategoryFromTags(tags, id),
      url: `portfolio/${id}`,
      keywords,
      content: cleanedBody,
      date: frontmatter.date as string | undefined
    }
  } catch (error) {
    console.error(`Error loading portfolio item ${id}:`, error)
    return null
  }
}
