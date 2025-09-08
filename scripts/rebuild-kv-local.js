import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PORTFOLIO_DIR = 'portfolio';
const BLOG_DIR = 'blog';
const PROJECTS_DIR = 'projects';

console.log('🔄 Rebuilding KV cache from localhost...');

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

// Import matter for frontmatter parsing
import fm from 'front-matter';

// Process all content files
async function processAllContent() {
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

  return { portfolioItems, blogItems, projectItems, allItems };
}

// Function to write to KV using wrangler
function writeToKV(key, data) {
  try {
    const jsonData = JSON.stringify(data);
    // Escape quotes for shell command
    const escapedData = jsonData.replace(/"/g, '\\"');

    const command = `wrangler kv:key put "${key}" "${escapedData}" --env production`;
    console.log(`📝 Writing to KV: ${key}`);

    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Successfully wrote: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to write ${key} to KV:`, error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting local KV cache rebuild...');

    // Process all content
    const { portfolioItems, blogItems, projectItems, allItems } = await processAllContent();

    if (allItems.length === 0) {
      throw new Error('No content items were processed successfully');
    }

    console.log('📊 Cache data prepared:');
    console.log(`   Portfolio: ${portfolioItems.length} items`);
    console.log(`   Blog: ${blogItems.length} items`);
    console.log(`   Projects: ${projectItems.length} items`);
    console.log(`   Total: ${allItems.length} items`);

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

    // Write to KV using wrangler
    console.log('☁️  Writing to Cloudflare KV...');
    writeToKV('content-cache', cacheData);

    console.log('✅ KV cache rebuild completed successfully!');
    console.log(`📊 Total items cached: ${allItems.length}`);
    console.log(`🕒 Last updated: ${cacheData.metadata.lastUpdated}`);

  } catch (error) {
    console.error('❌ KV cache rebuild failed:', error.message);
    console.log('💡 Make sure:');
    console.log('   1. Wrangler is authenticated: wrangler auth login');
    console.log('   2. You have access to the KV namespace');
    console.log('   3. Source files exist in portfolio/, blog/, projects/ directories');
    process.exit(1);
  }
}

// Run the script
main();
