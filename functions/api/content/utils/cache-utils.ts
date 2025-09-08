import matter from 'gray-matter'
import type { R2Bucket, KVNamespace } from '@cloudflare/workers-types'
// Use console for logging in Worker environment

interface CachedContentItem {
  id: string
  title: string
  description: string
  tags: string[]
  date?: string
  content: string
  contentType: 'portfolio' | 'blog' | 'project'
  category: string
  fileName: string
  keywords: string[]
}

function getCategoryFromTags(tags: string[], fileName: string): string {
  const tagString = tags.join(' ').toLowerCase()
  const fileNameLower = fileName.toLowerCase()

  if (tagString.includes('strategy') || tagString.includes('consulting') || fileNameLower.includes('strategy') || fileNameLower.includes('governance')) {
    return 'Strategy & Consulting'
  }
  if (tagString.includes('leadership') || tagString.includes('culture') || tagString.includes('talent') || fileNameLower.includes('leadership') || fileNameLower.includes('culture')) {
    return 'Leadership & Culture'
  }
  if (tagString.includes('devops') || tagString.includes('technology') || tagString.includes('saas') || tagString.includes('automation') || fileNameLower.includes('devops') || fileNameLower.includes('saas')) {
    return 'Technology & Operations'
  }
  if (tagString.includes('analytics') || tagString.includes('data') || fileNameLower.includes('analytics')) {
    return 'Data & Analytics'
  }
  if (tagString.includes('risk') || tagString.includes('compliance') || fileNameLower.includes('risk-compliance')) {
    return 'Risk & Compliance'
  }
  if (tagString.includes('product') || tagString.includes('ux') || fileNameLower.includes('product-ux')) {
    return 'Product & UX'
  }
  if (tagString.includes('education') || tagString.includes('certification') || fileNameLower.includes('education-certifications')) {
    return 'Education & Certifications'
  }
  if (tagString.includes('ai') || fileNameLower.includes('ai-automation')) {
    return 'AI & Automation'
  }
  if (fileNameLower.includes('projects') || fileNameLower.includes('project-analysis')) {
    return 'Project Portfolio'
  }
  return 'Strategy & Consulting'
}

async function processContentFile(bucket: R2Bucket, key: string): Promise<CachedContentItem | null> {
  try {
    const object = await bucket.get(key)
    if (!object) return null
    const content = await object.text()
    const { data: attributes, content: body } = matter(content)

    const contentType = key.startsWith('portfolio/') ? 'portfolio' : key.startsWith('blog/') ? 'blog' : 'project'
    const id = key.split('/').pop()?.replace('.md', '') || ''
    const fileName = key.split('/').pop() || ''
    const category = getCategoryFromTags(attributes.tags || [], fileName)

    return {
      id,
      title: attributes.title || id.replace(/-/g, ' '),
      description: attributes.description || body.substring(0, 200) + '...',
      tags: attributes.tags || [],
      keywords: attributes.keywords || [],
      content: body,
      date: attributes.date,
      contentType,
      category,
      fileName
    }
  } catch (error) {
    console.error(`Error processing ${key}:`, error)
    return null
  }
}

async function rebuildCache(env: { R2_CONTENT: R2Bucket }): Promise<CachedContentItem[]> {
  const { R2_CONTENT: bucket } = env
  const allItems: CachedContentItem[] = []
  const dirs = ['portfolio/', 'blog/', 'projects/']

  for (const dir of dirs) {
    try {
      const objects = await bucket.list({ prefix: dir })
      for (const obj of objects.objects) {
        if (obj.key.endsWith('.md')) {
          const item = await processContentFile(bucket, obj.key)
          if (item) allItems.push(item)
        }
      }
    } catch (error) {
      console.error(`Error listing ${dir}:`, error)
    }
  }

  // Sort all items by title
  allItems.sort((a, b) => a.title.localeCompare(b.title))
  return allItems
}

export async function rebuildAndStoreCache(env: { R2_CONTENT: R2Bucket; CONTENT_CACHE: KVNamespace }): Promise<CachedContentItem[]> {
  const allItems = await rebuildCache(env)
  const cacheData = {
    all: allItems,
    metadata: {
      totalCount: allItems.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  // Store in KV
  await env.CONTENT_CACHE.put('content-cache', JSON.stringify(cacheData), { expirationTtl: 3600 }) // Expire in 1 hour

  console.log(`Rebuilt and stored cache with ${allItems.length} items`)
  return allItems
}

export async function getContentCache(env: { CONTENT_CACHE: KVNamespace; R2_CONTENT: R2Bucket }): Promise<unknown> {
  try {
    let cacheData = await env.CONTENT_CACHE.get('content-cache', 'json')
    if (!cacheData) {
      console.log('KV cache miss, rebuilding from R2')
      cacheData = await rebuildAndStoreCache(env)
    }
    return cacheData
  } catch (error) {
    console.error('Error getting cache:', error)
    // Fallback to rebuild
    return await rebuildAndStoreCache(env)
  }
}