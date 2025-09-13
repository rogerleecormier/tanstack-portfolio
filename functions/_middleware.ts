/**
 * Global middleware for Cloudflare Pages Functions
 * Handles CORS for all API endpoints
 */

interface Env {
  // Add any environment variables you need
}

// Handle all requests and add CORS headers
export async function onRequest(context: EventContext<Env, any, any>) {
  const { request, next } = context;

  // CORS headers for all API requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, CF-Access-Jwt-Assertion, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight requests (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Continue to the next function/handler
  const response = await next();

  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Specific handler for OPTIONS requests (preflight)
export async function onRequestOptions(context: EventContext<Env, any, any>) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, CF-Access-Jwt-Assertion, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
