/**
 * Portfolio Search and Filter Component
 * Reusable search/filter UI for portfolio list pages
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronDown, Filter, Search, Tag, X } from 'lucide-react';

interface PortfolioSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  selectedTags: string[];
  onTagsClick: () => void;
  onClearFilters: () => void;
  onRemoveTag: (tag: string) => void;
}

export function PortfolioSearchFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedTags,
  onTagsClick,
  onClearFilters,
  onRemoveTag,
}: PortfolioSearchFilterProps) {
  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || selectedTags.length > 0;

  return (
    <div className="rounded-lg border border-strategy-gold/20 bg-surface-elevated/30 p-6 shadow-lg backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-strategy-gold" />
          <Input
            placeholder="Search portfolio and expertise..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/50 pl-12 text-text-foreground placeholder:text-text-tertiary focus:border-strategy-gold/50 focus:ring-strategy-gold/20"
          />
        </div>

        {/* Category Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50"
            >
              <span className="mr-2">
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
              </span>
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 w-full overflow-y-auto rounded-lg border-strategy-gold/20 bg-surface-elevated/90 shadow-xl backdrop-blur-xl sm:w-64">
            <DropdownMenuItem
              onClick={() => onCategoryChange('all')}
              className="mx-2 my-1 rounded-lg text-strategy-gold hover:bg-surface-deep/50"
            >
              All Categories
            </DropdownMenuItem>
            {categories.map(category => (
              <DropdownMenuItem
                key={category}
                onClick={() => onCategoryChange(category)}
                className="mx-2 my-1 rounded-lg text-strategy-gold hover:bg-surface-deep/50"
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter Button */}
        <Button
          variant="outline"
          onClick={onTagsClick}
          className="h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50"
        >
          <Filter className="mr-2 size-4" />
          Tags{' '}
          {selectedTags.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-strategy-gold text-precision-charcoal"
            >
              {selectedTags.length}
            </Badge>
          )}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="h-12 rounded-lg border-strategy-gold/20 bg-surface-deep/30 px-6 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50"
          >
            <X className="mr-2 size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mt-4 border-t border-strategy-gold/20 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium text-strategy-gold">
              Active filters:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge
                key={tag}
                variant="default"
                className="cursor-pointer border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90"
                onClick={() => onRemoveTag(tag)}
              >
                <Tag className="mr-1 size-3" />
                {tag}
                <X className="ml-1 size-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
