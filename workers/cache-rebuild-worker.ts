/**
 * @fileoverview Cache Rebuild Worker
 * @description Dedicated Cloudflare Worker for rebuilding content cache from R2 to KV
 * @author Roger Lee Cormier
 * @version 1.0.0
 *
 * @features
 * - Build-time cache rebuilding
 * - Content studio integration
 * - Cron-based automatic updates
 * - Multi-trigger support (manual, build, scheduled)
 *
 * @endpoints
 * - POST /rebuild - Manual cache rebuild
 * - POST /rebuild/build - Build-time trigger
 * - POST /rebuild/content - Content studio trigger
 * - GET /status - Worker health and cache status
 */

// Note: front-matter package needs to be available in worker environment
// For now, we'll use a simple frontmatter parser

interface Env {
  CONTENT_CACHE: KVNamespace;
  R2_CONTENT: R2Bucket;
  // Add API key for security
  REBUILD_API_KEY?: string;
}

interface CachedContentItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date?: string;
  content: string;
  contentType: 'portfolio' | 'blog' | 'project';
  category: string;
  fileName: string;
  keywords: string[];
  url: string;
}

interface CacheData {
  portfolio: CachedContentItem[];
  blog: CachedContentItem[];
  projects: CachedContentItem[];
  all: CachedContentItem[];
  metadata: {
    portfolioCount: number;
    blogCount: number;
    projectCount: number;
    lastUpdated: string;
    version: string;
    trigger: string;
  };
}

// Helper function to determine category from tags and filename
function getCategoryFromTags(tags: string[], fileName: string): string {
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

// Parse frontmatter (simple implementation for worker environment)
function parseFrontmatter(content: string): {
  attributes: Record<string, unknown>;
  body: string;
} {
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
    const attributes: Record<string, unknown> = {};
    for (const line of frontmatterLines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value: unknown = line.substring(colonIndex + 1).trim();

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

// Process content from R2
async function processContentFile(
  bucket: R2Bucket,
  key: string
): Promise<CachedContentItem | null> {
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
    const fileName = key.split('/').pop()?.replace('.md', '') ?? '';
    const tagsForCategory = Array.isArray(attributes.tags)
      ? (attributes.tags as string[])
      : [];
    const category = getCategoryFromTags(tagsForCategory, fileName);

    const titleFallback = fileName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    const title =
      typeof attributes.title === 'string' ? attributes.title : titleFallback;

    const descriptionFallback = body.substring(0, 200) + '...';
    const description =
      typeof attributes.description === 'string'
        ? attributes.description
        : descriptionFallback;

    const date =
      typeof attributes.date === 'string' ? attributes.date : undefined;

    return {
      id: fileName,
      title,
      description,
      tags: Array.isArray(attributes.tags) ? (attributes.tags as string[]) : [],
      keywords: Array.isArray(attributes.keywords)
        ? (attributes.keywords as string[])
        : [],
      content: body,
      date,
      contentType,
      category,
      fileName,
      url: `/${contentType}/${fileName}`,
    };
  } catch (error) {
    console.error(`Error processing ${key}:`, error);
    return null;
  }
}

// Rebuild cache from R2
async function rebuildCache(
  env: Env,
  trigger: string = 'manual'
): Promise<CacheData> {
  const { R2_CONTENT: bucket } = env;
  const portfolioItems: CachedContentItem[] = [];
  const blogItems: CachedContentItem[] = [];
  const projectItems: CachedContentItem[] = [];

  const dirs = ['portfolio/', 'blog/', 'projects/']; // Note: projects/ directory contains project content

  console.log(`🔄 Starting cache rebuild (trigger: ${trigger})...`);

  for (const dir of dirs) {
    try {
      const objects = await bucket.list({ prefix: dir });
      console.log(`📁 Found ${objects.objects.length} files in ${dir}`);

      for (const obj of objects.objects) {
        if (obj.key.endsWith('.md')) {
          const item = await processContentFile(bucket, obj.key);
          if (item) {
            if (item.contentType === 'portfolio') portfolioItems.push(item);
            else if (item.contentType === 'blog') blogItems.push(item);
            else if (item.contentType === 'project') projectItems.push(item);
            console.log(`✅ Processed: ${item.title}`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error listing ${dir}:`, error);
    }
  }

  // Sort items
  portfolioItems.sort((a, b) => a.title.localeCompare(b.title));
  blogItems.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  projectItems.sort((a, b) => a.title.localeCompare(b.title));

  const allItems = [...portfolioItems, ...blogItems, ...projectItems];

  const cacheData: CacheData = {
    portfolio: portfolioItems,
    blog: blogItems,
    projects: projectItems,
    all: allItems,
    metadata: {
      portfolioCount: portfolioItems.length,
      blogCount: blogItems.length,
      projectCount: projectItems.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      trigger,
    },
  };

  // Store in KV
  await env.CONTENT_CACHE.put('content-cache', JSON.stringify(cacheData));

  console.log(`🎉 Cache rebuilt successfully!`);
  console.log(
    `📊 Total items: ${allItems.length} (Portfolio: ${portfolioItems.length}, Blog: ${blogItems.length}, Projects: ${projectItems.length})`
  );

  return cacheData;
}

// Authentication check
function isAuthenticated(request: Request, env: Env): boolean {
  if (!env.REBUILD_API_KEY) return true; // No auth required if no key set

  const authHeader = request.headers.get('Authorization');
  const apiKey = request.headers.get('X-API-Key');

  return (
    authHeader === `Bearer ${env.REBUILD_API_KEY}` ||
    apiKey === env.REBUILD_API_KEY
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false',
      Vary: 'Origin',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      console.log('CORS preflight request received');
      console.log('CORS headers:', corsHeaders);
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Health check
      if (request.method === 'GET' && path === '/status') {
        const cacheData = await env.CONTENT_CACHE.get<CacheData>(
          'content-cache',
          'json'
        );

        return new Response(
          JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            cache: cacheData
              ? {
                  lastUpdated: cacheData.metadata.lastUpdated,
                  totalItems:
                    cacheData.metadata.portfolioCount +
                    cacheData.metadata.blogCount +
                    cacheData.metadata.projectCount,
                  version: cacheData.metadata.version,
                  trigger: cacheData.metadata.trigger,
                }
              : null,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Only allow POST for rebuild operations
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check authentication
      if (!isAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle rebuild requests
      let trigger = 'manual';
      if (path === '/rebuild/build') trigger = 'build';
      else if (path === '/rebuild/content') trigger = 'content-studio';
      else if (path === '/rebuild/cron') trigger = 'cron';

      const cacheData = await rebuildCache(env, trigger);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Cache rebuilt successfully',
          trigger,
          stats: {
            total: cacheData.all.length,
            portfolio: cacheData.portfolio.length,
            blog: cacheData.blog.length,
            projects: cacheData.projects.length,
          },
          timestamp: cacheData.metadata.lastUpdated,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Cache rebuild worker error:', error);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },

  // Cron trigger for scheduled rebuilds
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    console.log('🕒 Scheduled cache rebuild triggered');

    try {
      await rebuildCache(env, 'cron');
      console.log('✅ Scheduled cache rebuild completed');
    } catch (error) {
      console.error('❌ Scheduled cache rebuild failed:', error);
    }
  },
};
