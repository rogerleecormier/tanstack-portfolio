declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: any)
    use(plugin: any): void
    addRule(name: string, rule: any): void
    turndown(html: string): string
  }
}

declare module 'turndown-plugin-gfm' {
  export const gfm: any
  export const tables: any
  export const strikethrough: any
  export const taskListItems: any
  const _default: any
  export default _default
}

