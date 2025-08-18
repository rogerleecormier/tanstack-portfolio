import Fuse from 'fuse.js'
import type { SearchItem, SearchResult } from '../types/search'

// Define all your markdown files and their route mappings
const MARKDOWN_FILES = [
  { file: 'about', url: 'about', section: 'About' },
  { file: 'strategy', url: 'strategy', section: 'Strategy' },
  { file: 'leadership', url: 'leadership', section: 'Leadership' },
  { file: 'devops', url: 'devops', section: 'DevOps' },
  { file: 'saas', url: 'saas', section: 'SaaS' },
  { file: 'talent', url: 'talent', section: 'Talent' },
  { file: 'culture', url: 'culture', section: 'Culture' },
  { file: 'vision', url: 'vision', section: 'Vision' },
  { file: 'analytics', url: 'analytics', section: 'Analytics' },
  // Add the nested project analysis page
  { file: 'project-analysis', url: 'project-analysis', section: 'Analytics' },
]

let searchIndex: Fuse<SearchItem> | null = null
let searchData: SearchItem[] = []

// Initialize search index
export const initializeSearchIndex = async (): Promise<void> => {
  try {
    const items: SearchItem[] = []
    
    for (const { file, url, section } of MARKDOWN_FILES) {
      try {
        // Import markdown file
        const markdownModule = await import(`../content/${file}.md?raw`)
        const text = markdownModule.default
        
        // Parse frontmatter
        const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
        const match = text.match(fmRegex)
        
        let frontmatter: any = {}
        let content = text
        
        if (match) {
          try {
            // Simple YAML parsing for frontmatter
            const yamlContent = match[1]
            const lines = yamlContent.split('\n')
            for (const line of lines) {
              const [key, ...valueParts] = line.split(':')
              if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
                frontmatter[key.trim()] = value
              }
            }
          } catch (e) {
            console.warn(`Failed to parse frontmatter for ${file}:`, e)
          }
          content = match[2]
        }
        
        // Extract headings
        const headingRegex = /^#{1,6}\s+(.+)$/gm
        const headings: string[] = []
        let headingMatch
        
        while ((headingMatch = headingRegex.exec(content)) !== null) {
          // Remove emoji and clean up heading text
          const cleanHeading = headingMatch[1].replace(/[^\w\s-]/g, '').trim()
          if (cleanHeading) {
            headings.push(cleanHeading)
          }
        }
        
        // Clean content for searching (remove markdown syntax)
        const cleanContent = content
          .replace(/#{1,6}\s+/g, '') // Remove heading markers
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
          .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
          .replace(/`(.*?)`/g, '$1') // Remove code markers
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
          .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Extract image alt text
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .trim()
        
        const item: SearchItem = {
          id: `${section.toLowerCase()}-${file}`,
          title: frontmatter.title || section,
          content: cleanContent,
          description: frontmatter.description,
          url,
          section,
          headings,
          tags: frontmatter.tags || []
        }
        
        items.push(item)
      } catch (error) {
        console.warn(`Failed to load ${file}.md:`, error)
      }
    }
    
    searchData = items
    
    // Configure Fuse.js search
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'description', weight: 0.25 },
        { name: 'content', weight: 0.2 },
        { name: 'headings', weight: 0.15 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    }
    
    searchIndex = new Fuse(searchData, fuseOptions)
    
    console.log(`Search index initialized with ${items.length} items`)
  } catch (error) {
    console.error('Failed to initialize search index:', error)
  }
}

// Perform search
export const performSearch = async (query: string): Promise<SearchResult[]> => {
  if (!searchIndex) {
    await initializeSearchIndex()
  }
  
  if (!searchIndex || query.length < 2) {
    return []
  }
  
  const results = searchIndex.search(query)
  
  return results.map(result => ({
    item: result.item,
    score: result.score,
    matches: result.matches?.map(match => ({
      key: match.key || '',
      indices: match.indices.map(([start, end]) => [start, end] as [number, number])
    }))
  }))
}

// Get all search data (for debugging)
export const getSearchData = (): SearchItem[] => {
  return searchData
}