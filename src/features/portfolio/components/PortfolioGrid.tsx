/**
 * Portfolio Grid
 * Reusable grid component for displaying portfolio cards
 */

import type { CachedContentItem } from '@/api/cachedContentService';
import { PortfolioCard } from './PortfolioCard';

interface PortfolioGridProps {
  items: CachedContentItem[];
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <PortfolioCard key={item.id} item={item} />
      ))}
    </div>
  );
}
