// Lightweight, dependency-free frontmatter generation heuristics
// - Extracts dynamic title from H1 or composes from keywords
// - Summarizes content using frequency scoring of sentences
// - Generates tags from top keywords (filters stopwords, short tokens, numbers)

const STOPWORDS = new Set<string>([
  'the','and','for','are','but','not','you','your','with','that','this','from','have','has','was','were','they','their','our','out','about','into','over','under','then','than','them','these','those','just','like','can','cant','cannot','will','wont','should','would','could','may','might','must','been','being','also','there','here','what','when','where','why','how','who','whom','which','as','on','in','of','to','by','at','it','its','we','i','a','an','or','if','is','be','do','did','does','done','up','down','across','within','between','because','so','such','only','more','most','less','least','very','every','each','per','via'
]);

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\s*/m, '');
}

function stripCode(md: string): string {
  return md
    // fenced code
    .replace(/```[\s\S]*?```/g, '')
    // inline code
    .replace(/`[^`]+`/g, '');
}

function stripMdFormatting(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '') // images
    .replace(/\[[^\]]*\]\([^\)]+\)/g, '$1') // links -> text
    .replace(/[*_~>#-]/g, ' ') // markdown punctuation
    .replace(/<[^>]+>/g, ' '); // html tags
}

function extractH1(md: string): string | undefined {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : undefined;
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t && !STOPWORDS.has(t) && /[a-z]/.test(t) && t.length >= 3);
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function topN<T>(entries: Array<[T, number]>, n: number): T[] {
  return entries.sort((a,b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

export function generateSmartFrontmatter(markdown: string): Record<string, unknown> {
  const today = new Date().toISOString().split('T')[0];
  const noFm = stripFrontmatter(markdown || '');
  const noCode = stripCode(noFm);
  const h1 = extractH1(noCode);
  const plain = stripMdFormatting(noCode);
  const sentences = sentenceSplit(plain);

  // Build term frequency across content
  const tf = new Map<string, number>();
  for (const token of tokenize(plain)) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Score sentences by sum of token frequencies
  const scored: Array<{ s: string; score: number }> = sentences.map(s => ({
    s,
    score: tokenize(s).reduce((acc, t) => acc + (tf.get(t) || 0), 0)
  }));

  // Summary: pick top sentences until ~220 chars
  const summaryParts: string[] = [];
  let remaining = 220;
  for (const { s } of scored.sort((a,b) => b.score - a.score)) {
    const chunk = s.trim();
    if (!chunk) continue;
    if (summaryParts.length && (chunk.length + 2) > remaining) continue;
    summaryParts.push(chunk);
    remaining -= chunk.length + 2;
    if (remaining <= 0 || summaryParts.length >= 3) break;
  }
  const description = truncate(summaryParts.join(' '), 220) || undefined;

  // Tags: top keywords by frequency
  const keywords = topN(Array.from(tf.entries()), 6);
  const tags = keywords.map(k => k.replace(/[^a-z0-9\-]/g, '-')).filter(Boolean);

  // Title: prefer H1 if present & reasonable; else compose from top keywords or first strong sentence
  let title = h1 && h1.length >= 6 ? h1 : undefined;
  if (!title) {
    if (keywords.length >= 2) {
      title = titleCase(keywords.slice(0, 3).join(' '));
    } else if (sentences.length) {
      title = titleCase(truncate(sentences[0], 80));
    } else {
      title = 'Untitled';
    }
  }

  return {
    title,
    description,
    tags: tags.length ? tags : undefined,
    date: today,
    draft: true,
  };
}

