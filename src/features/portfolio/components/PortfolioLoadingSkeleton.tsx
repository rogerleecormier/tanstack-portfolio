/**
 * Portfolio Loading Skeleton
 * Reusable skeleton component for portfolio page loading states
 */

import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioLoadingSkeletonProps {
  /** Whether this is an about/profile page */
  isProfilePage?: boolean;
  /** Number of content sections to show */
  sectionCount?: number;
}

export function PortfolioLoadingSkeleton({
  isProfilePage = false,
  sectionCount = 6,
}: PortfolioLoadingSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <header className="mb-8">
        <Skeleton className="mb-4 h-12 w-3/4" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-4 h-6 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </header>

      {/* Profile card skeleton for about page */}
      {isProfilePage && (
        <div className="mb-12">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      )}

      {/* Content skeleton - Preserve space to prevent layout shift */}
      <div className="min-h-[1000px] space-y-6">
        {Array.from({ length: sectionCount }, (_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            {i % 2 === 0 && <Skeleton className="mt-4 h-32 w-full" />}
          </div>
        ))}
      </div>
    </div>
  );
}
