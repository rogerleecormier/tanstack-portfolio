/**
 * Portfolio Card
 * Reusable card component for portfolio items in grid layouts
 */

import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Briefcase, Tag } from 'lucide-react';
import type { CachedContentItem } from '@/api/cachedContentService';
import { CATEGORY_CONFIG } from '../config/categoryConfig';
import { formatTag, parseTagsSafely } from '../utils/tagUtils';

interface PortfolioCardProps {
  item: CachedContentItem;
}

export function PortfolioCard({ item }: PortfolioCardProps) {
  const categoryInfo = CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] || {
    icon: Briefcase,
    color: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-950/20',
    borderColor: 'border-slate-200 dark:border-slate-800',
  };
  const CategoryIcon = categoryInfo.icon;
  const cleanTags = parseTagsSafely(item.tags).filter(
    tag => tag && tag.trim().length > 0
  );

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-strategy-gold/40 hover:bg-surface-elevated/50 hover:shadow-xl">
      {/* Gold accent on top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-strategy-gold/60" />

      <div className="relative flex flex-1 flex-col p-6">
        {/* Category Badge */}
        <div className="mb-4 flex items-start justify-between">
          <Badge
            variant="secondary"
            className="border-strategy-gold/30 bg-strategy-gold/20 text-strategy-gold shadow-sm"
          >
            <CategoryIcon className="mr-1 size-3" />
            {item.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-bold text-text-foreground transition-colors group-hover:text-strategy-gold">
          <Link
            to={`/${item.url}`}
            className="decoration-2 underline-offset-4 hover:underline"
          >
            {item.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-3 flex-1 leading-relaxed text-text-secondary">
          {item.description}
        </p>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {cleanTags.slice(0, 3).map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="h-auto border-strategy-gold/30 bg-strategy-gold/20 px-2 py-1 text-xs text-strategy-gold"
            >
              <Tag className="mr-1 size-3" />
              <span className="whitespace-nowrap">{formatTag(tag)}</span>
            </Badge>
          ))}
          {cleanTags.length > 3 && (
            <Badge
              variant="secondary"
              className="border-text-tertiary/30 bg-text-tertiary/10 px-2 py-1 text-xs text-text-tertiary"
            >
              +{cleanTags.length - 3}
            </Badge>
          )}
        </div>

        {/* View Details Button */}
        <Link
          to={`/${item.url}`}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-strategy-gold px-4 py-3 font-semibold text-precision-charcoal transition-all duration-200 hover:bg-strategy-gold/90 hover:shadow-lg"
        >
          View Details
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
