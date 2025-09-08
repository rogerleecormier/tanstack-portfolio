import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const PORTFOLIO_DIR = 'portfolio';
const BLOG_DIR = 'blog';
const PROJECTS_DIR = 'projects';

console.log('🔄 Building KV cache from source files...');

// File lists (same as rebuild-cache.js)
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
function getCategoryFromTags(tags, fileName) {
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

// Read content from file
function readContentFromFile(dir, fileName) {
  try {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Failed to read ${fileName}:`, error);
    return null;
  }
}

// Process all content files and push to KV
async function buildAndPushKvCache() {
  // Process all content files
  let portfolioItems = [];
  let blogItems = [];
  let projectItems = [];
  let allItems = [];

  // Process portfolio items
  console.log('🔄 Processing portfolio items...');
  for (const fileName of PORTFOLIO_FILES) {
    const content = readContentFromFile(PORTFOLIO_DIR, fileName);
    if (!content) {
      console.log(`⚠️  Skipping ${fileName} - not found`);
      continue;
    }

    const { data: attributes, content: body } = matter(content);

    const item = {
      id: fileName.replace('.md', ''),
      title: attributes.title || fileName.replace('.md', '').replace(/-/g, ' '),
      description: attributes.description || body.substring(0, 200) + '...',
      contentType: 'portfolio',
      category: getCategoryFromTags(attributes.tags || [], fileName),
      tags: attributes.tags || [],
      keywords: attributes.keywords || [],
      content: body,
      date: attributes.date,
      fileName: fileName
    };

    portfolioItems.push(item);
    allItems.push(item);
    console.log(`✅ Processed: ${item.title}`);
  }

  // Process blog items
  console.log('🔄 Processing blog items...');
  for (const fileName of BLOG_FILES) {
    const content = readContentFromFile(BLOG_DIR, fileName);
    if (!content) {
      console.log(`⚠️  Skipping ${fileName} - not found`);
      continue;
    }

    const { data: attributes, content: body } = matter(content);

    const item = {
      id: fileName.replace('.md', ''),
      title: attributes.title || fileName.replace('.md', '').replace(/-/g, ' '),
      description: attributes.description || body.substring(0, 200) + '...',
      contentType: 'blog',
      category: getCategoryFromTags(attributes.tags || [], fileName),
      tags: attributes.tags || [],
      keywords: attributes.keywords || [],
      content: body,
      date: attributes.date,
      fileName: fileName
    };

    blogItems.push(item);
    allItems.push(item);
    console.log(`✅ Processed: ${item.title}`);
  }

  // Process project items
  console.log('🔄 Processing project items...');
  for (const fileName of PROJECT_FILES) {
    const content = readContentFromFile(PROJECTS_DIR, fileName);
    if (!content) {
      console.log(`⚠️  Skipping ${fileName} - not found`);
      continue;
    }

    const { data: attributes, content: body } = matter(content);

    const item = {
      id: fileName.replace('.md', ''),
      title: attributes.title || fileName.replace('.md', '').replace(/-/g, ' '),
      description: attributes.description || body.substring(0, 200) + '...',
      contentType: 'project',
      category: getCategoryFromTags(attributes.tags || [], fileName),
      tags: attributes.tags || [],
      keywords: attributes.keywords || [],
      content: body,
      date: attributes.date,
      fileName: fileName
    };

    projectItems.push(item);
    allItems.push(item);
    console.log(`✅ Processed: ${item.title}`);
  }

  // Sort items
  portfolioItems.sort((a, b) => a.title.localeCompare(b.title));
  blogItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  projectItems.sort((a, b) => a.title.localeCompare(b.title));
  allItems.sort((a, b) => a.title.localeCompare(b.title));

  // Create cache data structure
  const cacheData = {
    portfolio: portfolioItems,
    blog: blogItems,
    projects: projectItems,
    all: allItems,
    metadata: {
      portfolioCount: portfolioItems.length,
      blogCount: blogItems.length,
      projectCount: projectItems.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  console.log('📊 Cache data prepared:');
  console.log(`   Portfolio: ${portfolioItems.length} items`);
  console.log(`   Blog: ${blogItems.length} items`);
  console.log(`   Projects: ${projectItems.length} items`);
  console.log(`   Total: ${allItems.length} items`);

  // Push to Cloudflare KV
  console.log('☁️  Pushing to Cloudflare KV...');

  // Always use production URL for consistent KV cache across environments
  const baseUrl = 'https://tanstack-portfolio.pages.dev';
  const rebuildEndpoint = `${baseUrl}/api/content/rebuild-cache-kv`;

  console.log(`📡 Using production endpoint: ${rebuildEndpoint}`);

  try {
    console.log(`📡 Calling KV rebuild endpoint: ${rebuildEndpoint}`);

    const response = await fetch(rebuildEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cacheData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ KV cache rebuilt successfully!');
      console.log(`📊 Total items stored: ${result.totalItems}`);
      console.log(`🔄 Cache version: ${cacheData.metadata.version}`);
      console.log(`🕒 Last updated: ${cacheData.metadata.lastUpdated}`);
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to rebuild KV cache:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      console.log('💡 Make sure your Cloudflare Pages deployment is accessible');
      console.log('💡 Check that KV namespace is properly configured');

      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error calling KV rebuild endpoint:', error.message);
    console.log('💡 Check your internet connection');
    console.log('💡 Verify Cloudflare Pages deployment is working');

    process.exit(1);
  }

  console.log('✅ KV cache build and push completed successfully!');
}

// Run the combined process
buildAndPushKvCache().catch(console.error);
