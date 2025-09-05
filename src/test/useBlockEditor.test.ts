import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBlockEditor } from '../hooks/useBlockEditor';

describe('useBlockEditor', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useBlockEditor());

    expect(result.current.editorState.isOpen).toBe(false);
    expect(result.current.editorState.blockType).toBe('');
    expect(result.current.editorState.blockData).toEqual({});
    expect(result.current.editorState.blockIndex).toBe(-1);
  });

  it('should open block editor with correct state', () => {
    const { result } = renderHook(() => useBlockEditor());

    const blockType = 'card';
    const blockData = { title: 'Test Card', content: 'Test content' };
    const blockIndex = 0;
    const markdownContent = '```card\n{"title": "Test Card"}\n```';

    act(() => {
      result.current.openBlockEditor(
        blockType,
        blockData,
        blockIndex,
        markdownContent
      );
    });

    expect(result.current.editorState.isOpen).toBe(true);
    expect(result.current.editorState.blockType).toBe(blockType);
    expect(result.current.editorState.blockData).toEqual(blockData);
    expect(result.current.editorState.blockIndex).toBe(blockIndex);
    expect(result.current.editorState.markdownContent).toBe(markdownContent);
  });

  it('should close block editor', () => {
    const { result } = renderHook(() => useBlockEditor());

    // First open the editor
    act(() => {
      result.current.openBlockEditor(
        'card',
        { title: 'Test' },
        0,
        '```card\n{"title": "Test"}\n```'
      );
    });

    expect(result.current.editorState.isOpen).toBe(true);

    // Then close it
    act(() => {
      result.current.closeBlockEditor();
    });

    expect(result.current.editorState.isOpen).toBe(false);
  });

  it('should update block in markdown content', () => {
    const { result } = renderHook(() => useBlockEditor());

    const markdownContent = `# Test Document

\`\`\`card
{"title": "Original Title"}
\`\`\`

Some text.`;

    const newBlockData = { title: 'Updated Title', content: 'Updated content' };

    act(() => {
      result.current.openBlockEditor(
        'card',
        { title: 'Original Title' },
        0,
        markdownContent
      );
    });

    const onMarkdownChange = vi.fn();

    act(() => {
      result.current.saveBlock('card', newBlockData, onMarkdownChange);
    });

    expect(onMarkdownChange).toHaveBeenCalledWith(
      expect.stringContaining('"title": "Updated Title"')
    );
    expect(onMarkdownChange).toHaveBeenCalledWith(
      expect.stringContaining('"content": "Updated content"')
    );
    expect(result.current.editorState.isOpen).toBe(false);
  });

  it('should handle multiple blocks in markdown', () => {
    const { result } = renderHook(() => useBlockEditor());

    const markdownContent = `# Test Document

\`\`\`card
{"title": "First Card"}
\`\`\`

Some text.

\`\`\`barchart
{"title": "Chart", "data": [{"name": "A", "value": 1}]}
\`\`\`

More text.`;

    const newBlockData = {
      title: 'Updated Chart',
      data: [{ name: 'B', value: 2 }],
    };

    act(() => {
      result.current.openBlockEditor(
        'barchart',
        { title: 'Chart', data: [{ name: 'A', value: 1 }] },
        1,
        markdownContent
      );
    });

    const onMarkdownChange = vi.fn();

    act(() => {
      result.current.saveBlock('barchart', newBlockData, onMarkdownChange);
    });

    const updatedMarkdown = onMarkdownChange.mock.calls[0][0];

    // Should update the second block (barchart) but leave the first block (card) unchanged
    expect(updatedMarkdown).toContain('"title": "First Card"'); // First block unchanged
    expect(updatedMarkdown).toContain('"title": "Updated Chart"'); // Second block updated
    expect(updatedMarkdown).toContain('"name": "B"'); // Second block data updated
  });

  it('should handle block not found gracefully', () => {
    const { result } = renderHook(() => useBlockEditor());

    const markdownContent = '```card\n{"title": "Test"}\n```';
    const onMarkdownChange = vi.fn();

    act(() => {
      result.current.openBlockEditor(
        'card',
        { title: 'Test' },
        0,
        markdownContent
      );
    });

    // Try to save with invalid block index
    act(() => {
      result.current.saveBlock('card', { title: 'Updated' }, onMarkdownChange);
    });

    // Should not call onMarkdownChange if block is not found
    expect(onMarkdownChange).not.toHaveBeenCalled();
  });

  it('should preserve markdown structure when updating blocks', () => {
    const { result } = renderHook(() => useBlockEditor());

    const markdownContent = `# Header

\`\`\`card
{"title": "Test Card"}
\`\`\`

## Subheader

- List item 1
- List item 2

\`\`\`barchart
{"title": "Chart", "data": []}
\`\`\`

> Blockquote

End of document.`;

    const newBlockData = { title: 'Updated Card', content: 'New content' };

    act(() => {
      result.current.openBlockEditor(
        'card',
        { title: 'Test Card' },
        0,
        markdownContent
      );
    });

    const onMarkdownChange = vi.fn();

    act(() => {
      result.current.saveBlock('card', newBlockData, onMarkdownChange);
    });

    const updatedMarkdown = onMarkdownChange.mock.calls[0][0];

    // Should preserve all markdown structure
    expect(updatedMarkdown).toContain('# Header');
    expect(updatedMarkdown).toContain('## Subheader');
    expect(updatedMarkdown).toContain('- List item 1');
    expect(updatedMarkdown).toContain('- List item 2');
    expect(updatedMarkdown).toContain('> Blockquote');
    expect(updatedMarkdown).toContain('End of document.');

    // Should update the specific block
    expect(updatedMarkdown).toContain('"title": "Updated Card"');
    expect(updatedMarkdown).toContain('"content": "New content"');
  });
});
