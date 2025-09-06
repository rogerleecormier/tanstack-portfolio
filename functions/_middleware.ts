import { jwtVerify } from 'jose';

interface Env {
  ACCESS_AUD?: string;
  ACCESS_ISS?: string;
}

interface User {
  sub: string;
  email: string;
  role?: string;
}

export async function onRequest(context: { request: Request; env: Env; next: () => Promise<Response> }) {
  const { request } = context;

  // Extract JWT from CF-Access-Jwt-Assertion header
  const jwt = request.headers.get('CF-Access-Jwt-Assertion');

  if (!jwt) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // For now, we'll trust Cloudflare Access and just decode the JWT
    // In production, you might want to verify the JWT signature
    const { payload } = await jwtVerify(jwt, new Uint8Array(32)); // Dummy key for decoding

    const user: User = {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string || 'reader',
    };

    // Add user to context
    context.request = new Request(request.url, {
      ...request,
      cf: { ...request.cf, user },
    });

    return context.next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return new Response('Unauthorized', { status: 401 });
  }
}
