import { htmlToMarkdown } from '@/lib/htmlToMarkdown';
import { markdownToHtml } from '@/lib/markdown';
import ImageExtension from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table as TableIcon,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from '../ui/button';

interface TipTapEditorProps {
  initialMarkdown?: string;
  onDocChange: (markdown: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

// Memoized toolbar button to prevent unnecessary re-renders
const ToolbarButton = React.memo<ToolbarButtonProps>(
  ({ onClick, isActive, children, className = '' }) => (
    <Button
      variant='ghost'
      size='sm'
      onClick={onClick}
      className={`rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 backdrop-blur-md transition-all duration-200 hover:border-strategy-gold/50 hover:bg-surface-elevated/40 dark:border-strategy-gold/20 dark:bg-surface-elevated/30 dark:hover:border-strategy-gold/50 dark:hover:bg-surface-elevated/40 ${
        isActive
          ? 'border-strategy-gold/60 bg-strategy-gold/30 text-strategy-gold ring-1 ring-gold-500/30 dark:border-strategy-gold/60'
          : 'hover:bg-surface-elevated/40 hover:text-strategy-gold dark:hover:bg-surface-elevated/40 dark:hover:text-strategy-gold'
      } ${className}`}
    >
      {children}
    </Button>
  )
);

export function TipTapEditor({
  initialMarkdown,
  onDocChange,
}: TipTapEditorProps) {
  // Debounce TipTap -> parent updates to reduce re-renders and keep behavior
  // consistent with the Markdown editor. This avoids cursor jumps on idle.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHtmlRef = useRef<string | null>(null);
  const addLinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addImageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension,
    ],
    // Hydrate TipTap with HTML converted from current Markdown state
    content: markdownToHtml(initialMarkdown ?? ''),
    editorProps: {
      attributes: {
        class: 'min-h-full focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (!editor) return;
      const html = editor.getHTML();
      if (lastHtmlRef.current === html) return;
      lastHtmlRef.current = html;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const md = htmlToMarkdown(html);
        onDocChange(md);
      }, 300);
    },
  });

  // Keep TipTap in sync if parent Markdown changes (e.g., after switching tabs)
  // Preserve selection and avoid resetting if the change originated locally.
  useEffect(() => {
    if (!editor) return;

    const nextHtml = markdownToHtml(initialMarkdown ?? '');

    // If parent-provided HTML matches what we last emitted, skip to avoid caret jumps
    if (lastHtmlRef.current === nextHtml) {
      return;
    }

    // If DOM already matches, no-op
    if (nextHtml === editor.getHTML()) {
      lastHtmlRef.current = nextHtml;
      return;
    }

    // Capture current selection and attempt to restore after content set
    const { from, to } = editor.state.selection;

    // Avoid emitting update to prevent conversion loop
    editor.commands.setContent(nextHtml, { emitUpdate: false });
    lastHtmlRef.current = nextHtml;

    // Restore selection on next frame to prevent cursor jumping to end
    requestAnimationFrame(() => {
      // Clamp selection to document size just in case
      const docSize = editor.state.doc.content.size;
      const clampedFrom = Math.min(from, docSize);
      const clampedTo = Math.min(to, docSize);
      editor
        ?.chain()
        .setTextSelection({ from: clampedFrom, to: clampedTo })
        .focus()
        .run();
    });
  }, [editor, initialMarkdown]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (addLinkTimeoutRef.current) clearTimeout(addLinkTimeoutRef.current);
      if (addImageTimeoutRef.current) clearTimeout(addImageTimeoutRef.current);
    };
  }, []);

  const addLink = useCallback(() => {
    if (!editor) return;

    // Prevent multiple rapid clicks
    if (addLinkTimeoutRef.current) return;

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();

    // Prevent rapid successive calls
    addLinkTimeoutRef.current = setTimeout(() => {
      addLinkTimeoutRef.current = null;
    }, 300);
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    // Prevent multiple rapid clicks
    if (addImageTimeoutRef.current) return;

    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }

    // Prevent rapid successive calls
    addImageTimeoutRef.current = setTimeout(() => {
      addImageTimeoutRef.current = null;
    }, 300);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className='flex h-full flex-col bg-surface-deep backdrop-blur-xl dark:bg-surface-deep'>
      {/* Enhanced Toolbar with Brand Theme */}
      <div className='flex shrink-0 flex-wrap gap-2 border-b border-strategy-gold/10 bg-surface-deep/40 p-4 backdrop-blur-xl dark:border-strategy-gold/10 dark:bg-surface-deep/40'>
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor?.isActive('heading', { level: 1 }) || false}
        >
          <Heading1 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor?.isActive('heading', { level: 2 }) || false}
        >
          <Heading2 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor?.isActive('heading', { level: 3 }) || false}
        >
          <Heading3 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive('bold') || false}
        >
          <Bold className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive('italic') || false}
        >
          <Italic className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          isActive={editor?.isActive('strike') || false}
        >
          <Strikethrough className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive('bulletList') || false}
        >
          <List className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive('orderedList') || false}
        >
          <ListOrdered className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive('blockquote') || false}
        >
          <Quote className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          isActive={false}
        >
          <Minus className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={addLink}
          isActive={editor?.isActive('link') || false}
        >
          <LinkIcon className='size-4' />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} isActive={false}>
          <ImageIcon className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          isActive={editor?.isActive('codeBlock') || false}
        >
          <Code className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          isActive={false}
        >
          <TableIcon className='size-4' />
        </ToolbarButton>
      </div>
      {/* Editor Content Area */}
      <div className='flex-1 overflow-hidden bg-surface-elevated/30 backdrop-blur-xl dark:bg-surface-elevated/30'>
        {editor && (
          <EditorContent
            editor={editor}
            className='prose prose-invert h-full max-w-none cursor-text overflow-auto rounded-b-xl p-6 dark:prose-invert focus-within:outline-none focus-within:ring-2 focus-within:ring-gold-500/30'
          />
        )}
      </div>
    </div>
  );
}
