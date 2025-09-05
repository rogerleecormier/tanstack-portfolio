import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Mock the TinyMCE Editor
vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({
    onInit,
    value,
    onEditorChange,
    ...rest
  }: {
    onInit?: (evt: unknown, editor: unknown) => void;
    value: string;
    onEditorChange: (content: string) => void;
    [key: string]: unknown;
  }) => {
    // Store props for testing
    (globalThis as Record<string, unknown>).__lastTinyProps = rest;

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
            select: vi.fn(() => []),
            setAttrib: vi.fn(),
            getParent: vi.fn(() => null),
          },
          on: vi.fn(),
        };
        onInit({}, mockEditor);
      }
    }, [onInit]);

    return (
      <div data-testid="visual-editor">
        <textarea
          data-testid="editor-content"
          value={value}
          onChange={(e) => onEditorChange(e.target.value)}
          placeholder="Start writing..."
        />
      </div>
    );
  },
}));

import VisualEditor from '../editor/VisualEditor';

describe('Paste Policy & Sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have paste plugin enabled', () => {
    render(<VisualEditor value="" onChange={vi.fn()} />);

    const props = (globalThis as Record<string, unknown>)
      .__lastTinyProps as Record<string, unknown>;
    expect(props.init).toBeDefined();

    const init = props.init as Record<string, unknown>;
    expect(Array.isArray(init.plugins)).toBe(true);
    expect(init.plugins).toContain('paste');
  });

  it('should configure paste settings correctly', () => {
    render(<VisualEditor value="" onChange={vi.fn()} />);

    const props = (globalThis as Record<string, unknown>)
      .__lastTinyProps as Record<string, unknown>;
    const init = props.init as Record<string, unknown>;

    // Check paste configuration
    expect(init.paste_data_images).toBe(false);
    expect(init.paste_auto_cleanup_on_paste).toBe(true);
    expect(init.paste_remove_styles_if_webkit).toBe(true);
    expect(init.paste_remove_empty_paragraphs).toBe(true);
    expect(init.paste_merge_formats).toBe(false);
    expect(init.paste_convert_word_fake_lists).toBe(true);
    expect(init.paste_webkit_styles).toBe('none');
    expect(init.paste_retain_style_properties).toBe('');
  });

  it('should have strict valid_elements configuration', () => {
    render(<VisualEditor value="" onChange={vi.fn()} />);

    const props = (globalThis as Record<string, unknown>)
      .__lastTinyProps as Record<string, unknown>;
    const init = props.init as Record<string, unknown>;

    expect(init.valid_elements).toBeDefined();
    const validElements = init.valid_elements as string;

    // Check for essential elements
    expect(validElements).toContain('p[class|style]');
    expect(validElements).toContain('strong');
    expect(validElements).toContain('em');
    expect(validElements).toContain('ul[class|style]');
    expect(validElements).toContain('ol[class|style]');
    expect(validElements).toContain('li[class|style]');
    expect(validElements).toContain('table[class|style]');
    expect(validElements).toContain('td[class|style|colspan|rowspan]');
    expect(validElements).toContain('th[class|style|colspan|rowspan]');
    expect(validElements).toContain('shadcn-block-placeholder[class|style]');
  });

  it('should have extended_valid_elements for complex structures', () => {
    render(<VisualEditor value="" onChange={vi.fn()} />);

    const props = (globalThis as Record<string, unknown>)
      .__lastTinyProps as Record<string, unknown>;
    const init = props.init as Record<string, unknown>;

    expect(init.extended_valid_elements).toBeDefined();
    const extendedElements = init.extended_valid_elements as string;

    // Check for table-specific attributes
    expect(extendedElements).toContain(
      'table[class|style|border|cellpadding|cellspacing|width|height]'
    );
    expect(extendedElements).toContain(
      'td[class|style|colspan|rowspan|width|height|align|valign]'
    );
    expect(extendedElements).toContain(
      'th[class|style|colspan|rowspan|width|height|align|valign|scope]'
    );

    // Check for list-specific attributes
    expect(extendedElements).toContain('ul[class|style|type]');
    expect(extendedElements).toContain('ol[class|style|type|start]');
    expect(extendedElements).toContain('li[class|style|value]');
  });

  it('should have invalid_elements to block dangerous content', () => {
    render(<VisualEditor value="" onChange={vi.fn()} />);

    const props = (globalThis as Record<string, unknown>)
      .__lastTinyProps as Record<string, unknown>;
    const init = props.init as Record<string, unknown>;

    expect(init.invalid_elements).toBeDefined();
    const invalidElements = init.invalid_elements as string;

    // Check for blocked dangerous elements
    expect(invalidElements).toContain('script');
    expect(invalidElements).toContain('object');
    expect(invalidElements).toContain('embed');
    expect(invalidElements).toContain('iframe');
    expect(invalidElements).toContain('form');
    expect(invalidElements).toContain('input');
    expect(invalidElements).toContain('button');
    expect(invalidElements).toContain('style');
  });

  it('should have BeforePaste event handler for sanitization', () => {
    render(<VisualEditor value="" onChange={vi.fn()} />);

    const props = (globalThis as Record<string, unknown>)
      .__lastTinyProps as Record<string, unknown>;
    const init = props.init as Record<string, unknown>;

    expect(init.setup).toBeDefined();
    const setup = init.setup as (editor: unknown) => void;

    // Mock editor with event handlers
    const mockEditor = {
      on: vi.fn(),
    };

    setup(mockEditor);

    // Verify BeforePaste event handler is registered
    expect(mockEditor.on).toHaveBeenCalledWith(
      'BeforePaste',
      expect.any(Function)
    );
  });

  describe('Paste Sanitization Tests', () => {
    it('should sanitize Google Docs content with inline styles', () => {
      render(<VisualEditor value="" onChange={vi.fn()} />);

      const props = (globalThis as Record<string, unknown>)
        .__lastTinyProps as Record<string, unknown>;
      const init = props.init as Record<string, unknown>;
      const setup = init.setup as (editor: unknown) => void;

      const mockEditor = {
        on: vi.fn((event, handler) => {
          if (event === 'BeforePaste') {
            // Test the paste handler with Google Docs content
            const mockEvent = {
              content:
                '<p style="color: red; font-size: 16px; margin: 10px;">Test content</p>',
            };
            handler(mockEvent);

            // Should remove non-allowed styles
            expect(mockEvent.content).not.toContain('font-size: 16px');
            expect(mockEvent.content).not.toContain('margin: 10px');
            // Should keep allowed styles
            expect(mockEvent.content).toContain('color: red');
          }
        }),
      };

      setup(mockEditor);
    });

    it('should clean up Google Docs specific elements', () => {
      render(<VisualEditor value="" onChange={vi.fn()} />);

      const props = (globalThis as Record<string, unknown>)
        .__lastTinyProps as Record<string, unknown>;
      const init = props.init as Record<string, unknown>;
      const setup = init.setup as (editor: unknown) => void;

      const mockEditor = {
        on: vi.fn((event, handler) => {
          if (event === 'BeforePaste') {
            const mockEvent = {
              content:
                '<p>Content <o:p>Google Docs element</o:p> more content</p>',
            };
            handler(mockEvent);

            // Should remove Google Docs specific elements
            expect(mockEvent.content).not.toContain('<o:p>');
            expect(mockEvent.content).not.toContain('</o:p>');
            expect(mockEvent.content).toBe('<p>Content  more content</p>');
          }
        }),
      };

      setup(mockEditor);
    });

    it('should preserve list structure while cleaning styles', () => {
      render(<VisualEditor value="" onChange={vi.fn()} />);

      const props = (globalThis as Record<string, unknown>)
        .__lastTinyProps as Record<string, unknown>;
      const init = props.init as Record<string, unknown>;
      const setup = init.setup as (editor: unknown) => void;

      const mockEditor = {
        on: vi.fn((event, handler) => {
          if (event === 'BeforePaste') {
            const mockEvent = {
              content: `
                <ul style="list-style-type: disc;">
                  <li style="margin: 5px;"><p style="font-size: 14px;">Item 1</p></li>
                  <li style="margin: 5px;"><p style="font-size: 14px;">Item 2</p></li>
                </ul>
              `,
            };
            handler(mockEvent);

            // Should preserve list structure
            expect(mockEvent.content).toContain('<ul');
            expect(mockEvent.content).toContain('<li>');
            expect(mockEvent.content).toContain('Item 1');
            expect(mockEvent.content).toContain('Item 2');

            // Should remove non-allowed styles
            expect(mockEvent.content).not.toContain('font-size: 14px');
            expect(mockEvent.content).not.toContain('margin: 5px');

            // Should clean up nested p tags in li
            expect(mockEvent.content).not.toContain('<li><p>');
            expect(mockEvent.content).toContain('<li>Item 1</li>');
          }
        }),
      };

      setup(mockEditor);
    });

    it('should preserve table structure while sanitizing', () => {
      render(<VisualEditor value="" onChange={vi.fn()} />);

      const props = (globalThis as Record<string, unknown>)
        .__lastTinyProps as Record<string, unknown>;
      const init = props.init as Record<string, unknown>;
      const setup = init.setup as (editor: unknown) => void;

      const mockEditor = {
        on: vi.fn((event, handler) => {
          if (event === 'BeforePaste') {
            const mockEvent = {
              content: `
                <table style="border-collapse: collapse; width: 100%;">
                  <tr>
                    <td style="border: 1px solid black; padding: 8px; font-size: 12px;">Cell 1</td>
                    <td style="border: 1px solid black; padding: 8px; font-size: 12px;">Cell 2</td>
                  </tr>
                </table>
              `,
            };
            handler(mockEvent);

            // Should preserve table structure
            expect(mockEvent.content).toContain('<table');
            expect(mockEvent.content).toContain('<tr>');
            expect(mockEvent.content).toContain('<td');
            expect(mockEvent.content).toContain('Cell 1');
            expect(mockEvent.content).toContain('Cell 2');

            // Should keep allowed table styles
            expect(mockEvent.content).toContain('border-collapse');
            expect(mockEvent.content).toContain('border');

            // Should remove non-allowed styles
            expect(mockEvent.content).not.toContain('font-size: 12px');
            expect(mockEvent.content).not.toContain('padding: 8px');
          }
        }),
      };

      setup(mockEditor);
    });

    it('should remove empty spans and divs', () => {
      render(<VisualEditor value="" onChange={vi.fn()} />);

      const props = (globalThis as Record<string, unknown>)
        .__lastTinyProps as Record<string, unknown>;
      const init = props.init as Record<string, unknown>;
      const setup = init.setup as (editor: unknown) => void;

      const mockEditor = {
        on: vi.fn((event, handler) => {
          if (event === 'BeforePaste') {
            const mockEvent = {
              content:
                '<p>Text <span style="color: red;"></span> more text <div class="empty"></div> end</p>',
            };
            handler(mockEvent);

            // Should remove empty spans and divs
            expect(mockEvent.content).not.toContain(
              '<span style="color: red;"></span>'
            );
            expect(mockEvent.content).not.toContain(
              '<div class="empty"></div>'
            );
            expect(mockEvent.content).toBe('<p>Text  more text  end</p>');
          }
        }),
      };

      setup(mockEditor);
    });

    it('should preserve shadcn-block-placeholder elements', () => {
      render(<VisualEditor value="" onChange={vi.fn()} />);

      const props = (globalThis as Record<string, unknown>)
        .__lastTinyProps as Record<string, unknown>;
      const init = props.init as Record<string, unknown>;
      const setup = init.setup as (editor: unknown) => void;

      const mockEditor = {
        on: vi.fn((event, handler) => {
          if (event === 'BeforePaste') {
            const mockEvent = {
              content:
                '<p>Content</p><div class="shadcn-block-placeholder">Placeholder</div><p>More content</p>',
            };
            handler(mockEvent);

            // Should preserve shadcn-block-placeholder
            expect(mockEvent.content).toContain('shadcn-block-placeholder');
            expect(mockEvent.content).toContain('Placeholder');
          }
        }),
      };

      setup(mockEditor);
    });
  });
});
