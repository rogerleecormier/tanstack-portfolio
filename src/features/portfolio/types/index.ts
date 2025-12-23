/**
 * Portfolio Feature Types
 * Centralized type definitions for the portfolio feature
 */

import type { CachedContentItem } from '@/api/cachedContentService';

export type PortfolioItem = CachedContentItem;

export interface Frontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  author?: string;
  keywords?: string[];
  image?: string;
}

export interface TOCEntry {
  title: string;
  slug: string;
}

export interface CategoryConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

export type ContentType = 'website' | 'article' | 'profile';
