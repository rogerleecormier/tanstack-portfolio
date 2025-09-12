import { useEffect, useRef, useCallback, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface MarkdownEditorProps {
  initialMarkdown?: string;
  onChange: (markdown: string) => void;
  onTypingStateChange?: (isTyping: boolean) => void;
}

export function MarkdownEditor({
  initialMarkdown = '',
  onChange,
  onTypingStateChange,
}: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const lastValueRef = useRef(initialMarkdown);
  const isInitializedRef = useRef(false);

  const debouncedOnChange = useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set typing state
      setIsTyping(true);
      onTypingStateChange?.(true);

      debounceTimeoutRef.current = setTimeout(() => {
        // Store the current value for external use
        lastValueRef.current = value;

        // Only call onChange if value has actually changed from the initial state
        if (value !== initialMarkdown) {
          onChange(value);
        }

        setIsTyping(false);
        onTypingStateChange?.(false);
      }, 300); // 300ms debounce
    },
    [onChange, onTypingStateChange, initialMarkdown]
  );

  // Initialize CodeMirror once on mount. Do NOT re-create when props change,
  // otherwise focus/selection will be lost on parent re-renders.
  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: initialMarkdown,
      extensions: [
        markdown(),
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            debouncedOnChange(update.state.doc.toString());
          }
        }),
        // Ensure the editor fills the available height
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { height: '100%', overflow: 'auto' },
          '.cm-content': {
            minHeight: '100%',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    // Configure the container and editor for proper sizing
    if (editorRef.current) {
      editorRef.current.style.height = '100%';
    }

    // Configure CodeMirror to fill the full height and maintain focus
    view.dom.style.height = '100%';
    view.dom.style.overflow = 'auto';
    view.dom.style.outline = 'none'; // Prevent focus outline issues

    viewRef.current = view;
    isInitializedRef.current = true;

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect for cleanup to avoid dependency issues
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Update lastValueRef when initialMarkdown changes
  useEffect(() => {
    lastValueRef.current = initialMarkdown;
  }, [initialMarkdown]);

  useEffect(() => {
    // Only update if this is an external change AND we're not currently typing
    if (
      viewRef.current &&
      isInitializedRef.current &&
      !isTyping &&
      initialMarkdown !== viewRef.current.state.doc.toString()
    ) {
      // Store the current selection state before updating
      const currentSelection = viewRef.current.state.selection;

      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialMarkdown,
        },
      });

      // Restore the exact selection state
      requestAnimationFrame(() => {
        if (viewRef.current) {
          viewRef.current.focus();
          viewRef.current.dispatch({
            selection: currentSelection,
          });
        }
      });
    }
  }, [initialMarkdown, isTyping]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={editorRef}
      className='h-full w-full overflow-hidden'
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    />
  );
}
