import type { CachedContentItem } from './utils/cache-utils'

interface Env {
  PORTFOLIO_CONTENT: R2Bucket;
}

// Content file lists (same as in build script)
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
];

const BLOG_FILES = [
  'ai-models-2025.md',
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
];

const PROJECT_FILES = [
  'project-analysis.md'
];

// Helper function to determine category from tags and filename
function getCategoryFromTags(tags: string[], fileName: string): string {
  const tagString = tags.join(' ').toLowerCase();
  const fileNameLower = fileName.toLowerCase();

  // Strategy & Consulting
  if (tagString.includes('strategy') || tagString.includes('consulting') ||
      fileNameLower.includes('strategy') || fileNameLower.includes('governance')) {
    return 'Strategy & Consulting';
  }

  // Leadership & Culture
  if (tagString.includes('leadership') || tagString.includes('culture') ||
      tagString.includes('talent') || tagString.includes('team') ||
      fileNameLower.includes('leadership') || fileNameLower.includes('culture') ||
      fileNameLower.includes('talent')) {
    return 'Leadership & Culture';
  }

  // Technology & Operations
  if (tagString.includes('devops') || tagString.includes('technology') ||
      tagString.includes('saas') || tagString.includes('automation') ||
      fileNameLower.includes('devops') || fileNameLower.includes('saas') ||
      fileNameLower.includes('ai-automation')) {
    return 'Technology & Operations';
  }

  // Data & Analytics
  if (tagString.includes('analytics') || tagString.includes('data') ||
      tagString.includes('insights') || fileNameLower.includes('analytics')) {
    return 'Data & Analytics';
  }

  // Risk & Compliance
  if (tagString.includes('risk') || tagString.includes('compliance') ||
      tagString.includes('governance') || fileNameLower.includes('risk-compliance')) {
    return 'Risk & Compliance';
  }

  // Product & UX
  if (tagString.includes('product') || tagString.includes('ux') ||
      tagString.includes('design') || fileNameLower.includes('product-ux')) {
    return 'Product & UX';
  }

  // Education & Certifications
  if (tagString.includes('education') || tagString.includes('certification') ||
      fileNameLower.includes('education-certifications')) {
    return 'Education & Certifications';
  }

  // AI & Automation
  if (tagString.includes('ai') || tagString.includes('artificial intelligence') ||
      fileNameLower.includes('ai-automation')) {
    return 'AI & Automation';
  }

  // Project Portfolio
  if (fileNameLower.includes('projects') || fileNameLower.includes('project-analysis')) {
    return 'Project Portfolio';
  }

  // Default category
  return 'Strategy & Consulting';
}

// Fetch content from R2
async function fetchContentFromR2(env: Env, key: string): Promise<string | null> {
  try {
    const object = await env.PORTFOLIO_CONTENT.get(key);
    if (!object) {
      return null;
    }
    return await object.text();
  } catch (error) {
    console.error(`Failed to fetch ${key}:`, error);
    return null;
  }
}

// Simple frontmatter parser (basic implementation)
function parseFrontmatter(content: string): { attributes: Record<string, unknown>; body: string } {
  const lines = content.split('\n');
  const frontmatterStart = lines.findIndex(line => line.trim() === '---');

  if (frontmatterStart !== 0) {
    return { attributes: {}, body: content };
  }

  const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line.trim() === '---');

  if (frontmatterEnd === -1) {
    return { attributes: {}, body: content };
  }

  const frontmatterLines = lines.slice(1, frontmatterEnd);
  const body = lines.slice(frontmatterEnd + 1).join('\n');

  // Simple YAML parsing (very basic)
  const attributes: Record<string, unknown> = {};
  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value: unknown = line.substring(colonIndex + 1).trim();

      // Parse arrays (basic)
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
      }

      attributes[key] = value;
    }
  }

  return { attributes, body };
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    console.log('🔄 Starting cache rebuild from API call...');

    const portfolioItems: CachedContentItem[] = [];
    const blogItems: CachedContentItem[] = [];
    const projectItems: CachedContentItem[] = [];
    const allItems: CachedContentItem[] = [];

    // Process portfolio items
    console.log('🔄 Processing portfolio items...');
    for (const fileName of PORTFOLIO_FILES) {
      try {
        const key = `portfolio/${fileName}`;
        const content = await fetchContentFromR2(env, key);

        if (!content) {
          console.log(`⚠️  Skipping ${key} - not found`);
          continue;
        }

        const { attributes, body } = parseFrontmatter(content);

        const item = {
          id: key,
          title: attributes.title as string || fileName.replace('.md', '').replace(/-/g, ' '),
          description: attributes.description as string || body.substring(0, 200) + '...',
          url: `/${key}`,
          contentType: 'portfolio',
          category: getCategoryFromTags(attributes.tags as string[] || [], fileName),
          tags: attributes.tags as string[] || [],
          keywords: attributes.keywords as string[] || [],
          content: body,
          fileName: fileName
        };

        portfolioItems.push(item);
        allItems.push(item);

        console.log(`✅ Processed: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to process portfolio/${fileName}:`, error);
      }
    }

    // Process blog items
    console.log('🔄 Processing blog items...');
    for (const fileName of BLOG_FILES) {
      try {
        const key = `blog/${fileName}`;
        const content = await fetchContentFromR2(env, key);

        if (!content) {
          console.log(`⚠️  Skipping ${key} - not found`);
          continue;
        }

        const { attributes, body } = parseFrontmatter(content);

        const item = {
          id: key,
          title: attributes.title as string || fileName.replace('.md', '').replace(/-/g, ' '),
          description: attributes.description as string || body.substring(0, 200) + '...',
          url: `/${key}`,
          contentType: 'blog',
          category: getCategoryFromTags(attributes.tags as string[] || [], fileName),
          tags: attributes.tags as string[] || [],
          keywords: attributes.keywords as string[] || [],
          content: body,
          date: attributes.date as string,
          fileName: fileName
        };

        blogItems.push(item);
        allItems.push(item);

        console.log(`✅ Processed: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to process blog/${fileName}:`, error);
      }
    }

    // Process project items
    console.log('🔄 Processing project items...');
    for (const fileName of PROJECT_FILES) {
      try {
        const key = `projects/${fileName}`;
        const content = await fetchContentFromR2(env, key);

        if (!content) {
          console.log(`⚠️  Skipping ${key} - not found`);
          continue;
        }

        const { attributes, body } = parseFrontmatter(content);

        const item = {
          id: key,
          title: attributes.title as string || fileName.replace('.md', '').replace(/-/g, ' '),
          description: attributes.description as string || body.substring(0, 200) + '...',
          url: `/${key}`,
          contentType: 'project',
          category: getCategoryFromTags(attributes.tags as string[] || [], fileName),
          tags: attributes.tags as string[] || [],
          keywords: attributes.keywords as string[] || [],
          content: body,
          fileName: fileName
        };

        projectItems.push(item);
        allItems.push(item);

        console.log(`✅ Processed: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to process projects/${fileName}:`, error);
      }
    }

    // Sort items
    portfolioItems.sort((a, b) => a.title.localeCompare(b.title));
    blogItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    projectItems.sort((a, b) => a.title.localeCompare(b.title));
    allItems.sort((a, b) => a.title.localeCompare(b.title));

    // Cache data created but not stored in this function

    console.log('🎉 Content indexing completed successfully!');
    console.log(`📊 Total items indexed: ${allItems.length}`);
    console.log(`📁 Portfolio: ${portfolioItems.length}`);
    console.log(`📝 Blog: ${blogItems.length}`);
    console.log(`🚀 Projects: ${projectItems.length}`);

    return Response.json({
      success: true,
      message: 'Cache rebuilt successfully',
      stats: {
        total: allItems.length,
        portfolio: portfolioItems.length,
        blog: blogItems.length,
        projects: projectItems.length
      }
    });

  } catch (error) {
    console.error('❌ Cache rebuild API error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
