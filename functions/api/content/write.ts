interface Env {
  R2_CONTENT: R2Bucket;
  ALLOWED_DIRS?: string;
  MAX_FILE_BYTES: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { key, content, etag } = await request.json();

    if (!key || !content) {
      return Response.json({ error: 'Key and content required' }, { status: 400 });
    }

    // Security: Ensure key is under allowed directories and filename is safe
    const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const isAllowed = allowedDirs.some((d) => key === `${d}` || key.startsWith(`${d}/`));
    if (!isAllowed) {
      return Response.json({ error: 'Invalid key' }, { status: 400 });
    }

    // Validate filename part: only allow a-zA-Z0-9-_ and .md extension
    const fileName = key.split('/').pop() || '';
    const safeNameRegex = /^[a-zA-Z0-9-_]{3,64}\.md$/;
    if (!safeNameRegex.test(fileName)) {
      return Response.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Size check
    const maxBytes = parseInt(env.MAX_FILE_BYTES);
    if (content.length > maxBytes) {
      return Response.json({ error: 'Content too large' }, { status: 413 });
    }

    // ETag check for optimistic concurrency
    if (etag) {
      const existing = await env.R2_CONTENT.get(key);
      if (existing && existing.etag !== etag) {
        return Response.json({
          code: 'etag_conflict',
          error: 'Object has been modified'
        }, { status: 409 });
      }
    }

    const result = await env.R2_CONTENT.put(key, content, {
      httpMetadata: {
        contentType: 'text/markdown; charset=utf-8',
      },
    });

    return Response.json({ etag: result.etag });
  } catch (error) {
    console.error('Write error:', error);
    return Response.json({ error: 'Failed to write object' }, { status: 500 });
  }
}
