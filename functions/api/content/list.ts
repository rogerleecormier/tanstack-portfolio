interface Env {
  R2_CONTENT: R2Bucket;
  ALLOWED_PREFIX: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const prefix = url.searchParams.get('prefix') || '';
  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000);

  // Security: Ensure prefix is under allowed path
  if (!prefix.startsWith(env.ALLOWED_PREFIX)) {
    return Response.json({ error: 'Invalid prefix' }, { status: 400 });
  }

  try {
    const result = await env.R2_CONTENT.list({
      prefix,
      cursor,
      limit,
    });

    const objects = result.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      etag: obj.etag,
    }));

    return Response.json({
      objects,
      cursor: result.truncated ? result.cursor : undefined,
    });
  } catch (error) {
    console.error('List error:', error);
    return Response.json({ error: 'Failed to list objects' }, { status: 500 });
  }
}
