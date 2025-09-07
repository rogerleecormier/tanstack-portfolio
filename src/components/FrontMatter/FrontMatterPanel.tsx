import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Settings, Edit3 } from 'lucide-react'
import type { Frontmatter } from '../../schemas/frontmatter'
import { extractFrontMatter } from '../../lib/markdown'

interface FrontMatterPanelProps {
  markdown: string
  onFrontMatterChange: (frontmatter: Record<string, unknown>) => void
  onEdit?: () => void
}

export function FrontMatterPanel({ markdown, onEdit }: FrontMatterPanelProps) {
  const [frontmatter, setFrontmatter] = useState<Partial<Frontmatter>>({})

  useEffect(() => {
    const extracted = extractFrontMatter(markdown)
    setFrontmatter(extracted.attributes as Partial<Frontmatter>)
  }, [markdown])

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
      <CardHeader className="flex-shrink-0 relative border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg shadow-md">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white" style={{fontWeight: 700}}>
                Front Matter
              </h3>
              <div className="h-0.5 w-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full mt-1"></div>
            </div>
          </CardTitle>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm"
            onClick={onEdit}
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-4">
          {/* Title Section */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
              <span className="text-xs uppercase font-semibold text-teal-700 dark:text-teal-300">Title</span>
            </div>
            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{frontmatter.title || 'No title set'}</div>
          </div>

          {/* Description Section */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span className="text-xs uppercase font-semibold text-blue-700 dark:text-blue-300">Description</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{frontmatter.description || 'No description set'}</div>
          </div>

          {/* Date & Layout Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span className="text-xs uppercase font-semibold text-purple-700 dark:text-purple-300">Date</span>
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-200">
                {(frontmatter as any).date
                  ? (frontmatter as any).date instanceof Date
                    ? (frontmatter as any).date.toISOString().split('T')[0]
                    : String((frontmatter as any).date)
                  : 'Not set'
                }
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <span className="text-xs uppercase font-semibold text-orange-700 dark:text-orange-300">Layout</span>
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-200">{frontmatter.layout || 'Default'}</div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
              <span className="text-xs uppercase font-semibold text-teal-700 dark:text-teal-300">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags?.length ? (
                frontmatter.tags.map((tag) => (
                  <Badge key={tag} className="bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400 italic">No tags set</span>
              )}
            </div>
          </div>

          {/* Draft Status */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                <span className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Draft Status</span>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-md ${
                frontmatter.draft
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
              }`}>
                {frontmatter.draft ? 'Draft' : 'Published'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <span>Use "Edit" button above to modify front matter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
