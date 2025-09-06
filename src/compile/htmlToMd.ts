/**
 * HTML to Markdown Converter
 * Converts HTML back to Markdown for mode switching
 */

import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { rehypeToRemark } from '../blocks/rehype-to-remark';

export function htmlToMd(html: string): string {
  try {
    const processor = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeToRemark) // Convert placeholders to fenced blocks first
      .use(rehypeRemark) // Then convert HTML to Markdown AST
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(remarkGfm) // Add GFM support for tables and other features
      .use(remarkStringify, { fences: true });

    const result = processor.processSync(html);
    return String(result);
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return 'Error converting HTML to Markdown';
  }
}
