import fs from 'fs';
import path from 'path';

// Import local cache data
const contentCachePath = path.join(process.cwd(), 'src', 'data', 'content-cache.json');

console.log('🔄 Populating KV cache for development...');

// Read local cache data
let cacheData;
try {
  const cacheContent = fs.readFileSync(contentCachePath, 'utf8');
  cacheData = JSON.parse(cacheContent);
  console.log(`📚 Found ${cacheData.all?.length || 0} items in local cache`);
} catch (error) {
  console.error('❌ Failed to read local cache file:', error.message);
  process.exit(1);
}

// Function to populate KV cache
async function populateKvCache() {
  try {
    console.log('🚀 Sending cache data to KV...');

    const response = await fetch('http://localhost:8788/api/content/rebuild-cache-kv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cacheData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ KV cache populated successfully!');
      console.log(`📊 Total items: ${result.totalItems}`);
    } else {
      const error = await response.text();
      console.error('❌ Failed to populate KV cache:', error);
      console.log('💡 Make sure your development server is running: npm run dev:functions');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error connecting to development server:', error.message);
    console.log('💡 Make sure your development server is running: npm run dev:functions');
    process.exit(1);
  }
}

// Run the population
populateKvCache();
