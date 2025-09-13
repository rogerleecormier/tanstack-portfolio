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

  const key = url.searchParams.get('key');

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

  // Security: Ensure key is under allowed directories
  const isAllowed = allowedDirs.some(
    d => key === `${d}` || key.startsWith(`${d}/`)
  );
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
    const object = await env.R2_CONTENT.get(key);

    if (!object) {
      return Response.json(
        { error: 'Object not found' },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const body = await object.text();

    // Return JSON with body and ETag so the client can parse easily
    return Response.json(
      { body, etag: object.etag },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Read error:', error);
    return Response.json(
      { error: 'Failed to read object' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
