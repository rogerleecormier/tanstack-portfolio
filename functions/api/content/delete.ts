/**
 * @typedef {Object} Env
 * @property {R2Bucket} R2_CONTENT
 * @property {string} [ALLOWED_DIRS]
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Jwt-Assertion, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    const { key } = await request.json();
    if (!key) return Response.json({ error: 'Key required' }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

    const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const isAllowed = allowedDirs.some(
      d => key === d || key.startsWith(`${d}/`)
    );
    if (!isAllowed)
      return Response.json({ error: 'Invalid key' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });

    // Get the original object
    const obj = await env.R2_CONTENT.get(key);
    if (!obj) return Response.json({ error: 'Not found' }, {
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const trashKey = `trash/${now}/${key}`;

    // Copy to trash (retain original content type if available)
    await env.R2_CONTENT.put(trashKey, obj.body, {
      httpMetadata: {
        contentType:
          obj.httpMetadata?.contentType || 'text/markdown; charset=utf-8',
      },
    });

    // Delete original
    await env.R2_CONTENT.delete(key);

    return Response.json({ ok: true, trashKey }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch {
    return Response.json({ error: 'Failed to delete' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
