import { getContentCache } from './utils/cache-utils'
import { Response } from '@cloudflare/workers-types'
import type { PagesFunction, KVNamespace, R2Bucket } from '@cloudflare/workers-types'

export interface Env {
  CONTENT_CACHE: KVNamespace
  R2_CONTENT: R2Bucket
}

export const onRequestGet: PagesFunction<Env> = async (context): Promise<Response> => {
  try {
    const cache = await getContentCache({
      CONTENT_CACHE: context.env.CONTENT_CACHE,
      R2_CONTENT: context.env.R2_CONTENT
    })

    // CORS headers for development and production
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Allow all origins for development
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    }

    return new Response(JSON.stringify(cache), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders
      }
    })
  } catch (error) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    return new Response(JSON.stringify({ error: 'Failed to load cache', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
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