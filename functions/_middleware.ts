// Lightweight JWT payload decode without external deps.
// Cloudflare Access has already verified the token at the edge.
// We only need the payload claims for app logic.

interface Env {
  ACCESS_AUD?: string;
  ACCESS_ISS?: string;
}

interface User {
  sub: string;
  email: string;
  role?: string;
}

function decodeJwtPayload<T = Record<string, unknown>>(token: string): T {
  const parts = token.split('.')
  if (parts.length < 2) throw new Error('Invalid JWT')
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '==='.slice((base64.length + 3) % 4)
  const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0))
  const json = new TextDecoder().decode(bytes)
  return JSON.parse(json) as T
}

export async function onRequest(context: { request: Request; env: Env; data?: any; next: () => Promise<Response> }) {
  const { request } = context

  // Extract JWT from CF-Access-Jwt-Assertion header
  const jwt = request.headers.get('CF-Access-Jwt-Assertion')

  if (!jwt) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Decode payload claims (Access already verified the token)
    const payload = decodeJwtPayload<Record<string, unknown>>(jwt)

    const user: User = {
      sub: (payload.sub as string) || '',
      email: (payload.email as string) || '',
      role: (payload.role as string) || 'reader',
    }

    // Attach user to context.data for downstream functions
    ;(context as any).data = { ...(context as any).data, user }

    return context.next()
  } catch (error) {
    console.error('JWT decode failed:', error)
    return new Response('Unauthorized', { status: 401 })
  }
}
