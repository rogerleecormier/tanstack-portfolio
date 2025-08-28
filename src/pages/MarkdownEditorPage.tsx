import React, { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'




// Create lowlight instance with common languages
const lowlight = createLowlight(common)

const MarkdownEditorPage: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false)
  const [markdownOutput, setMarkdownOutput] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default codeBlock to avoid conflict with CodeBlockLowlight
      }),
      Highlight,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none border border-gray-200 focus:border-gray-400 rounded-lg p-6 min-h-[600px] transition-colors duration-200',
      },
    },
    content: `
      <h1>Welcome to the Markdown Editor</h1>
      <p>This is a rich text editor that helps you create markdown content. Use the toolbar above to format your text, and toggle the preview to see the generated markdown.</p>
      <h2>Features</h2>
      <ul>
        <li>Rich text editing with common formatting options</li>
        <li>Real-time markdown generation</li>
        <li>Syntax highlighting for code blocks</li>
        <li>Preview mode to see the final output</li>
      </ul>
      <h3>Getting Started</h3>
      <p>Start typing and use the toolbar to format your content. The markdown will be generated automatically as you type.</p>
      <blockquote>
        <p>This editor supports all standard markdown elements including headers, lists, code blocks, and more.</p>
      </blockquote>
      <p>You can also write code blocks with syntax highlighting:</p>
      <pre><code class="language-javascript">function hello() {
  console.log("Hello, World!");
}</code></pre>
    `,
    onUpdate: ({ editor }) => {
      // Convert HTML to markdown-like format
      const content = editor.getHTML()
      const markdown = htmlToMarkdown(content)
      setMarkdownOutput(markdown)
    },
  })

  const htmlToMarkdown = (html: string): string => {
    // Simple HTML to markdown conversion
    return html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<h4>(.*?)<\/h4>/g, '#### $1\n\n')
      .replace(/<h5>(.*?)<\/h5>/g, '##### $1\n\n')
      .replace(/<h6>(.*?)<\/h6>/g, '###### $1\n\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<i>(.*?)<\/i>/g, '*$1*')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<pre><code class="language-(\w+)">(.*?)<\/code><\/pre>/gs, '```$1\n$2\n```\n\n')
      .replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n\n')
      .replace(/<ul>(.*?)<\/ul>/gs, '$1\n')
      .replace(/<ol>(.*?)<\/ol>/gs, '$1\n')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<blockquote>(.*?)<\/blockquote>/gs, '> $1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  }

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdownOutput], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [markdownOutput])

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void, 
    isActive?: boolean, 
    children: React.ReactNode, 
    title: string 
  }) => (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      className={isActive ? "bg-teal-100 text-teal-700 hover:bg-teal-200" : ""}
      title={title}
    >
      {children}
    </Button>
  )

  return (
    <div className="max-w-6xl mx-auto">
             <div className="mb-8">
         <div className="flex items-center gap-4 mb-4">
           <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
             <Link to="/tools">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Tools
             </Link>
           </Button>
         </div>
         <h1 className="text-4xl font-bold text-gray-900 mb-4">Markdown Editor</h1>
         <p className="text-lg text-gray-600">
           A rich text editor for creating and editing markdown content with real-time preview and syntax highlighting.
         </p>
       </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6" />

                         <div className="flex items-center gap-1">
               <ToolbarButton
                 onClick={() => editor.chain().focus().toggleBulletList().run()}
                 isActive={editor.isActive('bulletList')}
                 title="Bullet List"
               >
                 <List className="h-4 w-4" />
               </ToolbarButton>
               <ToolbarButton
                 onClick={() => editor.chain().focus().toggleOrderedList().run()}
                 isActive={editor.isActive('orderedList')}
                 title="Numbered List"
               >
                 <ListOrdered className="h-4 w-4" />
               </ToolbarButton>
               <ToolbarButton
                 onClick={() => editor.chain().focus().toggleBlockquote().run()}
                 isActive={editor.isActive('blockquote')}
                 title="Quote"
               >
                 <Quote className="h-4 w-4" />
               </ToolbarButton>
               <ToolbarButton
                 onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                 isActive={editor.isActive('codeBlock')}
                 title="Code Block"
               >
                 <Code className="h-4 w-4" />
               </ToolbarButton>
             </div>

            <div className="flex items-center gap-2 ml-auto">
              <ToolbarButton
                onClick={() => setShowPreview(!showPreview)}
                title={showPreview ? "Hide Preview" : "Show Preview"}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </ToolbarButton>
              <ToolbarButton
                onClick={downloadMarkdown}
                title="Download Markdown"
              >
                <Download className="h-4 w-4" />
              </ToolbarButton>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex">
            {/* Editor */}
            <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-6`}>
                                                     <div className="prose prose-sm max-w-none">
                                                             <EditorContent 
                   editor={editor} 
                   className="min-h-[600px]"
                 />
              </div>
             </div>

            {/* Preview */}
            {showPreview && (
              <>
                <Separator orientation="vertical" />
                <div className="w-1/2 p-6 bg-muted/30">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Markdown Output</h3>
                    <Card>
                      <CardContent className="p-4">
                        <pre className="font-mono text-sm overflow-auto max-h-[600px] whitespace-pre-wrap">{markdownOutput}</pre>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

             <Card className="mt-8">
         <CardHeader>
           <CardTitle>How to Use</CardTitle>
         </CardHeader>
                 <CardContent>
           <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
             <li>Use the toolbar to format your text with headers, bold, italic, lists, and more</li>
             <li>Toggle the preview to see the generated markdown in real-time</li>
             <li>Download your markdown file when you're ready</li>
             <li>The editor supports code blocks with syntax highlighting for various programming languages</li>
           </ul>
         </CardContent>
      </Card>
    </div>
  )
}

export default MarkdownEditorPage
