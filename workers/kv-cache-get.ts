/**
 * Cloudflare Worker to retrieve content cache from KV
 * This provides direct access to production KV cache for all environments
 */

export interface Env {
  CONTENT_CACHE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      console.log('🔄 Retrieving content cache from KV...');

      // Get cache data from KV
      const cacheData = await env.CONTENT_CACHE.get('content-cache', 'json');

      if (!cacheData) {
        console.log('⚠️ No cache data found in KV');
        return new Response(
          JSON.stringify({
            error: 'Cache not found',
            message: 'No content cache available in KV store',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      console.log(
        `✅ Retrieved cache with ${Array.isArray(cacheData.all) ? cacheData.all.length : 'unknown'} items`
      );

      // Return the cache data
      return new Response(JSON.stringify(cacheData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('❌ Error retrieving cache:', error);

      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: 'Failed to retrieve cache from KV',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
