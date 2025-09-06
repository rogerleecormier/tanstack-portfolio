import { describe, it, expect } from 'vitest';
import { DUMMY_MARKDOWN } from '../lib/dummyMarkdown';

describe('Markdown Editor Components', () => {
  describe('Dummy Content', () => {
    it('should have substantial content for testing scrollbars', () => {
      expect(DUMMY_MARKDOWN).toBeDefined();
      expect(DUMMY_MARKDOWN.length).toBeGreaterThan(1000); // Should be long enough to test scrolling

      // Should contain various markdown elements
      expect(DUMMY_MARKDOWN).toContain('# ');
      expect(DUMMY_MARKDOWN).toContain('**');
      expect(DUMMY_MARKDOWN).toContain('- ');
      expect(DUMMY_MARKDOWN).toContain('|');
      expect(DUMMY_MARKDOWN).toContain('```');
    });

    it('should include different types of content blocks', () => {
      expect(DUMMY_MARKDOWN).toContain('## Headings');
      expect(DUMMY_MARKDOWN).toContain('## Text Formatting');
      expect(DUMMY_MARKDOWN).toContain('## Lists');
      expect(DUMMY_MARKDOWN).toContain('## Blockquotes');
      expect(DUMMY_MARKDOWN).toContain('## Code Blocks');
      expect(DUMMY_MARKDOWN).toContain('## Tables');
      expect(DUMMY_MARKDOWN).toContain('## Images');
      expect(DUMMY_MARKDOWN).toContain('## Horizontal Rules');
      expect(DUMMY_MARKDOWN).toContain('## Footnotes');
      expect(DUMMY_MARKDOWN).toContain('## Definition Lists');
      expect(DUMMY_MARKDOWN).toContain('## Abbreviations');
      expect(DUMMY_MARKDOWN).toContain('## Mathematical Expressions');
      expect(DUMMY_MARKDOWN).toContain('## HTML in Markdown');
      expect(DUMMY_MARKDOWN).toContain('## Escaping Characters');
    });
  });
});
