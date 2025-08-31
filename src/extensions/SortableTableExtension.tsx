import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, ReactNodeViewProps } from '@tiptap/react'
import UnifiedTableRenderer from '@/components/UnifiedTableRenderer'
import { parseMarkdownTable } from '@/utils/tableParser'

export interface SortableTableOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sortableTable: {
      setSortableTable: (attributes: { content: string }) => ReturnType
    }
  }
}

export const SortableTableExtension = Node.create<SortableTableOptions>({
  name: 'sortableTable',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: element => element.getAttribute('data-content') || '',
        renderHTML: attributes => ({
          'data-content': attributes.content,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="sortable-table"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'sortable-table' })]
  },

  addCommands() {
    return {
      setSortableTable:
        attributes =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(SortableTableNodeView)
  },
})

// React component for the table node view
function SortableTableNodeView({ node }: ReactNodeViewProps) {
  const content = node.attrs.content
  
  if (!content) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
        No table content
      </div>
    )
  }

  // Parse the markdown content to get table data
  const tableData = parseMarkdownTable(content)
  
  if (!tableData) {
    return (
      <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center text-red-500">
        Invalid table format
      </div>
    )
  }

  return (
    <div className="my-4">
      <div className="mb-2 text-sm text-muted-foreground">
        <span className="font-medium">Sortable Table</span> - Click arrows to sort, edit headers directly
      </div>
      <UnifiedTableRenderer content={content} />
    </div>
  )
}
