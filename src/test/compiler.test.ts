import { describe, it, expect } from 'vitest';
import { mdToHtml } from '../compile/mdToHtml';

describe('Markdown to HTML Compiler', () => {
  it('should convert basic markdown to HTML', () => {
    const markdown = '# Hello World\n\nThis is a **test**.';
    const html = mdToHtml(markdown);

    expect(html).toContain('<h1>Hello World</h1>');
    expect(html).toContain('<strong>test</strong>');
  });

  it('should handle fenced blocks as placeholders', () => {
    const markdown = '```card\n{"title": "Test Card"}\n```';
    const html = mdToHtml(markdown);

    expect(html).toContain('data-block-type="card"');
    expect(html).toContain('[CARD BLOCK]');
  });

  it('should sanitize dangerous HTML', () => {
    const markdown = '<script>alert("xss")</script>';
    const html = mdToHtml(markdown);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert');
  });
});
