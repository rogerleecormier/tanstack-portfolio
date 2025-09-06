import { jwtVerify, createRemoteJWKSet, decodeJwt, type JWTPayload } from 'jose';

interface Env {
  ACCESS_AUD?: string;
  ACCESS_ISS?: string; // e.g. https://your-team.cloudflareaccess.com
}

interface User {
  sub: string;
  email: string;
  role?: string;
}

function issuerToJwksUrl(issuer: string): URL {
  const base = issuer.endsWith('/') ? issuer.slice(0, -1) : issuer;
  return new URL(`${base}/cdn-cgi/access/certs`);
}

type RequestContext = { request: Request; env: Env; data?: { user?: User }; next: () => Promise<Response> };

export async function onRequest(context: RequestContext) {
  const { request, env } = context;

  // CF Access adds this header when the app is protected by Access
  const jwt = request.headers.get('CF-Access-Jwt-Assertion');

  // If no JWT (public route or Access not configured), let it through
  if (!jwt) return context.next();

  try {
    let payload: JWTPayload;

    if (env.ACCESS_ISS) {
      // Verify with CF Access JWKS when issuer is configured
      const jwks = createRemoteJWKSet(issuerToJwksUrl(env.ACCESS_ISS));
      const { payload: verified } = await jwtVerify(jwt, jwks, {
        audience: env.ACCESS_AUD,
        issuer: env.ACCESS_ISS.endsWith('/') ? env.ACCESS_ISS.slice(0, -1) : env.ACCESS_ISS,
      });
      payload = verified;
    } else {
      // Fallback: decode claims without verification (not recommended for protected routes)
      payload = decodeJwt(jwt) as JWTPayload;
    }

    const user: User = {
      sub: (payload.sub as string) || '',
      email: (payload.email as string) || '',
      role: (payload.role as string) || 'reader',
    };

    const ctx = context as unknown as { data?: { user?: User } };
    ctx.data = { ...(ctx.data ?? {}), user };

    return context.next();
  } catch (err) {
    console.error('Access JWT verify failed', err);
    return new Response('Unauthorized', { status: 401 });
  }
}
