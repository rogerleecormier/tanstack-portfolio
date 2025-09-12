import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Settings, Edit3 } from 'lucide-react';
import type { Frontmatter } from '../../schemas/frontmatter';
import { extractFrontMatter } from '../../lib/markdown';

interface FrontMatterPanelProps {
  markdown: string;
  onFrontMatterChange: (frontmatter: Record<string, unknown>) => void;
  onEdit?: () => void;
}

export function FrontMatterPanel({ markdown, onEdit }: FrontMatterPanelProps) {
  const [frontmatter, setFrontmatter] = useState<Partial<Frontmatter>>({});

  useEffect(() => {
    const extracted = extractFrontMatter(markdown);
    setFrontmatter(extracted.attributes as Partial<Frontmatter>);
  }, [markdown]);

  return (
    <Card className='border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70'>
      <CardHeader className='relative shrink-0 border-b border-slate-200/60 dark:border-slate-700/60'>
        <div className='flex w-full items-center justify-between'>
          <CardTitle className='flex items-center gap-3'>
            <div className='rounded-lg bg-gradient-to-br from-teal-600 to-blue-600 p-2 shadow-md'>
              <Settings className='size-5 text-white' />
            </div>
            <div>
              <h3
                className='text-lg font-semibold text-slate-900 dark:text-white'
                style={{ fontWeight: 700 }}
              >
                Front Matter
              </h3>
              <div className='mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-600 to-blue-600'></div>
            </div>
          </CardTitle>
          <button
            className='flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-xs text-white shadow-sm hover:bg-teal-700'
            onClick={onEdit}
          >
            <Edit3 className='size-3' />
            Edit
          </button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4 p-4'>
        <div className='space-y-4'>
          {/* Title Section */}
          <div className='rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-700/50'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-teal-600'></div>
              <span className='text-xs font-semibold uppercase text-teal-700 dark:text-teal-300'>
                Title
              </span>
            </div>
            <div className='truncate font-medium text-slate-800 dark:text-slate-200'>
              {frontmatter.title || 'No title set'}
            </div>
          </div>

          {/* Description Section */}
          <div className='rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-700/50'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600'></div>
              <span className='text-xs font-semibold uppercase text-blue-700 dark:text-blue-300'>
                Description
              </span>
            </div>
            <div className='line-clamp-3 text-sm text-slate-600 dark:text-slate-300'>
              {frontmatter.description || 'No description set'}
            </div>
          </div>

          {/* Date & Layout Grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-700/50'>
              <div className='mb-1 flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-purple-600'></div>
                <span className='text-xs font-semibold uppercase text-purple-700 dark:text-purple-300'>
                  Date
                </span>
              </div>
              <div className='text-sm text-slate-800 dark:text-slate-200'>
                {(() => {
                  const date = frontmatter.date;
                  if (!date) return 'Not set';
                  if (
                    typeof date === 'object' &&
                    date !== null &&
                    'toISOString' in date
                  ) {
                    return (date as Date).toISOString().split('T')[0];
                  }
                  return String(date);
                })()}
              </div>
            </div>

            <div className='rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-700/50'>
              <div className='mb-1 flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-orange-600'></div>
                <span className='text-xs font-semibold uppercase text-orange-700 dark:text-orange-300'>
                  Layout
                </span>
              </div>
              <div className='text-sm text-slate-800 dark:text-slate-200'>
                {frontmatter.layout || 'Default'}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className='rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-700/50'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-teal-600'></div>
              <span className='text-xs font-semibold uppercase text-teal-700 dark:text-teal-300'>
                Tags
              </span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {frontmatter.tags?.length ? (
                frontmatter.tags.map(tag => (
                  <Badge
                    key={tag}
                    className='border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className='text-sm italic text-slate-500 dark:text-slate-400'>
                  No tags set
                </span>
              )}
            </div>
          </div>

          {/* Draft Status */}
          <div className='rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-700/50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-slate-600'></div>
                <span className='text-xs font-semibold uppercase text-slate-700 dark:text-slate-300'>
                  Draft Status
                </span>
              </div>
              <span
                className={`rounded-md px-2 py-1 text-sm font-medium ${
                  frontmatter.draft
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                }`}
              >
                {frontmatter.draft ? 'Draft' : 'Published'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className='border-t border-slate-200 pt-3 dark:border-slate-700'>
          <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
            <div className='size-1 rounded-full bg-slate-400'></div>
            <span>Use "Edit" button above to modify front matter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
