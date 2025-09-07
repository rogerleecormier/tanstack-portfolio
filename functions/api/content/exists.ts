interface Env {
  R2_CONTENT: R2Bucket;
  ALLOWED_DIRS?: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';

  if (!key) {
    return Response.json({ error: 'Key parameter required' }, { status: 400 });
  }

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isAllowed = allowedDirs.some((d) => key === d || key.startsWith(`${d}/`));
  if (!isAllowed) {
    return Response.json({ error: 'Invalid key' }, { status: 400 });
  }

  try {
    const obj = await env.R2_CONTENT.get(key);
    const exists = !!obj;
    return Response.json({ exists, etag: obj?.etag });
  } catch (e) {
    return Response.json({ error: 'Failed to check' }, { status: 500 });
  }
}

