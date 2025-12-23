/**
 * Typography System Component Library
 *
 * Provides a consistent, reusable typography system across the portfolio.
 * Dark-first design with Hunter Green/Slate/Gold brand colors.
 *
 * Usage:
 * - Use these components instead of raw HTML tags for consistent styling
 * - All components support className prop for additional customization
 * - Gold accents available via className (text-gold, text-gold-accent)
 */

import * as React from 'react';

// H1 - Page/Section Titles
export function H1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={[
        'text-h1 text-hunter dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// H2 - Subsection Titles
export function H2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={[
        'text-h2 text-hunter dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// H3 - Section Headers
export function H3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={[
        'text-h3 text-hunter dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// H4 - Card/Component Titles
export function H4(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      {...props}
      className={[
        'text-h4 text-hunter dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// H5 - Subsection Headers
export function H5(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      {...props}
      className={[
        'text-h5 text-hunter dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// H6 - Minimal Headers
export function H6(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h6
      {...props}
      className={[
        'text-h6 text-hunter dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// P - Standard body paragraph text
export function P(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={[
        'text-body text-slate dark:text-slate-300',
        props.className,
      ].join(' ')}
    />
  );
}

// Small - Smaller, secondary text (captions, dates, help text)
export function Small(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <small
      {...props}
      className={[
        'text-small text-slate-600 dark:text-slate-400',
        props.className,
      ].join(' ')}
    />
  );
}

// XSmall - Minimal text for very small content
export function XSmall(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <span
      {...props}
      className={[
        'text-xs-subtle text-slate-500 dark:text-slate-500',
        props.className,
      ].join(' ')}
    />
  );
}

// Blockquote - For quoted or emphasized content
export function Blockquote(props: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      {...props}
      className={['text-blockquote accent-gold-left', props.className].join(
        ' '
      )}
    />
  );
}

// Muted - For de-emphasized text
export function Muted(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <span
      {...props}
      className={[
        'text-foreground/60 dark:text-foreground/50',
        props.className,
      ].join(' ')}
    />
  );
}

// Strong - For emphasis/importance
export function Strong(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <strong
      {...props}
      className={[
        'text-hunter font-bold dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// Accent - Gold-highlighted important text
export function Accent(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <span
      {...props}
      className={['text-gold-accent highlight-gold', props.className].join(' ')}
    />
  );
}

// Code - Inline code snippets
export function Code(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      {...props}
      className={[
        'inline-code rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        props.className,
      ].join(' ')}
    />
  );
}

// Lead - Opening paragraph with emphasis
export function Lead(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={[
        'text-lg leading-relaxed text-slate-700 dark:text-slate-300',
        props.className,
      ].join(' ')}
    />
  );
}

// Label - Form labels or tag-like text
export function Label(props: React.HTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={[
        'text-hunter text-sm font-medium dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// Heading - Generic heading with customizable level
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({ level = 2, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  const levelClasses: Record<number, string> = {
    1: 'text-h1',
    2: 'text-h2',
    3: 'text-h3',
    4: 'text-h4',
    5: 'text-h5',
    6: 'text-h6',
  };

  return (
    <Tag
      {...(props as React.ComponentProps<typeof Tag>)}
      className={[
        levelClasses[level],
        'text-hunter dark:text-strategy-gold',
        props.className,
      ].join(' ')}
    />
  );
}

// Export index for convenience
export const Typography = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Small,
  XSmall,
  Blockquote,
  Muted,
  Strong,
  Accent,
  Code,
  Lead,
  Label,
  Heading,
};
