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
          let chartData = encodedChartData
          
          // Try to decode URI-encoded data if it appears to be encoded
          try {
            if (encodedChartData.includes('%') || encodedChartData.includes('&')) {
              chartData = decodeURIComponent(encodedChartData)
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
    
    const result: [string, Record<string, unknown>] = [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'chart',
        'data-chart-type': HTMLAttributes.chartType,
        'data-chart-data': HTMLAttributes.data || '[]',
        'data-chart-title': HTMLAttributes.chartTitle,
        'data-chart-x-axis-label': HTMLAttributes.xAxisLabel,
        'data-chart-y-axis-label': HTMLAttributes.yAxisLabel,
        'data-chart-width': HTMLAttributes.width,
        'data-chart-height': HTMLAttributes.height,
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
