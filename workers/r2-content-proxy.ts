/**
 * R2 Content Proxy Worker
 * 
 * This worker serves content from your R2 bucket with proper CORS headers
 * to resolve the CORS issue when fetching from files.rcormier.dev
 */

export interface Env {
  PORTFOLIO_CONTENT: R2Bucket
  PORTFOLIO_CONTENT_PREVIEW: R2Bucket
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'false', // Explicitly disable credentials for content proxy
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    try {
      const url = new URL(request.url)
      const path = url.pathname

      // Only allow GET and HEAD requests
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405 })
      }

      // Extract the file path from the URL
      // URLs like /portfolio/analytics.md or /blog/post.md
      const pathParts = path.split('/').filter(Boolean)
      
      if (pathParts.length < 2) {
        return new Response('Invalid path', { status: 400 })
      }

      const directory = pathParts[0] // portfolio, blog, projects
      const fileName = pathParts.slice(1).join('/') // analytics.md, post.md, etc.

      // Validate directory
      const validDirectories = ['portfolio', 'blog', 'projects']
      if (!validDirectories.includes(directory)) {
        return new Response('Invalid directory', { status: 400 })
      }

      // Get the appropriate R2 bucket
      const bucket = env.PORTFOLIO_CONTENT

      // Construct the R2 key
      const r2Key = `${directory}/${fileName}`

      // Get the object from R2
      const object = await bucket.get(r2Key)

      if (!object) {
        return new Response('File not found', { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'false',
            'Content-Type': 'text/plain',
          }
        })
      }

      // Prepare response headers
      const headers = new Headers()
      
      // Set CORS headers - be more restrictive to avoid conflicts with authentication
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      headers.set('Access-Control-Allow-Credentials', 'false') // Explicitly disable credentials for content proxy
      
      // Set content type based on file extension
      if (fileName.endsWith('.md')) {
        headers.set('Content-Type', 'text/markdown; charset=utf-8')
      } else if (fileName.endsWith('.json')) {
        headers.set('Content-Type', 'application/json; charset=utf-8')
      } else if (fileName.endsWith('.txt')) {
        headers.set('Content-Type', 'text/plain; charset=utf-8')
      } else {
        // Let R2 determine the content type
        headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
      }

      // Set cache headers
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
      headers.set('ETag', object.httpEtag)
      
      if (object.httpMetadata?.lastModified) {
        headers.set('Last-Modified', object.httpMetadata.lastModified)
      }

      // Return the object with headers
      return new Response(object.body, {
        status: 200,
        headers,
      })

    } catch (error) {
      console.error('Error in R2 content proxy:', error)
      
      return new Response('Internal server error', { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'false',
          'Content-Type': 'text/plain',
        }
      })
    }
  },
}
