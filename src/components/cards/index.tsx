import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

/**
 * GlassCard - Glassmorphic Card Component
 * Features: Backdrop blur, semi-transparent background, subtle border
 * Perfect for modern, layered UI designs
 */

const glassCardVariants = cva(
  'glass-card rounded-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: '',
        hover: 'hover:scale-[1.02] hover:shadow-lg',
      },
      padding: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
GlassCard.displayName = 'GlassCard';

/**
 * SolidCard - Solid Background Card Component
 * Features: Solid hunter green background, standard border, shadow
 * Perfect for content-heavy sections
 */

const solidCardVariants = cva(
  'rounded-lg border transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-card border-border shadow-sm',
        hunter: 'bg-brand-hunter border-brand-hunter',
        slate: 'bg-brand-slate border-brand-slate',
        elevated: 'bg-card border-border shadow-lg',
      },
      padding: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface SolidCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof solidCardVariants> {}

export const SolidCard = React.forwardRef<HTMLDivElement, SolidCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(solidCardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
SolidCard.displayName = 'SolidCard';

/**
 * InteractiveCard - Interactive Card with Hover Effects
 * Features: Scale, shadow, and optional click handler
 * Perfect for clickable items, portfolio pieces, project cards
 */

const interactiveCardVariants = cva(
  'cursor-pointer rounded-lg border transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        glass: 'glass-card hover:scale-105 hover:shadow-xl',
        solid: 'bg-card border-border shadow-sm hover:scale-105 hover:shadow-xl',
        hunter: 'bg-brand-hunter border-brand-hunter hover:scale-105 hover:shadow-xl',
      },
      padding: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'solid',
      padding: 'default',
    },
  }
);

export interface InteractiveCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof interactiveCardVariants> {
  onCardClick?: () => void;
}

export const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  InteractiveCardProps
>(
  (
    { className, variant, padding, onCardClick, onClick, ...props },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      onCardClick?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          interactiveCardVariants({ variant, padding }),
          className
        )}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCardClick?.();
          }
        }}
        role="button"
        tabIndex={0}
        {...props}
      />
    );
  }
);
InteractiveCard.displayName = 'InteractiveCard';

/**
 * Styled Card Components using shadcn's Card as base
 * These can be used as drop-in replacements with enhanced Hunter Green styling
 */

export const BrandCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn('border-brand-hunter bg-card', className)}
    {...props}
  />
));
BrandCard.displayName = 'BrandCard';

export const BrandCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader ref={ref} className={cn('', className)} {...props} />
));
BrandCardHeader.displayName = 'BrandCardHeader';

export const BrandCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn('text-brand-hunter', className)}
    {...props}
  />
));
BrandCardTitle.displayName = 'BrandCardTitle';

export const BrandCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn('text-brand-slate', className)}
    {...props}
  />
));
BrandCardDescription.displayName = 'BrandCardDescription';

export const BrandCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent ref={ref} className={cn('', className)} {...props} />
));
BrandCardContent.displayName = 'BrandCardContent';

export const BrandCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter ref={ref} className={cn('', className)} {...props} />
));
BrandCardFooter.displayName = 'BrandCardFooter';

/**
 * Export all card components together
 */
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
};
