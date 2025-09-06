import React, { useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Markdown Editor Component
 * Uses CodeMirror for Markdown editing
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your markdown...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="markdown-editor h-full" ref={editorRef}>
      <CodeMirror
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        extensions={[
          markdown(),
          EditorView.theme({
            '&': {
              height: '100%',
            },
            '.cm-editor': {
              height: '100%',
            },
            '.cm-scroller': {
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
            },
            '.cm-content': {
              padding: '16px',
            },
            '.cm-focused': {
              outline: 'none',
            },
          }),
        ]}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
