interface Env {
  R2_CONTENT: R2Bucket;
  ALLOWED_DIRS?: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const key = url.searchParams.get('key');

  if (!key) {
    return Response.json({ error: 'Key parameter required' }, { status: 400 });
  }

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Security: Ensure key is under allowed directories
  const isAllowed = allowedDirs.some((d) => key === `${d}` || key.startsWith(`${d}/`));
  if (!isAllowed) {
    return Response.json({ error: 'Invalid key' }, { status: 400 });
  }

  try {
    const object = await env.R2_CONTENT.get(key);

    if (!object) {
      return Response.json({ error: 'Object not found' }, { status: 404 });
    }

    const body = await object.text();

    // Return JSON with body and ETag so the client can parse easily
    return Response.json({ body, etag: object.etag });
  } catch (error) {
    console.error('Read error:', error);
    return Response.json({ error: 'Failed to read object' }, { status: 500 });
  }
}
