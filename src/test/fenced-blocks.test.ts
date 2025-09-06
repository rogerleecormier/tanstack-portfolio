import { describe, it, expect } from 'vitest';
import { mdToHtml } from '../compile/mdToHtml';
import { htmlToMd } from '../compile/htmlToMd';

describe('Fenced Block Detection & Placeholders', () => {
  describe('Block Type Detection', () => {
    it('should detect all supported block types', () => {
      const blockTypes = [
        'card',
        'barchart',
        'linechart',
        'scatterplot',
        'tablejson',
        'histogram',
        'piechart',
        'donutchart',
        'areachart',
        'radarchart',
        'gauge',
        'progress',
        'alert',
        'badge',
        'button',
        'input',
        'textarea',
        'select',
        'checkbox',
        'radio',
        'switch',
        'slider',
        'tabs',
        'accordion',
        'carousel',
        'modal',
        'tooltip',
        'popover',
        'dropdown',
        'menu',
        'breadcrumb',
        'pagination',
        'stepper',
        'timeline',
        'avatar',
        'skeleton',
        'spinner',
        'divider',
        'separator',
      ];

      blockTypes.forEach((blockType) => {
        const markdown = `\`\`\`${blockType}\n{"test": "data"}\n\`\`\``;
        const html = mdToHtml(markdown);

        expect(html).toContain('data-block-type');
        expect(html).toContain(`data-block-type="${blockType}"`);
        expect(html).toContain('shadcn-block-placeholder');
        expect(html).toContain(`[${blockType.toUpperCase()} BLOCK]`);
      });
    });

    it('should handle invalid block types gracefully', () => {
      const markdown = '```invalidtype\n{"test": "data"}\n```';
      const html = mdToHtml(markdown);

      // Should not create a placeholder for invalid block types
      expect(html).not.toContain('shadcn-block-placeholder');
      expect(html).not.toContain('data-block-type');
    });

    it('should handle malformed JSON gracefully', () => {
      const markdown = '```card\n{invalid json}\n```';
      const html = mdToHtml(markdown);

      // Should still create a placeholder even with malformed JSON
      expect(html).toContain('shadcn-block-placeholder');
      expect(html).toContain('data-block-type="card"');
      expect(html).toContain('[CARD BLOCK]');
    });
  });

  describe('Placeholder Protection', () => {
    it('should create non-editable placeholders', () => {
      const markdown = '```card\n{"title": "Test Card"}\n```';
      const html = mdToHtml(markdown);

      // The contenteditable attribute is handled by TinyMCE, not in the HTML output
      expect(html).toContain('shadcn-block-placeholder');
      expect(html).toContain('data-block-type="card"');
      expect(html).toContain('[CARD BLOCK]');
    });

    it('should preserve JSON data in placeholders', () => {
      const jsonData = '{"title": "Test Card", "content": "Hello World"}';
      const markdown = `\`\`\`card\n${jsonData}\n\`\`\``;
      const html = mdToHtml(markdown);

      expect(html).toContain('data-json=');
      expect(html).toContain('&#x26;quot;title&#x26;quot;');
      expect(html).toContain('&#x26;quot;content&#x26;quot;');
    });

    it('should handle complex JSON structures', () => {
      const complexJson = `{
        "title": "Complex Card",
        "data": {
          "nested": {
            "value": 123,
            "array": [1, 2, 3]
          }
        },
        "actions": [
          {"label": "Action 1", "url": "#"},
          {"label": "Action 2", "url": "#"}
        ]
      }`;

      const markdown = `\`\`\`card\n${complexJson}\n\`\`\``;
      const html = mdToHtml(markdown);

      expect(html).toContain('data-json=');
      expect(html).toContain('&#x26;quot;title&#x26;quot;');
      expect(html).toContain('&#x26;quot;nested&#x26;quot;');
      expect(html).toContain('&#x26;quot;array&#x26;quot;');
    });
  });

  describe('Round-trip Preservation', () => {
    it('should preserve blocks through MD → HTML → MD conversion', () => {
      const originalMarkdown = '```card\n{"title": "Test Card"}\n```';

      const html = mdToHtml(originalMarkdown);
      expect(html).toContain('shadcn-block-placeholder');

      const roundTripMarkdown = htmlToMd(html);
      expect(roundTripMarkdown).toContain('```card');
      expect(roundTripMarkdown).toContain('{"title": "Test Card"}');
      expect(roundTripMarkdown).toContain('```');
    });

    it('should handle multiple blocks in one document', () => {
      const originalMarkdown = `# Test Document

\`\`\`card
{"title": "Card 1"}
\`\`\`

Some text here.

\`\`\`barchart
{"data": [1, 2, 3, 4, 5]}
\`\`\`

More content.

\`\`\`alert
{"message": "Important notice"}
\`\`\``;

      const html = mdToHtml(originalMarkdown);
      expect(html).toContain('data-block-type="card"');
      expect(html).toContain('data-block-type="barchart"');
      expect(html).toContain('data-block-type="alert"');

      const roundTripMarkdown = htmlToMd(html);
      expect(roundTripMarkdown).toContain('```card');
      expect(roundTripMarkdown).toContain('```barchart');
      expect(roundTripMarkdown).toContain('```alert');
    });

    it('should preserve blocks with mixed content', () => {
      const originalMarkdown = `# Mixed Content Test

This is regular text.

\`\`\`card
{"title": "Test Card"}
\`\`\`

- List item 1
- List item 2

\`\`\`progress
{"value": 75, "max": 100}
\`\`\`

> This is a blockquote.

\`\`\`button
{"label": "Click Me", "variant": "primary"}
\`\`\``;

      const html = mdToHtml(originalMarkdown);
      const roundTripMarkdown = htmlToMd(html);

      // Should preserve all block types
      expect(roundTripMarkdown).toContain('```card');
      expect(roundTripMarkdown).toContain('```progress');
      expect(roundTripMarkdown).toContain('```button');

      // Should preserve JSON content
      expect(roundTripMarkdown).toContain('{"title": "Test Card"}');
      expect(roundTripMarkdown).toContain('{"value": 75, "max": 100}');
      expect(roundTripMarkdown).toContain(
        '{"label": "Click Me", "variant": "primary"}'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty blocks', () => {
      const markdown = '```card\n\n```';
      const html = mdToHtml(markdown);

      expect(html).toContain('shadcn-block-placeholder');
      expect(html).toContain('data-block-type="card"');
    });

    it('should handle blocks with only whitespace', () => {
      const markdown = '```card\n   \n```';
      const html = mdToHtml(markdown);

      expect(html).toContain('shadcn-block-placeholder');
      expect(html).toContain('data-block-type="card"');
    });

    it('should handle blocks with special characters in JSON', () => {
      const jsonWithSpecialChars =
        '{"title": "Test & More", "content": "Line 1\\nLine 2"}';
      const markdown = `\`\`\`card\n${jsonWithSpecialChars}\n\`\`\``;
      const html = mdToHtml(markdown);

      expect(html).toContain('data-json=');
      expect(html).toContain('&#x26;'); // & should be escaped
      expect(html).toContain('\\n'); // newlines should be escaped
    });

    it('should handle very long JSON content', () => {
      const longJson = JSON.stringify({
        title: 'Very Long Card',
        content: 'A'.repeat(1000),
        data: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          value: `Item ${i}`,
        })),
      });

      const markdown = `\`\`\`card\n${longJson}\n\`\`\``;
      const html = mdToHtml(markdown);

      expect(html).toContain('shadcn-block-placeholder');
      expect(html).toContain('data-block-type="card"');
      expect(html).toContain('data-json=');
    });
  });
});
