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
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          licensekey: 'gpl',
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
          ],
          toolbar:
            'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
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
            }
            .shadcn-block-placeholder:hover {
              background-color: #e5e7eb;
              border-color: #9ca3af;
            }
          `,
          placeholder: placeholder,
          noneditable_class: 'shadcn-block-placeholder',
          noneditable_regexp: /shadcn-block-placeholder/,
          setup: (editor) => {
            // Prevent editing of shadcn block placeholders
            editor.on('BeforeSetContent', (e) => {
              // Ensure placeholders remain non-editable
              if (e.content.includes('shadcn-block-placeholder')) {
                e.content = e.content.replace(
                  /<div[^>]*class="[^"]*shadcn-block-placeholder[^"]*"[^>]*>.*?<\/div>/g,
                  (match) => {
                    if (!match.includes('contenteditable="false"')) {
                      return match.replace('>', ' contenteditable="false">');
                    }
                    return match;
                  }
                );
              }
            });

            // Prevent deletion of block placeholders
            editor.on('KeyDown', (e) => {
              const selection = editor.selection.getNode();
              const isInPlaceholder = selection.closest(
                '.shadcn-block-placeholder'
              );

              if (isInPlaceholder) {
                // Prevent backspace, delete, and other destructive keys
                if ([8, 46, 127].includes(e.keyCode)) {
                  // Backspace, Delete, Forward Delete
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }
            });

            // Prevent selection within placeholders
            editor.on('SelectionChange', () => {
              const selection = editor.selection.getNode();
              const isInPlaceholder = selection.closest(
                '.shadcn-block-placeholder'
              );

              if (isInPlaceholder) {
                // Move cursor outside the placeholder
                const placeholder = selection.closest(
                  '.shadcn-block-placeholder'
                );
                if (placeholder) {
                  const range = editor.dom.createRng();
                  range.setStartAfter(placeholder);
                  range.collapse(true);
                  editor.selection.setRng(range);
                }
              }
            });

            // Prevent paste operations that might break placeholders
            editor.on('BeforePaste', (e) => {
              const selection = editor.selection.getNode();
              const isInPlaceholder = selection.closest(
                '.shadcn-block-placeholder'
              );

              if (isInPlaceholder) {
                e.preventDefault();
                return false;
              }
            });
          },
        }}
      />
    </div>
  );
};

export default VisualEditor;
