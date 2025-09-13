declare module 'turndown' {
  export interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    br?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: '```' | '~~~';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '**' | '__';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    preformattedCode?: boolean;
  }

  export interface Rule {
    filter: string | string[] | ((node: Element) => boolean);
    replacement: (
      content: string,
      node: Element,
      options: TurndownOptions
    ) => string;
  }

  export default class TurndownService {
    constructor(options?: TurndownOptions);
    use(plugin: unknown): void;
    addRule(name: string, rule: Rule): void;
    turndown(html: string): string;
  }
}

declare module 'turndown-plugin-gfm' {
  export const gfm: unknown;
  export const tables: unknown;
  export const strikethrough: unknown;
  export const taskListItems: unknown;
  const _default: unknown;
  export default _default;
}
