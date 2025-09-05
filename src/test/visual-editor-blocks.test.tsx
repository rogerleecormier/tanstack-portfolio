import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VisualEditor from '../editor/VisualEditor';

// Mock TinyMCE
vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({
    onInit,
    value,
  }: {
    onInit?: (evt: unknown, editor: unknown) => void;
    value: string;
  }) => {
    // Simulate TinyMCE initialization
    React.useEffect(() => {
      if (onInit) {
        const mockEditor = {
          selection: {
            getNode: () => document.createElement('div'),
            setRng: vi.fn(),
          },
          dom: {
            createRng: () => ({
              setStartAfter: vi.fn(),
              collapse: vi.fn(),
            }),
          },
          on: vi.fn(),
        };
        onInit(null, mockEditor);
      }
    }, [onInit]);

    return (
      <div
        data-testid="tinymce-editor"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  },
}));

describe('Visual Editor Block Protection', () => {
  it('should render with block placeholders', () => {
    const htmlWithBlocks = `
      <p>Some text</p>
      <div class="shadcn-block-placeholder" data-block-type="card" data-json="{&quot;title&quot;: &quot;Test&quot;}" contenteditable="false">[CARD BLOCK]</div>
      <p>More text</p>
    `;

    render(<VisualEditor value={htmlWithBlocks} onChange={vi.fn()} />);

    expect(screen.getByTestId('tinymce-editor')).toBeInTheDocument();
    expect(screen.getByText('[CARD BLOCK]')).toBeInTheDocument();
  });

  it('should handle content changes', () => {
    const onChange = vi.fn();
    const initialContent = '<p>Initial content</p>';

    render(<VisualEditor value={initialContent} onChange={onChange} />);

    expect(screen.getByTestId('tinymce-editor')).toBeInTheDocument();
  });

  it('should preserve block placeholders in content', () => {
    const htmlWithBlocks = `
      <div class="shadcn-block-placeholder" data-block-type="card" data-json="{&quot;title&quot;: &quot;Test Card&quot;}" contenteditable="false">[CARD BLOCK]</div>
    `;

    render(<VisualEditor value={htmlWithBlocks} onChange={vi.fn()} />);

    const editor = screen.getByTestId('tinymce-editor');
    expect(editor.innerHTML).toContain('shadcn-block-placeholder');
    expect(editor.innerHTML).toContain('data-block-type="card"');
    expect(editor.innerHTML).toContain('contenteditable="false"');
  });

  it('should handle multiple block types', () => {
    const htmlWithMultipleBlocks = `
      <div class="shadcn-block-placeholder" data-block-type="card" data-json="{&quot;title&quot;: &quot;Card&quot;}" contenteditable="false">[CARD BLOCK]</div>
      <div class="shadcn-block-placeholder" data-block-type="barchart" data-json="{&quot;data&quot;: [1,2,3]}" contenteditable="false">[BARCHART BLOCK]</div>
      <div class="shadcn-block-placeholder" data-block-type="alert" data-json="{&quot;message&quot;: &quot;Alert&quot;}" contenteditable="false">[ALERT BLOCK]</div>
    `;

    render(<VisualEditor value={htmlWithMultipleBlocks} onChange={vi.fn()} />);

    const editor = screen.getByTestId('tinymce-editor');
    expect(editor.innerHTML).toContain('[CARD BLOCK]');
    expect(editor.innerHTML).toContain('[BARCHART BLOCK]');
    expect(editor.innerHTML).toContain('[ALERT BLOCK]');
  });
});
