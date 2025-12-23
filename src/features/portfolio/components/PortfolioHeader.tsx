/**
 * Portfolio Header
 * Reusable header component for portfolio detail pages
 */

import { Badge } from '@/components/ui/badge';
import { H1, P } from '@/components/ui/typography';
import { Tag } from 'lucide-react';
import type { Frontmatter } from '../types';
import { formatTag, getUniqueTags } from '../utils/tagUtils';

interface PortfolioHeaderProps {
  frontmatter: Frontmatter;
}

export function PortfolioHeader({ frontmatter }: PortfolioHeaderProps) {
  if (!frontmatter.title) return null;

  const uniqueTags = getUniqueTags(frontmatter.tags ?? []);

  return (
    <header className="mb-8 border-b border-strategy-gold/20 pb-8">
      <H1 className="mb-4 text-white">{frontmatter.title}</H1>
      {frontmatter.description && (
        <P className="text-lg leading-7 text-slate-300">
          {frontmatter.description}
        </P>
      )}
      {uniqueTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {uniqueTags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              className="border-strategy-gold/40 bg-strategy-gold/15 text-strategy-gold"
              title={formatTag(tag)}
            >
              <Tag className="mr-1 size-3" />
              <span className="whitespace-nowrap">{formatTag(tag)}</span>
            </Badge>
          ))}
        </div>
      )}
    </header>
  );
}
