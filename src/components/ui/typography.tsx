// components/ui/typography.tsx
import * as React from 'react';

export function H1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={[
        'scroll-m-20 text-balance text-4xl font-extrabold tracking-tight',
        props.className,
      ].join(' ')}
    />
  );
}

export function H2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={[
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        props.className,
      ].join(' ')}
    />
  );
}

export function H3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={[
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        props.className,
      ].join(' ')}
    />
  );
}

export function H4(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      {...props}
      className={[
        'scroll-m-20 text-xl font-semibold tracking-tight',
        props.className,
      ].join(' ')}
    />
  );
}

export function P(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={['leading-7 [&:not(:first-child)]:mt-6', props.className].join(
        ' '
      )}
    />
  );
}

export function Blockquote(props: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      {...props}
      className={['mt-6 border-l-2 pl-6 italic', props.className].join(' ')}
    />
  );
}

export function Small(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <small
      {...props}
      className={['text-sm font-medium leading-none', props.className].join(
        ' '
      )}
    />
  );
}

export function Muted(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={['text-sm text-muted-foreground', props.className].join(' ')}
    />
  );
}

export function InlineCode(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      {...props}
      className={[
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        props.className,
      ].join(' ')}
    />
  );
}

export function Lead(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={['text-xl text-muted-foreground', props.className].join(' ')}
    />
  );
}

export function Large(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={['text-lg font-semibold', props.className].join(' ')}
    />
  );
}
