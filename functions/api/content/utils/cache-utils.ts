// Note: Using basic frontmatter parsing for Pages Functions environment
// import matter from 'gray-matter'
// import type { R2Bucket, KVNamespace } from '@cloudflare/workers-types';
// Use console for logging in Worker environment

/**
 * @typedef {Object} CachedContentItem
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} tags
 * @property {string} [date]
 * @property {string} content
 * @property {'portfolio'|'blog'|'project'} contentType
 * @property {string} category
 * @property {string} fileName
 * @property {string[]} keywords
 */

function getCategoryFromTags(tags, fileName) {
  const tagString = tags.join(' ').toLowerCase();
  const fileNameLower = fileName.toLowerCase();

  if (
    tagString.includes('strategy') ||
    tagString.includes('consulting') ||
    fileNameLower.includes('strategy') ||
    fileNameLower.includes('governance')
  ) {
    return 'Strategy & Consulting';
  }
  if (
    tagString.includes('leadership') ||
    tagString.includes('culture') ||
    tagString.includes('talent') ||
    fileNameLower.includes('leadership') ||
    fileNameLower.includes('culture')
  ) {
    return 'Leadership & Culture';
  }
  if (
    tagString.includes('devops') ||
    tagString.includes('technology') ||
    tagString.includes('saas') ||
    tagString.includes('automation') ||
    fileNameLower.includes('devops') ||
    fileNameLower.includes('saas')
  ) {
    return 'Technology & Operations';
  }
  if (
    tagString.includes('analytics') ||
    tagString.includes('data') ||
    fileNameLower.includes('analytics')
  ) {
    return 'Data & Analytics';
  }
  if (
    tagString.includes('risk') ||
    tagString.includes('compliance') ||
    fileNameLower.includes('risk-compliance')
  ) {
    return 'Risk & Compliance';
  }
  if (
    tagString.includes('product') ||
    tagString.includes('ux') ||
    fileNameLower.includes('product-ux')
  ) {
    return 'Product & UX';
  }
  if (
    tagString.includes('education') ||
    tagString.includes('certification') ||
    fileNameLower.includes('education-certifications')
  ) {
    return 'Education & Certifications';
  }
  if (tagString.includes('ai') || fileNameLower.includes('ai-automation')) {
    return 'AI & Automation';
  }
  if (
    fileNameLower.includes('projects') ||
    fileNameLower.includes('project-analysis')
  ) {
    return 'Project Portfolio';
  }
  return 'Strategy & Consulting';
}

// Parse frontmatter (simple implementation for Pages Functions environment)
function parseFrontmatter(content) {
  try {
    const lines = content.split('\n');
    const frontmatterStart = lines.findIndex(line => line.trim() === '---');

    if (frontmatterStart !== 0) {
      return { attributes: {}, body: content };
    }

    const frontmatterEnd = lines.findIndex(
      (line, index) => index > 0 && line.trim() === '---'
    );

    if (frontmatterEnd === -1) {
      return { attributes: {}, body: content };
    }

    const frontmatterLines = lines.slice(1, frontmatterEnd);
    const body = lines.slice(frontmatterEnd + 1).join('\n');

    // Simple YAML parsing
    const attributes = {};
    for (const line of frontmatterLines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Parse arrays
        if (
          typeof value === 'string' &&
          value.startsWith('[') &&
          value.endsWith(']')
        ) {
          value = value
            .slice(1, -1)
            .split(',')
            .map(item => item.trim().replace(/^["']|["']$/g, ''));
        }

        // Remove quotes from strings
        if (
          typeof value === 'string' &&
          ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
        ) {
          value = value.slice(1, -1);
        }

        attributes[key] = value;
      }
    }

    return { attributes, body };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return { attributes: {}, body: content };
  }
}

async function processContentFile(bucket, key) {
  try {
    const object = await bucket.get(key);
    if (!object) return null;
    const content = await object.text();
    const { attributes, body } = parseFrontmatter(content);

    const contentType = key.startsWith('portfolio/')
      ? 'portfolio'
      : key.startsWith('blog/')
        ? 'blog'
        : 'project';
    const id = key.split('/').pop()?.replace('.md', '') || '';
    const fileName = key.split('/').pop() || '';
    const category = getCategoryFromTags(
      attributes.tags || [],
      fileName
    );

    return {
      id,
      title: attributes.title || id.replace(/-/g, ' '),
      description:
        attributes.description || body.substring(0, 200) + '...',
      tags: attributes.tags || [],
      keywords: attributes.keywords || [],
      content: body,
      date: attributes.date,
      contentType,
      category,
      fileName,
    };
  } catch (error) {
    console.error(`Error processing ${key}:`, error);
    return null;
  }
}

async function rebuildCache(env) {
  const { R2_CONTENT: bucket } = env;
  const allItems = [];
  const dirs = ['portfolio/', 'blog/', 'projects/'];

  for (const dir of dirs) {
    try {
      const objects = await bucket.list({ prefix: dir });
      for (const obj of objects.objects) {
        if (obj.key.endsWith('.md')) {
          const item = await processContentFile(bucket, obj.key);
          if (item) allItems.push(item);
        }
      }
    } catch (error) {
      console.error(`Error listing ${dir}:`, error);
    }
  }

  // Sort all items by title
  allItems.sort((a, b) => a.title.localeCompare(b.title));
  return allItems;
}

export async function rebuildAndStoreCache(env) {
  const allItems = await rebuildCache(env);
  const cacheData = {
    all: allItems,
    metadata: {
      totalCount: allItems.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  // Store in KV without expiration - cache should persist
  await env.CONTENT_CACHE.put('content-cache', JSON.stringify(cacheData));

  console.log(`Rebuilt and stored cache with ${allItems.length} items`);
  return allItems;
}

export async function getContentCache(env) {
  try {
    let cacheData = await env.CONTENT_CACHE.get('content-cache', 'json');
    if (!cacheData) {
      console.log('KV cache miss, rebuilding from R2');
      cacheData = await rebuildAndStoreCache(env);
    }
    return cacheData;
  } catch (error) {
    console.error('Error getting cache:', error);
    // Fallback to rebuild
    return await rebuildAndStoreCache(env);
  }
}
