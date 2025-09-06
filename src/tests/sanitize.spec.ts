import { describe, it, expect } from 'vitest';
import { renderMarkdownToReact } from '../lib/markdown';

describe('Markdown Sanitization', () => {
  it('should strip script tags and event handlers', () => {
    const maliciousMarkdown = `
# Safe Title

<img src="safe.jpg" alt="Safe image">

<img src="x" onerror="alert(1)">

<script>alert('XSS')</script>

<button onclick="alert('XSS')">Click me</button>
`;

    const result = renderMarkdownToReact(maliciousMarkdown);

    // Convert React element to string for inspection
    const elementString = JSON.stringify(result);

    // Should not contain script tags or event handlers
    expect(elementString).not.toContain('<script>');
    expect(elementString).not.toContain('onerror');
    expect(elementString).not.toContain('onclick');
    expect(elementString).not.toContain('alert(');
  });

  it('should neutralize javascript: URLs', () => {
    const maliciousMarkdown = `
[Click me](javascript:alert('XSS'))

<img src="javascript:alert('XSS')" alt="Bad image">
`;

    const result = renderMarkdownToReact(maliciousMarkdown);
    const elementString = JSON.stringify(result);

    // Should not contain javascript: URLs
    expect(elementString).not.toContain('javascript:');
  });

  it('should allow safe content', () => {
    const safeMarkdown = `
# Safe Title

This is a **bold** text with *italic* formatting.

- List item 1
- List item 2

\`\`\`
code block
\`\`\`

| Table | Header |
|-------|--------|
| Cell  | Data   |
`;

    const result = renderMarkdownToReact(safeMarkdown);
    const elementString = JSON.stringify(result);

    // Should contain expected safe elements
    expect(elementString).toContain('Safe Title');
    expect(elementString).toContain('bold');
    expect(elementString).toContain('italic');
    expect(elementString).toContain('code block');
  });

  it('should sanitize iframe tags', () => {
    const maliciousMarkdown = `
<iframe src="https://evil.com"></iframe>
`;

    const result = renderMarkdownToReact(maliciousMarkdown);
    const elementString = JSON.stringify(result);

    // Should not contain iframe
    expect(elementString).not.toContain('<iframe');
    expect(elementString).not.toContain('iframe');
  });
});
