import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import fm from 'front-matter'
import slugify from 'slugify'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Skeleton } from '@/components/ui/skeleton'
import { H1, H2, P, Blockquote } from "@/components/ui/typography";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Label, Legend, Tooltip as RechartsTooltip, LineChart, Line, ScatterChart, Scatter, ZAxis, ResponsiveContainer, LabelList, ErrorBar } from "recharts";
import { MessageSquare, Calendar, Clock, User, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from '@tanstack/react-router'
import NewsletterSignup from '@/components/NewsletterSignup'
import BlogRecommendations from '@/components/BlogRecommendations'

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
}

function parseChartData(code: string) {
  try {
    return JSON.parse(code.trim());
  } catch {
    return [];
  }
}

interface ChartDataPoint {
  date: string;
  x?: number;
  y?: number;
  series?: string;
  n?: number;
  [key: string]: string | number | undefined;
}

function getSeriesKeys(data: ChartDataPoint[]) {
  if (!Array.isArray(data) || data.length === 0) return [];
  // Exclude 'date' key
  return Object.keys(data[0]).filter((key) => key !== "date");
}

// Calculate reading time based on word count
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Format date for display
function formatDate(dateString: string): string {
  // Create date and adjust for timezone to ensure it displays as the intended date
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
        // Import markdown directly from src/content/blog
        const markdownModule = await import(`../content/blog/${slug}.md?raw`)
        const text = markdownModule.default

        // Parse frontmatter
        const { attributes, body } = fm(text)
        setFrontmatter(attributes as BlogFrontmatter)
        
        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim()
        setContent(cleanedBody)

        // Calculate reading time
        const calculatedReadingTime = calculateReadingTime(cleanedBody)
        setReadingTime(frontmatter.readTime || calculatedReadingTime)

        // Extract headings for TOC - ONLY H2 headings
        const headingRegex = /^#{2}\s+(.+)$/gm
        const headings: BlogTOCEntry[] = []
        let match

        while ((match = headingRegex.exec(cleanedBody)) !== null) {
          const title = match[1].trim()
          const slug = slugify(title, { lower: true, strict: true })
          headings.push({ title, slug })
        }

        // Dispatch custom event to update sidebar TOC
        window.dispatchEvent(new CustomEvent('blog-toc-updated', { 
          detail: { toc: headings, slug } 
        }))
      } catch (error) {
        console.error('Error loading blog markdown:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMarkdown()
  }, [slug, frontmatter.readTime])

  // Clean up event when component unmounts
  React.useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('blog-toc-updated', { 
        detail: { toc: [], slug: null } 
      }))
    }
  }, [])

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

  return (
    <div className="w-full">
      {/* Back to Blog Link */}
      <div className="mb-6">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </div>

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
                <div className="flex flex-wrap gap-2">
                  {frontmatter.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
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
                    const chartData = parseChartData(String(children));
                    if (!Array.isArray(chartData) || chartData.length === 0) {
                      return <div className="text-red-500">Invalid chart data</div>;
                    }
                    // Group by series (optional). If no 'series', treat as single series named 'Data'.
                    const groups: Record<string, ChartDataPoint[]> = {};
                    for (const d of chartData) {
                      const key = d.series ?? "Data";
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(d);
                    }
                    const xs = chartData.map(d => Number(d.x));
                    const ys = chartData.map(d => Number(d.y));
                    const xMin = Math.min(...xs), xMax = Math.max(...xs);
                    const yMin = Math.min(...ys), yMax = Math.max(...ys);
                    const xPad = (xMax - xMin) * 0.05 || 1;
                    const yPad = (yMax - yMin) * 0.05 || 1;
                    const colors = ["#0d9488", "#64748b", "#f59e42", "#e11d48", "#6366f1"];
                    const seriesNames = Object.keys(groups);
                    // Total n per series for legend formatting
                    const seriesTotals: Record<string, number> = Object.fromEntries(
                      seriesNames.map((name) => [name, groups[name].reduce((acc, d) => acc + (Number(d.n) || 0), 0)])
                    );

                    // Simple linear regression for each series (least squares)
                    const getTrendLine = (data: ChartDataPoint[]) => {
                      if (data.length < 2) return [];
                      const n = data.length;
                      const sumX = data.reduce((acc, d) => acc + Number(d.x), 0);
                      const sumY = data.reduce((acc, d) => acc + Number(d.y), 0);
                      const sumXY = data.reduce((acc, d) => acc + Number(d.x) * Number(d.y), 0);
                      const sumX2 = data.reduce((acc, d) => acc + Number(d.x) ** 2, 0);
                      
                      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
                      const intercept = (sumY - slope * sumX) / n;
                      
                      const minX = Math.min(...data.map(d => Number(d.x)));
                      const maxX = Math.max(...data.map(d => Number(d.x)));
                      
                      return [
                        { x: minX, y: slope * minX + intercept },
                        { x: maxX, y: slope * maxX + intercept }
                      ];
                    };

                    function formatCurrency(value: number) {
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(2)}M`;
                      }
                      if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}K`;
                      }
                      return `$${value.toFixed(0)}`;
                    }
                    function formatComplexity(value: number) {
                      return value.toFixed(2);
                    }
                    function formatCount(value: number) {
                      return `${value} projects`;
                    }

                    return (
                      <div className="w-full my-6" style={{ minHeight: 320 }}>
                        <ResponsiveContainer width="100%" height={320}>
                          <ScatterChart
                            data={chartData}
                            margin={{ left: 32, right: 32, bottom: 20 }}
                          >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              dataKey="x"
                              domain={[xMin - xPad, xMax + xPad]}
                              tickFormatter={formatCurrency}
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                            >
                              <Label value="Budget (USD, scaled)" offset={-50} position="insideBottom" />
                            </XAxis>
                            <YAxis
                              type="number"
                              dataKey="y"
                              domain={[yMin - yPad, yMax + yPad]}
                              tickFormatter={formatComplexity}
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                            >
                              <Label value="Mean Complexity" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                            </YAxis>
                            <Legend formatter={(value: string) => {
                              const total = seriesTotals?.[value];
                              return total ? `${value} — Mean Complexity (n=${total})` : `${value} — Mean Complexity`;
                            }} />
                            <RechartsTooltip
                              formatter={(value: number, name: string) => {
                                if (name === "x") return formatCurrency(value);
                                if (name === "y") return [`${formatComplexity(value)}`, "Mean Complexity"];
                                if (name === "n") return formatCount(value);
                                return value;
                              }}
                              labelFormatter={(label) => formatCurrency(label)}
                            />
                            {seriesNames.map((name, i) => (
                              <Scatter key={name} name={name} data={groups[name]} fill={colors[i % colors.length]}>
                                <ZAxis dataKey="n" range={[60, 300]} />
                                {/* Optional 95% CI error bars if ciLow/ciHigh are provided */}
                                <ErrorBar dataKey="ciLow" strokeOpacity={0.7} />
                                <ErrorBar dataKey="ciHigh" strokeOpacity={0.7} />
                                {/* Label each point with its budget tier */}
                                <LabelList dataKey="group" position="top" />
                              </Scatter>
                            ))}
                            {(language === "scatter-trend" || language === "scattertrend") && seriesNames.map((name, i) => {
                              const trend = getTrendLine(groups[name]);
                              return trend.length === 2 ? (
                                <Scatter
                                  key={name + "-trend"}
                                  data={trend}
                                  line
                                  fill={colors[i % colors.length]}
                                  legendType="none"
                                />
                              ) : null;
                            })}
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    )
                  }

                  // Multi-series grouped bar chart
                  if (language === "barchart" || language === "bar-chart") {
                    const chartData = parseChartData(String(children))
                    if (!Array.isArray(chartData) || chartData.length === 0) {
                      return <div className="text-red-500">Invalid chart data</div>
                    }
                    const seriesKeys = getSeriesKeys(chartData)
                    const allValues = chartData.flatMap(d => seriesKeys.map(k => d[k]))
                    const min = Math.min(...allValues)
                    const max = Math.max(...allValues)
                    const padding = Math.max(2, Math.round((max - min) * 0.05))
                    const yDomain = [
                      Number((min - padding).toFixed(3)),
                      Number((max + padding).toFixed(3))
                    ]
                    const colors = ["#0d9488", "#64748b", "#f59e42", "#e11d48", "#6366f1"]

                    return (
                      <div className="w-full my-6" style={{ minHeight: 320 }}>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart
                            data={chartData}
                            margin={{ left: 32, right: 32, bottom: 20 }}
                          >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                              tickFormatter={(value) => value}
                            >
                              <Label value="Budget Tier" offset={-50} position="insideBottom" />
                            </XAxis>
                            <YAxis
                              domain={yDomain}
                              tickFormatter={(value) => Number(value).toFixed(3)}
                            >
                              <Label value="Frequency" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                            </YAxis>
                            <Legend />
                            <RechartsTooltip
                              formatter={(value: number, name: string, props: { payload?: Record<string, unknown> }) => {
                                // If per-series count is provided (e.g., Agile_n), show alongside value
                                const perSeriesN = props?.payload?.[`${name}_n`];
                                const globalN = props?.payload?.n;
                                if (perSeriesN != null) return [`${value} (n=${perSeriesN})`, name];
                                if (globalN != null) return [`${value} (n=${globalN})`, name];
                                return [value, name];
                              }}
                            />
                            {seriesKeys.map((key, i) => (
                              <Bar
                                key={key}
                                dataKey={key}
                                fill={colors[i % colors.length]}
                                isAnimationActive={false}
                                radius={[4, 4, 0, 0]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )
                  }

                  // Multi-series line chart
                  if (language === "linechart" || language === "line-chart") {
                    const chartData = parseChartData(String(children))
                    if (!Array.isArray(chartData) || chartData.length === 0) {
                      return <div className="text-red-500">Invalid chart data</div>
                    }
                    const seriesKeys = getSeriesKeys(chartData)
                    const allValues = chartData.flatMap(d => seriesKeys.map(k => d[k]))
                    const min = Math.min(...allValues)
                    const max = Math.max(...allValues)
                    const padding = Math.max(2, Math.round((max - min) * 0.05))
                    const yDomain = [
                      Number((min - padding).toFixed(3)),
                      Number((max + padding).toFixed(3))
                    ]
                    const colors = ["#0d9488", "#64748b", "#f59e42", "#e11d48", "#6366f1"]

                    return (
                      <div className="w-full my-6" style={{ minHeight: 320 }}>
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart
                            data={chartData}
                            margin={{ left: 32, right: 32, bottom: 20 }}
                          >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                              tickFormatter={(value) => value}
                            >
                              <Label value="Budget Tier" offset={-50} position="insideBottom" />
                            </XAxis>
                            <YAxis
                              domain={yDomain}
                              tickFormatter={(value) => Number(value).toFixed(3)}
                            >
                              <Label value="Frequency" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                            </YAxis>
                            <Legend />
                            <RechartsTooltip
                              formatter={(value: number, name: string, props: { payload?: Record<string, unknown> }) => {
                                // If per-series count is provided (e.g., Agile_n), show alongside value
                                const perSeriesN = props?.payload?.[`${name}_n`];
                                const globalN = props?.payload?.n;
                                if (perSeriesN != null) return [`${value} (n=${perSeriesN})`, name];
                                if (globalN != null) return [`${value} (n=${globalN})`, name];
                                return [value, name];
                              }}
                            />
                            {seriesKeys.map((key, i) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[i % colors.length]}
                                strokeWidth={2}
                                dot={{ fill: colors[i % colors.length], strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                                isAnimationActive={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )
                  }

                  // -----------------------------
                  // HISTOGRAM
                  // -----------------------------
                  // Expects pre-binned data: [{ "date": "<bin label>", "value": <count> }, ...]
                  if (language === "histogram" || language === "histchart") {
                    const chartData = parseChartData(String(children))
                    if (!Array.isArray(chartData) || chartData.length === 0) {
                      return <div className="text-red-500">Invalid chart data</div>
                    }
                    const seriesKeys = ["value"]
                    const allValues = chartData.flatMap(d => seriesKeys.map(k => d[k]))
                    const min = Math.min(...allValues)
                    const max = Math.max(...allValues)
                    const padding = Math.max(2, Math.round((max - min) * 0.05))
                    const yDomain = [
                      Number((min - padding).toFixed(3)),
                      Number((max + padding).toFixed(3))
                    ]
                    return (
                      <div className="w-full my-6" style={{ minHeight: 320 }}>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={chartData} margin={{ left: 32, right: 32, bottom: 20 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32}>
                              <Label value="Budget Bins" offset={-50} position="insideBottom" />
                            </XAxis>
                            <YAxis domain={yDomain}>
                              <Label value="Frequency" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                            </YAxis>
                            <RechartsTooltip />
                            <Bar dataKey="value" fill="#0d9488" isAnimationActive={false} radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )
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
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-teal-700 border border-teal-300 px-6 py-3 rounded-lg font-medium transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-teal-400 dark:border-teal-500"
                  >
                    <Calendar className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                    <span className="text-teal-700 dark:text-teal-400">Read More Articles</span>
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
          <div className="sticky top-32 space-y-6">
            {/* Portfolio Page Recommendations Sidebar */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950 dark:to-blue-950 rounded-xl p-6 border border-teal-200 dark:border-teal-800 shadow-sm">
              <BlogRecommendations 
                blogContent={content}
                blogTitle={frontmatter.title || ''}
                blogTags={frontmatter.tags}
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
