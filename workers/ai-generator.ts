// Cloudflare Worker: AI Frontmatter Generator
// Exposes:
//   - GET  /health                -> { ok: true }
//   - POST /api/generate          -> { frontmatter: { title, description, tags[], date?, draft? } }
// CORS is controlled via env.ALLOWED_ORIGINS (comma-separated) or "*".

export interface Env {
  AI: any; // Workers AI binding
  ALLOWED_ORIGINS?: string; // e.g., "http://localhost:5173,https://example.com" or "*"
  MODEL?: string; // optional default model id
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }), request, env);
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return cors(json({ ok: true }), request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/generate') {
      try {
        const body = await safeJson(request);
        if (!body || typeof body.markdown !== 'string') {
          return cors(jsonError('bad_request', 'Expected JSON body with { markdown: string }', 400), request, env);
        }

        // Try Workers AI first (if binding/model present), else fallback to heuristic generation
        const model = (body.model as string) || env.MODEL || '@cf/meta/llama-3.1-8b-instruct';
        let fm: Record<string, unknown> | null = null;

        if (env.AI && typeof env.AI.run === 'function') {
          try {
            const sys = `You are a helpful assistant generating Markdown frontmatter for a blog.
Return ONLY a minified JSON object with this exact shape:
{"title": string, "description": string, "tags": string[]}
Rules:
- Title: compelling, <= 80 chars, no quotes or trailing punctuation.
- Description: concise summary, <= 220 chars, no newlines.
- Tags: 3-7 lowercase keywords (kebab-case), no duplicates, no special characters besides dashes.`;

            const user = `Markdown content:\n\n${body.markdown.slice(0, 20000)}`;

            const result = await env.AI.run(model, {
              messages: [
                { role: 'system', content: sys },
                { role: 'user', content: user },
              ],
              max_tokens: 400,
            });

            // Workers AI responses differ by model. Prefer result.response if present; else text
            const raw = typeof result === 'string' ? result : (result?.response ?? result?.output_text ?? '');
            fm = parseFrontmatterJson(raw);
          } catch (e) {
            console.warn('AI generation failed, falling back to heuristic:', e);
          }
        }

        if (!fm) {
          fm = generateSmartFrontmatter(body.markdown);
        }

        return cors(json({ frontmatter: fm }), request, env);
      } catch (e) {
        return cors(jsonError('internal_error', (e as Error).message || 'Internal error', 500), request, env);
      }
    }

    return cors(jsonError('not_found', 'Route not found', 404), request, env);
  }
} satisfies ExportedHandler<Env>;

// ----- Helpers -----

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonError(code: string, message: string, status = 400): Response {
  return json({ error: { code, message } }, status);
}

function cors(res: Response, req: Request, env: Env): Response {
  const origin = req.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || '*').trim();
  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, CF-Access-Jwt-Assertion');
  headers.set('Access-Control-Max-Age', '86400');
  if (allowed === '*') {
    headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin && allowed.split(',').map(s => s.trim()).includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(res.body, { status: res.status, headers });
}

async function safeJson(req: Request): Promise<any | null> {
  try { return await req.json(); } catch { return null; }
}

function parseFrontmatterJson(raw: string): Record<string, unknown> | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*|```$/g, '');
    const obj = JSON.parse(cleaned);
    const title = String(obj.title || '').trim();
    const description = String(obj.description || '').trim();
    let tags: string[] = Array.isArray(obj.tags) ? obj.tags.map((t: any) => String(t).toLowerCase()) : [];
    tags = normalizeTags(tags);
    if (!title || !description || tags.length === 0) return null;
    return { title, description, tags, draft: true };
  } catch {
    return null;
  }
}

function normalizeTags(tags: string[]): string[] {
  const norm = new Set<string>();
  for (const t of tags) {
    const k = t.toLowerCase().replace(/[^a-z0-9\-\s]/g, ' ').trim().replace(/\s+/g, '-');
    if (k && k.length >= 2) norm.add(k);
  }
  return Array.from(norm).slice(0, 7);
}

// Heuristic generator (non-AI)
function generateSmartFrontmatter(markdown: string): Record<string, unknown> {
  const today = new Date().toISOString().split('T')[0];
  const noFm = markdown.replace(/^---[\s\S]*?---\s*/m, '');
  const noCode = noFm.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
  const h1 = (noCode.match(/^#\s+(.+)$/m) || [])[1];
  const plain = noCode
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
    .replace(/\[[^\]]*\]\([^\)]+\)/g, '$1')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  const sentences = plain.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const tokens = tokenize(plain);
  const tf = new Map<string, number>();
  tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));

  const scored = sentences.map(s => ({ s, score: tokenize(s).reduce((a, t) => a + (tf.get(t) || 0), 0) }));
  const desc = pickSummary(scored, 220);
  const keywords = Array.from(tf.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
  const tags = normalizeTags(keywords);
  const title = (h1 && h1.length >= 6 ? h1 : composeTitle(keywords, sentences)).slice(0, 80);

  return { title, description: desc, tags: tags.length ? tags : undefined, date: today, draft: true };
}

function tokenize(text: string): string[] {
  const STOP = new Set(['the','and','for','are','but','not','you','your','with','that','this','from','have','has','was','were','they','their','our','out','about','into','over','under','then','than','them','these','those','just','like','can','will','should','would','could','may','might','been','being','also','there','here','what','when','where','why','how','who','whom','which','as','on','in','of','to','by','at','it','its','we','i','a','an','or','if','is','be','do','did','does','done','up','down','across','within','between','because','so','such','only','more','most','less','least','very','every','each','per','via']);
  return text.toLowerCase().replace(/[^a-z0-9\s\-]/g, ' ').split(/\s+/).map(t => t.trim()).filter(t => t && !STOP.has(t) && /[a-z]/.test(t) && t.length >= 3);
}

function pickSummary(scored: Array<{ s: string; score: number }>, limit: number): string {
  const parts: string[] = [];
  let remain = limit;
  for (const { s } of scored.sort((a, b) => b.score - a.score)) {
    const chunk = s.trim();
    if (!chunk) continue;
    if (parts.length && (chunk.length + 1) > remain) continue;
    parts.push(chunk);
    remain -= chunk.length + 1;
    if (remain <= 0 || parts.length >= 3) break;
  }
  const joined = parts.join(' ');
  return joined.length > limit ? joined.slice(0, limit - 1).trimEnd() + '…' : joined;
}

function composeTitle(keywords: string[], sentences: string[]): string {
  if (keywords.length >= 2) return titleCase(keywords.slice(0, 3).join(' '));
  if (sentences.length) return titleCase(sentences[0].slice(0, 80));
  return 'Untitled';
}

function titleCase(s: string): string { return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1)); }

