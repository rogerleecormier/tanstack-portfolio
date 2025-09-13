/**
 * @typedef {Object} Env
 * @property {R2Bucket} R2_CONTENT
 * @property {string} [ALLOWED_DIRS] - Optional: comma-separated list of allowed top-level directories (e.g. "blog,portfolio,projects")
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

  const url = new URL(request.url);

  const rawPrefix = url.searchParams.get('prefix') || '';
  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000);

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Normalize prefix to ensure folder-style prefixes end with '/'
  const normalizePrefix = (p) => (p && !p.endsWith('/') ? `${p}/` : p);
  const prefix = normalizePrefix(rawPrefix);

  // If no prefix, return only the allowed top-level directories as folders
  if (!prefix) {
    return Response.json({
      prefixes: allowedDirs.map(d => `${d}/`),
      objects: [],
      cursor: undefined,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  // Security: Only allow listing within allowed directories
  const isAllowed = allowedDirs.some(
    d => prefix === `${d}/` || prefix.startsWith(`${d}/`)
  );
  if (!isAllowed) {
    return Response.json({ error: 'Invalid prefix' }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    // Do a plain list without delimiter so we can derive both immediate files and subfolders
    const result = await env.R2_CONTENT.list({ prefix, cursor, limit });

    const filesInCurrentDir = result.objects
      .filter(obj => {
        const key = obj.key;
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
    const folderSet = new Set();
    for (const obj of result.objects) {
      const rest = obj.key.slice(prefix.length);
      const idx = rest.indexOf('/');
      if (idx > -1) {
        const seg = rest.slice(0, idx);
        if (seg) folderSet.add(`${prefix}${seg}/`);
      }
    }
    const prefixes = Array.from(folderSet);

    return Response.json({
      prefixes,
      objects: filesInCurrentDir,
      cursor: result.truncated ? result.cursor : undefined,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('List error:', error);
    return Response.json({ error: 'Failed to list objects' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
