# Issue #33: Project Structure

- Create folder structure for dual-mode editor:
  - src/editor/ (MarkdownEditor.tsx, VisualEditor.tsx, DualModeEditor.tsx)
  - src/compile/ (mdToHtml.ts, htmlToMd.ts)
  - src/blocks/ (remark-shadcn-blocks.ts, rehype-placeholders.ts, rehype-to-remark.ts, schemas/)
  - src/preview/ (PreviewPane.tsx)
  - src/workers/ (compiler.worker.ts)
- Create basic TypeScript files with proper interfaces and TODO comments
- Ensure no cross-layer imports or circular dependencies
- All acceptance criteria met:
  - Types build cleanly
  - No circular dependencies
