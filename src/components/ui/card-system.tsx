/**
 * Card Component Library
 *
 * Provides a consistent card system with multiple variants:
 * - GlassCard: Glassmorphic effect with Hunter Green accent (primary)
 * - SolidCard: Solid background, professional (secondary)
 * - InteractiveCard: With hover effects and CTA support
 * - BorderCard: Minimal, border-only design
 * - OutlineCard: Bordered card with gold accents
 *
 * All variants support:
 * - Header / Title / Description / Content / Footer slots
 * - Icon support (Lucide)
 * - Badge support
 * - Dark mode optimization
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// Base Card Component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'interactive' | 'border' | 'outline';
  hover?: boolean;
}

const cardVariants = {
  glass: 'glass-card border-white/10 bg-white/5',
  solid: 'card-primary shadow-sm',
  interactive: 'card-primary shadow-sm card-hover cursor-pointer',
  border:
    'bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg',
  outline:
    'bg-transparent border-2 border-gold-600/40 dark:border-gold-400/40 rounded-lg',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'solid', hover = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg transition-all duration-300',
        cardVariants[variant],
        hover && 'hover:shadow-lg dark:hover:shadow-md',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: 'gold' | 'hunter' | 'none';
  icon?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ accent = 'none', icon, className, children, ...props }, ref) => {
    const accentClasses = {
      gold: 'accent-gold-top',
      hunter: 'accent-hunter-left',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mb-4 flex items-center gap-3 pb-4',
          accentClasses[accent],
          className
        )}
        {...props}
      >
        {icon && (
          <div className='flex-shrink-0 text-gold-600 dark:text-gold-400'>
            {icon}
          </div>
        )}
        <div className='flex-1'>{children}</div>
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

// Card Title
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { accent?: boolean }
>(({ accent = false, className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-h4 text-hunter font-semibold dark:text-hunter-300',
      accent && 'text-gold-accent',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-small text-slate dark:text-slate-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-body text-foreground/90', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Badge for cards
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'hunter' | 'slate';
}

export const CardBadge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'slate', className, ...props }, ref) => {
    const badgeVariants = {
      gold: 'badge-gold',
      hunter: 'badge-hunter',
      slate: 'badge-slate',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
          badgeVariants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
CardBadge.displayName = 'CardBadge';

// Preset Card Combinations for common use cases

// Glass Card Preset - Primary card type with hunter green accent
export const GlassCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ ...props }, ref) => <Card ref={ref} variant='glass' {...props} />
);
GlassCard.displayName = 'GlassCard';

// Solid Card Preset - Professional solid background
export const SolidCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = true, ...props }, ref) => (
    <Card ref={ref} variant='solid' hover={hover} {...props} />
  )
);
SolidCard.displayName = 'SolidCard';

// Interactive Card Preset - Clickable card with hover state
export const InteractiveCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ ...props }, ref) => <Card ref={ref} variant='interactive' {...props} />
);
InteractiveCard.displayName = 'InteractiveCard';

// Border Card Preset - Minimal card design
export const BorderCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ ...props }, ref) => <Card ref={ref} variant='border' {...props} />
);
BorderCard.displayName = 'BorderCard';

// Gold Outline Card - CTA or featured card
export const GoldOutlineCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ ...props }, ref) => (
    <Card
      ref={ref}
      variant='outline'
      className='transition-colors hover:border-gold-600/70 dark:hover:border-gold-400/70'
      {...props}
    />
  )
);
GoldOutlineCard.displayName = 'GoldOutlineCard';

// Experience Card - Specialized for work/project experiences
export interface ExperienceCardProps extends CardProps {
  title?: string;
  subtitle?: string;
  period?: string;
  description?: string;
  badges?: Array<{ text: string; variant?: 'gold' | 'hunter' | 'slate' }>;
  icon?: React.ReactNode;
}

export const ExperienceCard = React.forwardRef<
  HTMLDivElement,
  ExperienceCardProps
>(
  (
    {
      title,
      subtitle,
      period,
      description,
      badges = [],
      icon,
      variant = 'solid',
      className,
      ...props
    },
    ref
  ) => (
    <Card
      ref={ref}
      variant={variant}
      className={cn('space-y-3', className)}
      {...props}
    >
      <CardHeader accent='gold' icon={icon}>
        <div>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
          {period && <p className='text-xs-subtle mt-1'>{period}</p>}
        </div>
      </CardHeader>
      {description && <CardContent>{description}</CardContent>}
      {badges.length > 0 && (
        <div className='flex flex-wrap gap-2 pt-2'>
          {badges.map((badge, idx) => (
            <CardBadge key={idx} variant={badge.variant ?? 'slate'}>
              {badge.text}
            </CardBadge>
          ))}
        </div>
      )}
    </Card>
  )
);
ExperienceCard.displayName = 'ExperienceCard';

// Skill Card - For displaying skills/technologies
export interface SkillCardProps extends CardProps {
  title?: string;
  skills?: Array<string>;
  icon?: React.ReactNode;
}

export const SkillCard = React.forwardRef<HTMLDivElement, SkillCardProps>(
  (
    { title, skills = [], icon, variant = 'border', className, ...props },
    ref
  ) => (
    <Card
      ref={ref}
      variant={variant}
      className={cn('p-4 text-center', className)}
      {...props}
    >
      {icon && (
        <div className='mb-3 flex justify-center text-2xl text-gold-600 dark:text-gold-400'>
          {icon}
        </div>
      )}
      {title && <CardTitle className='mb-3 text-center'>{title}</CardTitle>}
      {skills.length > 0 && (
        <div className='flex flex-wrap justify-center gap-2'>
          {skills.map((skill, idx) => (
            <CardBadge key={idx} variant='gold'>
              {skill}
            </CardBadge>
          ))}
        </div>
      )}
    </Card>
  )
);
SkillCard.displayName = 'SkillCard';

// Feature Card - For highlighting key features/benefits
export interface FeatureCardProps extends CardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  highlight?: 'gold' | 'hunter';
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      title,
      description,
      icon,
      highlight = 'gold',
      variant = 'border',
      className,
      ...props
    },
    ref
  ) => (
    <Card
      ref={ref}
      variant={variant}
      className={cn('space-y-3 p-6 text-center', className)}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            'flex justify-center text-4xl',
            highlight === 'gold' && 'text-gold-600 dark:text-gold-400',
            highlight === 'hunter' && 'text-hunter-600 dark:text-hunter-400'
          )}
        >
          {icon}
        </div>
      )}
      {title && (
        <CardTitle
          className={cn(
            'text-center',
            highlight === 'gold' && 'text-gold-accent',
            highlight === 'hunter' && 'text-hunter-strong'
          )}
        >
          {title}
        </CardTitle>
      )}
      {description && (
        <CardDescription className='text-center'>{description}</CardDescription>
      )}
    </Card>
  )
);
FeatureCard.displayName = 'FeatureCard';

// Project Card - Specialized for portfolio projects
export interface ProjectCardProps extends CardProps {
  title?: string;
  description?: string;
  image?: string;
  tags?: Array<string>;
  status?: 'featured' | 'completed' | 'in-progress';
  link?: string;
  onLinkClick?: () => void;
}

export const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  (
    {
      title,
      description,
      image,
      tags = [],
      status = 'completed',
      link,
      onLinkClick,
      className,
      ...props
    },
    ref
  ) => (
    <Card
      ref={ref}
      variant='solid'
      hover
      className={cn('overflow-hidden', className)}
      {...props}
    >
      {image && (
        <div className='h-40 w-full overflow-hidden bg-gradient-to-br from-hunter-600 to-hunter-800'>
          <img src={image} alt={title} className='h-full w-full object-cover' />
        </div>
      )}
      <CardHeader accent={status === 'featured' ? 'gold' : 'hunter'}>
        <div>
          {title && (
            <CardTitle accent={status === 'featured'}>{title}</CardTitle>
          )}
          {status === 'featured' && (
            <CardBadge variant='gold'>Featured</CardBadge>
          )}
        </div>
      </CardHeader>
      {description && <CardContent>{description}</CardContent>}
      <CardFooter>
        <div className='flex flex-wrap gap-1.5'>
          {tags.map((tag, idx) => (
            <CardBadge key={idx} variant='slate'>
              {tag}
            </CardBadge>
          ))}
        </div>
        {link && (
          <button
            onClick={onLinkClick}
            className='ml-auto text-sm font-medium text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300'
          >
            View →
          </button>
        )}
      </CardFooter>
    </Card>
  )
);
ProjectCard.displayName = 'ProjectCard';

// Export all components and types
export const CardComponents = {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBadge,
  GlassCard,
  SolidCard,
  InteractiveCard,
  BorderCard,
  GoldOutlineCard,
  ExperienceCard,
  SkillCard,
  FeatureCard,
  ProjectCard,
};
