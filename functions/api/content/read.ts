interface Env {
  R2_CONTENT: R2Bucket;
  ALLOWED_PREFIX: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const key = url.searchParams.get('key');

  if (!key) {
    return Response.json({ error: 'Key parameter required' }, { status: 400 });
  }

  // Security: Ensure key is under allowed path
  if (!key.startsWith(env.ALLOWED_PREFIX)) {
    return Response.json({ error: 'Invalid key' }, { status: 400 });
  }

  try {
    const object = await env.R2_CONTENT.get(key);

    if (!object) {
      return Response.json({ error: 'Object not found' }, { status: 404 });
    }

    const body = await object.text();

    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'ETag': object.etag,
      },
    });
  } catch (error) {
    console.error('Read error:', error);
    return Response.json({ error: 'Failed to read object' }, { status: 500 });
  }
}
