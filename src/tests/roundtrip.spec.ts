import { describe, it, expect } from 'vitest';
import { extractFrontMatter, assemble } from '../lib/markdown';

describe('Markdown Roundtrip', () => {
  it('should preserve front-matter through extract/assemble cycle', () => {
    const originalMarkdown = `---
title: Test Title
description: Test Description
tags:
  - test
  - example
draft: false
---

# Main Content

This is the body content.

card {"title": "Test Card", "body": "Card content"}

chart {"type": "bar", "data": [{"x": 1, "y": 10}], "xKey": "x", "yKeys": ["y"]}

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;

    const { attributes, body } = extractFrontMatter(originalMarkdown);
    const assembled = assemble(attributes, body);

    // Should be identical after roundtrip
    expect(assembled.trim()).toBe(originalMarkdown.trim());
  });

  it('should handle fenced blocks correctly', () => {
    const markdownWithFences = `# Test Document

card {"title": "Info Card", "body": "This is a test card", "variant": "info"}

chart {"type": "line", "data": [{"month": "Jan", "value": 100}], "xKey": "month", "yKeys": ["value"]}

Regular paragraph text.

| Col 1 | Col 2 |
|-------|-------|
| Data  | More  |
`;

    const { attributes, body } = extractFrontMatter(markdownWithFences);
    const assembled = assemble(attributes, body);

    // Fenced blocks should be preserved
    expect(assembled).toContain('card {"title": "Info Card"');
    expect(assembled).toContain('chart {"type": "line"');

    // Regular markdown should be preserved
    expect(assembled).toContain('# Test Document');
    expect(assembled).toContain('Regular paragraph text');
    expect(assembled).toContain('| Col 1 | Col 2 |');
  });

  it('should handle empty front-matter', () => {
    const markdownWithoutFrontmatter = `# Just Content

This is a regular markdown file without front-matter.
`;

    const { attributes, body } = extractFrontMatter(markdownWithoutFrontmatter);
    const assembled = assemble(attributes, body);

    // Should be identical
    expect(assembled.trim()).toBe(markdownWithoutFrontmatter.trim());
  });

  it('should preserve GFM tables', () => {
    const markdownWithTable = `---
title: Table Test
---

# Tables

| Feature | Status |
|---------|--------|
| Tables  | ✅     |
| GFM     | ✅     |

More content after table.
`;

    const { attributes, body } = extractFrontMatter(markdownWithTable);
    const assembled = assemble(attributes, body);

    expect(assembled).toContain('| Feature | Status |');
    expect(assembled).toContain('| Tables  | ✅     |');
    expect(assembled).toContain('More content after table.');
  });
});
