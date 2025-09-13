// Cloudflare Worker: AI Frontmatter Generator with Smart Model Selection
// Exposes:
//   - GET  /health                     -> { ok: true, models: {}, features: {} }
//   - POST /api/generate               -> { frontmatter: {}, metadata: {} }
//   - POST /api/analyze-complexity     -> { complexity: {}, recommendedModel: {}, allModels: {} }
// Features:
//   - Smart AI model selection based on content complexity (8B, 70B, 405B models)
//   - Automatic fallback to heuristic generation if AI fails
//   - Complexity analysis considering length, structure, technical terms, code blocks, links, images
// CORS is controlled via env.ALLOWED_ORIGINS (comma-separated) or "*".

export interface Env {
  AI: { run: (model: string, options: unknown) => Promise<unknown> }; // Workers AI binding
  ALLOWED_ORIGINS?: string; // e.g., "http://localhost:5173,https://example.com" or "*"
  MODEL?: string; // optional default model id
  CACHE?: {
    get: (key: string) => Promise<string | null>;
    put: (
      key: string,
      value: string,
      options?: { expirationTtl?: number }
    ) => Promise<void>;
  }; // Optional KV cache for similar content
}

// AI response types for different models
interface AIResponse {
  response?: string;
  output_text?: string;
  text?: string;
  [key: string]: unknown;
}

interface GenerateRequest {
  markdown: string;
  model?: string;
}

// Available AI models with their characteristics
const AI_MODELS = {
  // Fast, lightweight model for simple content
  FAST: '@cf/meta/llama-3.1-8b-instruct',
  // Balanced model for medium complexity
  BALANCED: '@cf/meta/llama-3.1-70b-instruct',
  // Most capable model for complex content
  ADVANCED: '@cf/meta/llama-3.1-405b-instruct',
} as const;

type ModelType = keyof typeof AI_MODELS;

interface ContentComplexity {
  score: number;
  factors: {
    length: number;
    structure: number;
    technical: number;
    codeBlocks: number;
    links: number;
    images: number;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }), request, env);
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return cors(
        json({
          ok: true,
          models: AI_MODELS,
          features: {
            smartModelSelection: true,
            complexityAnalysis: true,
            fallbackToHeuristic: true,
          },
        }),
        request,
        env
      );
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/api/analyze-complexity'
    ) {
      try {
        const body = (await safeJson(request)) as { markdown: string } | null;
        if (!body || typeof body.markdown !== 'string') {
          return cors(
            jsonError(
              'bad_request',
              'Expected JSON body with { markdown: string }',
              400
            ),
            request,
            env
          );
        }

        const complexity = analyzeContentComplexity(body.markdown);
        const selectedModel = selectOptimalModel(complexity);

        return cors(
          json({
            complexity,
            recommendedModel: selectedModel,
            allModels: AI_MODELS,
          }),
          request,
          env
        );
      } catch (e) {
        return cors(
          jsonError(
            'internal_error',
            (e as Error).message || 'Internal error',
            500
          ),
          request,
          env
        );
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/generate') {
      try {
        const body = (await safeJson(request)) as GenerateRequest | null;
        if (!body || typeof body.markdown !== 'string') {
          return cors(
            jsonError(
              'bad_request',
              'Expected JSON body with { markdown: string }',
              400
            ),
            request,
            env
          );
        }

        // Smart model selection based on content complexity
        const complexity = analyzeContentComplexity(body.markdown);
        const selectedModel = selectOptimalModel(
          complexity,
          body.model,
          env.MODEL
        );

        let fm: Record<string, unknown> | null = null;

        // Check cache for similar content (simple hash-based caching)
        if (env.CACHE) {
          const contentHash = generateContentHash(body.markdown);
          const cached = await env.CACHE.get(`fm:${contentHash}`);
          if (cached) {
            try {
              const cachedData = JSON.parse(cached) as Record<string, unknown>;
              return cors(
                json({
                  frontmatter: cachedData,
                  metadata: {
                    modelUsed: 'cached',
                    modelType: 'CACHED',
                    complexity: complexity.score,
                    complexityFactors: complexity.factors,
                    fallbackUsed: false,
                    cached: true,
                  },
                }),
                request,
                env
              );
            } catch {
              // Invalid cache, continue with AI generation
            }
          }
        }

        if (env.AI && typeof env.AI.run === 'function') {
          try {
            // Optimized attempts for speed vs variety balance
            const attempts = 2; // Reduced for speed - still provides variety
            let lastValidResult: Record<string, unknown> | null = null;
            let bestResult: Record<string, unknown> | null = null;

            for (let i = 0; i < attempts; i++) {
              try {
                const systemPrompt = getSystemPrompt(selectedModel.type);
                const userPrompt = generateVariedUserPrompt(body.markdown);

                // Add timeout for faster response
                const timeoutPromise = new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error('AI request timeout')),
                    15000
                  )
                );

                const aiPromise = env.AI.run(selectedModel.id, {
                  messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                  ],
                  max_tokens: getMaxTokens(selectedModel.type),
                  temperature: getTemperature(selectedModel.type),
                });

                const result = await Promise.race([aiPromise, timeoutPromise]);

                // Workers AI responses differ by model. Prefer result.response if present; else text
                const raw =
                  typeof result === 'string'
                    ? result
                    : ((result as AIResponse)?.response ??
                      (result as AIResponse)?.output_text ??
                      '');

                const parsed = parseFrontmatterJson(raw);
                if (parsed) {
                  lastValidResult = parsed;

                  // Store the first result as our baseline
                  bestResult ??= parsed;

                  // Use this result if it's significantly different from the last one
                  // or if we're on the first attempt
                  if (i === 0 || isSignificantlyDifferent(parsed, bestResult)) {
                    fm = parsed;
                    bestResult = parsed;
                    // 60% chance to continue trying for more variety, 40% chance to use this result
                    if (Math.random() < 0.4) {
                      break;
                    }
                  }
                }
              } catch (attemptError) {
                console.warn(
                  `AI generation attempt ${i + 1} failed:`,
                  attemptError
                );
                if (i === attempts - 1) throw attemptError;
              }
            }

            // Use the best result if we didn't get one in the loop
            if (!fm && bestResult) {
              fm = bestResult;
            } else if (!fm && lastValidResult) {
              fm = lastValidResult;
            }
          } catch (e) {
            console.warn(
              `AI generation failed with ${selectedModel.id}, falling back to heuristic:`,
              e
            );
          }
        }

        fm ??= generateSmartFrontmatter(body.markdown);

        // Cache the result for future similar requests
        if (env.CACHE && fm) {
          const contentHash = generateContentHash(body.markdown);
          await env.CACHE.put(`fm:${contentHash}`, JSON.stringify(fm), {
            expirationTtl: 3600, // Cache for 1 hour
          });
        }

        return cors(
          json({
            frontmatter: fm,
            metadata: {
              modelUsed: selectedModel.id,
              modelType: selectedModel.type,
              complexity: complexity.score,
              complexityFactors: complexity.factors,
              fallbackUsed: !env.AI || typeof env.AI.run !== 'function',
            },
          }),
          request,
          env
        );
      } catch (e) {
        return cors(
          jsonError(
            'internal_error',
            (e as Error).message || 'Internal error',
            500
          ),
          request,
          env
        );
      }
    }

    return cors(jsonError('not_found', 'Route not found', 404), request, env);
  },
} satisfies {
  fetch(request: Request, env: Env): Promise<Response>;
};

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
  const allowed = (env.ALLOWED_ORIGINS ?? '*').trim();
  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, CF-Access-Jwt-Assertion'
  );
  headers.set('Access-Control-Max-Age', '86400');
  if (allowed === '*') {
    headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin && isOriginAllowed(origin, allowed)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(res.body, { status: res.status, headers });
}

function isOriginAllowed(origin: string, allowedOrigins: string): boolean {
  const allowedList = allowedOrigins.split(',').map(s => s.trim());

  for (const allowed of allowedList) {
    if (allowed === origin) {
      return true; // Exact match
    }

    if (allowed.includes('*')) {
      // Handle wildcard patterns like https://*.domain.com
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) {
        return true;
      }
    }
  }

  return false;
}

async function safeJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function parseFrontmatterJson(raw: string): Record<string, unknown> | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*|```$/g, '');
    const obj = JSON.parse(cleaned) as Record<string, unknown>;
    const title = typeof obj.title === 'string' ? obj.title.trim() : '';
    const description =
      typeof obj.description === 'string' ? obj.description.trim() : '';
    let tags: string[] = Array.isArray(obj.tags)
      ? obj.tags.map((t: unknown) => String(t).toLowerCase())
      : [];
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
    const k = t
      .toLowerCase()
      .replace(/[^a-z0-9\-\s]/g, ' ')
      .trim()
      .replace(/\s+/g, '-');
    if (k && k.length >= 2) norm.add(k);
  }
  return Array.from(norm).slice(0, 7);
}

// Heuristic generator (non-AI)
function generateSmartFrontmatter(markdown: string): Record<string, unknown> {
  const today = new Date().toISOString().split('T')[0];
  const noFm = markdown.replace(/^---[\s\S]*?---\s*/m, '');
  const noCode = noFm.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
  const h1 = (noCode.match(/^#\s+(.+)$/m) ?? [])[1];
  const plain = noCode
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[[^\]]*\]\([^)]+\)/g, '$1')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  const sentences = plain
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const tokens = tokenize(plain);
  const tf = new Map<string, number>();
  tokens.forEach(t => tf.set(t, (tf.get(t) ?? 0) + 1));

  const scored = sentences.map(s => ({
    s,
    score: tokenize(s).reduce((a, t) => a + (tf.get(t) ?? 0), 0),
  }));
  const desc = pickSummary(scored, 220);
  const keywords = Array.from(tf.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(e => e[0]);
  const tags = normalizeTags(keywords);
  const title = (
    h1 && h1.length >= 6 ? h1 : composeTitle(keywords, sentences)
  ).slice(0, 80);

  return {
    title,
    description: desc,
    tags: tags.length ? tags : undefined,
    date: today,
    draft: true,
  };
}

function tokenize(text: string): string[] {
  const STOP = new Set([
    'the',
    'and',
    'for',
    'are',
    'but',
    'not',
    'you',
    'your',
    'with',
    'that',
    'this',
    'from',
    'have',
    'has',
    'was',
    'were',
    'they',
    'their',
    'our',
    'out',
    'about',
    'into',
    'over',
    'under',
    'then',
    'than',
    'them',
    'these',
    'those',
    'just',
    'like',
    'can',
    'will',
    'should',
    'would',
    'could',
    'may',
    'might',
    'been',
    'being',
    'also',
    'there',
    'here',
    'what',
    'when',
    'where',
    'why',
    'how',
    'who',
    'whom',
    'which',
    'as',
    'on',
    'in',
    'of',
    'to',
    'by',
    'at',
    'it',
    'its',
    'we',
    'i',
    'a',
    'an',
    'or',
    'if',
    'is',
    'be',
    'do',
    'did',
    'does',
    'done',
    'up',
    'down',
    'across',
    'within',
    'between',
    'because',
    'so',
    'such',
    'only',
    'more',
    'most',
    'less',
    'least',
    'very',
    'every',
    'each',
    'per',
    'via',
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t && !STOP.has(t) && /[a-z]/.test(t) && t.length >= 3);
}

function pickSummary(
  scored: Array<{ s: string; score: number }>,
  limit: number
): string {
  const parts: string[] = [];
  let remain = limit;
  for (const { s } of scored.sort((a, b) => b.score - a.score)) {
    const chunk = s.trim();
    if (!chunk) continue;
    if (parts.length && chunk.length + 1 > remain) continue;
    parts.push(chunk);
    remain -= chunk.length + 1;
    if (remain <= 0 || parts.length >= 3) break;
  }
  const joined = parts.join(' ');
  return joined.length > limit
    ? joined.slice(0, limit - 1).trimEnd() + '…'
    : joined;
}

function composeTitle(keywords: string[], sentences: string[]): string {
  if (keywords.length >= 2) return titleCase(keywords.slice(0, 3).join(' '));
  if (sentences.length) return titleCase(sentences[0].slice(0, 80));
  return 'Untitled';
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

// ----- AI Model Selection Functions -----

function analyzeContentComplexity(markdown: string): ContentComplexity {
  const noFm = markdown.replace(/^---[\s\S]*?---\s*/m, '');
  const noCode = noFm.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');

  // Length factor (0-1)
  const length = Math.min(noCode.length / 10000, 1);

  // Structure factor - based on heading hierarchy and organization
  const headings = (noCode.match(/^#{1,6}\s+.+$/gm) ?? []).length;
  const structure = Math.min(headings / 20, 1);

  // Technical factor - code blocks, technical terms, special syntax
  const codeBlocks = (noFm.match(/```[\s\S]*?```/g) ?? []).length;
  const inlineCode = (noFm.match(/`[^`]+`/g) ?? []).length;
  const technicalTerms = (
    noCode.match(
      /\b(api|function|class|method|variable|database|server|client|framework|library|algorithm|protocol|interface|endpoint|request|response|json|xml|html|css|javascript|typescript|python|java|c\+\+|react|vue|angular|node|express|mongodb|mysql|postgresql|redis|docker|kubernetes|aws|azure|gcp|git|github|gitlab|ci\/cd|devops|microservices|rest|graphql|oauth|jwt|ssl|tls|http|https|tcp|udp|dns|cdn|load\s+balancer|cache|queue|message\s+broker|event\s+streaming|real\s+time|websocket|sse|pwa|spa|ssr|csr|jamstack|headless|cms|cms|headless|jamstack)\b/gi
    ) ?? []
  ).length;
  const technical = Math.min(
    codeBlocks * 0.3 + inlineCode * 0.1 + technicalTerms * 0.05,
    1
  );

  // Links factor
  const links = (noCode.match(/\[[^\]]*\]\([^)]+\)/g) ?? []).length;
  const linkFactor = Math.min(links / 50, 1);

  // Images factor
  const images = (noCode.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length;
  const imageFactor = Math.min(images / 20, 1);

  // Calculate overall complexity score (0-1)
  const score =
    length * 0.3 +
    structure * 0.2 +
    technical * 0.3 +
    linkFactor * 0.1 +
    imageFactor * 0.1;

  return {
    score,
    factors: {
      length,
      structure,
      technical,
      codeBlocks,
      links,
      images,
    },
  };
}

function selectOptimalModel(
  complexity: ContentComplexity,
  requestedModel?: string,
  envModel?: string
): { id: string; type: ModelType } {
  // If a specific model is requested, use it
  if (requestedModel) {
    const modelType = Object.entries(AI_MODELS).find(
      ([_, id]) => id === requestedModel
    )?.[0] as ModelType;
    if (modelType) {
      return { id: requestedModel, type: modelType };
    }
  }

  // If env model is set, use it
  if (envModel) {
    const modelType = Object.entries(AI_MODELS).find(
      ([_, id]) => id === envModel
    )?.[0] as ModelType;
    if (modelType) {
      return { id: envModel, type: modelType };
    }
  }

  // Speed-optimized selection - prefer faster models
  if (complexity.score >= 0.8) {
    return { id: AI_MODELS.ADVANCED, type: 'ADVANCED' };
  } else if (complexity.score >= 0.5) {
    return { id: AI_MODELS.BALANCED, type: 'BALANCED' };
  } else {
    return { id: AI_MODELS.FAST, type: 'FAST' };
  }
}

function getSystemPrompt(modelType: ModelType): string {
  // Much more aggressive and diverse system prompt variations
  const variations = [
    {
      persona:
        'You are a viral content creator who makes everything sound exciting and shareable.',
      style:
        'Use clickbait techniques, power words, and emotional hooks. Make titles irresistible.',
    },
    {
      persona:
        'You are a senior technical architect who speaks to other experts.',
      style:
        'Use precise technical language, industry jargon, and sophisticated terminology.',
    },
    {
      persona:
        'You are a beginner-friendly educator who makes complex topics accessible.',
      style:
        'Use simple language, analogies, and step-by-step explanations. Avoid jargon.',
    },
    {
      persona:
        'You are a controversial tech blogger who challenges conventional wisdom.',
      style: 'Take strong stances, use provocative language, and spark debate.',
    },
    {
      persona:
        'You are a data-driven analyst who focuses on metrics and results.',
      style:
        'Use numbers, statistics, specific outcomes, and measurable benefits.',
    },
    {
      persona:
        'You are a storytelling marketer who creates narrative-driven content.',
      style:
        'Use storytelling techniques, personal experiences, and emotional connections.',
    },
    {
      persona:
        'You are a futuristic tech visionary who focuses on innovation and trends.',
      style:
        'Use cutting-edge language, future-focused terminology, and trend buzzwords.',
    },
    {
      persona:
        'You are a problem-solving consultant who addresses pain points.',
      style:
        'Focus on problems, solutions, pain points, and practical applications.',
    },
    {
      persona: 'You are a minimalist writer who values clarity and simplicity.',
      style:
        'Use clean, concise language. Avoid fluff and focus on essential information.',
    },
    {
      persona:
        'You are a luxury brand marketer who creates premium positioning.',
      style:
        'Use sophisticated language, premium positioning, and exclusivity appeals.',
    },
  ];

  const randomVariation =
    variations[Math.floor(Math.random() * variations.length)];

  const basePrompt = `${randomVariation.persona}
${randomVariation.style}

Return ONLY a minified JSON object with this exact shape:
{"title": string, "description": string, "tags": string[]}
Rules:
- Title: compelling, <= 80 chars, no quotes or trailing punctuation.
- Description: concise summary, <= 220 chars, no newlines.
- Tags: 3-7 lowercase keywords (kebab-case), no duplicates, no special characters besides dashes.
- CRITICAL: Generate completely different content each time - never repeat patterns.
- Vary your approach dramatically - use different tones, angles, and perspectives.
- Make each generation feel like it's from a different writer entirely.`;

  switch (modelType) {
    case 'FAST':
      return (
        basePrompt +
        `
- Generate quickly but with maximum creativity and variation.
- Use bold, attention-grabbing language.
- Make each response dramatically different from the last.`
      );

    case 'BALANCED':
      return (
        basePrompt +
        `
- Balance quality with aggressive creativity.
- Experiment with different writing styles and approaches.
- Ensure each generation feels fresh and unique.`
      );

    case 'ADVANCED':
      return (
        basePrompt +
        `
- Use the highest level of creativity and variation.
- Experiment with unconventional approaches and perspectives.
- Make each response feel like a completely different author wrote it.
- Push creative boundaries while maintaining quality.`
      );

    default:
      return basePrompt;
  }
}

function getMaxTokens(modelType: ModelType): number {
  switch (modelType) {
    case 'FAST':
      return 150; // Reduced for speed
    case 'BALANCED':
      return 250; // Reduced for speed
    case 'ADVANCED':
      return 350; // Reduced for speed
    default:
      return 250;
  }
}

function getTemperature(modelType: ModelType): number {
  // Much more aggressive temperature ranges for maximum variation
  const baseTemps = {
    FAST: 0.8,
    BALANCED: 0.9,
    ADVANCED: 1.0,
  };

  // Add significant random variation (±0.3)
  const variation = (Math.random() - 0.5) * 0.6;
  return Math.max(0.3, Math.min(1.0, baseTemps[modelType] + variation));
}

function generateVariedUserPrompt(markdown: string): string {
  // Much more aggressive variation strategies
  const approaches = [
    {
      style: 'question-based',
      prompts: [
        `What's the most intriguing question this content answers? Create frontmatter that poses this question:\n\n${markdown}`,
        `What problem does this content solve? Generate frontmatter that highlights the solution:\n\n${markdown}`,
        `What's the most surprising insight here? Create frontmatter that teases this revelation:\n\n${markdown}`,
        `What would make someone stop scrolling to read this? Generate compelling frontmatter:\n\n${markdown}`,
      ],
    },
    {
      style: 'benefit-focused',
      prompts: [
        `Generate frontmatter that emphasizes the practical benefits and outcomes:\n\n${markdown}`,
        `Create frontmatter that highlights the time/money this content saves:\n\n${markdown}`,
        `Generate frontmatter that focuses on the competitive advantage gained:\n\n${markdown}`,
        `Create frontmatter that emphasizes the skill/knowledge gained:\n\n${markdown}`,
      ],
    },
    {
      style: 'technical-depth',
      prompts: [
        `Generate frontmatter for developers who want deep technical details:\n\n${markdown}`,
        `Create frontmatter that emphasizes the complexity and sophistication:\n\n${markdown}`,
        `Generate frontmatter that highlights the technical innovation:\n\n${markdown}`,
        `Create frontmatter that appeals to technical architects and senior developers:\n\n${markdown}`,
      ],
    },
    {
      style: 'beginner-friendly',
      prompts: [
        `Generate frontmatter that makes complex topics accessible to beginners:\n\n${markdown}`,
        `Create frontmatter that emphasizes step-by-step learning:\n\n${markdown}`,
        `Generate frontmatter that highlights the educational value:\n\n${markdown}`,
        `Create frontmatter that appeals to newcomers and students:\n\n${markdown}`,
      ],
    },
    {
      style: 'trendy/modern',
      prompts: [
        `Generate frontmatter using current tech buzzwords and trends:\n\n${markdown}`,
        `Create frontmatter that sounds cutting-edge and innovative:\n\n${markdown}`,
        `Generate frontmatter that emphasizes the "next-generation" aspects:\n\n${markdown}`,
        `Create frontmatter that appeals to early adopters and tech enthusiasts:\n\n${markdown}`,
      ],
    },
    {
      style: 'problem-focused',
      prompts: [
        `Generate frontmatter that starts with "Struggling with..." or "Tired of...":\n\n${markdown}`,
        `Create frontmatter that highlights the pain points this solves:\n\n${markdown}`,
        `Generate frontmatter that emphasizes the frustration this eliminates:\n\n${markdown}`,
        `Create frontmatter that speaks to common industry frustrations:\n\n${markdown}`,
      ],
    },
    {
      style: 'results-focused',
      prompts: [
        `Generate frontmatter that promises specific, measurable results:\n\n${markdown}`,
        `Create frontmatter that highlights success stories and case studies:\n\n${markdown}`,
        `Generate frontmatter that emphasizes proven outcomes:\n\n${markdown}`,
        `Create frontmatter that appeals to results-driven professionals:\n\n${markdown}`,
      ],
    },
    {
      style: 'controversial/opinion',
      prompts: [
        `Generate frontmatter that takes a strong, opinionated stance:\n\n${markdown}`,
        `Create frontmatter that challenges conventional wisdom:\n\n${markdown}`,
        `Generate frontmatter that sparks debate and discussion:\n\n${markdown}`,
        `Create frontmatter that presents an unconventional viewpoint:\n\n${markdown}`,
      ],
    },
  ];

  const randomApproach =
    approaches[Math.floor(Math.random() * approaches.length)];
  const randomPrompt =
    randomApproach.prompts[
      Math.floor(Math.random() * randomApproach.prompts.length)
    ];

  // Add even more aggressive variation instructions
  const variationInstructions = [
    ' Use a completely different tone and voice than typical tech content.',
    ' Make the title sound like a news headline or magazine article.',
    " Write as if you're explaining to a friend over coffee.",
    ' Use power words and emotional triggers in the title.',
    ' Make it sound urgent and time-sensitive.',
    ' Use numbers, statistics, or specific metrics in the title.',
    ' Make the description sound like a movie trailer.',
    ' Use industry jargon and insider language.',
    ' Make it sound like a personal story or experience.',
    ' Use action verbs and dynamic language.',
    ' Make it sound like breaking news or a major discovery.',
    ' Use contrasting or paradoxical language.',
    ' Make it sound like a tutorial or how-to guide.',
    ' Use superlatives and extreme language (best, worst, ultimate, etc.).',
    ' Make it sound like a review or comparison.',
    ' Use future-focused language (will, going to, next year, etc.).',
  ];

  const randomInstruction =
    variationInstructions[
      Math.floor(Math.random() * variationInstructions.length)
    ];

  return randomPrompt + randomInstruction;
}

function isSignificantlyDifferent(
  newResult: Record<string, unknown>,
  previousResult: Record<string, unknown>
): boolean {
  const newTitle = (
    typeof newResult.title === 'string' ? newResult.title : ''
  ).toLowerCase();
  const prevTitle = (
    typeof previousResult.title === 'string' ? previousResult.title : ''
  ).toLowerCase();
  const newDesc = (
    typeof newResult.description === 'string' ? newResult.description : ''
  ).toLowerCase();
  const prevDesc = (
    typeof previousResult.description === 'string'
      ? previousResult.description
      : ''
  ).toLowerCase();

  // Check if titles are significantly different (less than 60% similarity)
  const titleSimilarity = calculateSimilarity(newTitle, prevTitle);
  const descSimilarity = calculateSimilarity(newDesc, prevDesc);

  // Consider it significantly different if either title or description is quite different
  return titleSimilarity < 0.6 || descSimilarity < 0.6;
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  // Simple word-based similarity calculation
  const words1 = str1.split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.split(/\s+/).filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return 0.0;

  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

// Simple content hash for caching similar content
function generateContentHash(markdown: string): string {
  // Create a simple hash based on content structure and key terms
  const noFm = markdown.replace(/^---[\s\S]*?---\s*/m, '');
  const noCode = noFm.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');

  // Extract key structural elements
  const headings = (noCode.match(/^#{1,6}\s+(.+)$/gm) ?? []).map(h =>
    h.toLowerCase().trim()
  );
  const firstParagraph = noCode.split('\n\n')[0]?.slice(0, 200) ?? '';
  const wordCount = noCode.split(/\s+/).length;

  // Create a simple hash key
  const hashInput = `${headings.join('|')}|${firstParagraph}|${wordCount}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
