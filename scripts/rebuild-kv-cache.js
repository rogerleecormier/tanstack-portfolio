import fs from 'fs';
import path from 'path';
import fm from 'front-matter';

console.log('🔄 Building KV cache from R2 bucket...');

// R2 configuration
const R2_BASE_URL = 'https://r2-content-proxy.rcormier.workers.dev';
const PORTFOLIO_BASE_URL = `${R2_BASE_URL}/portfolio`;
const BLOG_BASE_URL = `${R2_BASE_URL}/blog`;
const PROJECT_BASE_URL = `${R2_BASE_URL}/projects`;

// Content type configurations
const CONTENT_TYPES = [
  { name: 'portfolio', baseUrl: PORTFOLIO_BASE_URL },
  { name: 'blog', baseUrl: BLOG_BASE_URL },
  { name: 'project', baseUrl: PROJECT_BASE_URL }
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

// Discover files from R2 bucket
async function discoverFiles(contentType) {
  try {
    const listUrl = `${R2_BASE_URL}/_list?prefix=${contentType}/&limit=1000`;
    console.log(`🔍 Discovering ${contentType} files from: ${listUrl}`);

    const response = await fetch(listUrl);
    if (!response.ok) {
      console.error(`❌ Failed to list ${contentType} files: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const files = data.objects || [];

    // Extract filenames from the full keys and filter for markdown files
    const fileNames = files
      .map(obj => obj.key.replace(`${contentType}/`, ''))
      .filter(fileName => fileName.endsWith('.md'));

    console.log(`📁 Found ${fileNames.length} ${contentType} files:`, fileNames);
    return fileNames;
  } catch (error) {
    console.error(`❌ Error discovering ${contentType} files:`, error.message);
    return [];
  }
}

// Fetch content from R2
async function fetchContent(url) {
  try {
    console.log(`📖 Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`⚠️  Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error.message);
    return null;
  }
}

// Process content from R2 bucket dynamically
async function processContentItems(contentType, baseUrl) {
  console.log(`🔄 Processing ${contentType} items from R2...`);

  // Dynamically discover all files for this content type
  const fileNames = await discoverFiles(contentType);

  if (fileNames.length === 0) {
    console.log(`⚠️  No ${contentType} files found`);
    return [];
  }

  const items = [];

  for (const fileName of fileNames) {
    const fileUrl = `${baseUrl}/${fileName}`;
    const content = await fetchContent(fileUrl);

    if (!content) continue;

    // Parse frontmatter using front-matter (consistent with project preference)
    let parsed, attributes, body, frontmatter, cleanedBody, tags, keywords;

    try {
      parsed = fm(content);
      attributes = parsed.attributes;
      body = parsed.body;
      frontmatter = attributes || {};

      // Remove import statements from markdown content (ensure body is a string)
      cleanedBody = typeof body === 'string' ? body.replace(/^import\s+.*$/gm, '').trim() : '';

      // Ensure tags and keywords are arrays
      tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
      keywords = Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [];
    } catch (parseError) {
      console.error(`❌ Error parsing frontmatter for ${fileName}:`, parseError.message);
      console.log(`📄 Content preview: ${content.substring(0, 200)}...`);
      continue;
    }

    // Extract filename for ID and URL
    const fileNameWithoutExt = fileName.replace('.md', '');

    // Create content item
    const item = {
      id: fileNameWithoutExt,
      title: frontmatter.title || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: frontmatter.description || 'No description available',
      tags: [...tags, ...keywords],
      category: getCategoryFromTags(tags, fileNameWithoutExt),
      url: `/${contentType}/${fileNameWithoutExt}`,
      keywords,
      content: cleanedBody,
      date: frontmatter.date,
      fileName: fileNameWithoutExt,
      contentType: contentType
    };

    items.push(item);
    console.log(`✅ Processed: ${item.title}`);
  }

  // Sort items based on content type
  if (contentType === 'blog') {
    // Sort blog by date (newest first)
    return items.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
  } else {
    // Sort other content by title
    return items.sort((a, b) => a.title.localeCompare(b.title));
  }
}

// Main function to rebuild KV cache from R2
async function rebuildKvCache() {
  console.log('🔍 Dynamically discovering content from R2 bucket...');

  try {
    // Process all content types dynamically
    const portfolioItems = await processContentItems('portfolio', PORTFOLIO_BASE_URL);
    const blogItems = await processContentItems('blog', BLOG_BASE_URL);
    const projectItems = await processContentItems('project', PROJECT_BASE_URL);

    const allItems = [...portfolioItems, ...blogItems, ...projectItems];

    if (allItems.length === 0) {
      throw new Error('No content items were processed from R2');
    }

    console.log('📊 Content dynamically processed from R2:');
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
        version: '1.0.3'
      }
    };

    // Push to Cloudflare KV
    console.log('☁️  Pushing to Cloudflare KV...');

    // Use dedicated cache rebuild worker for consistent KV cache across environments
    const rebuildEndpoint = 'https://cache-rebuild-worker.rcormier.workers.dev/rebuild/build';

    console.log(`📡 Using dedicated cache rebuild worker: ${rebuildEndpoint}`);

    const response = await fetch(rebuildEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.REBUILD_API_KEY || '', // Optional API key
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

      // Don't exit with error during build - just warn
      console.log('⚠️ KV rebuild failed, but build will continue');
    }
  } catch (error) {
    console.error('❌ Error processing content from R2:', error.message);
    console.log('💡 Check your R2 proxy worker is accessible');
    console.log('💡 Verify content files exist in R2 bucket');

    // Don't exit with error during build - just warn
    console.log('⚠️ KV rebuild failed, but build will continue');
  }

  console.log('✅ KV cache rebuild process completed!');
}

// Run the rebuild process
rebuildKvCache().catch(console.error);
