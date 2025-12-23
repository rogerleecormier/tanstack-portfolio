/**
 * Category Configuration
 * Icon and color mappings for portfolio categories
 */

import {
  Briefcase,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export const CATEGORY_CONFIG = {
  'Strategy & Consulting': {
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  'Leadership & Culture': {
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  'Technology & Operations': {
    icon: Zap,
    color: 'from-surface-elevated0 to-strategy-gold',
    bgColor: 'bg-surface-elevated dark:bg-surface-deep/20',
    borderColor: 'border-border-subtle dark:border-precision-charcoal-light',
  },
  'AI & Automation': {
    icon: Sparkles,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  'Data & Analytics': {
    icon: TrendingUp,
    color: 'from-surface-elevated0 to-strategy-gold',
    bgColor: 'bg-surface-elevated dark:bg-surface-deep/20',
    borderColor: 'border-border-subtle dark:border-precision-charcoal-light',
  },
  'Risk & Compliance': {
    icon: Shield,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
} as const;

export type CategoryName = keyof typeof CATEGORY_CONFIG;

export const DEFAULT_CATEGORY_CONFIG = {
  icon: Briefcase,
  color: 'from-slate-500 to-slate-600',
  bgColor: 'bg-slate-50 dark:bg-slate-950/20',
  borderColor: 'border-slate-200 dark:border-slate-800',
};
