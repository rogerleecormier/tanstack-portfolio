import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface VisualEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Visual Editor Component
 * Uses TinyMCE for WYSIWYG editing
 */
const VisualEditor: React.FC<VisualEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
}) => {
  const editorRef = useRef<unknown>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="visual-editor h-full">
      <Editor
        onInit={(_, editor) => {
          editorRef.current = editor;
        }}
        tinymceScriptSrc="/tinymce/tinymce.js"
        licenseKey="gpl"
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: '100%',
          menubar: false,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'help',
            'wordcount',
            'noneditable',
            'nonbreaking',
            'pagebreak',
            'paste',
          ],
          toolbar:
            'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          // Paste policy and sanitization configuration
          paste_data_images: false,
          paste_auto_cleanup_on_paste: true,
          paste_remove_styles_if_webkit: true,
          paste_remove_empty_paragraphs: true,
          paste_merge_formats: false,
          paste_convert_word_fake_lists: true,
          paste_webkit_styles: 'none',
          paste_retain_style_properties: '',
          // Strict allow-list for valid elements
          valid_elements: [
            'p[class|style]',
            'br',
            'strong',
            'em',
            'u',
            's',
            'h1[class|style]',
            'h2[class|style]',
            'h3[class|style]',
            'h4[class|style]',
            'h5[class|style]',
            'h6[class|style]',
            'ul[class|style]',
            'ol[class|style]',
            'li[class|style]',
            'blockquote[class|style]',
            'a[href|title|class|style]',
            'img[src|alt|title|width|height|class|style]',
            'table[class|style]',
            'thead[class|style]',
            'tbody[class|style]',
            'tr[class|style]',
            'td[class|style|colspan|rowspan]',
            'th[class|style|colspan|rowspan]',
            'div[class|style]',
            'span[class|style]',
            'code[class|style]',
            'pre[class|style]',
            'hr[class|style]',
            'sup[class|style]',
            'sub[class|style]',
            'del[class|style]',
            'ins[class|style]',
            'mark[class|style]',
            'small[class|style]',
            'abbr[title|class|style]',
            'cite[class|style]',
            'q[class|style]',
            'time[datetime|class|style]',
            'dfn[class|style]',
            'var[class|style]',
            'samp[class|style]',
            'kbd[class|style]',
            'bdi[class|style]',
            'bdo[dir|class|style]',
            'ruby[class|style]',
            'rt[class|style]',
            'rp[class|style]',
            'details[class|style]',
            'summary[class|style]',
            'figure[class|style]',
            'figcaption[class|style]',
            'dl[class|style]',
            'dt[class|style]',
            'dd[class|style]',
            'address[class|style]',
            'article[class|style]',
            'aside[class|style]',
            'footer[class|style]',
            'header[class|style]',
            'main[class|style]',
            'nav[class|style]',
            'section[class|style]',
            'shadcn-block-placeholder[class|style]',
          ].join(','),
          // Extended valid elements for more complex structures
          extended_valid_elements: [
            'table[class|style|border|cellpadding|cellspacing|width|height]',
            'thead[class|style]',
            'tbody[class|style]',
            'tfoot[class|style]',
            'tr[class|style]',
            'td[class|style|colspan|rowspan|width|height|align|valign]',
            'th[class|style|colspan|rowspan|width|height|align|valign|scope]',
            'ul[class|style|type]',
            'ol[class|style|type|start]',
            'li[class|style|value]',
            'dl[class|style]',
            'dt[class|style]',
            'dd[class|style]',
            'blockquote[class|style|cite]',
            'a[href|title|class|style|target|rel]',
            'img[src|alt|title|width|height|class|style|loading]',
            'figure[class|style]',
            'figcaption[class|style]',
            'details[class|style|open]',
            'summary[class|style]',
          ].join(','),
          // Invalid elements to remove
          invalid_elements: [
            'script',
            'object',
            'embed',
            'applet',
            'form',
            'input',
            'button',
            'select',
            'textarea',
            'label',
            'fieldset',
            'legend',
            'iframe',
            'frameset',
            'frame',
            'noframes',
            'base',
            'link',
            'meta',
            'style',
            'title',
            'head',
            'html',
            'body',
          ].join(','),
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 14px; 
              line-height: 1.6;
              padding: 16px;
            }
            .shadcn-block-placeholder {
              background-color: #f3f4f6;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              padding: 16px;
              margin: 8px 0;
              text-align: center;
              color: #6b7280;
              font-weight: 500;
              cursor: pointer;
              position: relative;
            }
            .shadcn-block-placeholder:hover {
              background-color: #e5e7eb;
              border-color: #9ca3af;
            }
            .shadcn-block-placeholder:focus {
              outline: 2px solid #3b82f6;
              outline-offset: 2px;
            }
            .sr-only {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border: 0;
            }
          `,
          placeholder: placeholder,
          noneditable_class: 'shadcn-block-placeholder',
          noneditable_regexp: /shadcn-block-placeholder/,
          setup: (editor) => {
            // Enhance placeholder accessibility
            editor.on('init', () => {
              // Add accessibility attributes to existing placeholders
              const placeholders = editor.dom.select(
                '.shadcn-block-placeholder'
              );
              placeholders.forEach((placeholder, index) => {
                const blockType = editor.dom.getAttrib(
                  placeholder,
                  'data-block-type'
                );
                const jsonData = editor.dom.getAttrib(placeholder, 'data-json');

                if (blockType) {
                  // Parse JSON to get a summary for screen readers
                  let blockSummary = `${blockType} block`;
                  try {
                    const parsedJson = JSON.parse(jsonData);
                    if (parsedJson.title) {
                      blockSummary = `${blockType} block: ${parsedJson.title}`;
                    } else if (parsedJson.label) {
                      blockSummary = `${blockType} block: ${parsedJson.label}`;
                    } else if (parsedJson.name) {
                      blockSummary = `${blockType} block: ${parsedJson.name}`;
                    }
                  } catch {
                    // If JSON parsing fails, use default summary
                  }

                  // Add accessibility attributes
                  editor.dom.setAttrib(placeholder, 'role', 'img');
                  editor.dom.setAttrib(placeholder, 'aria-label', blockSummary);
                  editor.dom.setAttrib(placeholder, 'tabindex', '0');

                  // Add screen reader description
                  const descriptionId = `block-description-${blockType}-${index}`;
                  editor.dom.setAttrib(
                    placeholder,
                    'aria-describedby',
                    descriptionId
                  );

                  // Create hidden description element
                  const description = editor.dom.create(
                    'span',
                    {
                      id: descriptionId,
                      class: 'sr-only',
                    },
                    `This is a ${blockType} block. ${blockSummary}. Use the block editor to configure this component.`
                  );

                  editor.dom.insertAfter(description, placeholder);
                }
              });
            });

            // Custom paste pre-processor for sanitization and placeholder protection
            editor.on('BeforePaste', (e) => {
              // Check for placeholder protection first
              if (editor.selection && editor.dom) {
                const selection = editor.selection.getNode();
                const placeholder = editor.dom.getParent(
                  selection,
                  '.shadcn-block-placeholder'
                );

                if (placeholder) {
                  e.preventDefault();
                  return false;
                }
              }

              // Clean up Google Docs/Office paste content
              let content = e.content;

              // Remove Google Docs specific classes and inline styles
              content = content.replace(/class="[^"]*"/g, (match: string) => {
                // Only keep specific classes that are safe
                const safeClasses = ['shadcn-block-placeholder'];
                const classes = match.match(/class="([^"]*)"/);
                if (classes) {
                  const classList = classes[1]
                    .split(' ')
                    .filter(
                      (cls: string) =>
                        safeClasses.includes(cls) || cls.startsWith('mce-')
                    );
                  return classList.length > 0
                    ? `class="${classList.join(' ')}"`
                    : '';
                }
                return '';
              });

              // Remove inline styles except for specific allow-listed properties
              content = content.replace(/style="[^"]*"/g, (match: string) => {
                const styleMatch = match.match(/style="([^"]*)"/);
                if (styleMatch) {
                  const styles = styleMatch[1];
                  const allowedProperties = [
                    'text-align',
                    'text-decoration',
                    'font-weight',
                    'font-style',
                    'color',
                    'background-color',
                    'border',
                    'border-collapse',
                    'width',
                    'height',
                    'colspan',
                    'rowspan',
                    'vertical-align',
                  ];

                  const filteredStyles = styles
                    .split(';')
                    .filter((style: string) => {
                      const [property] = style.split(':');
                      return allowedProperties.includes(property.trim());
                    })
                    .join(';');

                  return filteredStyles ? `style="${filteredStyles}"` : '';
                }
                return '';
              });

              // Remove empty spans and divs
              content = content.replace(
                /<(span|div)[^>]*>\s*<\/(span|div)>/g,
                ''
              );
              content = content.replace(
                /<(span|div)[^>]*>\s*<\/(span|div)>/g,
                ''
              );

              // Clean up nested lists from Google Docs
              content = content.replace(/<li[^>]*>\s*<p[^>]*>/g, '<li>');
              content = content.replace(/<\/p>\s*<\/li>/g, '</li>');

              // Remove Google Docs specific elements
              content = content.replace(/<o:p[^>]*>.*?<\/o:p>/g, '');
              content = content.replace(/<w:[^>]*>.*?<\/w:[^>]*>/g, '');
              content = content.replace(/<m:[^>]*>.*?<\/m:[^>]*>/g, '');

              e.content = content;
            });

            // Ensure placeholders have proper contenteditable="false" attribute
            editor.on('BeforeSetContent', (e) => {
              if (e.content.includes('shadcn-block-placeholder')) {
                e.content = e.content.replace(
                  /<div([^>]*class="[^"]*shadcn-block-placeholder[^"]*"[^>]*)>/g,
                  (match, attributes) => {
                    if (!match.includes('contenteditable="false"')) {
                      return `<div${attributes} contenteditable="false">`;
                    }
                    return match;
                  }
                );
              }
            });

            // Additional protection: prevent deletion of block placeholders
            editor.on('KeyDown', (e) => {
              const selection = editor.selection.getNode();
              const placeholder = editor.dom.getParent(
                selection,
                '.shadcn-block-placeholder'
              );

              if (placeholder) {
                if ([8, 46, 127].includes(e.keyCode)) {
                  // Backspace, Delete, Forward Delete
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }
            });

            // Move cursor out of placeholders when clicked
            editor.on('SelectionChange', () => {
              const selection = editor.selection.getNode();
              const placeholder = editor.dom.getParent(
                selection,
                '.shadcn-block-placeholder'
              );

              if (placeholder) {
                const range = editor.dom.createRng();
                range.setStartAfter(placeholder);
                range.collapse(true);
                editor.selection.setRng(range);
              }
            });
          },
        }}
      />
    </div>
  );
};

export default VisualEditor;
