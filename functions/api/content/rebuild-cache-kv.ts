import { rebuildAndStoreCache } from './utils/cache-utils'
import type { PagesFunction, KVNamespace, R2Bucket } from '@cloudflare/workers-types'

export interface Env {
  CONTENT_CACHE: KVNamespace
  R2_CONTENT: R2Bucket
}

export const onRequestPost: PagesFunction<Env> = async (context): Promise<Response> => {
  console.log('KV rebuild request received')

  try {
    console.log('Starting KV cache rebuild...')
    const cache = await rebuildAndStoreCache({ R2_CONTENT: context.env.R2_CONTENT, CONTENT_CACHE: context.env.CONTENT_CACHE })
    console.log(`Cache rebuild completed with ${cache.length} items`)

    // CORS headers for development and production
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Allow all origins for development
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Cache rebuilt and stored in KV successfully',
      totalItems: cache.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  } catch (error) {
    console.error('Rebuild cache error:', error)

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to rebuild cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

// For GET, return status info
export const onRequestGet: PagesFunction<Env> = async (): Promise<Response> => {
  console.log('GET request to KV rebuild endpoint')

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  return new Response(JSON.stringify({
    message: 'KV Cache Rebuild Endpoint',
    methods: {
      POST: 'Rebuild and store cache from R2',
      GET: 'Get endpoint info (this response)',
      OPTIONS: 'CORS preflight'
    },
    usage: {
      rebuild: 'POST /api/content/rebuild-cache-kv',
      getInfo: 'GET /api/content/rebuild-cache-kv'
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

// Handle OPTIONS requests for CORS preflight
export const onRequestOptions: PagesFunction<Env> = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    }
  })
}