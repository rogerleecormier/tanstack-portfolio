/// <reference types="@cloudflare/workers-types" />

/**
 * R2 Content Full Worker
 *
 * Combined worker that handles both reading and writing to R2 bucket
 * Supports GET operations for reading and POST operations for writing
 */

interface Env {
  PORTFOLIO_CONTENT: R2Bucket;
  PORTFOLIO_CONTENT_PREVIEW: R2Bucket;
  ALLOWED_DIRS?: string;
  MAX_FILE_BYTES?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
          'Access-Control-Allow-Credentials': 'false',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Utility to send JSON with CORS
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
          'Access-Control-Allow-Credentials': 'false',
        },
      })

    try {
      // API routes
      if (path.startsWith('/api/')) {
        const apiPath = path.slice(5) // Remove '/api/' prefix

        if (apiPath === 'content/write' && method === 'POST') {
          return await handleWrite(request, env)
        } else if (apiPath === 'content/read' && method === 'GET') {
          return await handleRead(request, env)
        } else if (apiPath === 'content/list' && method === 'GET') {
          return await handleList(request, env)
        } else if (apiPath === 'content/exists' && method === 'GET') {
          return await handleExists(request, env)
        }
      }

      // Legacy proxy routes for backward compatibility
      if (path === '/_list' && method === 'GET') {
        return await handleLegacyList(request, env)
      }

      // Default file serving (existing proxy functionality)
      if (method === 'GET' || method === 'HEAD') {
        return await handleFileRequest(request, env)
      }

      return json({ error: 'Method not allowed' }, 405)
    } catch (error) {
      console.error('Worker error:', error)
      return json({ error: 'Internal server error' }, 500)
    }
  },
}

// Handle POST /api/content/write
async function handleWrite(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  }

  try {
    const { key, content, etag } = await request.json()

    if (!key || !content) {
      return new Response(JSON.stringify({ error: 'Key and content required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Security: Ensure key is under allowed directories and filename is safe
    const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const isAllowed = allowedDirs.some((d) => key === `${d}` || key.startsWith(`${d}/`))
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Validate filename part: only allow a-zA-Z0-9-_ and .md extension
    const fileName = key.split('/').pop() || ''
    const safeNameRegex = /^[a-zA-Z0-9-_]{3,64}\.md$/
    if (!safeNameRegex.test(fileName)) {
      return new Response(JSON.stringify({ error: 'Invalid filename' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Size check
    const maxBytes = parseInt(env.MAX_FILE_BYTES || '1048576')
    if (content.length > maxBytes) {
      return new Response(JSON.stringify({ error: 'Content too large' }), {
        status: 413,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // ETag check for optimistic concurrency
    if (etag) {
      const existing = await env.PORTFOLIO_CONTENT.get(key)
      if (existing && existing.etag !== etag) {
        return new Response(JSON.stringify({
          code: 'etag_conflict',
          error: 'Object has been modified'
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    }

    const result = await env.PORTFOLIO_CONTENT.put(key, content, {
      httpMetadata: {
        contentType: 'text/markdown; charset=utf-8',
      },
    })

    return new Response(JSON.stringify({ etag: result.etag }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  } catch (error) {
    console.error('Write error:', error)
    return new Response(JSON.stringify({ error: 'Failed to write object' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

// Handle GET /api/content/read
async function handleRead(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')

  if (!key) {
    return new Response(JSON.stringify({ error: 'Key parameter required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Security: Ensure key is under allowed directories
  const isAllowed = allowedDirs.some((d) => key === `${d}` || key.startsWith(`${d}/`))
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid key' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const object = await env.PORTFOLIO_CONTENT.get(key)

    if (!object) {
      return new Response(JSON.stringify({ error: 'Object not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    const body = await object.text()

    // Return JSON with body and ETag so the client can parse easily
    return new Response(JSON.stringify({ body, etag: object.etag }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  } catch (error) {
    console.error('Read error:', error)
    return new Response(JSON.stringify({ error: 'Failed to read object' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

// Handle GET /api/content/exists
async function handleExists(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')

  if (!key) {
    return new Response(JSON.stringify({ error: 'Key parameter required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  }

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Security: Ensure key is under allowed directories
  const isAllowed = allowedDirs.some((d) => key === `${d}` || key.startsWith(`${d}/`))
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid key' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  }

  try {
    const object = await env.PORTFOLIO_CONTENT.get(key)

    if (object) {
      return new Response(JSON.stringify({
        exists: true,
        etag: object.etag
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      })
    } else {
      return new Response(JSON.stringify({ exists: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      })
    }
  } catch (error) {
    console.error('Exists error:', error)
    return new Response(JSON.stringify({ error: 'Failed to check object existence' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  }
}

// Handle GET /api/content/list
async function handleList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  const rawPrefix = url.searchParams.get('prefix') || ''
  const cursor = url.searchParams.get('cursor') || undefined
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000)
  const delimiter = url.searchParams.get('delimiter') || '/'

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Normalize prefix to ensure folder-style prefixes end with '/'
  const normalizePrefix = (p: string) => (p && !p.endsWith('/') ? `${p}/` : p)
  const prefix = normalizePrefix(rawPrefix)

  // If no prefix, return only the allowed top-level directories as folders
  if (!prefix) {
    return new Response(JSON.stringify({
      prefixes: allowedDirs.map((d) => `${d}/`),
      objects: [],
      cursor: undefined,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  }

  // Security: Only allow listing within allowed directories
  const isAllowed = allowedDirs.some((d) => prefix === `${d}/` || prefix.startsWith(`${d}/`))
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid prefix' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    // Do a plain list without delimiter so we can derive both immediate files and subfolders
    const result = await (env.PORTFOLIO_CONTENT as any).list({ prefix, cursor, limit })

    const filesInCurrentDir = (result.objects as any[])
      .filter((obj) => {
        const key: string = obj.key
        if (!key.endsWith('.md')) return false
        const rest = key.slice(prefix.length)
        return !rest.includes('/')
      })
      .map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded ? new Date(obj.uploaded).toISOString() : new Date().toISOString(),
        etag: obj.etag,
      }))

    // Derive immediate subfolders
    const folderSet = new Set<string>()
    for (const obj of result.objects as any[]) {
      const rest = (obj.key as string).slice(prefix.length)
      const idx = rest.indexOf('/')
      if (idx > -1) {
        const seg = rest.slice(0, idx)
        if (seg) folderSet.add(`${prefix}${seg}/`)
      }
    }
    const prefixes = Array.from(folderSet)

    return new Response(JSON.stringify({
      prefixes,
      objects: filesInCurrentDir,
      cursor: result.truncated ? result.cursor : undefined,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    })
  } catch (error) {
    console.error('List error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list objects' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

// Handle GET /_list (legacy proxy endpoint)
async function handleLegacyList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const prefix = url.searchParams.get('prefix') || ''
  const cursor = url.searchParams.get('cursor') || undefined
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000)

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Normalize prefix to ensure folder-style prefixes end with '/'
  const normalizePrefix = (p: string) => (p && !p.endsWith('/') ? `${p}/` : p)
  const normalizedPrefix = normalizePrefix(prefix)

  // If no prefix, return only the allowed top-level directories as folders
  if (!normalizedPrefix) {
    return new Response(JSON.stringify({
      prefixes: allowedDirs.map((d) => `${d}/`),
      objects: [],
      cursor: undefined,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  // Security: Only allow listing within allowed directories
  const isAllowed = allowedDirs.some((d) => normalizedPrefix === `${d}/` || normalizedPrefix.startsWith(`${d}/`))
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid prefix' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const result = await (env.PORTFOLIO_CONTENT as any).list({ prefix: normalizedPrefix, cursor, limit })

    const filesInCurrentDir = (result.objects as any[])
      .filter((obj) => {
        const key: string = obj.key
        if (!key.endsWith('.md')) return false
        const rest = key.slice(normalizedPrefix.length)
        return !rest.includes('/')
      })
      .map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded ? new Date(obj.uploaded).toISOString() : new Date().toISOString(),
        etag: obj.etag,
      }))

    // Derive immediate subfolders
    const folderSet = new Set<string>()
    for (const obj of result.objects as any[]) {
      const rest = (obj.key as string).slice(normalizedPrefix.length)
      const idx = rest.indexOf('/')
      if (idx > -1) {
        const seg = rest.slice(0, idx)
        if (seg) folderSet.add(`${normalizedPrefix}${seg}/`)
      }
    }
    const prefixes = Array.from(folderSet)

    return new Response(JSON.stringify({
      prefixes,
      objects: filesInCurrentDir,
      cursor: result.truncated ? result.cursor : undefined,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Legacy list error:', error)
    return new Response(JSON.stringify({ error: 'Failed to list objects' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

// Handle file requests (existing proxy functionality)
async function handleFileRequest(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url)
    const path = url.pathname

    // Remove leading slash
    const key = path.startsWith('/') ? path.slice(1) : path

    if (!key) {
      return new Response('Not found', { status: 404 })
    }

    const object = await env.PORTFOLIO_CONTENT.get(key)

    if (!object) {
      return new Response('Not found', { status: 404 })
    }

    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (object.etag) {
      headers.set('ETag', object.etag)
    }

    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType)
    }

    return new Response(object.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('File request error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
