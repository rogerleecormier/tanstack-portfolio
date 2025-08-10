import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import fm from 'front-matter'
import slugify from 'slugify'
import { useLocation } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import MermaidChart from '../components/MermaidChart'
import { AboutProfileCard } from '@/components/AboutProfileCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Skeleton } from '@/components/ui/skeleton'

// Define proper types for frontmatter
interface Frontmatter {
  title?: string
  description?: string
  tags?: string[]
  date?: string
  author?: string
  keywords?: string[]
  image?: string
}

// Define TOCEntry type - export it so sidebar can use it
export type TOCEntry = {
  title: string
  slug: string
}

export default function MarkdownPage({ file }: { file: string }) {
  const [content, setContent] = React.useState<string>('')
  const [frontmatter, setFrontmatter] = React.useState<Frontmatter>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const location = useLocation()

  // Determine content type based on file
  const getContentType = (file: string): 'website' | 'article' | 'profile' => {
    if (file === 'about') return 'profile'
    if (['strategy', 'leadership', 'devops', 'saas', 'analytics', 'project-analysis'].includes(file)) return 'article'
    return 'website'
  }

  // Generate page-specific keywords
  const getPageKeywords = (file: string, tags?: string[]): string[] => {
    const baseKeywords = tags || []
    
    const fileKeywords: Record<string, string[]> = {
      about: ['About', 'Biography', 'Professional Background'],
      strategy: ['Strategy', 'Strategic Planning', 'Business Strategy'],
      leadership: ['Leadership', 'Team Management', 'Leadership Philosophy'],
      devops: ['DevOps', 'CI/CD', 'Azure Functions', 'GitHub Actions'],
      saas: ['SaaS', 'Software as a Service', 'Enterprise Software'],
      analytics: ['Analytics', 'Data Analysis', 'Project Analytics'],
      'project-analysis': ['Project Analysis', 'Risk Analysis', 'Budget Analysis']
    }

    return [...baseKeywords, ...(fileKeywords[file] || [])]
  }

  // Update document title and meta tags with enhanced SEO
  useDocumentTitle({
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: getPageKeywords(file, frontmatter.keywords || frontmatter.tags),
    image: frontmatter.image,
    url: location.pathname,
    type: getContentType(file),
    author: frontmatter.author,
    publishedTime: frontmatter.date
  })

  // Load markdown content and extract TOC
  React.useEffect(() => {
    const loadMarkdown = async () => {
      setIsLoading(true)
      try {
        // Import markdown directly from src/content
        const markdownModule = await import(`../content/${file}.md?raw`)
        const text = markdownModule.default

        // Parse frontmatter
        const { attributes, body } = fm(text)
        setFrontmatter(attributes as Frontmatter)
        
        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
        setContent(cleanedBody)

        // Extract headings for TOC - ONLY H2 headings
        const headingRegex = /^#{2}\s+(.+)$/gm
        const headings: TOCEntry[] = []
        let match

        while ((match = headingRegex.exec(cleanedBody)) !== null) {
          const title = match[1].trim()
          const slug = slugify(title, { lower: true, strict: true })
          headings.push({ title, slug })
        }

        // Dispatch custom event to update sidebar TOC
        window.dispatchEvent(new CustomEvent('toc-updated', { 
          detail: { toc: headings, file } 
        }))
      } catch (error) {
        console.error('Error loading markdown:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMarkdown()
  }, [file])

  // Clean up event when component unmounts
  React.useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('toc-updated', { 
        detail: { toc: [], file: null } 
      }))
    }
  }, [])

  // Show loading skeleton to prevent layout shift - Optimized for sidebar layout
  if (isLoading) {
    return (
      <div className="w-full">
        {/* Header skeleton */}
        <header className="mb-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
        </header>

        {/* Profile card skeleton for about page */}
        {file === 'about' && (
          <div className="not-prose mb-12">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        )}

        {/* Content skeleton - Preserve space to prevent layout shift */}
        <div className="space-y-6 min-h-[1000px]">
          {/* Simulate multiple sections */}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              {i % 2 === 0 && <Skeleton className="h-32 w-full mt-4" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none">
      <div className="w-full">
        {/* Header with h1 title */}
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

        {/* Add the profile card for about page */}
        {file === 'about' && (
          <div className="not-prose mb-12">
            <AboutProfileCard />
          </div>
        )}

        {/* Markdown Content */}
        <article
          className={cn(
            "prose prose-neutral dark:prose-invert max-w-none w-full",
            "prose-headings:scroll-m-20 prose-headings:tracking-tight",
            "prose-h1:text-4xl prose-h1:font-extrabold",
            "prose-h2:text-3xl prose-h2:font-semibold prose-h2:border-b prose-h2:pb-2",
            "prose-h3:text-2xl prose-h3:font-semibold",
            "prose-h4:text-xl prose-h4:font-semibold",
            "prose-p:leading-7",
            "prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic",
            "prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm",
            "prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted prose-pre:p-4"
          )}
        >
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
                <pre className="overflow-x-auto rounded-lg border bg-muted p-4 w-full" {...props}>
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
                <div className="my-6 w-full overflow-x-auto">
                  <table className="w-full border-collapse border border-border table-fixed" {...props}>
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
                <th className="border border-border px-4 py-2 text-left font-bold min-w-[120px]" {...props}>
                  {children}
                </th>
              ),
              td: ({ children, ...props }) => (
                <td className="border border-border px-4 py-2 min-w-[120px]" {...props}>
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}