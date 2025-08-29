import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SortableTable } from './SortableTable'
import { parseMarkdownTable } from '@/utils/tableParser'
import { Eye, Code, Edit, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownTableRendererProps {
  markdownContent: string
  className?: string
}

export function MarkdownTableRenderer({ markdownContent, className }: MarkdownTableRendererProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown' | 'edit'>('preview')

  // Parse the markdown table
  const tableData = parseMarkdownTable(markdownContent)
  
  if (!tableData) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground", className)}>
        Invalid table format
      </div>
    )
  }

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy markdown:', error)
    }
  }

  return (
    <Card className={cn("w-full my-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Table</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">
                {copied ? 'Copied!' : 'Copy Markdown'}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'preview' | 'markdown' | 'edit')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Markdown
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-md border">
              <SortableTable data={tableData} />
            </div>
          </TabsContent>
          
          <TabsContent value="markdown" className="mt-4">
            <div className="rounded-md border bg-muted p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                {markdownContent}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                To edit this table, use the table editing tools in the markdown editor above.
                You can add/remove rows and columns, or modify cell content directly.
              </div>
              
              <div className="rounded-md border bg-muted p-4">
                <div className="text-sm font-medium mb-2">Table Structure:</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Headers: {tableData.headers.length}</div>
                  <div>• Rows: {tableData.rows.length}</div>
                  <div>• Total Cells: {tableData.headers.length * (tableData.rows.length + 1)}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
