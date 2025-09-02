import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import slugify from 'slugify'
import { H1, H2, P, Blockquote } from "@/components/ui/typography"
import { Separator } from '@/components/ui/separator'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, Tooltip as RechartsTooltip, LineChart, Line, ScatterChart, Scatter, ZAxis, ResponsiveContainer } from "recharts"
import { logger } from '@/utils/logger'
import UnifiedTableRenderer from '@/components/UnifiedTableRenderer'
import { parseCardBlock } from '@/utils/markdownCardExtensions'

interface EnhancedMarkdownWithCardsProps {
  content: string
  className?: string
}

// Helper function to get series keys from chart data
function getSeriesKeys(data: Record<string, unknown>[]) {
  if (!Array.isArray(data) || data.length === 0) return [];
  // Exclude 'date' key
  return Object.keys(data[0]).filter((key) => key !== "date");
}

export const EnhancedMarkdownWithCards: React.FC<EnhancedMarkdownWithCardsProps> = ({ 
  content, 
  className 
}) => {
  // Process content to extract card blocks and replace with placeholders
  const processContent = (markdown: string) => {
    const cardRegex = /^:::card\[(\w+)\]\{([^}]*)\}\n([\s\S]*?)\n:::$/gm
    const cardBlocks: Array<{ placeholder: string; component: React.ReactElement }> = []
    let processedMarkdown = markdown
    let cardIndex = 0

    let match
    while ((match = cardRegex.exec(markdown)) !== null) {
      const cardComponent = parseCardBlock(match[0])
      if (cardComponent) {
        const placeholder = `__CARD_PLACEHOLDER_${cardIndex}__`
        cardBlocks.push({ placeholder, component: cardComponent })
        processedMarkdown = processedMarkdown.replace(match[0], placeholder)
        cardIndex++
      }
    }

    return { processedMarkdown, cardBlocks }
  }

  const { processedMarkdown, cardBlocks } = processContent(content)

  // Split content by card placeholders and render accordingly
  const renderContent = () => {
    const parts = processedMarkdown.split(/(__CARD_PLACEHOLDER_\d+__)/)
    
    return parts.map((part, index) => {
      // Check if this part is a card placeholder
      const cardMatch = part.match(/^__CARD_PLACEHOLDER_(\d+)__$/)
      if (cardMatch) {
        // const cardIndex = parseInt(cardMatch[1])
        const cardBlock = cardBlocks.find(block => block.placeholder === part)
        return cardBlock ? (
          <div key={index} className="my-6">
            {cardBlock.component}
          </div>
        ) : null
      }
      
      // Regular markdown content - render with ReactMarkdown
      if (part.trim()) {
        return (
          <ReactMarkdown
            key={index}
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
                if (language === "scatter") {
                  try {
                    const chartData = JSON.parse(String(children));
                    return (
                      <div className="my-8">
                        <ResponsiveContainer width="100%" height={400}>
                          <ScatterChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" name="X" />
                            <YAxis dataKey="y" name="Y" />
                            <ZAxis dataKey="z" range={[50, 400]} name="Z" />
                            <Legend />
                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Data" dataKey="z" fill="#8884d8" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } catch (error) {
                    logger.error('Error parsing scatter chart data:', error);
                    return (
                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <p className="text-red-600">Error rendering scatter chart: {String(error)}</p>
                        <pre className="text-xs mt-2">{String(children)}</pre>
                      </div>
                    );
                  }
                }

                // LINE CHARTS WITH MULTIPLE SERIES, ANNOTATIONS, AND CUSTOM STYLING
                if (language === "linechart") {
                  try {
                    const chartData = JSON.parse(String(children));
                    return (
                      <div className="my-8">
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Legend />
                            <RechartsTooltip />
                            {getSeriesKeys(chartData).map((key, index) => (
                              <Line 
                                key={key} 
                                type="monotone" 
                                dataKey={key} 
                                stroke={`hsl(${index * 60}, 70%, 50%)`}
                                strokeWidth={2}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } catch (error) {
                    logger.error('Error parsing line chart data:', error);
                    return (
                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <p className="text-red-600">Error rendering line chart: {String(error)}</p>
                        <pre className="text-xs mt-2">{String(children)}</pre>
                      </div>
                    );
                  }
                }

                // BAR CHARTS WITH MULTIPLE SERIES, STACKING, AND CUSTOM COLORS
                if (language === "chart") {
                  try {
                    const chartData = JSON.parse(String(children));
                    return (
                      <div className="my-8">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Legend />
                            <RechartsTooltip />
                            {getSeriesKeys(chartData).map((key, index) => (
                              <Bar 
                                key={key} 
                                dataKey={key} 
                                fill={`hsl(${index * 60}, 70%, 50%)`}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } catch (error) {
                    logger.error('Error parsing chart data:', error);
                    return (
                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <p className="text-red-600">Error rendering chart: {String(error)}</p>
                        <pre className="text-xs mt-2">{String(children)}</pre>
                      </div>
                    );
                  }
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({ children, ...props }) => (
                <pre className="overflow-x-auto rounded-lg border bg-muted p-4" {...props}>
                  {children}
                </pre>
              ),
              table: ({ children }) => {
                return (
                  <UnifiedTableRenderer
                    content={children}
                    showSorting={true}
                  />
                )
              },
              hr: ({ ...props }) => (
                <Separator className="my-8" {...props} />
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        )
      }
      
      return null
    })
  }

  return (
    <div className={className}>
      {renderContent()}
    </div>
  )
}
