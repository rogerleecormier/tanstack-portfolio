import { getContentCache } from './utils/cache-utils';
import type { PagesFunction, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

export interface Env {
  CONTENT_CACHE: KVNamespace;
  R2_CONTENT: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (
  context
): Promise<Response> => {
  try {
    // Check if bindings are available
    if (!context.env.CONTENT_CACHE) {
      console.log('CONTENT_CACHE binding not available');
    }
    if (!context.env.R2_CONTENT) {
      console.log('R2_CONTENT binding not available');
    }

    console.log('Attempting to get content cache...');
    const cache = await getContentCache({
      CONTENT_CACHE: context.env.CONTENT_CACHE,
      R2_CONTENT: context.env.R2_CONTENT,
    });

    console.log(
      `Cache retrieved successfully: ${Array.isArray(cache) ? cache.length : 'unknown'} items`
    );

    // CORS headers for development and production
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Allow all origins for development
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    };

    return new Response(JSON.stringify(cache), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Cache-get error:', error);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return new Response(
      JSON.stringify({
        error: 'Failed to load cache',
        details: error.message,
        timestamp: new Date().toISOString(),
        environment: 'preview',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

// Handle OPTIONS requests for CORS preflight
export const onRequestOptions: PagesFunction<
  Env
> = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
};
