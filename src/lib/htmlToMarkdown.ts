// Lightweight HTML -> Markdown conversion using Turndown with GFM
// We keep the converter here so both editors can share it.
// Types are provided via local ambient declarations in src/types.
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

let td: TurndownService | null = null;

export function htmlToMarkdown(html: string): string {
  if (!td) {
    td = new TurndownService({
      codeBlockStyle: 'fenced',
      headingStyle: 'atx',
      bulletListMarker: '-',
      emDelimiter: '*',
      strongDelimiter: '**',
    });
    // Enable GFM features like tables/strikethrough/task lists
    td.use(gfm);
    // Preserve line breaks inside paragraphs similar to GitHub
    td.addRule('breaks', {
      filter: ['br'],
      replacement() {
        return '  \n';
      },
    });
  }
  return td.turndown(html);
}
