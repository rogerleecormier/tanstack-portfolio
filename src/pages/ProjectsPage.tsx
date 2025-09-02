import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import slugify from 'slugify'

import { Separator } from '@/components/ui/separator'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Skeleton } from '@/components/ui/skeleton'
import { H1, H2, P, Blockquote } from "@/components/ui/typography";
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Tag } from "lucide-react";
import { UnifiedRelatedContent } from '@/components/UnifiedRelatedContent'
import UnifiedChartRenderer from '@/components/UnifiedChartRenderer'
import UnifiedTableRenderer from '@/components/UnifiedTableRenderer'
import { getProjectItem, getPortfolioItem } from '@/utils/r2PortfolioLoader'
import { loadBlogPost } from '@/utils/blogUtils'


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



export default function ProjectsPage({ file }: { file: string }) {
  const [content, setContent] = React.useState<string>('')
  const [frontmatter, setFrontmatter] = React.useState<Frontmatter>({})
  const [isLoading, setIsLoading] = React.useState(true)

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [file]); // Use [file] as dependency instead of location.pathname

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
    url: window.location.pathname, // Use window.location instead of location.pathname
    type: getContentType(file),
    author: frontmatter.author,
    publishedTime: frontmatter.date
  })

  // Load markdown content and extract TOC
  React.useEffect(() => {
    const loadMarkdown = async () => {
      setIsLoading(true)
      try {
        console.log('Loading markdown file:', file)
        
        // Load content from API worker based on file type
        let content = ''
        let frontmatterData: Frontmatter = {}
        
        if (file.startsWith('projects/')) {
          // Handle project files
          const fileName = file.replace('projects/', '')
          const projectItem = await getProjectItem(fileName)
          if (projectItem) {
            content = projectItem.content
            frontmatterData = {
              title: projectItem.title,
              description: projectItem.description,
              tags: projectItem.tags,
              keywords: projectItem.keywords,
              date: projectItem.date
            }
          }
        } else if (file.startsWith('portfolio/')) {
          // Handle portfolio files
          const fileName = file.replace('portfolio/', '')
          const portfolioItem = await getPortfolioItem(fileName)
          if (portfolioItem) {
            content = portfolioItem.content
            frontmatterData = {
              title: portfolioItem.title,
              description: portfolioItem.description,
              tags: portfolioItem.tags,
              keywords: portfolioItem.keywords,
              date: portfolioItem.date
            }
          }
        } else if (file.startsWith('blog/')) {
          // Handle blog files
          const fileName = file.replace('blog/', '')
          const blogPost = await loadBlogPost(fileName)
          if (blogPost) {
            content = blogPost.content
            frontmatterData = {
              title: blogPost.title,
              description: blogPost.description,
              tags: blogPost.tags,
              keywords: blogPost.keywords,
              date: blogPost.date,
              author: blogPost.author
            }
          }
        } else {
          // Handle root level files (fallback) - TODO: implement about page loading
          console.log('Root level file loading not yet implemented')
        }
        
        if (content) {
          // Set frontmatter
          setFrontmatter(frontmatterData)
          
          // Set content
          setContent(content)

          // Extract headings for TOC - ONLY H2 headings
          const headingRegex = /^#{2}\s+(.+)$/gm
          const headings: TOCEntry[] = []
          const seenSlugs = new Set<string>()
          let match

          while ((match = headingRegex.exec(content)) !== null) {
            const title = match[1].trim()
            let slug = slugify(title, { lower: true, strict: true })
            
            // Handle duplicate slugs by adding a number suffix
            let counter = 1
            while (seenSlugs.has(slug)) {
              slug = `${slugify(title, { lower: true, strict: true })}-${counter}`
              counter++
            }
            
            seenSlugs.add(slug)
            headings.push({ title, slug })
          }

          // Dispatch custom event to update sidebar TOC
          window.dispatchEvent(new CustomEvent('toc-updated', { 
            detail: { toc: headings, file } 
          }))
        } else {
          console.error('No content loaded for file:', file)
        }
      } catch (error) {
        console.error('Error loading markdown for file:', file, error)
        console.error('Full error details:', error)
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
         {(file === 'about' || file === 'portfolio/about') && (
                       <div className="mb-12">
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
    <div className="w-full">
      {/* Check if this is a portfolio or project page to determine layout */}
      {file.startsWith('portfolio/') || file.startsWith('projects/') ? (
        // Two-column layout for portfolio/project pages
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-3">
            {/* Header with h1 title */}
            {frontmatter.title && (
              <header className="mb-8">
                <H1 className="mb-4">
                  {frontmatter.title}
                </H1>
                {frontmatter.description && (
                  <P className="text-xl text-muted-foreground leading-7">
                    {frontmatter.description}
                  </P>
                )}
                {frontmatter.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {(() => {
                      // Deduplicate tags by converting to lowercase for comparison
                      const uniqueTags = [...new Set(frontmatter.tags.map(tag => tag.toLowerCase()))];
                      
                      // Format tags with proper title case
                      const formatTag = (tag: string) => {
                        const commonWords = ['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
                        const acronyms = ['ai', 'ml', 'api', 'ui', 'ux', 'devops', 'saas', 'pmp', 'pmi', 'ide', 'erp', 'ap'];
                        
                        return tag.split(' ').map((word, index) => {
                          const lowerWord = word.toLowerCase();
                          
                          // Handle acronyms - always uppercase
                          if (acronyms.includes(lowerWord)) {
                            return lowerWord.toUpperCase();
                          }
                          
                          // Handle connected words with acronyms (e.g., "API-first", "AI-powered")
                          // Split by hyphens and process each part
                          if (word.includes('-')) {
                            const parts = word.split('-');
                            return parts.map((part) => {
                              const lowerPart = part.toLowerCase();
                              
                              // Check if this part is an acronym
                              if (acronyms.includes(lowerPart)) {
                                return lowerPart.toUpperCase();
                              }
                              
                              // For non-acronym parts, apply title case
                              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                            }).join('-');
                          }
                          
                          // Always capitalize first word, capitalize others unless they're common words
                          if (index === 0 || !commonWords.includes(lowerWord)) {
                            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                          }
                          return lowerWord;
                        }).join(' ');
                      };
                      
                      return uniqueTags.map((tag: string, index: number) => (
                        <Badge 
                          key={`${tag}-${index}`}
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5 h-auto"
                          title={formatTag(tag)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          <span className="whitespace-nowrap">{formatTag(tag)}</span>
                        </Badge>
                      ));
                    })()}
                  </div>
                )}
              </header>
            )}

            {/* Markdown Content */}
            <article className="max-w-none w-full space-y-6">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children, ...props }) => {
                const text = String(children)
                const id = slugify(text, { lower: true, strict: true })
                return (
                  <H1 id={id} {...props}>
                    {children}
                  </H1>
                )
              },
              h2: ({ children, ...props }) => {
                const text = String(children)
                const id = slugify(text, { lower: true, strict: true })
                return (
                  <H2 id={id} {...props}>
                    {children}
                  </H2>
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
                <P {...props}>
                  {children}
                </P>
              ),
              blockquote: ({ children, ...props }) => (
                <Blockquote {...props}>
                  {children}
                </Blockquote>
              ),
              code: ({ children, className, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";

                // SCATTER/BUBBLE CHARTS WITH GROUPING, BUBBLE SIZE, LABELS, CI ERROR BARS
                if (
                  language === "scatter-plot" ||
                  language === "scatterplot" ||
                  language === "scatter-trend" ||
                  language === "scattertrend"
                ) {
                  return (
                    <UnifiedChartRenderer
                      chartType="scatterplot"
                      data={String(children)}
                      chartTitle="Scatter Plot Analysis"
                      xAxisLabel="Budget (USD, scaled)"
                      yAxisLabel="Mean Complexity"
                    />
                  );
                }

                // -----------------------------
                // HISTOGRAM
                // -----------------------------
                // Expects pre-binned data: [{ "date": "<bin label>", "value": <count> }, ...]
                if (language === "histogram" || language === "histchart") {
                  return (
                    <UnifiedChartRenderer
                      chartType="histogram"
                      data={String(children)}
                      chartTitle="Histogram Analysis"
                      xAxisLabel="Budget Bins"
                      yAxisLabel="Frequency"
                    />
                  );
                }

                // Multi-series grouped bar chart
                if (language === "barchart" || language === "bar-chart") {
                  return (
                    <UnifiedChartRenderer
                      chartType="barchart"
                      data={String(children)}
                      chartTitle="Bar Chart Analysis"
                      xAxisLabel="Budget Tier"
                      yAxisLabel="Frequency"
                    />
                  );
                }

                // Multi-series line chart
                if (language === "linechart" || language === "line-chart") {
                  return (
                    <UnifiedChartRenderer
                      chartType="linechart"
                      data={String(children)}
                      chartTitle="Line Chart Analysis"
                      xAxisLabel="Budget Tier"
                      yAxisLabel="Frequency"
                    />
                  );
                }

                // Inline code and other code blocks
                const isInline = !className?.includes("language-")
                if (isInline) {
                  return (
                    <code
                      className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                }

                return (
                  <code className={`font-mono text-sm ${className || ""}`} {...props}>
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
                li: ({ children, ...props }) => (
                  <li className="mt-2" {...props}>
                    {children}
                  </li>
                ),
              hr: ({ ...props }) => (
                <Separator className="my-8" {...props} />
              ),
              table: ({ children }) => {
                return (
                  <UnifiedTableRenderer
                    content={children}
                    showSorting={true}
                  />
                )
              },
            }}
          >
            {content}
          </ReactMarkdown>
          
          {/* Contact Section at bottom of every page */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-center">
              <H2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to discuss your next project?
              </H2>
              <P className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Whether you need enterprise integration expertise, DevOps transformation, 
                or strategic technology leadership, I'm here to help bring your vision to life.
              </P>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Get in Touch
              </a>
            </div>
          </div>
        </article>
        </div>
        
                     {/* Right Sidebar */}
             <div className="lg:col-span-1">
               <div className="sticky top-36 space-y-6">
            {/* Smart Related Content Sidebar */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-sm">
              <UnifiedRelatedContent
                content={content}
                title={frontmatter.title || ''}
                tags={frontmatter.tags || []}
                currentUrl={`/projects/${file.replace('projects/', '')}`}
                maxResults={2}
                variant="sidebar"
              />
            </div>
          </div>
        </div>
        </div>
      ) : (
        // Single-column layout for other pages  
        <div>
          <article className="max-w-none w-full space-y-6">
            <ReactMarkdown 
              rehypePlugins={[rehypeRaw]} 
              remarkPlugins={[remarkGfm]}
              components={{
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
                li: ({ children, ...props }) => (
                  <li className="mt-2" {...props}>
                    {children}
                  </li>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  )
}