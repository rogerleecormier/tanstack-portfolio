import fm from 'front-matter'

export interface PortfolioItem {
  title: string
  url: string
  description: string
  tags: string[]
  category: string
  fileName: string
  frontmatter: Record<string, unknown>
  aiAnalysis?: {
    keyTechnologies?: string[]
    expertise?: string[]
    businessValue?: string
  }
}

// Dynamic file discovery using Vite's import.meta.glob
async function discoverPortfolioFiles(): Promise<string[]> {
  try {
    console.log('🔍 Starting AI-powered portfolio discovery...')
    
    // Use manual discovery for now to avoid build issues
    console.log('🔄 Using manual file discovery for compatibility')
    const manualFiles = await discoverFilesManually()
    if (manualFiles.length > 0) {
      console.log(`✅ Manual discovery found ${manualFiles.length} files:`, manualFiles)
      return manualFiles
    }
    
    return []
    
  } catch (error) {
    console.error('❌ Error in dynamic file discovery:', error)
    
    // Fallback: try manual discovery
    console.log('🔄 Attempting manual file discovery as fallback...')
    const manualFiles = await discoverFilesManually()
    if (manualFiles.length > 0) {
      console.log(`✅ Manual discovery found ${manualFiles.length} files:`, manualFiles)
      return manualFiles
    }
    
    return []
  }
}

// Manual file discovery fallback
async function discoverFilesManually(): Promise<string[]> {
  try {
    // List of known portfolio files as fallback
    const knownFiles = [
      'strategy.md',
      'leadership.md',
      'culture.md',
      'saas.md',
      'devops.md',
      'product-ux.md',
      'risk-compliance.md',
      'governance-pmo.md',
      'talent.md',
      'ai-automation.md',
      'analytics.md',
      'education-certifications.md',
      'projects.md',
      'capabilities.md'
    ]
    
    console.log('📋 Using known file list as fallback:', knownFiles)
    return knownFiles
  } catch {
    console.error('❌ Manual file discovery failed')
    return []
  }
}

// Load and parse portfolio files with AI enhancement
async function loadPortfolioFiles(): Promise<Array<{ fileName: string; content: string; frontmatter: Record<string, unknown> }>> {
  const portfolioFiles = await discoverPortfolioFiles()
  const fileData: Array<{ fileName: string; content: string; frontmatter: Record<string, unknown> }> = []
  
  console.log(`📁 Attempting to load ${portfolioFiles.length} portfolio files...`)
  
  for (const fileName of portfolioFiles) {
    try {
      const fileNameWithoutExt = fileName.replace('.md', '')
      console.log(`📖 Loading file: ${fileName}`)
      
      // Try to import the markdown file
      let text: string
      try {
        const markdownModule = await import(`../content/portfolio/${fileNameWithoutExt}.md?raw`)
        text = markdownModule.default
        console.log(`✅ Successfully imported ${fileName}`)
                    } catch {
                console.warn(`⚠️ Failed to import ${fileName}, trying alternative import...`)
        
        // Alternative import approach
        try {
          const altModule = await import(`../content/portfolio/${fileNameWithoutExt}.md`)
          text = altModule.default
          console.log(`✅ Successfully imported ${fileName} with alternative method`)
        } catch (altError) {
          console.error(`❌ Failed to import ${fileName} with both methods:`, altError)
          continue
        }
      }
      
      if (!text || typeof text !== 'string') {
        console.warn(`⚠️ No content found in ${fileName}`)
        continue
      }
      
      // Parse frontmatter
      const { attributes, body } = fm(text)
      const frontmatter = attributes as Record<string, unknown>
      
      fileData.push({
        fileName,
        content: body,
        frontmatter
      })
      
      console.log(`✅ Processed ${fileName} - Frontmatter keys:`, Object.keys(frontmatter))
      
    } catch (error) {
      console.error(`❌ Error loading portfolio file ${fileName}:`, error)
    }
  }
  
  console.log(`📊 Successfully loaded ${fileData.length} out of ${portfolioFiles.length} portfolio files`)
  return fileData
}

// Fast portfolio loading - AI analysis loaded on-demand
export async function loadAIPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    console.log('🚀 Loading portfolio items (AI analysis on-demand)...')
    
    // Load raw portfolio files
    const portfolioFiles = await loadPortfolioFiles()
    
    if (portfolioFiles.length === 0) {
      console.warn('⚠️ No portfolio files loaded. Check the portfolio directory.')
      return []
    }
    
    console.log(`📁 Processing ${portfolioFiles.length} portfolio files...`)
    
    // Create basic portfolio items without AI analysis for fast loading
    const items: PortfolioItem[] = portfolioFiles.map(fileData => {
      const fileNameWithoutExt = fileData.fileName.replace('.md', '')
      
      // Generate title from frontmatter or filename
      let title = fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      if (fileData.frontmatter.title && typeof fileData.frontmatter.title === 'string') {
        title = fileData.frontmatter.title
      }
      
      // Generate description from frontmatter or content
      let description = 'Professional expertise in this specialized area.'
      if (fileData.frontmatter.description && typeof fileData.frontmatter.description === 'string') {
        description = fileData.frontmatter.description
      } else if (fileData.content && fileData.content.trim()) {
        const lines = fileData.content.split('\n').filter(line => line.trim())
        for (const line of lines) {
          const cleanLine = line.replace(/^#+\s*/, '').trim()
          if (cleanLine && cleanLine.length > 20 && !cleanLine.startsWith('---')) {
            description = cleanLine.substring(0, 120) + (cleanLine.length > 120 ? '...' : '')
            break
          }
        }
      }
      
      // Extract tags from frontmatter
      let tags: string[] = []
      if (fileData.frontmatter.tags && Array.isArray(fileData.frontmatter.tags)) {
        tags = fileData.frontmatter.tags.filter(tag => typeof tag === 'string')
      } else if (fileData.frontmatter.keywords && Array.isArray(fileData.frontmatter.keywords)) {
        tags = fileData.frontmatter.keywords.filter(keyword => typeof keyword === 'string')
      }
      
      // Determine category - consolidated into 5 core categories
      let category = 'Technology & Operations' // Default to most common category
      if (fileData.frontmatter.category && typeof fileData.frontmatter.category === 'string') {
        category = fileData.frontmatter.category
      } else {
        // Infer from filename with consolidated categorization
        if (fileNameWithoutExt.includes('strategy') || fileNameWithoutExt.includes('consulting') || 
            fileNameWithoutExt.includes('projects') || fileNameWithoutExt.includes('case')) {
          category = 'Strategy & Consulting'
        } else if (fileNameWithoutExt.includes('leadership') || fileNameWithoutExt.includes('culture') || 
                   fileNameWithoutExt.includes('capabilities') || fileNameWithoutExt.includes('skills') ||
                   fileNameWithoutExt.includes('talent') || fileNameWithoutExt.includes('hr') ||
                   fileNameWithoutExt.includes('education') || fileNameWithoutExt.includes('certification')) {
          category = 'Leadership & People'
        } else if (fileNameWithoutExt.includes('tech') || fileNameWithoutExt.includes('devops') || 
                   fileNameWithoutExt.includes('saas') || fileNameWithoutExt.includes('product') || 
                   fileNameWithoutExt.includes('ux')) {
          category = 'Technology & Operations'
        } else if (fileNameWithoutExt.includes('ai') || fileNameWithoutExt.includes('automation') || 
                   fileNameWithoutExt.includes('analytics') || fileNameWithoutExt.includes('data')) {
          category = 'AI & Analytics'
        } else if (fileNameWithoutExt.includes('governance') || fileNameWithoutExt.includes('pmo') || 
                   fileNameWithoutExt.includes('risk') || fileNameWithoutExt.includes('compliance')) {
          category = 'Governance & Risk'
        }
      }
      
      return {
        title,
        url: fileNameWithoutExt,
        description,
        tags: tags.slice(0, 5), // Limit tags for performance
        category,
        fileName: fileNameWithoutExt,
        frontmatter: fileData.frontmatter
        // aiAnalysis will be loaded on-demand when user clicks on items
      }
    })
    
    // Sort items by category and then by title
    const sortedItems = items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.title.localeCompare(b.title)
    })
    
    console.log(`✨ Successfully loaded ${sortedItems.length} portfolio items (fast mode)`)
    return sortedItems
    
  } catch (error) {
    console.error('❌ Error in portfolio loading:', error)
    
    // Fallback to basic loading if everything fails
    console.log('🔄 Falling back to basic portfolio loading...')
    return await loadBasicPortfolioItems()
  }
}

// Fallback basic portfolio loading (without AI)
async function loadBasicPortfolioItems(): Promise<PortfolioItem[]> {
  const items: PortfolioItem[] = []
  const portfolioFiles = await loadPortfolioFiles()
  
  for (const fileData of portfolioFiles) {
    try {
      const fileNameWithoutExt = fileData.fileName.replace('.md', '')
      
      // Generate URL from filename
      const url = fileNameWithoutExt
      
      // Generate title - prioritize frontmatter, then filename
      let title = fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      if (fileData.frontmatter.title && typeof fileData.frontmatter.title === 'string') {
        title = fileData.frontmatter.title
      }
      
      // Generate description - prioritize frontmatter, then content extraction
      let description = 'Professional expertise in this specialized area.'
      if (fileData.frontmatter.description && typeof fileData.frontmatter.description === 'string') {
        description = fileData.frontmatter.description
      } else if (fileData.content && fileData.content.trim()) {
        const lines = fileData.content.split('\n').filter(line => line.trim())
        for (const line of lines) {
          const cleanLine = line.replace(/^#+\s*/, '').trim()
          if (cleanLine && cleanLine.length > 20 && !cleanLine.startsWith('---')) {
            description = cleanLine.substring(0, 150) + (cleanLine.length > 150 ? '...' : '')
            break
          }
        }
      }
      
      // Extract tags - prioritize frontmatter tags, then keywords
      let tags: string[] = []
      if (fileData.frontmatter.tags && Array.isArray(fileData.frontmatter.tags)) {
        tags = fileData.frontmatter.tags.filter(tag => typeof tag === 'string')
      } else if (fileData.frontmatter.keywords && Array.isArray(fileData.frontmatter.keywords)) {
        tags = fileData.frontmatter.keywords.filter(keyword => typeof keyword === 'string')
      } else if (fileData.frontmatter.keywords && typeof fileData.frontmatter.keywords === 'string') {
        tags = [fileData.frontmatter.keywords]
      }
      
      // Determine category - consolidated into 5 core categories
      let category = 'Technology & Operations' // Default to most common category
      if (fileData.frontmatter.category && typeof fileData.frontmatter.category === 'string') {
        category = fileData.frontmatter.category
      } else {
        // Infer from filename with consolidated categorization
        if (fileNameWithoutExt.includes('strategy') || fileNameWithoutExt.includes('consulting') || 
            fileNameWithoutExt.includes('projects') || fileNameWithoutExt.includes('case')) {
          category = 'Strategy & Consulting'
        } else if (fileNameWithoutExt.includes('leadership') || fileNameWithoutExt.includes('culture') || 
                   fileNameWithoutExt.includes('capabilities') || fileNameWithoutExt.includes('skills') ||
                   fileNameWithoutExt.includes('talent') || fileNameWithoutExt.includes('hr') ||
                   fileNameWithoutExt.includes('education') || fileNameWithoutExt.includes('certification')) {
          category = 'Leadership & People'
        } else if (fileNameWithoutExt.includes('tech') || fileNameWithoutExt.includes('devops') || 
                   fileNameWithoutExt.includes('saas') || fileNameWithoutExt.includes('product') || 
                   fileNameWithoutExt.includes('ux')) {
          category = 'Technology & Operations'
        } else if (fileNameWithoutExt.includes('ai') || fileNameWithoutExt.includes('automation') || 
                   fileNameWithoutExt.includes('analytics') || fileNameWithoutExt.includes('data')) {
          category = 'AI & Analytics'
        } else if (fileNameWithoutExt.includes('governance') || fileNameWithoutExt.includes('pmo') || 
                   fileNameWithoutExt.includes('risk') || fileNameWithoutExt.includes('compliance')) {
          category = 'Governance & Risk'
        }
      }
      
      // Create portfolio item
      const item: PortfolioItem = {
        title,
        url,
        description,
        tags,
        category,
        fileName: fileNameWithoutExt,
        frontmatter: fileData.frontmatter
      }
      
      items.push(item)
    } catch {
      console.error(`❌ Error processing portfolio file ${fileData.fileName}`)
    }
  }
  
  // Sort items by category and then by title
  return items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.title.localeCompare(b.title)
  })
}

// Get category colors for UI display - consolidated into 5 core categories
export function getCategoryColors(): Record<string, string> {
  return {
    'Strategy & Consulting': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors',
    'Leadership & People': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors',
    'Technology & Operations': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors',
    'AI & Analytics': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors',
    'Governance & Risk': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors'
  }
}

// Export the main function for backward compatibility
export const loadPortfolioItems = loadAIPortfolioItems
