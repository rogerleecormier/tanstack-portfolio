import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import fm from 'front-matter'
import slugify from 'slugify'
import Sidebar from '../layout/Sidebar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { navigationPages } from '../config/navigation'
import MermaidChart from '../components/MermaidChart'

// Define proper types for frontmatter
interface Frontmatter {
  title?: string
  description?: string
  tags?: string[]
  date?: string
  author?: string
}

// Define TOCEntry type
type TOCEntry = {
  title: string
  slug: string
}


// Update the subpages array to use navigation config with children
const subpages = navigationPages

export default function MarkdownPage({ file }: { file: string }) {
  const [content, setContent] = React.useState<string>('')
  const [frontmatter, setFrontmatter] = React.useState<Frontmatter>({})
  const [toc, setToc] = React.useState<TOCEntry[]>([])

  // Load markdown content and extract TOC
  React.useEffect(() => {
    const loadMarkdown = async () => {
      try {
        // Import markdown directly from src/content
        const markdownModule = await import(`../content/${file}.md?raw`)
        const text = markdownModule.default

        // Parse frontmatter
        const { attributes, body } = fm(text)
        setFrontmatter(attributes as Frontmatter)
        setContent(body)

        // Extract headings for TOC
        const headingRegex = /^#{2}\s+(.+)$/gm  // Only capture ## headers (h2)
        const headings: TOCEntry[] = []
        let match

        while ((match = headingRegex.exec(body)) !== null) {
          const title = match[1].trim()
          const slug = slugify(title, { lower: true, strict: true })
          headings.push({ title, slug })
        }

        setToc(headings)
      } catch (error) {
        console.error('Error loading markdown:', error)
      }
    }

    loadMarkdown()
  }, [file])


  // Get current path for highlighting
  const getCurrentPath = () => {
    if (file === 'projects') return '/projects'
    if (file === 'about') return '/about'
    if (file === 'project-analysis') return '/analytics/project-analysis'  // Fixed: file is now 'project-analysis' but path is still nested
    return `/${file}`
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentToc={toc}
        subpages={subpages}
        currentPath={getCurrentPath()}
      />
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          {/* Header with h1 title instead of Card */}
          {frontmatter.title && (
            <header className="mb-8">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                {frontmatter.title}
              </h1>
              {frontmatter.description && (
                <p className="text-xl text-muted-foreground leading-7">
                  {frontmatter.description}
                </p>
              )}
              {frontmatter.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {frontmatter.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>
          )}

          {/* Markdown Content with Typography */}
          <article className={cn(
            "prose prose-neutral dark:prose-invert max-w-none",
            "prose-headings:scroll-m-20 prose-headings:tracking-tight",
            "prose-h1:text-4xl prose-h1:font-extrabold",
            "prose-h2:text-3xl prose-h2:font-semibold prose-h2:border-b prose-h2:pb-2",
            "prose-h3:text-2xl prose-h3:font-semibold",
            "prose-h4:text-xl prose-h4:font-semibold",
            "prose-p:leading-7",
            "prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic",
            "prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm",
            "prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted prose-pre:p-4"
          )}>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children, ...props }) => {
                  const text = String(children)
                  const id = slugify(text, { lower: true, strict: true })
                  return (
                    <h1 id={id} className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" {...props}>
                      {children}
                    </h1>
                  )
                },
                h2: ({ children, ...props }) => {
                  const text = String(children)
                  const id = slugify(text, { lower: true, strict: true })
                  return (
                    <h2 id={id} className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0" {...props}>
                      {children}
                    </h2>
                  )
                },
                h3: ({ children, ...props }) => {
                  const text = String(children)
                  const id = slugify(text, { lower: true, strict: true })
                  return (
                    <h3 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight" {...props}>
                      {children}
                    </h3>
                  )
                },
                p: ({ children, ...props }) => (
                  <p className="leading-7 [&:not(:first-child)]:mt-6" {...props}>
                    {children}
                  </p>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote className="mt-6 border-l-2 pl-6 italic" {...props}>
                    {children}
                  </blockquote>
                ),
                code: ({ children, className, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  
                  // Handle Mermaid charts
                  if (language === 'mermaid') {
                    return <MermaidChart chart={String(children).replace(/\n$/, '')} />
                  }
                  
                  const isInline = !className?.includes('language-')

                  if (isInline) {
                    return (
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>
                        {children}
                      </code>
                    )
                  }

                  return (
                    <code className={`font-mono text-sm ${className || ''}`} {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children, ...props }) => (
                  <pre className="overflow-x-auto rounded-lg border bg-muted p-4" {...props}>
                    {children}
                  </pre>
                ),
                ul: ({ children, ...props }) => (
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props}>
                    {children}
                  </ol>
                ),
                hr: ({ ...props }) => (
                  <Separator className="my-8" {...props} />
                ),
                table: ({ children, ...props }) => (
                  <div className="my-6 w-full overflow-y-auto">
                    <table className="w-full border-collapse border border-border" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children, ...props }) => (
                  <thead className="bg-muted" {...props}>
                    {children}
                  </thead>
                ),
                th: ({ children, ...props }) => (
                  <th className="border border-border px-4 py-2 text-left font-bold" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="border border-border px-4 py-2" {...props}>
                    {children}
                  </td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  )
}