interface Env {
  R2_CONTENT: R2Bucket;
  // Optional: comma-separated list of allowed top-level directories (e.g. "blog,portfolio,projects")
  ALLOWED_DIRS?: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const rawPrefix = url.searchParams.get('prefix') || '';
  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000);

  const allowedDirs = (env.ALLOWED_DIRS || 'blog,portfolio,projects')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Normalize prefix to ensure folder-style prefixes end with '/'
  const normalizePrefix = (p: string) => (p && !p.endsWith('/') ? `${p}/` : p);
  const prefix = normalizePrefix(rawPrefix);

  // If no prefix, return only the allowed top-level directories as folders
  if (!prefix) {
    return Response.json({
      prefixes: allowedDirs.map(d => `${d}/`),
      objects: [],
      cursor: undefined,
    });
  }

  // Security: Only allow listing within allowed directories
  const isAllowed = allowedDirs.some(
    d => prefix === `${d}/` || prefix.startsWith(`${d}/`)
  );
  if (!isAllowed) {
    return Response.json({ error: 'Invalid prefix' }, { status: 400 });
  }

  try {
    // Do a plain list without delimiter so we can derive both immediate files and subfolders
    const result = await env.R2_CONTENT.list({ prefix, cursor, limit });

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
      const rest = (obj.key as string).slice(prefix.length);
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
    });
  } catch (error) {
    console.error('List error:', error);
    return Response.json({ error: 'Failed to list objects' }, { status: 500 });
  }
}
