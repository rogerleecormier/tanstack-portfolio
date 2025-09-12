import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeReact from 'rehype-react';
import rehypeStringify from 'rehype-stringify';
import { ReactElement, createElement } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import fm from 'front-matter';
import { fencedPlugin } from './fencedPlugins';
import { sanitizeSchema } from './sanitizeSchema';

export function renderMarkdownToReact(markdown: string): ReactElement {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(fencedPlugin)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeReact, {
      jsx,
      jsxs,
      Fragment,
      components: {},
    });

  const result = processor.processSync(markdown);
  return result.result as ReactElement;
}

// Preview renderer: use the full unified pipeline so
// GFM, raw HTML, and sanitization behave like final render.
// Heuristic: if input looks like raw HTML, render it directly for preview.

export function renderMarkdownForPreview(markdown: string): ReactElement {
  try {
    // Always parse as Markdown with embedded HTML allowed. This prevents
    // false-positives where Markdown that contains some HTML (e.g. <div>)
    // would otherwise be rendered as plain HTML, breaking Markdown syntax.
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(fencedPlugin)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeReact, {
        jsx,
        jsxs,
        Fragment,
        components: {},
      });

    const result = processor.processSync(markdown);
    return result.result as ReactElement;
  } catch (e) {
    // Fallback to raw HTML/text if anything goes wrong
    return createElement('pre', {}, String(e));
  }
}
export function extractFrontMatter(markdown: string): {
  attributes: Record<string, unknown>;
  body: string;
} {
  return fm(markdown);
}

function serializeYamlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    // For strings, check if they need quotes
    if (
      value.includes('\n') ||
      value.includes(':') ||
      value.startsWith(' ') ||
      value.endsWith(' ')
    ) {
      return JSON.stringify(value); // Use JSON for multiline or special chars
    }
    return value; // No quotes needed for simple strings
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => serializeYamlValue(item)).join(', ')}]`;
  }

  if (value instanceof Date) {
    // Convert Date objects to ISO date strings (YYYY-MM-DD format)
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'object') {
    // For objects, use JSON stringify as fallback
    return JSON.stringify(value);
  }

  return String(value);
}

export function assemble(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  const yaml =
    Object.keys(frontmatter).length > 0
      ? `---\n${Object.entries(frontmatter)
          .map(([key, value]) => `${key}: ${serializeYamlValue(value)}`)
          .join('\n')}\n---\n`
      : '';
  return yaml + body;
}

// Convert Markdown -> sanitized HTML string (for WYSIWYG hydration)
export function markdownToHtml(markdown: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(fencedPlugin)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify);

  const file = processor.processSync(markdown);
  return String(file);
}
