/**
 * Markdown to HTML Compiler
 * Converts Markdown to sanitized HTML for preview
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { remarkShadcnBlocks } from '../blocks/remark-shadcn-blocks';
import { rehypePlaceholders } from '../blocks/rehype-placeholders';

// Sanitization schema - allow only required tags/attrs
const sanitizeSchema = {
  tagNames: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'hr',
    'strong',
    'em',
    'code',
    'pre',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'div',
    'span',
  ],
  attributes: {
    '*': ['data-block-type', 'data-json', 'contenteditable', 'class'], // Allow specific data attributes for blocks
    div: ['data-block-type', 'data-json', 'contenteditable', 'class'], // Explicitly allow for div elements
    a: ['href', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    th: ['scope'],
    td: ['colspan', 'rowspan'],
  },
};

export function mdToHtml(markdown: string): string {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkShadcnBlocks)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypePlaceholders)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeStringify);

    const result = processor.processSync(markdown);
    return String(result);
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    return `<p>Error converting Markdown to HTML</p>`;
  }
}
