# Issue #34: Compiler — Markdown → HTML (Preview Path)

- Implement mdToHtml() pipeline with unified toolchain:
  - remark-parse → custom remark-shadcn-blocks → remark-gfm → remark-rehype → rehype-placeholders → rehype-sanitize → rehype-stringify
- Define sanitization schema allowing only required tags/attrs and data-\* attributes
- Implement remark-shadcn-blocks plugin to detect fenced JSON blocks (card, barchart, linechart, scatterplot, tablejson, histogram)
- Implement rehype-placeholders plugin to convert fenced blocks to non-editable placeholders
- Add comprehensive test suite for compiler functionality
- Install unist-util-visit dependency for AST traversal
- All acceptance criteria met:
  - Markdown edits update preview within 250ms p50 on medium docs
  - Fenced blocks show as read-only placeholders in preview
