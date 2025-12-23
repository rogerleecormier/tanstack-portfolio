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
    <Card className='border border-surface-elevated0/20 bg-surface-deep/30 shadow-sm backdrop-blur-xl dark:border-surface-elevated0/20 dark:bg-surface-deep/30'>
      <CardHeader className='relative shrink-0 border-b border-surface-elevated0/10 dark:border-surface-elevated0/10'>
        <div className='flex w-full items-center justify-between'>
          <CardTitle className='flex items-center gap-3'>
            <div className='rounded-lg bg-surface-deep/60 p-2 shadow-md ring-1 ring-surface-elevated0/20 backdrop-blur-md'>
              <Settings className='size-5 text-strategy-gold' />
            </div>
            <div>
              <h3
                className='text-lg font-semibold text-white dark:text-strategy-gold'
                style={{ fontWeight: 700 }}
              >
                Front Matter
              </h3>
              <div className='mt-1 h-0.5 w-16 rounded-full bg-surface-elevated0/60'></div>
            </div>
          </CardTitle>
          <button
            className='flex items-center gap-1.5 rounded-md bg-strategy-gold px-3 py-1.5 text-xs text-white shadow-sm transition-all duration-200 hover:bg-strategy-gold-dark'
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
          <div className='rounded-lg border border-surface-elevated0/20 bg-surface-deep/40 p-3 backdrop-blur-md dark:border-surface-elevated0/20 dark:bg-surface-deep/40'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-strategy-gold'></div>
              <span className='text-xs font-semibold uppercase text-strategy-gold/30 dark:text-strategy-gold/30'>
                Title
              </span>
            </div>
            <div className='truncate font-medium text-grey-200 dark:text-grey-300'>
              {frontmatter.title ?? 'No title set'}
            </div>
          </div>

          {/* Description Section */}
          <div className='rounded-lg border border-surface-elevated0/20 bg-surface-deep/40 p-3 backdrop-blur-md dark:border-surface-elevated0/20 dark:bg-surface-deep/40'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-slate-600'></div>
              <span className='text-xs font-semibold uppercase text-slate-700 dark:text-slate-300'>
                Description
              </span>
            </div>
            <div className='line-clamp-3 text-sm text-grey-400 dark:text-grey-400'>
              {frontmatter.description ?? 'No description set'}
            </div>
          </div>

          {/* Date & Layout Grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='rounded-lg border border-surface-elevated0/20 bg-surface-deep/40 p-3 backdrop-blur-md dark:border-surface-elevated0/20 dark:bg-surface-deep/40'>
              <div className='mb-1 flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-strategy-gold'></div>
                <span className='text-xs font-semibold uppercase text-strategy-gold/30 dark:text-strategy-gold/30'>
                  Date
                </span>
              </div>
              <div className='text-sm text-grey-200 dark:text-grey-300'>
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

            <div className='rounded-lg border border-surface-elevated0/20 bg-surface-deep/40 p-3 backdrop-blur-md dark:border-surface-elevated0/20 dark:bg-surface-deep/40'>
              <div className='mb-1 flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-strategy-gold'></div>
                <span className='text-xs font-semibold uppercase text-strategy-gold/30 dark:text-strategy-gold/30'>
                  Layout
                </span>
              </div>
              <div className='text-sm text-grey-200 dark:text-grey-300'>
                {frontmatter.layout ?? 'Default'}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className='rounded-lg border border-surface-elevated0/20 bg-surface-deep/40 p-3 backdrop-blur-md dark:border-surface-elevated0/20 dark:bg-surface-deep/40'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-strategy-gold'></div>
              <span className='text-xs font-semibold uppercase text-strategy-gold/30 dark:text-strategy-gold/30'>
                Tags
              </span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {frontmatter.tags?.length ? (
                frontmatter.tags.map(tag => (
                  <Badge
                    key={tag}
                    className='border border-surface-elevated0/30 bg-surface-elevated0/20 text-strategy-gold/30 dark:border-surface-elevated0/30 dark:bg-surface-elevated0/10 dark:text-strategy-gold/30'
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className='text-sm italic text-grey-400 dark:text-grey-500'>
                  No tags set
                </span>
              )}
            </div>
          </div>

          {/* Draft Status */}
          <div className='rounded-lg border border-surface-elevated0/20 bg-surface-deep/40 p-3 backdrop-blur-md dark:border-surface-elevated0/20 dark:bg-surface-deep/40'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-strategy-gold'></div>
                <span className='text-xs font-semibold uppercase text-strategy-gold/30 dark:text-strategy-gold/30'>
                  Draft Status
                </span>
              </div>
              <span
                className={`rounded-md px-2 py-1 text-sm font-medium ${
                  frontmatter.draft
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                }`}
              >
                {frontmatter.draft ? 'Draft' : 'Published'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className='border-t border-indigo-200/60 pt-3 dark:border-indigo-800/60'>
          <div className='flex items-center gap-2 text-xs text-grey-400 dark:text-grey-500'>
            <div className='size-1 rounded-full bg-strategy-gold'></div>
            <span>Use "Edit" button above to modify front matter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
