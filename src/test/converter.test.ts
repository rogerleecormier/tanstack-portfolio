import { describe, it, expect } from 'vitest';
import { htmlToMd } from '../compile/htmlToMd';
import { mdToHtml } from '../compile/mdToHtml';

describe('HTML to Markdown Converter', () => {
  it('should convert basic HTML to Markdown', () => {
    const html = '<h1>Hello World</h1><p>This is a <strong>test</strong>.</p>';
    const markdown = htmlToMd(html);

    expect(markdown).toContain('# Hello World');
    expect(markdown).toContain('**test**');
  });

  it('should convert placeholders back to fenced blocks', () => {
    const html =
      '<div class="shadcn-block-placeholder" data-block-type="card" data-json="{&quot;title&quot;: &quot;Test&quot;}">[CARD BLOCK]</div>';
    const markdown = htmlToMd(html);

    expect(markdown).toContain('```card');
    expect(markdown).toContain('{"title": "Test"}');
    expect(markdown).toContain('```');
  });
});

describe('Round-trip Conversion', () => {
  it('should preserve fenced blocks through MD → HTML → MD conversion', () => {
    const originalMarkdown =
      '```card\n{"title": "Test Card", "content": "Hello"}\n```';

    // Convert to HTML
    const html = mdToHtml(originalMarkdown);
    expect(html).toContain('data-block-type="card"');

    // Convert back to Markdown
    const roundTripMarkdown = htmlToMd(html);

    // Should preserve the fenced block structure
    expect(roundTripMarkdown).toContain('```card');
    expect(roundTripMarkdown).toContain(
      '{"title": "Test Card", "content": "Hello"}'
    );
    expect(roundTripMarkdown).toContain('```');
  });

  it('should handle multiple fenced blocks', () => {
    const originalMarkdown = `# Test

\`\`\`card
{"title": "Card 1"}
\`\`\`

Some text.

\`\`\`barchart
{"data": [1, 2, 3]}
\`\`\``;

    const html = mdToHtml(originalMarkdown);
    const roundTripMarkdown = htmlToMd(html);

    expect(roundTripMarkdown).toContain('```card');
    expect(roundTripMarkdown).toContain('```barchart');
    expect(roundTripMarkdown).toContain('{"title": "Card 1"}');
    expect(roundTripMarkdown).toContain('{"data": [1, 2, 3]}');
  });
});
