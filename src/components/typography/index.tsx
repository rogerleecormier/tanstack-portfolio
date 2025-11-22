import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * H1 - Hero Headings
 * Large, bold headings for hero sections and major page titles
 * Responsive: 3xl on mobile, 5xl on desktop
 */
export const H1 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          'scroll-m-20 text-3xl font-bold tracking-tight text-brand-hunter md:text-5xl',
          className
        )}
        {...props}
      >
        {children}
      </h1>
    );
  }
);
H1.displayName = 'H1';

/**
 * H2 - Section Headings
 * Semi-bold headings for major sections
 * Responsive: 2xl on mobile, 3xl on desktop
 */
export const H2 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          'scroll-m-20 text-2xl font-semibold tracking-tight text-brand-hunter transition-colors md:text-3xl',
          className
        )}
        {...props}
      >
        {children}
      </h2>
    );
  }
);
H2.displayName = 'H2';

/**
 * H3 - Subsection Headings
 * Medium weight headings for subsections
 * Responsive: xl on mobile, 2xl on desktop
 */
export const H3 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'scroll-m-20 text-xl font-medium tracking-normal text-brand-slate md:text-2xl',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
H3.displayName = 'H3';

/**
 * H4 - Minor Headings
 * Regular weight headings for smaller sections
 */
export const H4 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn(
          'scroll-m-20 text-lg font-medium tracking-normal text-brand-slate md:text-xl',
          className
        )}
        {...props}
      >
        {children}
      </h4>
    );
  }
);
H4.displayName = 'H4';

/**
 * H5 - Small Headings
 */
export const H5 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn(
          'scroll-m-20 text-base font-medium tracking-normal text-brand-slate md:text-lg',
          className
        )}
        {...props}
      >
        {children}
      </h5>
    );
  }
);
H5.displayName = 'H5';

/**
 * H6 - Smallest Headings
 */
export const H6 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h6
        ref={ref}
        className={cn(
          'scroll-m-20 text-sm font-medium tracking-normal text-brand-slate md:text-base',
          className
        )}
        {...props}
      >
        {children}
      </h6>
    );
  }
);
H6.displayName = 'H6';

/**
 * P - Paragraph Text
 * Standard body text with relaxed leading
 */
export const P = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'leading-relaxed text-foreground [&:not(:first-child)]:mt-4',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
P.displayName = 'P';

/**
 * Small - Small Text
 * For meta information, captions, and secondary text
 */
export const Small = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <small
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </small>
    );
  }
);
Small.displayName = 'Small';

/**
 * Blockquote - Quoted Content
 * For quotes, callouts, and important notes
 */
export const Blockquote = React.forwardRef<HTMLQuoteElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <blockquote
        ref={ref}
        className={cn(
          'mt-6 border-l-4 border-brand-hunter pl-6 italic text-muted-foreground',
          className
        )}
        {...props}
      >
        {children}
      </blockquote>
    );
  }
);
Blockquote.displayName = 'Blockquote';

/**
 * Lead - Lead Paragraph
 * Larger text for introductory paragraphs
 */
export const Lead = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-lg text-muted-foreground md:text-xl', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
Lead.displayName = 'Lead';

/**
 * Muted - Muted Text
 * For less important text
 */
export const Muted = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
Muted.displayName = 'Muted';

/**
 * InlineCode - Inline Code
 * For inline code snippets
 */
export const InlineCode = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <code
        ref={ref}
        className={cn(
          'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }
);
InlineCode.displayName = 'InlineCode';
