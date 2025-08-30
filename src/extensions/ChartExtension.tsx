import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ChartRenderer from '@/components/ChartRenderer'
import { logger } from '@/utils/logger'

export interface ChartOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chart: {
      setChart: (attributes: { chartType: string; data: string; chartTitle?: string; xAxisLabel?: string; yAxisLabel?: string; width?: string; height?: string }) => ReturnType
    }
  }
}

// Wrapper component to adapt props for ReactNodeViewRenderer
const ChartRendererWrapper = (props: { node: { attrs: Record<string, unknown> } }) => {
  return <ChartRenderer node={props.node as { attrs: { chartType: string; data: string; xAxisLabel?: string; yAxisLabel?: string; width?: string; height?: string } } } />
}

export const Chart = Node.create<ChartOptions>({
  name: 'chart',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      chartType: {
        default: 'barchart',
      },
      data: {
        default: '[]',
      },
      chartTitle: {
        default: '',
      },
      xAxisLabel: {
        default: '',
      },
      yAxisLabel: {
        default: '',
      },
      width: {
        default: '100%',
      },
      height: {
        default: '320px',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="chart"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return {}
          
          logger.debug('ChartExtension.parseHTML - element:', element)
          logger.debug('ChartExtension.parseHTML - element attributes:', {
            chartType: element.getAttribute('data-chart-type'),
            chartData: element.getAttribute('data-chart-data'),
            xAxisLabel: element.getAttribute('data-chart-x-axis-label'),
            yAxisLabel: element.getAttribute('data-chart-y-axis-label'),
            width: element.getAttribute('data-chart-width'),
            height: element.getAttribute('data-chart-height'),
          })
          
          // Get the chart data from the div attribute and decode it
          const encodedChartData = element.getAttribute('data-chart-data') || '[]'
          const encoding = element.getAttribute('data-chart-encoding') || 'uri'
          let chartData = encodedChartData
          
          // Decode the chart data based on encoding type
          try {
            if (encoding === 'base64') {
              // Decode base64-encoded chart data
              chartData = decodeURIComponent(escape(atob(encodedChartData)))
            } else if (encodedChartData.includes('%') || encodedChartData.includes('&')) {
              // Decode URI-encoded chart data (backward compatibility)
              chartData = decodeURIComponent(encodedChartData)
            }
            
            // Validate the decoded data is valid JSON
            try {
              JSON.parse(chartData)
            } catch (jsonError) {
              logger.warn('ChartExtension.parseHTML - decoded chart data is not valid JSON:', jsonError)
              // Use original encoded data if decoding fails
              chartData = encodedChartData
            }
          } catch (error) {
            logger.warn('ChartExtension.parseHTML - failed to decode chart data, using original:', error)
            chartData = encodedChartData
          }
          
          const attrs = {
            chartType: element.getAttribute('data-chart-type') || 'barchart',
            data: chartData,
            chartTitle: element.getAttribute('data-chart-title') || '',
            xAxisLabel: element.getAttribute('data-chart-x-axis-label') || '',
            yAxisLabel: element.getAttribute('data-chart-y-axis-label') || '',
            width: element.getAttribute('data-chart-width') || '100%',
            height: element.getAttribute('data-chart-height') || '320px',
          }
          
          logger.debug('ChartExtension.parseHTML - returning attrs:', attrs)
          return attrs
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    logger.debug('ChartExtension.renderHTML - HTMLAttributes:', HTMLAttributes)
    
    // Clean the chart data before rendering to prevent HTML entity encoding issues
    let chartData = HTMLAttributes.data || '[]'
    if (typeof chartData === 'string' && chartData.length > 0) {
      try {
        // Clean the data by removing carriage returns and normalizing whitespace
        const cleanedData = chartData
          .replace(/\r\n/g, '\n')  // Replace carriage returns with newlines
          .replace(/\r/g, '\n')    // Replace any remaining carriage returns
          .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
          .trim()                  // Remove leading/trailing whitespace
        
        // Validate the cleaned data is valid JSON
        JSON.parse(cleanedData)
        chartData = cleanedData
        logger.debug('ChartExtension.renderHTML - data cleaned successfully')
      } catch (error) {
        logger.warn('ChartExtension.renderHTML - failed to clean chart data:', error)
        // Use original data if cleaning fails
      }
    }
    
    const result: [string, Record<string, unknown>] = [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'chart',
        'data-chart-type': HTMLAttributes.chartType,
        'data-chart-data': chartData,
        'data-chart-title': HTMLAttributes.chartTitle,
        'data-chart-x-axis-label': HTMLAttributes.xAxisLabel,
        'data-chart-y-axis-label': HTMLAttributes.yAxisLabel,
        'data-chart-width': HTMLAttributes.width,
        'data-chart-height': HTMLAttributes.height,
        // Add the raw data attribute for easier HTML to Markdown conversion
        'data': chartData,
        // Add legacy attributes for backward compatibility
        'charttype': HTMLAttributes.chartType,
        'charttitle': HTMLAttributes.chartTitle,
        'xaxislabel': HTMLAttributes.xAxisLabel,
        'yaxislabel': HTMLAttributes.yAxisLabel,
      }),
    ]
    
    logger.debug('ChartExtension.renderHTML - result:', result)
    return result
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartRendererWrapper)
  },

  addCommands() {
    return {
      setChart:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    }
  },
})
