import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import slugify from 'slugify';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import NewsletterSignup from '@/components/NewsletterSignup';
import { Skeleton } from '@/components/ui/skeleton';
import { Blockquote, H1, H2, P } from '@/components/ui/typography';
import UnifiedChartRenderer from '@/components/UnifiedChartRenderer';
import { UnifiedRelatedContent } from '@/components/UnifiedRelatedContent';
import UnifiedTableRenderer from '@/components/UnifiedTableRenderer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, loadBlogPost } from '@/utils/blogUtils';
import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  User,
} from 'lucide-react';

// Define proper types for frontmatter
interface BlogFrontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  author?: string;
  keywords?: string[];
  image?: string;
  readTime?: number;
}

// Define TOCEntry type - export it so sidebar can use it
export type BlogTOCEntry = {
  title: string;
  slug: string;
  level: 2;
};

export default function BlogPage({ slug }: { slug: string }) {
  const [content, setContent] = React.useState<string>('');
  const [frontmatter, setFrontmatter] = React.useState<BlogFrontmatter>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [readingTime, setReadingTime] = React.useState(0);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  // Generate page-specific keywords
  const getPageKeywords = (tags?: string[]): string[] => {
    const baseKeywords = tags ?? [];
    return [...baseKeywords, 'Blog', 'Article', 'Technical Writing'];
  };

  // Update document title and meta tags with enhanced SEO
  useDocumentTitle({
    ...(frontmatter.title && { title: frontmatter.title }),
    ...(frontmatter.description && { description: frontmatter.description }),
    keywords: getPageKeywords(frontmatter.keywords ?? frontmatter.tags),
    ...(frontmatter.image && { image: frontmatter.image }),
    url: window.location.pathname,
    type: 'article',
    ...(frontmatter.author && { author: frontmatter.author }),
    ...(frontmatter.date && { publishedTime: frontmatter.date }),
  });

  // Load markdown content and extract TOC
  React.useEffect(() => {
    const loadMarkdown = () => {
      setIsLoading(true);
      try {
        // Load blog post from API worker
        const blogPost = loadBlogPost(slug);

        if (blogPost) {
          // Set frontmatter
          setFrontmatter({
            title: blogPost.title,
            description: blogPost.description,
            tags: blogPost.tags,
            ...(blogPost.date && { date: blogPost.date }),
            author: blogPost.author,
            keywords: blogPost.keywords,
            ...(blogPost.image && { image: blogPost.image }),
            readTime: blogPost.readTime,
          });

          // Set content
          setContent(blogPost.content);

          // Set reading time
          setReadingTime(blogPost.readTime);

          // Extract headings for TOC - ONLY H2 headings
          const headingRegex = /^#{2}\s+(.+)$/gm;
          const headings: BlogTOCEntry[] = [];
          const seenSlugs = new Set<string>();
          let match;

          while ((match = headingRegex.exec(blogPost.content)) !== null) {
            const title = match[1]?.trim();
            if (!title) continue;
            let headingSlug = slugify(title, { lower: true, strict: true });

            // Handle duplicate slugs by adding a number suffix
            let counter = 1;
            while (seenSlugs.has(headingSlug)) {
              headingSlug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
              counter++;
            }

            seenSlugs.add(headingSlug);
            headings.push({ title, slug: headingSlug, level: 2 });
          }

          // Dispatch custom event to update sidebar TOC
          window.dispatchEvent(
            new CustomEvent('blog-toc-updated', {
              detail: { toc: headings, file: slug },
            })
          );
        } else {
          console.error('Blog post not found:', slug);
        }
      } catch (error) {
        console.error('Error loading blog markdown:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkdown();
  }, [slug]);

  // Clean up event when component unmounts
  React.useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent('blog-toc-updated', {
          detail: { toc: [], file: null },
        })
      );
    };
  }, []);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className='w-full'>
        {/* Header skeleton */}
        <header className='mb-8'>
          <Skeleton className='mb-4 h-12 w-3/4' />
          <Skeleton className='mb-2 h-6 w-full' />
          <Skeleton className='mb-4 h-6 w-2/3' />
          <div className='flex gap-2'>
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-6 w-20' />
            <Skeleton className='h-6 w-14' />
          </div>
        </header>

        {/* Content skeleton */}
        <div className='min-h-[1000px] space-y-6'>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className='space-y-4'>
              <Skeleton className='h-8 w-1/2' />
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-6 w-3/4' />
              {i % 2 === 0 && <Skeleton className='mt-4 h-32 w-full' />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (!frontmatter.title) {
    // Changed from blogPost to frontmatter.title
    return (
      <div className='container mx-auto max-w-4xl px-4 py-8'>
        <div className='text-center'>
          <H1>Blog Post Not Found</H1>
          <P className='mt-4'>The requested blog post could not be found.</P>
          <Link
            to='/blog'
            className='mt-4 inline-flex items-center text-blue-600 hover:text-blue-800'
          >
            <ArrowRight className='mr-2 size-4' />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Main Content with Sidebar Layout */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        {/* Main Content Area */}
        <div className='lg:col-span-3'>
          {/* Blog Header */}
          {frontmatter.title && (
            <header className='mb-8 border-b border-hunter-600/20 pb-8'>
              {/* Header Image */}
              {frontmatter.image && (
                <div className='mb-6'>
                  <img
                    src={frontmatter.image}
                    alt={frontmatter.title}
                    className='h-64 w-full rounded-lg object-cover shadow-lg'
                  />
                </div>
              )}

              <H1 className='mb-4 text-4xl font-bold leading-tight text-white'>
                {frontmatter.title}
              </H1>
              {frontmatter.description && (
                <P className='mb-6 text-lg leading-7 text-slate-300'>
                  {frontmatter.description}
                </P>
              )}

              {/* Blog Meta Information */}
              <div className='mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-400'>
                {frontmatter.author && (
                  <div className='flex items-center gap-2'>
                    <User className='size-4' />
                    <span>{frontmatter.author}</span>
                  </div>
                )}
                {frontmatter.date && (
                  <div className='flex items-center gap-2'>
                    <Calendar className='size-4' />
                    <span>{formatDate(frontmatter.date)}</span>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <Clock className='size-4' />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {/* Tags */}
              {frontmatter.tags && (
                <div className='flex flex-wrap gap-1.5'>
                  {(() => {
                    // Deduplicate tags by converting to lowercase for comparison
                    const uniqueTags = [
                      ...new Set(
                        frontmatter.tags.map(tag => tag.toLowerCase())
                      ),
                    ];

                    // Format tags with proper title case
                    const formatTag = (tag: string) => {
                      const commonWords = [
                        'and',
                        'or',
                        'the',
                        'a',
                        'an',
                        'in',
                        'on',
                        'at',
                        'to',
                        'for',
                        'of',
                        'with',
                        'by',
                      ];
                      const acronyms = [
                        'ai',
                        'ml',
                        'api',
                        'ui',
                        'ux',
                        'devops',
                        'saas',
                        'pmp',
                        'pmi',
                        'ide',
                        'erp',
                        'ap',
                      ];

                      return tag
                        .split(' ')
                        .map((word, index) => {
                          const lowerWord = word.toLowerCase();

                          // Handle acronyms - always uppercase
                          if (acronyms.includes(lowerWord)) {
                            return lowerWord.toUpperCase();
                          }

                          // Handle connected words with acronyms (e.g., "API-first", "AI-powered")
                          // Split by hyphens and process each part
                          if (word.includes('-')) {
                            const parts = word.split('-');
                            return parts
                              .map(part => {
                                const lowerPart = part.toLowerCase();

                                // Check if this part is an acronym
                                if (acronyms.includes(lowerPart)) {
                                  return lowerPart.toUpperCase();
                                }

                                // For non-acronym parts, apply title case
                                return (
                                  part.charAt(0).toUpperCase() +
                                  part.slice(1).toLowerCase()
                                );
                              })
                              .join('-');
                          }

                          // Always capitalize first word, capitalize others unless they're common words
                          if (index === 0 || !commonWords.includes(lowerWord)) {
                            return (
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                            );
                          }
                          return lowerWord;
                        })
                        .join(' ');
                    };

                    return uniqueTags.map((tag: string, index: number) => (
                      <Badge
                        key={`${frontmatter.title}-${tag}-${index}`}
                        className='border-hunter-600/40 bg-hunter-600/15 text-hunter-300'
                        title={formatTag(tag)}
                      >
                        <Tag className='mr-1 size-3' />
                        <span className='whitespace-nowrap'>
                          {formatTag(tag)}
                        </span>
                      </Badge>
                    ));
                  })()}
                </div>
              )}
            </header>
          )}

          {/* Blog Content */}
          <article className='w-full max-w-none space-y-6'>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children, ...props }) => {
                  const text = typeof children === 'string' ? children : '';
                  const id = slugify(text, { lower: true, strict: true });
                  return (
                    <H1 id={id} {...props}>
                      {children}
                    </H1>
                  );
                },
                h2: ({ children, ...props }) => {
                  const text = typeof children === 'string' ? children : '';
                  const id = slugify(text, { lower: true, strict: true });
                  return (
                    <H2 id={id} className='scroll-m-20' {...props}>
                      {children}
                    </H2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const text = typeof children === 'string' ? children : '';
                  const id = slugify(text, { lower: true, strict: true });
                  return (
                    <h3
                      id={id}
                      className='scroll-m-20 text-2xl font-semibold tracking-tight text-white'
                      {...props}
                    >
                      {children}
                    </h3>
                  );
                },
                p: ({ children, ...props }) => (
                  <P className='text-slate-300' {...props}>
                    {children}
                  </P>
                ),
                blockquote: ({ children, ...props }) => (
                  <Blockquote {...props}>{children}</Blockquote>
                ),
                code: ({ children, className, ...props }) => {
                  const match = /language-(\w+)/.exec(className ?? '');
                  const language = match ? match[1] : '';

                  // SCATTER/BUBBLE CHARTS WITH GROUPING, BUBBLE SIZE, LABELS, CI ERROR BARS
                  if (
                    language === 'scatter-plot' ||
                    language === 'scatterplot' ||
                    language === 'scatter-trend' ||
                    language === 'scattertrend'
                  ) {
                    return (
                      <UnifiedChartRenderer
                        chartType='scatterplot'
                        data={typeof children === 'string' ? children : ''}
                        chartTitle='Scatter Plot Analysis'
                        xAxisLabel='Budget (USD, scaled)'
                        yAxisLabel='Mean Complexity'
                      />
                    );
                  }

                  // Multi-series grouped bar chart
                  if (language === 'barchart' || language === 'bar-chart') {
                    return (
                      <UnifiedChartRenderer
                        chartType='barchart'
                        data={typeof children === 'string' ? children : ''}
                        chartTitle='Bar Chart Analysis'
                        xAxisLabel='Budget Tier'
                        yAxisLabel='Frequency'
                      />
                    );
                  }

                  // Multi-series line chart
                  if (language === 'linechart' || language === 'line-chart') {
                    return (
                      <UnifiedChartRenderer
                        chartType='linechart'
                        data={typeof children === 'string' ? children : ''}
                        chartTitle='Line Chart Analysis'
                        xAxisLabel='Budget Tier'
                        yAxisLabel='Frequency'
                      />
                    );
                  }

                  // -----------------------------
                  // HISTOGRAM
                  // -----------------------------
                  // Expects pre-binned data: [{ "date": "<bin label>", "value": <count> }, ...]
                  if (language === 'histogram' || language === 'histchart') {
                    return (
                      <UnifiedChartRenderer
                        chartType='histogram'
                        data={typeof children === 'string' ? children : ''}
                        chartTitle='Histogram Analysis'
                        xAxisLabel='Budget Bins'
                        yAxisLabel='Frequency'
                      />
                    );
                  }

                  // Default code block
                  return (
                    <code
                      className={`font-mono text-sm ${className ?? ''}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children, ...props }) => (
                  <pre
                    className='w-full overflow-x-auto rounded-lg border bg-muted p-4'
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                ul: ({ children, ...props }) => (
                  <ul className='my-6 ml-6 list-disc [&>li]:mt-2' {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className='my-6 ml-6 list-decimal [&>li]:mt-2' {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className='mt-2' {...props}>
                    {children}
                  </li>
                ),
                hr: ({ ...props }) => <Separator className='my-8' {...props} />,
                table: ({ children }) => {
                  return (
                    <UnifiedTableRenderer
                      content={children}
                      showSorting={true}
                    />
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>

            {/* Blog Footer */}
            <div className='mt-16 border-t border-hunter-600/20 pt-8'>
              <div className='text-center'>
                <H2 className='mb-4 text-2xl font-semibold text-white'>
                  Enjoyed this article?
                </H2>
                <P className='mx-auto mb-6 max-w-2xl text-slate-300'>
                  If you found this helpful, consider sharing it with your
                  network or reaching out to discuss how we can apply these
                  concepts to your projects.
                </P>
                <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                  <a
                    href='/contact'
                    className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-hunter-600 to-hunter-500 px-6 py-3 font-medium text-white transition-all hover:from-hunter-500 hover:to-hunter-400'
                  >
                    <MessageSquare className='size-4' />
                    <span>Get in Touch</span>
                  </a>
                  <Link
                    to='/blog'
                    className='inline-flex items-center gap-2 rounded-lg border border-hunter-600/40 bg-transparent px-6 py-3 font-medium text-hunter-400 transition-colors hover:border-hunter-600/60 hover:bg-hunter-600/10'
                  >
                    <Calendar className='size-4' />
                    <span>Read More Articles</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <NewsletterSignup
              title='Stay Updated'
              description='Get notified when I publish new articles like this one.'
            />
          </article>
        </div>

        {/* Right Sidebar */}
        <div className='lg:col-span-1'>
          <div className='sticky top-36 space-y-6'>
            {/* Smart Related Content Sidebar */}
            <div className='rounded-xl border border-hunter-600/20 bg-slate-900/40 p-6 backdrop-blur-sm'>
              <UnifiedRelatedContent
                content={content}
                title={frontmatter.title ?? ''}
                tags={frontmatter.tags ?? []}
                currentUrl={`/blog/${slug}`}
                maxResults={4}
                variant='sidebar'
                dynamicHeight={false}
              />
            </div>

            {/* Additional Sidebar Content */}
            <div className='rounded-xl border border-border bg-muted/50 p-6'>
              <h3 className='mb-4 text-lg font-semibold'>About the Author</h3>
              <p className='mb-4 text-sm text-muted-foreground'>
                Roger Lee Cormier is a technology leader and consultant with
                expertise in DevOps, AI automation, and organizational
                transformation.
              </p>
              <Link
                to='/about'
                className='inline-flex items-center gap-2 text-sm font-medium text-hunter-600 transition-colors hover:text-hunter-700'
              >
                Learn more about Roger
                <ArrowRight className='size-3' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
