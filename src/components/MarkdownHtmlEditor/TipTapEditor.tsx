import { useCallback, useEffect, useRef } from 'react';
import { htmlToMarkdown } from '@/lib/htmlToMarkdown';
import { markdownToHtml } from '@/lib/markdown';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
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

export function TipTapEditor({ initialMarkdown, onDocChange }: TipTapEditorProps) {
  // Debounce TipTap -> parent updates to reduce re-renders and keep behavior
  // consistent with the Markdown editor. This avoids cursor jumps on idle.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHtmlRef = useRef<string | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-teal-200/30 dark:border-teal-700/30 p-3 flex flex-wrap gap-1.5 flex-shrink-0 bg-gradient-to-r from-teal-50/30 to-blue-50/30 dark:from-teal-900/20 dark:to-blue-900/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-800/50 dark:hover:text-teal-300 transition-all duration-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-teal-100 text-teal-800 dark:bg-teal-800/50 dark:text-teal-200' : ''}`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-800/50 dark:hover:text-teal-300 transition-all duration-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-teal-100 text-teal-800 dark:bg-teal-800/50 dark:text-teal-200' : ''}`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-800/50 dark:hover:text-teal-300 transition-all duration-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-teal-100 text-teal-800 dark:bg-teal-800/50 dark:text-teal-200' : ''}`}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300 transition-all duration-200 ${editor.isActive('bold') ? 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200' : ''}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300 transition-all duration-200 ${editor.isActive('italic') ? 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200' : ''}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-accent' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-accent' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto bg-white/50 dark:bg-gray-900/50">
        <EditorContent
          editor={editor}
          className="h-full p-6 max-w-none focus-within:outline-none cursor-text overflow-auto focus-within:ring-2 focus-within:ring-teal-500/20 rounded-b-xl"

        />
      </div>
    </div>
  );
}

