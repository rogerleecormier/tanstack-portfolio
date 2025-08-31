import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import slugify from 'slugify'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Skeleton } from '@/components/ui/skeleton'
import { H1, H2, P, Blockquote } from "@/components/ui/typography";
import { MessageSquare, Calendar, Clock, User, Tag, ArrowRight } from "lucide-react";
import { Link } from '@tanstack/react-router'
import NewsletterSignup from '@/components/NewsletterSignup'
import { UnifiedRelatedContent } from '@/components/UnifiedRelatedContent'
import UnifiedChartRenderer from '@/components/UnifiedChartRenderer'
import UnifiedTableRenderer from '@/components/UnifiedTableRenderer'
import { loadBlogPost, formatDate } from '@/utils/blogUtils'


// Define proper types for frontmatter
interface BlogFrontmatter {
  title?: string
  description?: string
  tags?: string[]
  date?: string
  author?: string
  keywords?: string[]
  image?: string
  readTime?: number
}

// Define TOCEntry type - export it so sidebar can use it
export type BlogTOCEntry = {
  title: string
  slug: string
  level: 2 | 3
}





export default function BlogPage({ slug }: { slug: string }) {
  const [content, setContent] = React.useState<string>('')
  const [frontmatter, setFrontmatter] = React.useState<BlogFrontmatter>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [readingTime, setReadingTime] = React.useState(0)

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  // Generate page-specific keywords
  const getPageKeywords = (tags?: string[]): string[] => {
    const baseKeywords = tags || []
    return [...baseKeywords, 'Blog', 'Article', 'Technical Writing']
  }

  // Update document title and meta tags with enhanced SEO
  useDocumentTitle({
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: getPageKeywords(frontmatter.keywords || frontmatter.tags),
    image: frontmatter.image,
    url: window.location.pathname,
    type: 'article',
    author: frontmatter.author,
    publishedTime: frontmatter.date
  })

  // Load markdown content and extract TOC
  React.useEffect(() => {
    const loadMarkdown = async () => {
      setIsLoading(true)
      try {
        // Load blog post from API worker
        const blogPost = await loadBlogPost(slug)
        
        if (blogPost) {
          // Set frontmatter
          setFrontmatter({
            title: blogPost.title,
            description: blogPost.description,
            tags: blogPost.tags,
            date: blogPost.date,
            author: blogPost.author,
            keywords: blogPost.keywords,
            image: blogPost.image,
            readTime: blogPost.readTime
          })
          
          // Set content
          setContent(blogPost.content)
          
          // Set reading time
          setReadingTime(blogPost.readTime)

          // Extract headings for content analysis (used by related content service)
          const headingRegex = /^#{2,3}\s+(.+)$/gm
          const headings: BlogTOCEntry[] = []
          let match

          while ((match = headingRegex.exec(blogPost.content)) !== null) {
            const title = match[1].trim()
            const headingSlug = slugify(title, { lower: true, strict: true })
            const level = match[0].match(/^#+/)?.[0].length || 2
            headings.push({ title, slug: headingSlug, level: level as 2 | 3 })
          }
        } else {
          console.error('Blog post not found:', slug)
        }
      } catch (error) {
        console.error('Error loading blog markdown:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMarkdown()
  }, [slug])



  // Show loading skeleton
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

        {/* Content skeleton */}
        <div className="space-y-6 min-h-[1000px]">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              {i % 2 === 0 && <Skeleton className="h-32 w-full mt-4" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (!frontmatter.title) { // Changed from blogPost to frontmatter.title
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <H1>Blog Post Not Found</H1>
          <P className="mt-4">
            The requested blog post could not be found.
          </P>
          <Link to="/blog" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800">
            <ArrowRight className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">


      {/* Main Content with Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Blog Header */}
          {frontmatter.title && (
            <header className="mb-8">
              {/* Header Image */}
              {frontmatter.image && (
                <div className="mb-6">
                  <img 
                    src={frontmatter.image} 
                    alt={frontmatter.title}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}
              
              <H1 className="mb-4 text-4xl font-bold leading-tight">
                {frontmatter.title}
              </H1>
              {frontmatter.description && (
                <P className="text-xl text-muted-foreground leading-7 mb-6">
                  {frontmatter.description}
                </P>
              )}
              
              {/* Blog Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {frontmatter.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{frontmatter.author}</span>
                  </div>
                )}
                {frontmatter.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(frontmatter.date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {/* Tags */}
              {frontmatter.tags && (
                <div className="flex flex-wrap gap-1.5">
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
                        key={`${frontmatter.title}-${tag}-${index}`}
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

          {/* Blog Content */}
          <article
            className={cn(
              "prose prose-neutral dark:prose-invert max-w-none w-full",
              "prose-headings:tracking-tight",
              "prose-h1:text-4xl prose-h1:font-extrabold",
              "prose-h2:text-3xl prose-h2:font-semibold prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12 prose-h2:mb-6",
              "prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4",
              "prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-3",
              "prose-p:leading-7 prose-p:text-base",
              "prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-teal-50 prose-blockquote:py-2 prose-blockquote:rounded-r",
              "prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm",
              "prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted prose-pre:p-4",
              "prose-strong:font-semibold prose-strong:text-gray-900",
              "prose-a:text-teal-600 prose-a:no-underline hover:prose-a:text-teal-700 hover:prose-a:underline",
              "prose-img:rounded-lg prose-img:shadow-md"
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
                    <H1 id={id} {...props}>
                      {children}
                    </H1>
                  )
                },
                h2: ({ children, ...props }) => {
                  const text = String(children)
                  const id = slugify(text, { lower: true, strict: true })
                  return (
                    <H2 id={id} className="scroll-m-20" {...props}>
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

                  // Default code block
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
            
            {/* Blog Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="text-center">
                <H2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Enjoyed this article?
                </H2>
                <P className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  If you found this helpful, consider sharing it with your network or reaching out to discuss how we can apply these concepts to your projects.
                </P>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-white" />
                    <span className="text-white">Get in Touch</span>
                  </a>
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-teal-700 border border-teal-300 px-6 py-3 rounded-lg font-medium transition-colors dark:bg-teal-50 dark:hover:bg-teal-100 dark:text-teal-800 dark:border-teal-300"
                  >
                    <Calendar className="h-4 w-4 text-teal-700 dark:text-teal-800" />
                    <span className="text-teal-700 dark:text-teal-800">Read More Articles</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <NewsletterSignup 
              title="Stay Updated"
              description="Get notified when I publish new articles like this one."
            />
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
                currentUrl={`/blog/${slug}`}
                maxResults={2}
                variant="sidebar"
              />
            </div>

            {/* Additional Sidebar Content */}
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4">About the Author</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Roger Lee Cormier is a technology leader and consultant with expertise in DevOps, 
                AI automation, and organizational transformation.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
              >
                Learn more about Roger
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
