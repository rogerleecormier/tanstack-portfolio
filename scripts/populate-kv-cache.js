import fs from 'fs';
import path from 'path';

// Import local cache data
const contentCachePath = path.join(process.cwd(), 'src', 'data', 'content-cache.json');

console.log('🔄 Populating KV cache for development...');

// Read local cache data
let cacheData;
try {
  const cacheContent = fs.readFileSync(contentCachePath, 'utf8');
  const parsedData = JSON.parse(cacheContent);

  // Transform the data to match the expected format
  const allItems = [
    ...(parsedData.portfolio || []),
    ...(parsedData.blog || []),
    ...(parsedData.project || [])
  ];

  cacheData = {
    all: allItems,
    metadata: {
      totalCount: allItems.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  console.log(`📚 Found ${allItems.length} items in local cache (portfolio: ${parsedData.portfolio?.length || 0}, blog: ${parsedData.blog?.length || 0}, project: ${parsedData.project?.length || 0})`);
} catch (error) {
  console.error('❌ Failed to read local cache file:', error.message);
  process.exit(1);
}

// Function to populate KV cache
async function populateKvCache() {
  try {
    // Write transformed data to temp file
    const tempFilePath = path.join(process.cwd(), 'temp-cache.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(cacheData, null, 2));
    console.log('📝 Created temp cache file');

    // Upload to KV using wrangler
    console.log('🚀 Uploading to KV...');
    const { execSync } = await import('child_process');

    // Use the correct wrangler command format
    const command = `npx wrangler kv key put content-cache --namespace-id 0acc4d15643a427aa6a88967083be65d ${tempFilePath}`;

    execSync(command, { stdio: 'inherit' });
    console.log('✅ KV cache populated successfully!');
    console.log(`📊 Total items: ${cacheData.all.length}`);

    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    console.log('🧹 Cleaned up temp file');
  } catch (error) {
    console.error('❌ Error populating KV cache:', error.message);
    process.exit(1);
  }
}

// Run the population
populateKvCache();
