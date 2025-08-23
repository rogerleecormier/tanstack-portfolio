// components/ui/typography.tsx
import * as React from "react";

export function H1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={[
        "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
        props.className,
      ].join(" ")}
    />
  );
}

export function H2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={[
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        props.className,
      ].join(" ")}
    />
  );
}

export function H3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={[
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        props.className,
      ].join(" ")}
    />
  );
}

export function H4(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      {...props}
      className={[
        "scroll-m-20 text-xl font-semibold tracking-tight",
        props.className,
      ].join(" ")}
    />
  );
}

export function P(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={["leading-7 [&:not(:first-child)]:mt-6", props.className].join(" ")}
    />
  );
}

export function Blockquote(
  props: React.HTMLAttributes<HTMLQuoteElement>
) {
  return (
    <blockquote
      {...props}
      className={["mt-6 border-l-2 pl-6 italic", props.className].join(" ")}
    />
  );
}

// Add Small, Muted, InlineCode, Table wrappers as needed using the docs' classes
