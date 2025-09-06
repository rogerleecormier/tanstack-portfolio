/**
 * Production Renderer
 * Maps processed AST to real React components for production routes
 * No dangerouslySetInnerHTML - all components are real React elements
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { remarkShadcnBlocks } from '../blocks/remark-shadcn-blocks';
import { rehypePlaceholders } from '../blocks/rehype-placeholders';
import { H1, H2, H3, H4, P, Blockquote } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { logger } from '@/utils/logger';
import slugify from 'slugify';

interface ProductionRendererProps {
  markdown: string;
  className?: string;
}

interface BlockData {
  type: string;
  data: Record<string, unknown>;
}

// Component mapping for shadcn blocks
const BlockComponentMap: Record<
  string,
  React.ComponentType<{ data: Record<string, unknown> }>
> = {
  card: ({ data }) => (
    <Card className="my-6">
      {data.title ? (
        <CardHeader>
          <CardTitle>{String(data.title)}</CardTitle>
        </CardHeader>
      ) : null}
      {data.description ? (
        <CardHeader>
          <CardDescription>{String(data.description)}</CardDescription>
        </CardHeader>
      ) : null}
      {data.content ? <CardContent>{String(data.content)}</CardContent> : null}
    </Card>
  ),

  alert: ({ data }) => (
    <Alert
      className="my-6"
      variant={(data.variant as 'default' | 'destructive') || 'default'}
    >
      {data.title ? <AlertTitle>{String(data.title)}</AlertTitle> : null}
      {data.description ? (
        <AlertDescription>{String(data.description)}</AlertDescription>
      ) : null}
    </Alert>
  ),

  badge: ({ data }) => (
    <Badge
      variant={
        (data.variant as 'default' | 'secondary' | 'destructive' | 'outline') ||
        'default'
      }
      className="my-2"
    >
      {String(data.text || data.label || data.content)}
    </Badge>
  ),

  button: ({ data }) => (
    <Button
      variant={
        (data.variant as
          | 'default'
          | 'destructive'
          | 'outline'
          | 'secondary'
          | 'ghost'
          | 'link') || 'default'
      }
      size={(data.size as 'default' | 'sm' | 'lg' | 'icon') || 'default'}
      className="my-2"
    >
      {String(data.text || data.label || data.children)}
    </Button>
  ),

  progress: ({ data }) => (
    <div className="my-4">
      {data.label ? (
        <p className="text-sm text-muted-foreground mb-2">
          {String(data.label)}
        </p>
      ) : null}
      <Progress value={Number(data.value) || 0} className="w-full" />
    </div>
  ),

  skeleton: ({ data }) => (
    <div className="my-4">
      <Skeleton className={String(data.className || 'h-4 w-full')} />
    </div>
  ),

  avatar: ({ data }) => (
    <Avatar className="my-2">
      {data.src ? (
        <AvatarImage src={String(data.src)} alt={String(data.alt || '')} />
      ) : null}
      <AvatarFallback>{String(data.fallback || 'U')}</AvatarFallback>
    </Avatar>
  ),

  separator: () => <Separator className="my-6" />,

  // Chart components
  barchart: ({ data }) => {
    const chartData = Array.isArray(data.data) ? data.data : [];
    const seriesKeys =
      chartData.length > 0
        ? Object.keys(chartData[0]).filter((key) => key !== 'date')
        : [];

    return (
      <div className="my-6">
        {data.title ? (
          <h4 className="text-lg font-semibold mb-4">{String(data.title)}</h4>
        ) : null}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`hsl(${index * 45}, 70%, 50%)`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  },

  linechart: ({ data }) => {
    const chartData = Array.isArray(data.data) ? data.data : [];
    const seriesKeys =
      chartData.length > 0
        ? Object.keys(chartData[0]).filter((key) => key !== 'date')
        : [];

    return (
      <div className="my-6">
        {data.title ? (
          <h4 className="text-lg font-semibold mb-4">{String(data.title)}</h4>
        ) : null}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`hsl(${index * 45}, 70%, 50%)`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  },

  piechart: ({ data }) => {
    const chartData = Array.isArray(data.data) ? data.data : [];
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <div className="my-6">
        {data.title ? (
          <h4 className="text-lg font-semibold mb-4">{String(data.title)}</h4>
        ) : null}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  },

  areachart: ({ data }) => {
    const chartData = Array.isArray(data.data) ? data.data : [];
    const seriesKeys =
      chartData.length > 0
        ? Object.keys(chartData[0]).filter((key) => key !== 'date')
        : [];

    return (
      <div className="my-6">
        {data.title ? (
          <h4 className="text-lg font-semibold mb-4">{String(data.title)}</h4>
        ) : null}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={`hsl(${index * 45}, 70%, 50%)`}
                fill={`hsl(${index * 45}, 70%, 50%)`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  },

  radarchart: ({ data }) => {
    const chartData = Array.isArray(data.data) ? data.data : [];
    const seriesKeys =
      chartData.length > 0
        ? Object.keys(chartData[0]).filter((key) => key !== 'subject')
        : [];

    return (
      <div className="my-6">
        {data.title ? (
          <h4 className="text-lg font-semibold mb-4">{String(data.title)}</h4>
        ) : null}
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            {seriesKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={`hsl(${index * 45}, 70%, 50%)`}
                fill={`hsl(${index * 45}, 70%, 50%)`}
                fillOpacity={0.6}
              />
            ))}
            <RechartsTooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  },

  scatterplot: ({ data }) => {
    const chartData = Array.isArray(data.data) ? data.data : [];

    return (
      <div className="my-6">
        {data.title ? (
          <h4 className="text-lg font-semibold mb-4">{String(data.title)}</h4>
        ) : null}
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={chartData}>
            <CartesianGrid />
            <XAxis dataKey="x" type="number" />
            <YAxis dataKey="y" type="number" />
            <ZAxis dataKey="z" range={[50, 400]} />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Data" dataKey="z" fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  },

  tablejson: ({ data }) => {
    const tableData = Array.isArray(data.data) ? data.data : [];
    const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    return (
      <div className="my-6">
        {data.title ? (
          <h4 className="text-lg font-semibold mb-4">{String(data.title)}</h4>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border border-gray-300 px-4 py-2 text-left font-semibold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {String(row[column] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};

// Custom components for ReactMarkdown
const markdownComponents = {
  h1: ({ children, ...props }: React.ComponentProps<'h1'>) => {
    const text = String(children);
    const id = slugify(text, { lower: true, strict: true });
    return (
      <H1 id={id} {...props}>
        {children}
      </H1>
    );
  },
  h2: ({ children, ...props }: React.ComponentProps<'h2'>) => {
    const text = String(children);
    const id = slugify(text, { lower: true, strict: true });
    return (
      <H2 id={id} {...props}>
        {children}
      </H2>
    );
  },
  h3: ({ children, ...props }: React.ComponentProps<'h3'>) => {
    const text = String(children);
    const id = slugify(text, { lower: true, strict: true });
    return (
      <H3 id={id} {...props}>
        {children}
      </H3>
    );
  },
  h4: ({ children, ...props }: React.ComponentProps<'h4'>) => {
    const text = String(children);
    const id = slugify(text, { lower: true, strict: true });
    return (
      <H4 id={id} {...props}>
        {children}
      </H4>
    );
  },
  h5: ({ children, ...props }: React.ComponentProps<'h5'>) => {
    const text = String(children);
    const id = slugify(text, { lower: true, strict: true });
    return (
      <h5
        id={id}
        className="scroll-m-20 text-xl font-semibold tracking-tight"
        {...props}
      >
        {children}
      </h5>
    );
  },
  h6: ({ children, ...props }: React.ComponentProps<'h6'>) => {
    const text = String(children);
    const id = slugify(text, { lower: true, strict: true });
    return (
      <h6
        id={id}
        className="scroll-m-20 text-base font-semibold tracking-tight"
        {...props}
      >
        {children}
      </h6>
    );
  },
  p: ({ children, ...props }: React.ComponentProps<'p'>) => (
    <P {...props}>{children}</P>
  ),
  blockquote: ({ children, ...props }: React.ComponentProps<'blockquote'>) => (
    <Blockquote {...props}>{children}</Blockquote>
  ),
  ul: ({ children, ...props }: React.ComponentProps<'ul'>) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentProps<'ol'>) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentProps<'li'>) => (
    <li className="mt-2" {...props}>
      {children}
    </li>
  ),
  code: ({ children, className, ...props }: React.ComponentProps<'code'>) => {
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-4">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.ComponentProps<'pre'>) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-4" {...props}>
      {children}
    </pre>
  ),
  hr: () => <Separator className="my-6" />,
  table: ({ children, ...props }: React.ComponentProps<'table'>) => (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full border-collapse border border-gray-300"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentProps<'thead'>) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.ComponentProps<'tbody'>) => (
    <tbody {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: React.ComponentProps<'tr'>) => (
    <tr {...props}>{children}</tr>
  ),
  th: ({ children, ...props }: React.ComponentProps<'th'>) => (
    <th
      className="border border-gray-300 px-4 py-2 text-left font-semibold"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentProps<'td'>) => (
    <td className="border border-gray-300 px-4 py-2" {...props}>
      {children}
    </td>
  ),
  a: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }: React.ComponentProps<'img'>) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg my-4"
      {...props}
    />
  ),
};

export const ProductionRenderer: React.FC<ProductionRendererProps> = ({
  markdown,
  className = '',
}) => {
  const [processedContent, setProcessedContent] = React.useState<{
    markdown: string;
    blocks: BlockData[];
  }>({ markdown: '', blocks: [] });

  React.useEffect(() => {
    try {
      // Process markdown to extract blocks and create placeholders
      const processor = unified()
        .use(remarkParse)
        .use(remarkShadcnBlocks)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypePlaceholders)
        .use(rehypeStringify);

      const result = processor.processSync(markdown);
      const html = String(result);

      // Extract block data from the processed HTML
      const blocks: BlockData[] = [];
      const blockRegex =
        /<div[^>]*data-block-type="([^"]*)"[^>]*data-json="([^"]*)"[^>]*>/g;
      let match;

      while ((match = blockRegex.exec(html)) !== null) {
        try {
          const blockType = match[1];
          const jsonData = match[2]
            .replace(/&quot;/g, '"')
            .replace(/\\n/g, '\n');
          const data = JSON.parse(jsonData);
          blocks.push({ type: blockType, data });
        } catch (error) {
          logger.error('Error parsing block data:', error);
        }
      }

      // Replace block placeholders with simple markers
      const processedMarkdown = html
        .replace(
          /<div[^>]*data-block-type="([^"]*)"[^>]*data-json="([^"]*)"[^>]*>.*?<\/div>/gs,
          (_, blockType) => {
            const blockIndex = blocks.findIndex((b) => b.type === blockType);
            return `__BLOCK_${blockIndex}__`;
          }
        )
        .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      setProcessedContent({ markdown: processedMarkdown, blocks });
    } catch (error) {
      logger.error('Error processing markdown for production renderer:', error);
      setProcessedContent({ markdown, blocks: [] });
    }
  }, [markdown]);

  const renderContent = () => {
    const parts = processedContent.markdown.split(/(__BLOCK_\d+__)/);

    return parts.map((part, index) => {
      const blockMatch = part.match(/^__BLOCK_(\d+)__$/);
      if (blockMatch) {
        const blockIndex = parseInt(blockMatch[1]);
        const block = processedContent.blocks[blockIndex];

        if (block && BlockComponentMap[block.type]) {
          const Component = BlockComponentMap[block.type];
          return <Component key={index} data={block.data} />;
        }
      }

      if (part.trim()) {
        return (
          <div key={index} className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {part}
            </ReactMarkdown>
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className={`production-renderer ${className}`}>{renderContent()}</div>
  );
};

export default ProductionRenderer;
