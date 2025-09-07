interface Env {
  R2_CONTENT: R2Bucket;
  ALLOWED_DIRS?: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { key } = await request.json();
    if (!key) return Response.json({ error: 'Key required' }, { status: 400 });

    const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const isAllowed = allowedDirs.some((d) => key === d || key.startsWith(`${d}/`));
    if (!isAllowed) return Response.json({ error: 'Invalid key' }, { status: 400 });

    // Get the original object
    const obj = await env.R2_CONTENT.get(key);
    if (!obj) return Response.json({ error: 'Not found' }, { status: 404 });

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const trashKey = `trash/${now}/${key}`;

    // Copy to trash (retain original content type if available)
    await env.R2_CONTENT.put(trashKey, obj.body, {
      httpMetadata: {
        contentType: obj.httpMetadata?.contentType || 'text/markdown; charset=utf-8',
      },
    });

    // Delete original
    await env.R2_CONTENT.delete(key);

    return Response.json({ ok: true, trashKey });
  } catch (e) {
    return Response.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

