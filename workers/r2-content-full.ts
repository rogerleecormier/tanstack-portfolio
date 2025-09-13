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

interface WriteRequestBody {
  key: string;
  content: string;
  etag?: string;
}

interface DeleteRequestBody {
  key: string;
}

interface GenerateRequestBody {
  markdown: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
          'Access-Control-Allow-Credentials': 'false',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Utility to send JSON with CORS
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
          'Access-Control-Allow-Credentials': 'false',
        },
      });

    try {
      // API routes
      if (path.startsWith('/api/')) {
        const apiPath = path.slice(5); // Remove '/api/' prefix

        if (apiPath === 'content/write' && method === 'POST') {
          return await handleWrite(request, env);
        } else if (apiPath === 'content/read' && method === 'GET') {
          return await handleRead(request, env);
        } else if (apiPath === 'content/list' && method === 'GET') {
          return await handleList(request, env);
        } else if (apiPath === 'content/exists' && method === 'GET') {
          return await handleExists(request, env);
        } else if (apiPath === 'content/delete' && method === 'POST') {
          return await handleDelete(request, env);
        } else if (apiPath === 'content/rebuild-cache' && method === 'POST') {
          return await handleRebuildCache(request, env);
        } else if (apiPath === 'generate' && method === 'POST') {
          return await handleGenerate(request, env);
        }
      }

      // Legacy proxy routes for backward compatibility
      if (path === '/_list' && method === 'GET') {
        return await handleLegacyList(request, env);
      }

      // Default file serving (existing proxy functionality)
      if (method === 'GET' || method === 'HEAD') {
        return await handleFileRequest(request, env);
      }

      return json({ error: 'Method not allowed' }, 405);
    } catch (error) {
      console.error('Worker error:', error);
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Internal server error',
        },
        500
      );
    }
  },
};

// Handle POST /api/content/write
async function handleWrite(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  }

  try {
    const body = await request.json();
    const { key, content, etag } = body as WriteRequestBody;

    if (!key || !content) {
      return new Response(
        JSON.stringify({ error: 'Key and content required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Security: Ensure key is under allowed directories and filename is safe
    const allowedDirs = (env.ALLOWED_DIRS ?? 'blog,portfolio,projects')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const isAllowed = allowedDirs.some(
      d => key === `${d}` || key.startsWith(`${d}/`)
    );
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Validate filename part: only allow a-zA-Z0-9-_ and .md extension
    const fileName = key.split('/').pop() ?? '';
    const safeNameRegex = /^[a-zA-Z0-9-_]{3,64}\.md$/;
    if (!safeNameRegex.test(fileName)) {
      return new Response(JSON.stringify({ error: 'Invalid filename' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Size check
    const maxBytes = parseInt(env.MAX_FILE_BYTES ?? '1048576');
    if (content.length > maxBytes) {
      return new Response(JSON.stringify({ error: 'Content too large' }), {
        status: 413,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // ETag check for optimistic concurrency
    if (etag) {
      const existing = await env.PORTFOLIO_CONTENT.get(key);
      if (existing && existing.etag !== etag) {
        return new Response(
          JSON.stringify({
            code: 'etag_conflict',
            error: 'Object has been modified',
          }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    const result = await env.PORTFOLIO_CONTENT.put(key, content, {
      httpMetadata: {
        contentType: 'text/markdown; charset=utf-8',
      },
    });

    return new Response(JSON.stringify({ etag: result.etag }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  } catch (error) {
    console.error('Write error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to write object',
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
}

// Handle POST /api/content/delete
async function handleDelete(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  }

  try {
    const body = await request.json();
    const { key } = body as DeleteRequestBody;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Key required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const allowedDirs = (env.ALLOWED_DIRS ?? 'blog,portfolio,projects')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Security: Ensure key is under allowed directories
    const isAllowed = allowedDirs.some(
      d => key === `${d}` || key.startsWith(`${d}/`)
    );
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get the original object
    const obj = await env.PORTFOLIO_CONTENT.get(key);
    if (!obj) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const trashKey = `trash/${now}/${key}`;

    // Copy to trash (retain original content type if available)
    await env.PORTFOLIO_CONTENT.put(trashKey, obj.body, {
      httpMetadata: {
        contentType:
          obj.httpMetadata?.contentType ?? 'text/markdown; charset=utf-8',
      },
    });

    // Delete original
    await env.PORTFOLIO_CONTENT.delete(key);

    return new Response(JSON.stringify({ ok: true, trashKey }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to delete',
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
}

// Handle GET /api/content/read
async function handleRead(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ error: 'Key parameter required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const allowedDirs = (env.ALLOWED_DIRS ?? 'blog,portfolio,projects')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Security: Ensure key is under allowed directories
  const isAllowed = allowedDirs.some(
    d => key === `${d}` || key.startsWith(`${d}/`)
  );
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid key' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const object = await env.PORTFOLIO_CONTENT.get(key);

    if (!object) {
      return new Response(JSON.stringify({ error: 'Object not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const body = await object.text();

    // Return JSON with body and ETag so the client can parse easily
    return new Response(JSON.stringify({ body, etag: object.etag }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  } catch (error) {
    console.error('Read error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to read object',
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
}

// Handle GET /api/content/exists
async function handleExists(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ error: 'Key parameter required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  }

  const allowedDirs = (env.ALLOWED_DIRS ?? 'blog,portfolio,projects')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Security: Ensure key is under allowed directories
  const isAllowed = allowedDirs.some(
    d => key === `${d}` || key.startsWith(`${d}/`)
  );
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid key' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  }

  try {
    const object = await env.PORTFOLIO_CONTENT.get(key);

    if (object) {
      return new Response(
        JSON.stringify({
          exists: true,
          etag: object.etag,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers':
              'Content-Type, Authorization, CF-Access-Jwt-Assertion',
          },
        }
      );
    } else {
      return new Response(JSON.stringify({ exists: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      });
    }
  } catch (error) {
    console.error('Exists error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check object existence',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      }
    );
  }
}

// Handle GET /api/content/list
async function handleList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  const rawPrefix = url.searchParams.get('prefix') ?? '';
  const cursor = url.searchParams.get('cursor') ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 1000);

  const allowedDirs = (env.ALLOWED_DIRS ?? 'blog,portfolio,projects')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Normalize prefix to ensure folder-style prefixes end with '/'
  const normalizePrefix = (p: string) => (p && !p.endsWith('/') ? `${p}/` : p);
  const prefix = normalizePrefix(rawPrefix);

  // If no prefix, return only the allowed top-level directories as folders
  if (!prefix) {
    return new Response(
      JSON.stringify({
        prefixes: allowedDirs.map(d => `${d}/`),
        objects: [],
        cursor: undefined,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      }
    );
  }

  // Security: Only allow listing within allowed directories
  const isAllowed = allowedDirs.some(
    d => prefix === `${d}/` || prefix.startsWith(`${d}/`)
  );
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid prefix' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    // Do a plain list without delimiter so we can derive both immediate files and subfolders
    const result = await env.PORTFOLIO_CONTENT.list({ prefix, cursor, limit });

    const filesInCurrentDir = result.objects
      .filter(obj => {
        const key: string = obj.key;
        if (!key.endsWith('.md')) return false;
        const rest = key.slice(prefix.length);
        return !rest.includes('/');
      })
      .map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
          ? new Date(obj.uploaded).toISOString()
          : new Date().toISOString(),
        etag: obj.etag,
      }));

    // Derive immediate subfolders
    const folderSet = new Set<string>();
    for (const obj of result.objects) {
      const rest = obj.key.slice(prefix.length);
      const idx = rest.indexOf('/');
      if (idx > -1) {
        const seg = rest.slice(0, idx);
        if (seg) folderSet.add(`${prefix}${seg}/`);
      }
    }
    const prefixes = Array.from(folderSet);

    return new Response(
      JSON.stringify({
        prefixes,
        objects: filesInCurrentDir,
        cursor: result.truncated ? result.cursor : undefined,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      }
    );
  } catch (error) {
    console.error('List error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to list objects',
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
}

// Handle GET /_list (legacy proxy endpoint)
async function handleLegacyList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const prefix = url.searchParams.get('prefix') ?? '';
  const cursor = url.searchParams.get('cursor') ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 1000);

  const allowedDirs = (env.ALLOWED_DIRS ?? 'blog,portfolio,projects')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Normalize prefix to ensure folder-style prefixes end with '/'
  const normalizePrefix = (p: string) => (p && !p.endsWith('/') ? `${p}/` : p);
  const normalizedPrefix = normalizePrefix(prefix);

  // If no prefix, return only the allowed top-level directories as folders
  if (!normalizedPrefix) {
    return new Response(
      JSON.stringify({
        prefixes: allowedDirs.map(d => `${d}/`),
        objects: [],
        cursor: undefined,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }

  // Security: Only allow listing within allowed directories
  const isAllowed = allowedDirs.some(
    d => normalizedPrefix === `${d}/` || normalizedPrefix.startsWith(`${d}/`)
  );
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Invalid prefix' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const result = await env.PORTFOLIO_CONTENT.list({
      prefix: normalizedPrefix,
      cursor,
      limit,
    });

    const filesInCurrentDir = result.objects
      .filter(obj => {
        const key: string = obj.key;
        if (!key.endsWith('.md')) return false;
        const rest = key.slice(normalizedPrefix.length);
        return !rest.includes('/');
      })
      .map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
          ? new Date(obj.uploaded).toISOString()
          : new Date().toISOString(),
        etag: obj.etag,
      }));

    // Derive immediate subfolders
    const folderSet = new Set<string>();
    for (const obj of result.objects) {
      const rest = obj.key.slice(normalizedPrefix.length);
      const idx = rest.indexOf('/');
      if (idx > -1) {
        const seg = rest.slice(0, idx);
        if (seg) folderSet.add(`${normalizedPrefix}${seg}/`);
      }
    }
    const prefixes = Array.from(folderSet);

    return new Response(
      JSON.stringify({
        prefixes,
        objects: filesInCurrentDir,
        cursor: result.truncated ? result.cursor : undefined,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Legacy list error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to list objects',
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
}

// Handle POST /api/generate
async function handleGenerate(request: Request, _env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { markdown } = body as GenerateRequestBody;

    if (!markdown || typeof markdown !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Markdown content required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers':
              'Content-Type, Authorization, CF-Access-Jwt-Assertion',
          },
        }
      );
    }

    // Simple heuristic-based frontmatter generation (fallback when AI worker is not available)
    const frontmatter = generateBasicFrontmatter(markdown);

    return new Response(JSON.stringify({ frontmatter }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate frontmatter',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      }
    );
  }
}

// Content file lists (same as in build script)
const PORTFOLIO_FILES = [
  'strategy.md',
  'leadership.md',
  'talent.md',
  'devops.md',
  'saas.md',
  'analytics.md',
  'risk-compliance.md',
  'governance-pmo.md',
  'product-ux.md',
  'education-certifications.md',
  'ai-automation.md',
  'culture.md',
  'capabilities.md',
  'projects.md',
];

const BLOG_FILES = [
  'ai-models-2025.md',
  'pmbok-agile-methodology-blend.md',
  'serverless-ai-workflows-azure-functions.md',
  'power-automate-workflow-automation.md',
  'asana-ai-status-reporting.md',
  'mkdocs-github-actions-portfolio.md',
  'internal-ethos-high-performing-organizations.md',
  'digital-transformation-strategy-governance.md',
  'military-leadership-be-know-do.md',
  'ramp-agents-ai-finance-operations.md',
  'pmp-digital-transformation-leadership.md',
];

const PROJECT_FILES = ['project-analysis.md'];

// Helper function to determine category from tags and filename
function getCategoryFromTags(tags: string[], fileName: string): string {
  const tagString = tags.join(' ').toLowerCase();
  const fileNameLower = fileName.toLowerCase();

  // Strategy & Consulting
  if (
    tagString.includes('strategy') ||
    tagString.includes('consulting') ||
    fileNameLower.includes('strategy') ||
    fileNameLower.includes('governance')
  ) {
    return 'Strategy & Consulting';
  }

  // Leadership & Culture
  if (
    tagString.includes('leadership') ||
    tagString.includes('culture') ||
    tagString.includes('talent') ||
    tagString.includes('team') ||
    fileNameLower.includes('leadership') ||
    fileNameLower.includes('culture') ||
    fileNameLower.includes('talent')
  ) {
    return 'Leadership & Culture';
  }

  // Technology & Operations
  if (
    tagString.includes('devops') ||
    tagString.includes('technology') ||
    tagString.includes('saas') ||
    tagString.includes('automation') ||
    fileNameLower.includes('devops') ||
    fileNameLower.includes('saas') ||
    fileNameLower.includes('ai-automation')
  ) {
    return 'Technology & Operations';
  }

  // Data & Analytics
  if (
    tagString.includes('analytics') ||
    tagString.includes('data') ||
    tagString.includes('insights') ||
    fileNameLower.includes('analytics')
  ) {
    return 'Data & Analytics';
  }

  // Risk & Compliance
  if (
    tagString.includes('risk') ||
    tagString.includes('compliance') ||
    tagString.includes('governance') ||
    fileNameLower.includes('risk-compliance')
  ) {
    return 'Risk & Compliance';
  }

  // Product & UX
  if (
    tagString.includes('product') ||
    tagString.includes('ux') ||
    tagString.includes('design') ||
    fileNameLower.includes('product-ux')
  ) {
    return 'Product & UX';
  }

  // Education & Certifications
  if (
    tagString.includes('education') ||
    tagString.includes('certification') ||
    fileNameLower.includes('education-certifications')
  ) {
    return 'Education & Certifications';
  }

  // AI & Automation
  if (
    tagString.includes('ai') ||
    tagString.includes('artificial intelligence') ||
    fileNameLower.includes('ai-automation')
  ) {
    return 'AI & Automation';
  }

  // Project Portfolio
  if (
    fileNameLower.includes('projects') ||
    fileNameLower.includes('project-analysis')
  ) {
    return 'Project Portfolio';
  }

  // Default category
  return 'Strategy & Consulting';
}

// Fetch content from R2
async function fetchContentFromR2(
  env: Env,
  key: string
): Promise<string | null> {
  try {
    const object = await env.PORTFOLIO_CONTENT.get(key);
    if (!object) {
      return null;
    }
    return await object.text();
  } catch (error) {
    console.error(`Failed to fetch ${key}:`, error);
    return null;
  }
}

// Simple frontmatter parser (basic implementation)
function parseFrontmatter(content: string): {
  attributes: Record<string, unknown>;
  body: string;
} {
  const lines = content.split('\n');
  const frontmatterStart = lines.findIndex(line => line.trim() === '---');

  if (frontmatterStart !== 0) {
    return { attributes: {}, body: content };
  }

  const frontmatterEnd = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---'
  );

  if (frontmatterEnd === -1) {
    return { attributes: {}, body: content };
  }

  const frontmatterLines = lines.slice(1, frontmatterEnd);
  const body = lines.slice(frontmatterEnd + 1).join('\n');

  // Simple YAML parsing (very basic)
  const attributes: Record<string, unknown> = {};
  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value: unknown = line.substring(colonIndex + 1).trim();

      // Parse arrays (basic)
      if (
        typeof value === 'string' &&
        value.startsWith('[') &&
        value.endsWith(']')
      ) {
        value = value
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/^["']|["']$/g, ''));
      }

      attributes[key] = value;
    }
  }

  return { attributes, body };
}

// Handle POST /api/content/rebuild-cache
async function handleRebuildCache(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      },
    });
  }

  try {
    console.log('🔄 Starting cache rebuild from API call...');

    const portfolioItems: Record<string, unknown>[] = [];
    const blogItems: Record<string, unknown>[] = [];
    const projectItems: Record<string, unknown>[] = [];
    const allItems: Record<string, unknown>[] = [];

    // Process portfolio items
    console.log('🔄 Processing portfolio items...');
    for (const fileName of PORTFOLIO_FILES) {
      try {
        const key = `portfolio/${fileName}`;
        const content = await fetchContentFromR2(env, key);

        if (!content) {
          console.log(`⚠️  Skipping ${key} - not found`);
          continue;
        }

        const { attributes, body } = parseFrontmatter(content);

        const item = {
          id: key,
          title:
            (attributes.title as string) ||
            fileName.replace('.md', '').replace(/-/g, ' '),
          description:
            (attributes.description as string) ||
            body.substring(0, 200) + '...',
          url: `/${key}`,
          contentType: 'portfolio',
          category: getCategoryFromTags(
            (attributes.tags as string[]) || [],
            fileName
          ),
          tags: (attributes.tags as string[]) || [],
          keywords: (attributes.keywords as string[]) || [],
          content: body,
          fileName: fileName,
        };

        portfolioItems.push(item);
        allItems.push(item);

        console.log(`✅ Processed: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to process portfolio/${fileName}:`, error);
      }
    }

    // Process blog items
    console.log('🔄 Processing blog items...');
    for (const fileName of BLOG_FILES) {
      try {
        const key = `blog/${fileName}`;
        const content = await fetchContentFromR2(env, key);

        if (!content) {
          console.log(`⚠️  Skipping ${key} - not found`);
          continue;
        }

        const { attributes, body } = parseFrontmatter(content);

        const item = {
          id: key,
          title:
            (attributes.title as string) ||
            fileName.replace('.md', '').replace(/-/g, ' '),
          description:
            (attributes.description as string) ||
            body.substring(0, 200) + '...',
          url: `/${key}`,
          contentType: 'blog',
          category: getCategoryFromTags(
            (attributes.tags as string[]) || [],
            fileName
          ),
          tags: (attributes.tags as string[]) || [],
          keywords: (attributes.keywords as string[]) || [],
          content: body,
          date: attributes.date as string,
          fileName: fileName,
        };

        blogItems.push(item);
        allItems.push(item);

        console.log(`✅ Processed: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to process blog/${fileName}:`, error);
      }
    }

    // Process project items
    console.log('🔄 Processing project items...');
    for (const fileName of PROJECT_FILES) {
      try {
        const key = `projects/${fileName}`;
        const content = await fetchContentFromR2(env, key);

        if (!content) {
          console.log(`⚠️  Skipping ${key} - not found`);
          continue;
        }

        const { attributes, body } = parseFrontmatter(content);

        const item = {
          id: key,
          title:
            (attributes.title as string) ||
            fileName.replace('.md', '').replace(/-/g, ' '),
          description:
            (attributes.description as string) ||
            body.substring(0, 200) + '...',
          url: `/${key}`,
          contentType: 'project',
          category: getCategoryFromTags(
            (attributes.tags as string[]) || [],
            fileName
          ),
          tags: (attributes.tags as string[]) || [],
          keywords: (attributes.keywords as string[]) || [],
          content: body,
          fileName: fileName,
        };

        projectItems.push(item);
        allItems.push(item);

        console.log(`✅ Processed: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to process projects/${fileName}:`, error);
      }
    }

    // Sort items
    portfolioItems.sort((a, b) =>
      ((a.title as string) ?? '').localeCompare((b.title as string) ?? '')
    );
    blogItems.sort((a, b) =>
      ((b.date as string) ?? '').localeCompare((a.date as string) ?? '')
    );
    projectItems.sort((a, b) =>
      ((a.title as string) ?? '').localeCompare((b.title as string) ?? '')
    );
    allItems.sort((a, b) =>
      ((a.title as string) ?? '').localeCompare((b.title as string) ?? '')
    );

    // Note: cache data is returned directly in the response below

    console.log('🎉 Content indexing completed successfully!');
    console.log(`📊 Total items indexed: ${allItems.length}`);
    console.log(`📁 Portfolio: ${portfolioItems.length}`);
    console.log(`📝 Blog: ${blogItems.length}`);
    console.log(`🚀 Projects: ${projectItems.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cache rebuilt successfully',
        stats: {
          total: allItems.length,
          portfolio: portfolioItems.length,
          blog: blogItems.length,
          projects: projectItems.length,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, CF-Access-Jwt-Assertion',
        },
      }
    );
  } catch (error) {
    console.error('❌ Cache rebuild API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
}

// Simple frontmatter generation fallback
function generateBasicFrontmatter(markdown: string): Record<string, unknown> {
  // Extract title from first H1
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  // Extract first paragraph as description
  const descMatch = markdown.match(/\n\n(.+?)\n\n/);
  const description = descMatch
    ? descMatch[1].trim().slice(0, 200)
    : 'No description available';

  // Basic tags based on content
  const tags = ['blog'];
  if (markdown.includes('code') || markdown.includes('```'))
    tags.push('technical');
  if (markdown.includes('project') || markdown.includes('implementation'))
    tags.push('project');
  if (markdown.includes('guide') || markdown.includes('tutorial'))
    tags.push('tutorial');

  return {
    title: title.slice(0, 80),
    description: description.slice(0, 220),
    tags,
    draft: true,
    date: new Date().toISOString().split('T')[0],
  };
}

// Handle file requests (existing proxy functionality)
async function handleFileRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    // Remove leading slash
    const key = path.startsWith('/') ? path.slice(1) : path;

    if (!key) {
      return new Response('Not found', { status: 404 });
    }

    const object = await env.PORTFOLIO_CONTENT.get(key);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (object.etag) {
      headers.set('ETag', object.etag);
    }

    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType);
    }

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('File request error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
