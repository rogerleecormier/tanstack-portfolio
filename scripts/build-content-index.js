import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fm from 'gray-matter'

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Content file lists (same as in r2PortfolioLoader.ts)
const PORTFOLIO_FILES = [
  'strategy.md',
  'leadership.md',
  'talent.md',
  'devops.md',
  'saas.md',
  'analytics.md',
  'risk-compliance.md',
  'governance-pmo.md',
  'product-ux.md',
  'education-certifications.md',
  'ai-automation.md',
  'culture.md',
  'capabilities.md',
  'projects.md'
]

const BLOG_FILES = [
  'pmbok-agile-methodology-blend.md',
  'serverless-ai-workflows-azure-functions.md',
  'power-automate-workflow-automation.md',
  'asana-ai-status-reporting.md',
  'mkdocs-github-actions-portfolio.md',
  'internal-ethos-high-performing-organizations.md',
  'digital-transformation-strategy-governance.md',
  'military-leadership-be-know-do.md',
  'ramp-agents-ai-finance-operations.md',
  'pmp-digital-transformation-leadership.md'
]

const PROJECT_FILES = [
  'project-analysis.md'
]

// R2 URLs (same as in r2Config.ts)
const R2_BASE_URL = 'https://r2-content-proxy.rcormier.workers.dev'
const PORTFOLIO_BASE_URL = `${R2_BASE_URL}/portfolio`
const BLOG_BASE_URL = `${R2_BASE_URL}/blog`
const PROJECT_BASE_URL = `${R2_BASE_URL}/projects`

// Helper function to determine category from tags and filename
function getCategoryFromTags(tags, fileName) {
  const tagString = tags.join(' ').toLowerCase()
  const fileNameLower = fileName.toLowerCase()
  
  // Strategy & Consulting
  if (tagString.includes('strategy') || tagString.includes('consulting') || 
      fileNameLower.includes('strategy') || fileNameLower.includes('governance')) {
    return 'Strategy & Consulting'
  }
  
  // Leadership & Culture
  if (tagString.includes('leadership') || tagString.includes('culture') || 
      tagString.includes('talent') || tagString.includes('team') ||
      fileNameLower.includes('leadership') || fileNameLower.includes('culture') ||
      fileNameLower.includes('talent')) {
    return 'Leadership & Culture'
  }
  
  // Technology & Operations
  if (tagString.includes('devops') || tagString.includes('technology') || 
      tagString.includes('saas') || tagString.includes('automation') ||
      fileNameLower.includes('devops') || fileNameLower.includes('saas') ||
      fileNameLower.includes('ai-automation')) {
    return 'Technology & Operations'
  }
  
  // Data & Analytics
  if (tagString.includes('analytics') || tagString.includes('data') || 
      tagString.includes('insights') || fileNameLower.includes('analytics')) {
    return 'Data & Analytics'
  }
  
  // Risk & Compliance
  if (tagString.includes('risk') || tagString.includes('compliance') || 
      tagString.includes('governance') || fileNameLower.includes('risk-compliance')) {
    return 'Risk & Compliance'
  }
  
  // Product & UX
  if (tagString.includes('product') || tagString.includes('ux') || 
      tagString.includes('design') || fileNameLower.includes('product-ux')) {
    return 'Product & UX'
  }
  
  // Education & Certifications
  if (tagString.includes('education') || tagString.includes('certification') ||
      fileNameLower.includes('education-certifications')) {
    return 'Education & Certifications'
  }
  
  // AI & Automation
  if (tagString.includes('ai') || tagString.includes('artificial intelligence') ||
      fileNameLower.includes('ai-automation')) {
    return 'AI & Automation'
  }
  
  // Project Portfolio
  if (fileNameLower.includes('projects') || fileNameLower.includes('project-analysis')) {
    return 'Project Portfolio'
  }
  
  // Default category
  return 'Strategy & Consulting'
}

// Fetch content from R2
async function fetchContent(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message)
    return null
  }
}

// Check if R2 is accessible
async function checkR2Accessibility() {
  try {
    const testUrl = `${R2_BASE_URL}/portfolio/strategy.md`
    const response = await fetch(testUrl, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

// Process portfolio items
async function processPortfolioItems() {
  console.log('🔄 Processing portfolio items...')
  const items = []
  
  for (const fileName of PORTFOLIO_FILES) {
    try {
      const fileUrl = `${PORTFOLIO_BASE_URL}/${fileName}`
      console.log(`📖 Fetching: ${fileUrl}`)
      
      const content = await fetchContent(fileUrl)
      if (!content) continue
      
      // Parse frontmatter
      const { data, content: body } = fm(content)
      const frontmatter = data || {}
      
      // Remove import statements from markdown content
      const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
      
      const tags = (frontmatter.tags || [])
      const keywords = (frontmatter.keywords || [])
      
      // Extract filename for ID and URL
      const fileNameWithoutExt = fileName.replace('.md', '')
      
      // Create portfolio item
      const item = {
        id: fileNameWithoutExt,
        title: frontmatter.title || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: frontmatter.description || 'No description available',
        tags: [...tags, ...keywords],
        category: getCategoryFromTags(tags, fileNameWithoutExt),
        url: `/portfolio/${fileNameWithoutExt}`,
        keywords,
        content: cleanedBody,
        date: frontmatter.date,
        fileName: fileNameWithoutExt,
        contentType: 'portfolio'
      }
      
      items.push(item)
      console.log(`✅ Processed: ${item.title}`)
      
    } catch (error) {
      console.error(`❌ Error processing portfolio file ${fileName}:`, error.message)
    }
  }
  
  return items.sort((a, b) => a.title.localeCompare(b.title))
}

// Process blog items
async function processBlogItems() {
  console.log('🔄 Processing blog items...')
  const items = []
  
  for (const fileName of BLOG_FILES) {
    try {
      const fileUrl = `${BLOG_BASE_URL}/${fileName}`
      console.log(`📖 Fetching: ${fileUrl}`)
      
      const content = await fetchContent(fileUrl)
      if (!content) continue
      
      // Parse frontmatter
      const { data, content: body } = fm(content)
      const frontmatter = data || {}
      
      // Remove import statements from markdown content
      const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
      
      const tags = (frontmatter.tags || [])
      const keywords = (frontmatter.keywords || [])
      
      // Extract filename for ID and URL
      const fileNameWithoutExt = fileName.replace('.md', '')
      
      // Create blog item
      const item = {
        id: fileNameWithoutExt,
        title: frontmatter.title || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: frontmatter.description || 'No description available',
        tags: [...tags, ...keywords],
        category: getCategoryFromTags(tags, fileNameWithoutExt),
        url: `/blog/${fileNameWithoutExt}`,
        keywords,
        content: cleanedBody,
        date: frontmatter.date,
        fileName: fileNameWithoutExt,
        contentType: 'blog'
      }
      
      items.push(item)
      console.log(`✅ Processed: ${item.title}`)
      
    } catch (error) {
      console.error(`❌ Error processing blog file ${fileName}:`, error.message)
    }
  }
  
  // Sort by date (newest first)
  return items.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    return 0
  })
}

// Process project items
async function processProjectItems() {
  console.log('🔄 Processing project items...')
  const items = []
  
  for (const fileName of PROJECT_FILES) {
    try {
      const fileUrl = `${PROJECT_BASE_URL}/${fileName}`
      console.log(`📖 Fetching: ${fileUrl}`)
      
      const content = await fetchContent(fileUrl)
      if (!content) continue
      
      // Parse frontmatter
      const { data, content: body } = fm(content)
      const frontmatter = data || {}
      
      // Remove import statements from markdown content
      const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
      
      const tags = (frontmatter.tags || [])
      const keywords = (frontmatter.keywords || [])
      
      // Extract filename for ID and URL
      const fileNameWithoutExt = fileName.replace('.md', '')
      
      // Create project item
      const item = {
        id: fileNameWithoutExt,
        title: frontmatter.title || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: frontmatter.description || 'No description available',
        tags: [...tags, ...keywords],
        category: getCategoryFromTags(tags, fileNameWithoutExt),
        url: `/projects/${fileNameWithoutExt}`,
        keywords,
        content: cleanedBody,
        date: frontmatter.date,
        fileName: fileNameWithoutExt,
        contentType: 'project'
      }
      
      items.push(item)
      console.log(`✅ Processed: ${item.title}`)
      
    } catch (error) {
      console.error(`❌ Error processing project file ${fileName}:`, error.message)
    }
  }
  
  return items
}

// Generate search index
function generateSearchIndex(allItems) {
  console.log('🔍 Generating search index...')
  
  const searchIndex = allItems.map(item => ({
    id: item.id,
    title: item.title.toLowerCase(),
    description: item.description.toLowerCase(),
    tags: item.tags.map(tag => tag.toLowerCase()),
    keywords: item.keywords.map(keyword => keyword.toLowerCase()),
    content: item.content.toLowerCase(),
    contentType: item.contentType,
    category: item.category.toLowerCase()
  }))
  
  return searchIndex
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting content indexing...')
    
    // Check if R2 is accessible
    const r2Accessible = await checkR2Accessibility()
    if (!r2Accessible) {
      console.log('⚠️ R2 content worker not accessible during build')
      console.log('📝 Creating empty content cache for build process')
      
      // Create empty content cache for build
      const emptyCache = {
        portfolio: [],
        blog: [],
        projects: [],
        all: [],
        searchIndex: [],
        metadata: {
          totalItems: 0,
          portfolioCount: 0,
          blogCount: 0,
          projectCount: 0,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          note: 'Empty cache created during build - R2 not accessible'
        }
      }
      
      // Write empty cache files
      const outputDir = path.join(__dirname, '..', 'src', 'data')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const contentCachePath = path.join(outputDir, 'content-cache.json')
      fs.writeFileSync(contentCachePath, JSON.stringify(emptyCache, null, 2))
      
      const portfolioPath = path.join(outputDir, 'portfolio-items.json')
      fs.writeFileSync(portfolioPath, JSON.stringify([], null, 2))
      
      const blogPath = path.join(outputDir, 'blog-items.json')
      fs.writeFileSync(blogPath, JSON.stringify([], null, 2))
      
      const projectsPath = path.join(outputDir, 'project-items.json')
      fs.writeFileSync(projectsPath, JSON.stringify([], null, 2))
      
      const searchIndexPath = path.join(outputDir, 'search-index.json')
      fs.writeFileSync(searchIndexPath, JSON.stringify([], null, 2))
      
      console.log('✅ Empty content cache created successfully')
      console.log('💡 Run "npm run index-content" manually when R2 is accessible')
      return
    }
    
    // Process all content types
    const portfolioItems = await processPortfolioItems()
    const blogItems = await processBlogItems()
    const projectItems = await processProjectItems()
    
    const allItems = [...portfolioItems, ...blogItems, ...projectItems]
    
    if (allItems.length === 0) {
      throw new Error('No content items were processed successfully')
    }
    
    // Generate search index
    const searchIndex = generateSearchIndex(allItems)
    
    // Create content cache object
    const contentCache = {
      portfolio: portfolioItems,
      blog: blogItems,
      projects: projectItems,
      all: allItems,
      searchIndex,
      metadata: {
        totalItems: allItems.length,
        portfolioCount: portfolioItems.length,
        blogCount: blogItems.length,
        projectCount: projectItems.length,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    }
    
    // Write to files
    const outputDir = path.join(__dirname, '..', 'src', 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    // Write main content cache
    const contentCachePath = path.join(outputDir, 'content-cache.json')
    fs.writeFileSync(contentCachePath, JSON.stringify(contentCache, null, 2))
    console.log(`💾 Content cache written to: ${contentCachePath}`)
    
    // Write individual type files for easier imports
    const portfolioPath = path.join(outputDir, 'portfolio-items.json')
    fs.writeFileSync(portfolioPath, JSON.stringify(portfolioItems, null, 2))
    
    const blogPath = path.join(outputDir, 'blog-items.json')
    fs.writeFileSync(blogPath, JSON.stringify(blogItems, null, 2))
    
    const projectsPath = path.join(outputDir, 'project-items.json')
    fs.writeFileSync(projectsPath, JSON.stringify(projectItems, null, 2))
    
    // Write search index
    const searchIndexPath = path.join(outputDir, 'search-index.json')
    fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2))
    
    console.log('🎉 Content indexing completed successfully!')
    console.log(`📊 Total items indexed: ${allItems.length}`)
    console.log(`📁 Portfolio: ${portfolioItems.length}`)
    console.log(`📝 Blog: ${blogItems.length}`)
    console.log(`🚀 Projects: ${projectItems.length}`)
    
  } catch (error) {
    console.error('❌ Content indexing failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
