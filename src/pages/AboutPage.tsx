import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import fm from 'front-matter';
import slugify from 'slugify';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollToTop } from '@/components/ScrollToTop';
import {
  H1,
  H2,
  H3,
  H4,
  P,
  Blockquote,
  InlineCode,
} from '@/components/ui/typography';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Legend,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  ResponsiveContainer,
  LabelList,
  ErrorBar,
} from 'recharts';
import { MessageSquare } from 'lucide-react';
import { logger } from '@/utils/logger';
import UnifiedTableRenderer from '@/components/UnifiedTableRenderer';

import { renderCardComponent } from '@/utils/markdownCardParser';
import aboutContent from '../content/about.md?raw';

// Define proper types for frontmatter
interface Frontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  author?: string;
  keywords?: string[];
  image?: string;
}

// Define TOCEntry type - export it so sidebar can use it
export type TOCEntry = {
  title: string;
  slug: string;
};

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
  return Object.keys(data[0]).filter(key => key !== 'date');
}

export default function AboutPage() {
  const [content, setContent] = React.useState<string>('');
  const [frontmatter, setFrontmatter] = React.useState<Frontmatter>({});
  const [isLoading, setIsLoading] = React.useState(true);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []); // No dependency needed for about page

  // Update document title and meta tags with enhanced SEO for About page
  useDocumentTitle({
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: [
      'About',
      'Biography',
      'Professional Background',
      ...(frontmatter.keywords || frontmatter.tags || []),
    ],
    image: frontmatter.image,
    url: window.location.pathname,
    type: 'profile',
    author: frontmatter.author,
    publishedTime: frontmatter.date,
  });

  // Load markdown content and extract TOC
  React.useEffect(() => {
    const loadMarkdown = async () => {
      setIsLoading(true);
      try {
        // Use static import instead of dynamic import to avoid chunking issues
        logger.debug('Loading about markdown file');

        const text = aboutContent;
        console.log('AboutPage: aboutContent length:', text.length);
        console.log(
          'AboutPage: aboutContent first 200 chars:',
          text.substring(0, 200)
        );

        // Parse frontmatter
        const { attributes, body } = fm(text);
        console.log('AboutPage: Frontmatter parsed:', attributes);
        console.log('AboutPage: Body length:', body.length);
        setFrontmatter(attributes as Frontmatter);

        // Remove import statements from markdown content
        const cleanedBody = body.replace(/^import\s+.*$/gm, '').trim();
        console.log('AboutPage: Cleaned body length:', cleanedBody.length);

        // Store the cleaned markdown content directly
        setContent(cleanedBody);

        // Extract headings for TOC - ONLY H2 headings (use original content for TOC)
        const headingRegex = /^#{2}\s+(.+)$/gm;
        const headings: TOCEntry[] = [];
        const seenSlugs = new Set<string>();
        let match;

        while ((match = headingRegex.exec(cleanedBody)) !== null) {
          const title = match[1].trim();
          let slug = slugify(title, { lower: true, strict: true });

          // Handle duplicate slugs by adding a number suffix
          let counter = 1;
          while (seenSlugs.has(slug)) {
            slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
            counter++;
          }

          seenSlugs.add(slug);
          headings.push({ title, slug });
        }

        // Debug: Log the headings found
        console.log('AboutPage: TOC Headings found:', headings);
        console.log(
          'AboutPage: Raw markdown content length:',
          cleanedBody.length
        );
        console.log(
          'AboutPage: First 500 chars:',
          cleanedBody.substring(0, 500)
        );

        // Dispatch custom event to update sidebar TOC
        window.dispatchEvent(
          new CustomEvent('toc-updated', {
            detail: { toc: headings, file: 'about' },
          })
        );
      } catch (error) {
        logger.error('Error loading about markdown:', error);
        logger.error('Full error details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkdown();
  }, []);

  // Clean up event when component unmounts
  React.useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent('toc-updated', {
          detail: { toc: [], file: null },
        })
      );
    };
  }, []);

  // Show loading skeleton to prevent layout shift - Optimized for sidebar layout
  if (isLoading) {
    return (
      <div className='w-full'>
        {/* Header skeleton */}
        <header className='mb-8'>
          <Skeleton className='h-12 w-3/4 mb-4' />
          <Skeleton className='h-6 w-full mb-2' />
          <Skeleton className='h-6 w-2/3 mb-4' />
          <div className='flex gap-2'>
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-6 w-20' />
            <Skeleton className='h-6 w-14' />
          </div>
        </header>

        {/* Profile card skeleton for about page */}
        <div className='mb-12'>
          <Skeleton className='h-64 w-full rounded-lg' />
        </div>

        {/* Content skeleton - Preserve space to prevent layout shift */}
        <div className='space-y-6 min-h-[1000px]'>
          {/* Simulate multiple sections */}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className='space-y-4'>
              <Skeleton className='h-8 w-1/2' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              {i % 2 === 0 && <Skeleton className='h-32 w-full mt-4' />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Header with h1 title */}
      {frontmatter.title && (
        <header className='mb-8'>
          <H1 className='mb-4'>{frontmatter.title}</H1>
          {frontmatter.description && (
            <P className='text-xl text-muted-foreground leading-7'>
              {frontmatter.description}
            </P>
          )}
          {frontmatter.tags && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {[...new Set(frontmatter.tags)].map(
                (tag: string, index: number) => (
                  <Badge
                    key={`${tag}-${index}`}
                    variant='secondary'
                    className='border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                  >
                    {tag}
                  </Badge>
                )
              )}
            </div>
          )}
        </header>
      )}

      {/* Main content area */}
      <div>
        {/* Markdown Content */}
        <article className='max-w-none w-full space-y-6'>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, ...props }) => <P {...props}>{children}</P>,
              h1: ({ children, ...props }) => {
                const text = String(children);
                const id = slugify(text, { lower: true, strict: true });
                return (
                  <H1 id={id} {...props}>
                    {children}
                  </H1>
                );
              },
              h2: ({ children, ...props }) => {
                const text = String(children);
                const id = slugify(text, { lower: true, strict: true });
                return (
                  <H2 id={id} {...props}>
                    {children}
                  </H2>
                );
              },
              h3: ({ children, ...props }) => {
                const text = String(children);
                const id = slugify(text, { lower: true, strict: true });
                return (
                  <H3 id={id} {...props}>
                    {children}
                  </H3>
                );
              },
              h4: ({ children, ...props }) => {
                const text = String(children);
                const id = slugify(text, { lower: true, strict: true });
                return (
                  <H4 id={id} {...props}>
                    {children}
                  </H4>
                );
              },
              blockquote: ({ children, ...props }) => (
                <Blockquote {...props}>{children}</Blockquote>
              ),
              code: ({ children, className, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';

                // CUSTOM CARD COMPONENTS
                if (language === 'card' || language === 'json') {
                  try {
                    const cardData = JSON.parse(String(children));

                    // Create the card component directly using the parsed data
                    const cardComponent = renderCardComponent({
                      type: cardData.type,
                      props: cardData.props || {},
                      content: cardData.content || '',
                    });

                    if (cardComponent) {
                      return <div className='my-6'>{cardComponent}</div>;
                    } else {
                      return (
                        <div className='p-4 border border-yellow-200 bg-yellow-50 rounded-lg'>
                          <p className='text-yellow-600'>
                            Card component not rendered for type:{' '}
                            {cardData.type}
                          </p>
                          <p className='text-xs text-gray-600'>
                            Content type: {typeof cardData.content}
                          </p>
                          <p className='text-xs text-gray-600'>
                            Content: {JSON.stringify(cardData.content, null, 2)}
                          </p>
                        </div>
                      );
                    }
                  } catch (error) {
                    console.warn('Error parsing card data:', error);
                    return (
                      <div className='p-4 border border-red-200 bg-red-50 rounded-lg'>
                        <p className='text-red-600'>
                          Error rendering card: {String(error)}
                        </p>
                        <pre className='text-xs mt-2'>{String(children)}</pre>
                      </div>
                    );
                  }
                }

                // SCATTER/BUBBLE CHARTS WITH GROUPING, BUBBLE SIZE, LABELS, CI ERROR BARS
                if (
                  language === 'scatter-plot' ||
                  language === 'scatterplot' ||
                  language === 'scatter-trend' ||
                  language === 'scattertrend'
                ) {
                  const chartData = parseChartData(String(children));
                  if (!Array.isArray(chartData) || chartData.length === 0) {
                    return (
                      <div className='text-red-500'>Invalid chart data</div>
                    );
                  }
                  // Group by series (optional). If no 'series', treat as single series named 'Data'.
                  const groups: Record<string, ChartDataPoint[]> = {};
                  for (const d of chartData) {
                    const key = d.series ?? 'Data';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(d);
                  }
                  const xs = chartData.map(d => Number(d.x));
                  const ys = chartData.map(d => Number(d.y));
                  const xMin = Math.min(...xs),
                    xMax = Math.max(...xs);
                  const yMin = Math.min(...ys),
                    yMax = Math.max(...ys);
                  const xPad = (xMax - xMin) * 0.05 || 1;
                  const yPad = (yMax - yMin) * 0.05 || 1;
                  const colors = [
                    '#0d9488',
                    '#64748b',
                    '#f59e42',
                    '#e11d48',
                    '#6366f1',
                  ];
                  const seriesNames = Object.keys(groups);
                  // Total n per series for legend formatting
                  const seriesTotals: Record<string, number> =
                    Object.fromEntries(
                      seriesNames.map(name => [
                        name,
                        groups[name].reduce(
                          (acc, d) => acc + (Number(d.n) || 0),
                          0
                        ),
                      ])
                    );

                  // Simple linear regression for each series (least squares)
                  function getTrendLine(data: ChartDataPoint[]) {
                    const n = data.length;
                    if (n < 2) return [];
                    const sumX = data.reduce((acc, d) => acc + (d.x || 0), 0);
                    const sumY = data.reduce((acc, d) => acc + (d.y || 0), 0);
                    const sumXY = data.reduce(
                      (acc, d) => acc + (d.x || 0) * (d.y || 0),
                      0
                    );
                    const sumXX = data.reduce(
                      (acc, d) => acc + (d.x || 0) * (d.x || 0),
                      0
                    );
                    const meanX = sumX / n;
                    const meanY = sumY / n;
                    const slope =
                      (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                    const intercept = meanY - slope * meanX;
                    const xVals = data.map(d => d.x || 0);
                    const xStart = Math.min(...xVals);
                    const xEnd = Math.max(...xVals);
                    return [
                      { x: xStart, y: slope * xStart + intercept },
                      { x: xEnd, y: slope * xEnd + intercept },
                    ];
                  }

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
                    <div className='w-full my-6' style={{ minHeight: 320 }}>
                      <ResponsiveContainer width='100%' height={320}>
                        <ScatterChart
                          margin={{ left: 32, right: 32, bottom: 20 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray='3 3'
                          />
                          <XAxis
                            type='number'
                            dataKey='x'
                            domain={[xMin - xPad, xMax + xPad]}
                            tickFormatter={formatCurrency}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                          >
                            <Label
                              value='Budget (USD, scaled)'
                              offset={-50}
                              position='insideBottom'
                            />
                          </XAxis>
                          <YAxis
                            type='number'
                            dataKey='y'
                            domain={[yMin - yPad, yMax + yPad]}
                            tickFormatter={formatComplexity}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          >
                            <Label
                              value='Mean Complexity'
                              angle={-90}
                              position='insideLeft'
                              style={{ textAnchor: 'middle' }}
                            />
                          </YAxis>
                          <Legend
                            formatter={(value: string) => {
                              const total = seriesTotals?.[value];
                              return total
                                ? `${value} — Mean Complexity (n=${total})`
                                : `${value} — Mean Complexity`;
                            }}
                          />
                          <RechartsTooltip
                            formatter={(value: number, name: string) => {
                              if (name === 'x') return formatCurrency(value);
                              if (name === 'y')
                                return [
                                  `${formatComplexity(value)}`,
                                  'Mean Complexity',
                                ];
                              if (name === 'n') return formatCount(value);
                              return value;
                            }}
                            labelFormatter={label => formatCurrency(label)}
                          />
                          {seriesNames.map((name, i) => (
                            <Scatter
                              key={name}
                              name={name}
                              data={groups[name]}
                              fill={colors[i % colors.length]}
                            >
                              <ZAxis dataKey='n' range={[60, 300]} />
                              {/* Optional 95% CI error bars if ciLow/ciHigh are provided */}
                              <ErrorBar dataKey='ciLow' strokeOpacity={0.7} />
                              <ErrorBar dataKey='ciHigh' strokeOpacity={0.7} />
                              {/* Label each point with its budget tier */}
                              <LabelList dataKey='group' position='top' />
                            </Scatter>
                          ))}
                          {(language === 'scatter-trend' ||
                            language === 'scattertrend') &&
                            seriesNames.map((name, i) => {
                              const trend = getTrendLine(groups[name]);
                              return trend.length === 2 ? (
                                <Scatter
                                  key={name + '-trend'}
                                  data={trend}
                                  line
                                  fill={colors[i % colors.length]}
                                  legendType='none'
                                />
                              ) : null;
                            })}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  );
                }

                // -----------------------------
                // HISTOGRAM
                // -----------------------------
                // Expects pre-binned data: [{ "date": "<bin label>", "value": <count> }, ...]
                if (language === 'histogram' || language === 'histchart') {
                  const chartData = parseChartData(String(children));
                  if (!Array.isArray(chartData) || chartData.length === 0) {
                    return (
                      <div className='text-red-500'>Invalid chart data</div>
                    );
                  }
                  const seriesKeys = ['value'];
                  const allValues = chartData.flatMap(d =>
                    seriesKeys.map(k => d[k])
                  );
                  const min = Math.min(...allValues);
                  const max = Math.max(...allValues);
                  const padding = Math.max(2, Math.round((max - min) * 0.05));
                  const yDomain = [
                    Number((min - padding).toFixed(3)),
                    Number((max + padding).toFixed(3)),
                  ];
                  return (
                    <div className='w-full my-6' style={{ minHeight: 320 }}>
                      <ResponsiveContainer width='100%' height={320}>
                        <BarChart
                          data={chartData}
                          margin={{ left: 32, right: 32, bottom: 20 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray='3 3'
                          />
                          <XAxis
                            dataKey='date'
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                          >
                            <Label
                              value='Budget Bins'
                              offset={-50}
                              position='insideBottom'
                            />
                          </XAxis>
                          <YAxis domain={yDomain}>
                            <Label
                              value='Frequency'
                              angle={-90}
                              position='insideLeft'
                              style={{ textAnchor: 'middle' }}
                            />
                          </YAxis>
                          <RechartsTooltip />
                          <Bar
                            dataKey='value'
                            fill='#0d9488'
                            isAnimationActive={false}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                }

                // Multi-series grouped bar chart
                if (language === 'barchart' || language === 'bar-chart') {
                  const chartData = parseChartData(String(children));
                  if (!Array.isArray(chartData) || chartData.length === 0) {
                    return (
                      <div className='text-red-500'>Invalid chart data</div>
                    );
                  }
                  const seriesKeys = getSeriesKeys(chartData);
                  const allValues = chartData.flatMap(d =>
                    seriesKeys.map(k => d[k])
                  );
                  const min = Math.min(...allValues);
                  const max = Math.max(...allValues);
                  const padding = Math.max(2, Math.round((max - min) * 0.05));
                  const yDomain = [
                    Number((min - padding).toFixed(3)),
                    Number((max + padding).toFixed(3)),
                  ];
                  const colors = [
                    '#0d9488',
                    '#64748b',
                    '#f59e42',
                    '#e11d48',
                    '#6366f1',
                  ];

                  return (
                    <div className='w-full my-6' style={{ minHeight: 320 }}>
                      <ResponsiveContainer width='100%' height={320}>
                        <BarChart
                          data={chartData}
                          margin={{ left: 32, right: 32, bottom: 20 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray='3 3'
                          />
                          <XAxis
                            dataKey='date'
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={value => value}
                          >
                            <Label
                              value='Budget Tier'
                              offset={-50}
                              position='insideBottom'
                            />
                          </XAxis>
                          <YAxis
                            domain={yDomain}
                            tickFormatter={value => Number(value).toFixed(3)}
                          >
                            <Label
                              value='Frequency'
                              angle={-90}
                              position='insideLeft'
                              style={{ textAnchor: 'middle' }}
                            />
                          </YAxis>
                          <Legend />
                          <RechartsTooltip
                            formatter={(
                              value: number,
                              name: string,
                              props: { payload?: Record<string, unknown> }
                            ) => {
                              // If per-series count is provided (e.g., Agile_n), show alongside value
                              const perSeriesN = props?.payload?.[`${name}_n`];
                              const globalN = props?.payload?.n;
                              if (perSeriesN != null)
                                return [`${value} (n=${perSeriesN})`, name];
                              if (globalN != null)
                                return [`${value} (n=${globalN})`, name];
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
                  );
                }

                // Multi-series line chart
                if (language === 'linechart' || language === 'line-chart') {
                  const chartData = parseChartData(String(children));
                  if (!Array.isArray(chartData) || chartData.length === 0) {
                    return (
                      <div className='text-red-500'>Invalid chart data</div>
                    );
                  }
                  const seriesKeys = getSeriesKeys(chartData);
                  const allValues = chartData.flatMap(d =>
                    seriesKeys.map(k => d[k])
                  );
                  const min = Math.min(...allValues);
                  const max = Math.max(...allValues);
                  const padding = Math.max(2, Math.round((max - min) * 0.05));
                  const yDomain = [
                    Number((min - padding).toFixed(3)),
                    Number((max + padding).toFixed(3)),
                  ];
                  const colors = [
                    '#0d9488',
                    '#64748b',
                    '#f59e42',
                    '#e11d48',
                    '#6366f1',
                  ];

                  return (
                    <div className='w-full my-6' style={{ minHeight: 320 }}>
                      <ResponsiveContainer width='100%' height={320}>
                        <LineChart
                          data={chartData}
                          margin={{ left: 32, right: 32, bottom: 20 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray='3 3'
                          />
                          <XAxis
                            dataKey='date'
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={value => value}
                          >
                            <Label
                              value='Budget Tier'
                              offset={-50}
                              position='insideBottom'
                            />
                          </XAxis>
                          <YAxis
                            domain={yDomain}
                            tickFormatter={value => Number(value).toFixed(3)}
                          >
                            <Label
                              value='Frequency'
                              angle={-90}
                              position='insideLeft'
                              style={{ textAnchor: 'middle' }}
                            />
                          </YAxis>
                          <Legend />
                          <RechartsTooltip
                            formatter={(
                              value: number,
                              name: string,
                              props: { payload?: Record<string, unknown> }
                            ) => {
                              // If per-series count is provided (e.g., Agile_n), show alongside value
                              const perSeriesN = props?.payload?.[`${name}_n`];
                              const globalN = props?.payload?.n;
                              if (perSeriesN != null)
                                return [`${value} (n=${perSeriesN})`, name];
                              if (globalN != null)
                                return [`${value} (n=${globalN})`, name];
                              return [value, name];
                            }}
                          />
                          {seriesKeys.map((key, i) => (
                            <Line
                              key={key}
                              dataKey={key}
                              type='monotone'
                              stroke={colors[i % colors.length]}
                              strokeWidth={2}
                              dot={true}
                              isAnimationActive={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                }

                // Inline code and other code blocks
                const isInline = !className?.includes('language-');
                if (isInline) {
                  return <InlineCode {...props}>{children}</InlineCode>;
                }

                return (
                  <code
                    className={`font-mono text-sm ${className || ''}`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children, ...props }) => (
                <pre
                  className='overflow-x-auto rounded-lg border bg-muted p-4 w-full'
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
                  <UnifiedTableRenderer content={children} showSorting={true} />
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>

          {/* Contact Section at bottom of every page */}
          <div className='mt-16 pt-8 border-t border-gray-200'>
            <div className='text-center'>
              <H2 className='text-2xl font-semibold text-gray-900 mb-4'>
                Ready to discuss your next project?
              </H2>
              <P className='text-gray-600 mb-6 max-w-2xl mx-auto'>
                Whether you need enterprise integration expertise, DevOps
                transformation, or strategic technology leadership, I'm here to
                help bring your vision to life.
              </P>
              <a
                href='/contact'
                className='inline-flex items-center gap-2 bg-gradient-to-r from-teal-800 to-blue-800 hover:from-teal-900 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                <MessageSquare className='h-4 w-4' />
                Target Your Next Project
              </a>
            </div>
          </div>
        </article>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
