import React, { useState, useCallback } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import { H1, P } from '@/components/ui/typography'
import MarkdownEditor from '@/components/MarkdownEditor'

const MarkdownEditorPage: React.FC = () => {
  const [markdownOutput, setMarkdownOutput] = useState('')

  const handleContentChange = useCallback((_html: string, markdown: string) => {
    setMarkdownOutput(markdown)
  }, [])

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdownOutput], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [markdownOutput])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <H1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Markdown Editor
            </H1>
          </div>
          <P className="text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A rich text editor for creating and editing markdown content with real-time markdown generation and syntax highlighting.
          </P>
        </div>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
          <Link to="/tools">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
        </Button>
      </div>

      <Card className="border border-teal-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-teal-900">Professional Markdown Editor</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={downloadMarkdown}
                size="sm"
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
                title="Download Markdown"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <MarkdownEditor
            initialContent={`# Professional Markdown Editor

Welcome to the markdown editor designed for professional content creation. This tool helps you create well-formatted markdown documents with real-time markdown generation and syntax highlighting.

## Key Features

* **Rich Text Editing:** Intuitive toolbar for common formatting options
* **Real-time Markdown:** See your markdown output as you type
* **Syntax Highlighting:** Code blocks with language-specific highlighting
* **Export Functionality:** Download your markdown files instantly

## Getting Started

Use the toolbar above to format your content. The markdown will be generated automatically as you type, and you can download it when you're ready.

> This editor supports all standard markdown elements including headers, lists, code blocks, blockquotes, and inline formatting.

## Code Examples

You can create code blocks with syntax highlighting for various programming languages:

\`\`\`javascript
// Example JavaScript function
function createMarkdown() {
  const content = "Professional content";
  return \`# \${content}\`;
}
\`\`\`

\`\`\`python
# Example Python function
def generate_content():
    return "Professional markdown content"
\`\`\`

## Chart Examples

You can insert interactive charts using the chart button in the toolbar. Here's an example:

### Chart Example

\`\`\`barchart
[
  {"date": "Category 1", "value": 100},
  {"date": "Category 2", "value": 190},
  {"date": "Category 3", "value": 150}
]
\`\`\`

Charts support various types including bar charts, line charts, scatter plots, and histograms. Use the chart button to insert your own charts with custom data.

## Table Examples

You can create tables using markdown syntax. Here's an example:

| Budget Tier | Budget Range (USD) | Project Count | Mean Complexity (Agile) | Mean Complexity (Non-Agile) |
|-------------|-------------------|---------------|-------------------------|----------------------------|
| Low (≤33rd) | $159,355.55 – $790,000.26 | 1,334 | 4.670 | 3.982 |
| Mid (33rd–67th) | $790,000.26 – $1,279,552.09 | 1,333 | 6.667 | 5.436 |
| High (>67th) | $1,279,552.09 – $3,768,354.37 | 1,333 | 8.919 | 6.391 |

Tables support any number of columns and rows, and will be automatically formatted with proper borders and styling.`}
            onContentChange={handleContentChange}
            showToolbar={true}
            minHeight="600px"
          />
        </CardContent>
      </Card>

      <Card className="mt-8 border border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-teal-900">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-teal-800 pl-4">
            <li>Use the toolbar to format your text with headers, bold, italic, lists, and more</li>
            <li>Click the clipboard icon to paste markdown content from your clipboard</li>
            <li>Click the chart icon to insert shadcn charts with JSON data</li>
            <li>Click the trash icon to clear the editor and start fresh</li>
            <li>Download your markdown file when you're ready</li>
            <li>The editor supports code blocks with syntax highlighting for various programming languages</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  )
}

export default MarkdownEditorPage
