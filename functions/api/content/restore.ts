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
    const { trashKey, overwrite, targetKey } = await request.json();
    if (!trashKey || typeof trashKey !== 'string' || !trashKey.startsWith('trash/')) {
      return Response.json({ error: 'Invalid trashKey' }, { status: 400 });
    }

    // trash/<timestamp>/<original key>
    const parts = trashKey.split('/');
    if (parts.length < 3) {
      return Response.json({ error: 'Malformed trashKey' }, { status: 400 });
    }
    const originalKey = parts.slice(2).join('/');
    const destKey = typeof targetKey === 'string' && targetKey.length ? targetKey : originalKey;

    const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const isAllowed = allowedDirs.some((d) => destKey === d || destKey.startsWith(`${d}/`));
    if (!isAllowed) return Response.json({ error: 'Disallowed target key' }, { status: 400 });

    // Validate filename part for safety
    const fileName = destKey.split('/').pop() || '';
    const safeNameRegex = /^[a-zA-Z0-9-_]{3,64}\.md$/;
    if (!safeNameRegex.test(fileName)) {
      return Response.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const src = await env.R2_CONTENT.get(trashKey);
    if (!src) return Response.json({ error: 'Trash object not found' }, { status: 404 });

    const exists = await env.R2_CONTENT.get(destKey);
    if (exists && !overwrite) {
      return Response.json({ error: 'Target exists', code: 'exists' }, { status: 409 });
    }

    await env.R2_CONTENT.put(destKey, src.body, {
      httpMetadata: {
        contentType: src.httpMetadata?.contentType || 'text/markdown; charset=utf-8',
      },
    });
    await env.R2_CONTENT.delete(trashKey);

    return Response.json({ ok: true, key: destKey });
  } catch {
    return Response.json({ error: 'Failed to restore' }, { status: 500 });
  }
}
