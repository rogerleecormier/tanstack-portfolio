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
        'Access-Control-Allow-Headers':
          'Content-Type, CF-Access-Jwt-Assertion, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';

  if (!key) {
    return Response.json(
      { error: 'Key parameter required' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const isAllowed = allowedDirs.some(d => key === d || key.startsWith(`${d}/`));
  if (!isAllowed) {
    return Response.json(
      { error: 'Invalid key' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const obj = await env.R2_CONTENT.get(key);
    const exists = !!obj;
    return Response.json(
      { exists, etag: obj?.etag },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch {
    return Response.json(
      { error: 'Failed to check' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
