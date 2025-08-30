import fm from 'front-matter'
import { logger } from './logger'

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

export interface ProjectItem {
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

// Load all portfolio items from the API worker
export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    logger.info('🔄 Loading portfolio items from API worker...')
    
    // Use the production worker URL
    const workerUrl = 'https://github-file-manager.rcormier.workers.dev'
    
    const listResponse = await fetch(`${workerUrl}/api/files/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directory: 'portfolio' })
    })

    if (!listResponse.ok) {
      throw new Error(`Failed to list portfolio files: ${listResponse.status}`)
    }

    const listResult = await listResponse.json()
    logger.info(`🔍 List API response:`, listResult)
    
    if (!listResult.success) {
      throw new Error(`Failed to list portfolio files: ${listResult.error}`)
    }

    const portfolioFiles = listResult.files || []
    logger.info(`📁 Found ${portfolioFiles.length} portfolio files`)
    
    // Log file types for debugging
    portfolioFiles.forEach((file: any) => {
      logger.info(`🔍 File: ${file.name}, Type: ${file.type}`)
    })
    
    const items: PortfolioItem[] = []

    // Load each portfolio item
    for (const file of portfolioFiles) {
      if (file.type === 'blob' && file.name.endsWith('.md')) {
        try {
          // Read the file content
                    const readResponse = await fetch(`${workerUrl}/api/files/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: `portfolio/${file.name}` })
          })

          if (readResponse.ok) {
            const readResult = await readResponse.json()
            logger.info(`🔍 Read API response for ${file.name}:`, { success: readResult.success, hasContent: !!readResult.content, contentLength: readResult.content?.length })
            
            if (readResult.success && readResult.content) {
                try {
                  // Parse frontmatter
                  const { attributes, body } = fm(readResult.content)
                  const frontmatter = attributes as Record<string, unknown>

                  // Remove import statements from markdown content
                  const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

                  const tags = (frontmatter.tags as string[]) || []
                  const keywords = (frontmatter.keywords as string[]) || []

                  // Extract filename for ID and URL
                  const fileName = file.name.replace('.md', '')

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
                    date: frontmatter.date as string
                  }

                  items.push(item)
                  logger.info(`✅ Loaded portfolio item: ${item.title}`)
                } catch (parseError) {
                  logger.error(`❌ Error parsing frontmatter for ${file.name}:`, parseError)
                  logger.error(`❌ Content preview:`, readResult.content.substring(0, 200))
                }
              } else {
                logger.error(`❌ No content in response for ${file.name}:`, readResult)
              }
            } else {
              logger.error(`❌ Failed to read ${file.name}: ${readResponse.status}`)
            }
        } catch (error) {
          logger.error(`❌ Error loading portfolio file ${file.name}:`, error)
        }
      }
    }

    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title))
    
    logger.info(`🎉 Successfully loaded ${sortedItems.length} portfolio items`)
    return sortedItems
  } catch (error) {
    logger.error('❌ Error loading portfolio items from API worker:', error)
    
    // Fallback to local loading if API worker fails
    logger.info('🔄 Falling back to local file loading...')
    return loadPortfolioItemsLocal()
  }
}

// Fallback function for local file loading
async function loadPortfolioItemsLocal(): Promise<PortfolioItem[]> {
  try {
    logger.info('🔄 Loading portfolio items from local files...')
    // For now, return empty array to avoid build issues
    // In a real fallback scenario, you might want to implement a different approach
    logger.warn('⚠️ Local file loading is disabled to avoid build issues')
    return []
  } catch (error) {
    logger.error('❌ Error loading portfolio items from local files:', error)
    return []
  }
}

// Load a specific portfolio item by id
export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  try {
    logger.info(`🔄 Loading portfolio item: ${id}`)
    
    // Use the production worker URL
    const workerUrl = 'https://github-file-manager.rcormier.workers.dev'
    
    const readResponse = await fetch(`${workerUrl}/api/files/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: `portfolio/${id}.md` })
    })

    if (readResponse.ok) {
      const readResult = await readResponse.json()
      if (readResult.success && readResult.content) {
        // Parse frontmatter
        const { attributes, body } = fm(readResult.content)
        const frontmatter = attributes as Record<string, unknown>

        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

        const tags = (frontmatter.tags as string[]) || []
        const keywords = (frontmatter.keywords as string[]) || []

        const portfolioItem: PortfolioItem = {
          id,
          title: (frontmatter.title as string) || 'Untitled',
          description: (frontmatter.description as string) || '',
          tags: [...tags, ...keywords],
          category: getCategoryFromTags(tags, id),
          url: `portfolio/${id}`,
          keywords,
          content: cleanedBody,
          date: frontmatter.date as string
        }
        
        logger.info(`✅ Successfully loaded portfolio item: ${portfolioItem.title}`)
        return portfolioItem
      }
    }
    
    // Fallback to local loading if API worker fails
    logger.info(`🔄 API worker failed, falling back to local loading for: ${id}`)
    return getPortfolioItemLocal(id)
  } catch (error) {
    logger.error(`❌ Error loading portfolio item ${id} from API worker:`, error)
    
    // Fallback to local loading
    try {
      return await getPortfolioItemLocal(id)
    } catch (localError) {
      logger.error(`❌ Error loading portfolio item ${id} from local files:`, localError)
      return null
    }
  }
}

// Fallback function for local file loading
async function getPortfolioItemLocal(id: string): Promise<PortfolioItem | null> {
  try {
    logger.info(`🔄 Loading portfolio item ${id} from local files...`)
    // For now, return null to avoid build issues
    // In a real fallback scenario, you might want to implement a different approach
    logger.warn('⚠️ Local file loading is disabled to avoid build issues')
    return null
  } catch (error) {
    logger.error(`❌ Error loading portfolio item ${id} from local files:`, error)
    return null
  }
}

// Load all project items from the API worker
export async function loadProjectItems(): Promise<ProjectItem[]> {
  try {
    logger.info('🔄 Loading project items from API worker...')
    
    // Use the production worker URL
    const workerUrl = 'https://github-file-manager.rcormier.workers.dev'
    
    const listResponse = await fetch(`${workerUrl}/api/files/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directory: 'projects' })
    })

    if (!listResponse.ok) {
      throw new Error(`Failed to list project files: ${listResponse.status}`)
    }

    const listResult = await listResponse.json()
    if (!listResult.success) {
      throw new Error(`Failed to list project files: ${listResult.error}`)
    }

    const projectFiles = listResult.files || []
    logger.info(`📁 Found ${projectFiles.length} project files`)
    
    const items: ProjectItem[] = []

    // Load each project item
    for (const file of projectFiles) {
      if (file.type === 'blob' && file.name.endsWith('.md')) {
        try {
          // Read the file content
          const readResponse = await fetch(`${workerUrl}/api/files/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: `projects/${file.name}` })
          })

          if (readResponse.ok) {
            const readResult = await readResponse.json()
            if (readResult.success && readResult.content) {
              // Parse frontmatter
              const { attributes, body } = fm(readResult.content)
              const frontmatter = attributes as Record<string, unknown>

              // Remove import statements from markdown content
              const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

              const tags = (frontmatter.tags as string[]) || []
              const keywords = (frontmatter.keywords as string[]) || []

              // Extract filename for ID and URL
              const fileName = file.name.replace('.md', '')

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
                date: frontmatter.date as string
              }

              items.push(item)
              logger.info(`✅ Loaded project item: ${item.title}`)
            }
          }
        } catch (error) {
          logger.error(`❌ Error loading project file ${file.name}:`, error)
        }
      }
    }

    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title))

    logger.info(`🎉 Successfully loaded ${sortedItems.length} project items`)
    return sortedItems
  } catch (error) {
    logger.error('❌ Error loading project items from API worker:', error)

    // Fallback to local loading if API worker fails
    logger.info('🔄 Falling back to local file loading...')
    return loadProjectItemsLocal()
  }
}

// Fallback function for local project loading
async function loadProjectItemsLocal(): Promise<ProjectItem[]> {
  try {
    logger.info('🔄 Loading project items from local files...')
    // For now, return empty array to avoid build issues
    // In a real fallback scenario, you might want to implement a different approach
    logger.warn('⚠️ Local file loading is disabled to avoid build issues')
    return []
  } catch (error) {
    logger.error('❌ Error loading project items from local files:', error)
    return []
  }
}

// Load a specific project item by id
export async function getProjectItem(id: string): Promise<ProjectItem | null> {
  try {
    logger.info(`🔄 Loading project item: ${id}`)

    // Use the production worker URL
    const workerUrl = 'https://github-file-manager.rcormier.workers.dev'

    const readResponse = await fetch(`${workerUrl}/api/files/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: `projects/${id}.md` })
    })

    if (readResponse.ok) {
      const readResult = await readResponse.json()
      if (readResult.success && readResult.content) {
        // Parse frontmatter
        const { attributes, body } = fm(readResult.content)
        const frontmatter = attributes as Record<string, unknown>

        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()

        const tags = (frontmatter.tags as string[]) || []
        const keywords = (frontmatter.keywords as string[]) || []

        const projectItem: ProjectItem = {
          id,
          title: (frontmatter.title as string) || 'Untitled',
          description: (frontmatter.description as string) || '',
          tags: [...tags, ...keywords],
          category: getCategoryFromTags(tags, id),
          url: `projects/${id}`,
          keywords,
          content: cleanedBody,
          date: frontmatter.date as string
        }

        logger.info(`✅ Successfully loaded project item: ${projectItem.title}`)
        return projectItem
      }
    }

    // Fallback to local loading if API worker fails
    logger.info(`🔄 API worker failed, falling back to local loading for: ${id}`)
    return getProjectItemLocal(id)
  } catch (error) {
    logger.error(`❌ Error loading project item ${id} from API worker:`, error)

    // Fallback to local loading
    try {
      return await getProjectItemLocal(id)
    } catch (localError) {
      logger.error(`❌ Error loading project item ${id} from local files:`, localError)
      return null
    }
  }
}

// Fallback function for local project loading
async function getProjectItemLocal(id: string): Promise<ProjectItem | null> {
  try {
    logger.info(`🔄 Loading project item ${id} from local files...`)
    // For now, return null to avoid build issues
    // In a real fallback scenario, you might want to implement a different approach
    logger.warn('⚠️ Local file loading is disabled to avoid build issues')
    return null
  } catch (error) {
    logger.error(`❌ Error loading project item ${id} from local files:`, error)
    return null
  }
}
