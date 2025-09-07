import React, { useCallback, useEffect, useRef } from 'react';
import { htmlToMarkdown } from '@/lib/htmlToMarkdown';
import { markdownToHtml } from '@/lib/markdown';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import ImageExtension from '@tiptap/extension-image';
import { Button } from '../ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

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
const ToolbarButton = React.memo<ToolbarButtonProps>(({ onClick, isActive, children, className = '' }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={`rounded-lg border border-transparent hover:border-teal-200/50 dark:hover:border-teal-700/50 transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-teal-500 dark:border-teal-600'
        : 'hover:bg-teal-100/80 hover:text-teal-700 dark:hover:bg-teal-800/50 dark:hover:text-teal-300'
    } ${className}`}
  >
    {children}
  </Button>
));

export function TipTapEditor({ initialMarkdown, onDocChange }: TipTapEditorProps) {
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
    content: markdownToHtml(initialMarkdown || ''),
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

    const nextHtml = markdownToHtml(initialMarkdown || '');

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
      editor.chain().setTextSelection({ from: clampedFrom, to: clampedTo }).focus().run();
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

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
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
    <div className="h-full flex flex-col bg-white/50 dark:bg-slate-900/50">
      {/* Enhanced Toolbar with Brand Theme */}
      <div className="border-b border-teal-200/30 dark:border-teal-700/30 p-4 flex flex-wrap gap-2 flex-shrink-0 bg-gradient-to-r from-teal-50/40 to-blue-50/40 dark:from-teal-900/30 dark:to-blue-900/30 backdrop-blur-sm">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor?.isActive('heading', { level: 1 }) || false}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive('heading', { level: 2 }) || false}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor?.isActive('heading', { level: 3 }) || false}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive('bold') || false}
          className="hover:border-slate-200/50 dark:hover:border-slate-700/50 hover:bg-slate-100/80 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive('italic') || false}
          className="hover:border-slate-200/50 dark:hover:border-slate-700/50 hover:bg-slate-100/80 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor?.isActive('strike') || false}
          className="hover:border-red-200/50 dark:hover:border-red-700/50 hover:bg-red-100/80 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive('bulletList') || false}
          className="hover:border-green-200/50 dark:hover:border-green-700/50 hover:bg-green-100/80 hover:text-green-700 dark:hover:bg-green-900/50 dark:hover:text-green-300"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive('orderedList') || false}
          className="hover:border-green-200/50 dark:hover:border-green-700/50 hover:bg-green-100/80 hover:text-green-700 dark:hover:bg-green-900/50 dark:hover:text-green-300"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive('blockquote') || false}
          className="hover:border-purple-200/50 dark:hover:border-purple-700/50 hover:bg-purple-100/80 hover:text-purple-700 dark:hover:bg-purple-900/50 dark:hover:text-purple-300"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          className="hover:border-slate-200/50 dark:hover:border-slate-700/50 hover:bg-slate-100/80 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addLink}
          isActive={editor?.isActive('link') || false}
          className="hover:border-blue-200/50 dark:hover:border-blue-700/50 hover:bg-blue-100/80 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addImage}
          isActive={false}
          className="hover:border-orange-200/50 dark:hover:border-orange-700/50 hover:bg-orange-100/80 hover:text-orange-700 dark:hover:bg-orange-900/50 dark:hover:text-orange-300"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor?.isActive('codeBlock') || false}
          className="hover:border-purple-200/50 dark:hover:border-purple-700/50 hover:bg-purple-100/80 hover:text-purple-700 dark:hover:bg-purple-900/50 dark:hover:text-purple-300"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          isActive={false}
          className="hover:border-indigo-200/50 dark:hover:border-indigo-700/50 hover:bg-indigo-100/80 hover:text-indigo-700 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300"
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
      {/* Editor Content Area */}
      <div className="flex-1 bg-gradient-to-br from-white/80 to-slate-50/30 dark:from-slate-800/80 dark:to-slate-900/30 overflow-hidden">
        {editor && (
          <EditorContent
            editor={editor}
            className="h-full p-6 max-w-none focus-within:outline-none cursor-text prose prose-slate dark:prose-invert focus-within:ring-2 focus-within:ring-teal-500/30 rounded-b-xl overflow-auto"
          />
        )}
      </div>
    </div>
  );
}

