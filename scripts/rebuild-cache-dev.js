import fs from 'fs';
import path from 'path';

console.log('🔄 Building KV cache for development environment...');

// Development worker URL (will be available after deployment)
const DEV_WORKER_URL = 'https://cache-rebuild-worker-dev.rcormier.workers.dev/rebuild';
const PROD_WORKER_URL = 'https://cache-rebuild-worker.rcormier.workers.dev/rebuild';

// Use production worker as fallback if dev worker isn't available
const WORKER_URL = process.env.NODE_ENV === 'development' ? DEV_WORKER_URL : PROD_WORKER_URL;

// Simple cache rebuild trigger for development
async function triggerCacheRebuild() {
  console.log(`📡 Triggering cache rebuild via worker: ${WORKER_URL}`);

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.REBUILD_API_KEY || '', // Optional API key
      },
      body: JSON.stringify({
        trigger: 'development',
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Development cache rebuild successful!');
      console.log(`📊 Total items: ${result.stats?.total || 'unknown'}`);
      console.log(`🔄 Trigger: ${result.trigger}`);
      console.log(`🕒 Timestamp: ${result.timestamp}`);
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to rebuild cache via worker:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      
      // Provide helpful debugging info
      console.log('💡 Make sure the cache rebuild worker is deployed:');
      console.log('   wrangler publish -c wrangler/wrangler-cache-rebuild.toml --env development');
      console.log('💡 Check that CORS is properly configured');
      console.log('💡 Verify KV namespace and R2 bucket bindings');
    }
  } catch (error) {
    console.error('❌ Error calling cache rebuild worker:', error.message);
    console.log('💡 Check your internet connection and worker availability');
    console.log('💡 Ensure the worker URL is correct and accessible');
  }
}

// Run the rebuild
triggerCacheRebuild().catch(console.error);
