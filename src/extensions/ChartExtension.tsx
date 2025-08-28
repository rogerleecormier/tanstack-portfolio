import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ChartRenderer from '@/components/ChartRenderer'

export interface ChartOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chart: {
      setChart: (attributes: { chartType: string; data: string; xAxisLabel?: string; yAxisLabel?: string; width?: string; height?: string }) => ReturnType
    }
  }
}

// Wrapper component to adapt props for ReactNodeViewRenderer
const ChartRendererWrapper = (props: any) => {
  return <ChartRenderer node={props.node} />
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
          return {
            chartType: element.getAttribute('data-chart-type') || 'barchart',
            data: element.getAttribute('data-chart-data') || '[]',
            xAxisLabel: element.getAttribute('data-chart-x-axis-label') || '',
            yAxisLabel: element.getAttribute('data-chart-y-axis-label') || '',
            width: element.getAttribute('data-chart-width') || '100%',
            height: element.getAttribute('data-chart-height') || '320px',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'chart',
        'data-chart-type': HTMLAttributes.chartType,
        'data-chart-data': HTMLAttributes.data,
        'data-chart-x-axis-label': HTMLAttributes.xAxisLabel,
        'data-chart-y-axis-label': HTMLAttributes.yAxisLabel,
        'data-chart-width': HTMLAttributes.width,
        'data-chart-height': HTMLAttributes.height,
      }),
    ]
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
