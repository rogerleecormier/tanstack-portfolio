# Project Structure

**Labels:** architecture

## Description

Goal: Separate editor UI from compile/conversion and blocks logic.

## Tasks

- Create folders where it makes sense:
  editor/ (MarkdownEditor.tsx, VisualEditor.tsx, DualModeEditor.tsx)
  compile/ (mdToHtml.ts, htmlToMd.ts)
  blocks/ (remark-shadcn-blocks.ts, rehype-placeholders.ts, rehype-to-remark.ts, schemas/)
  preview/ (PreviewPane.tsx)
  workers/ (compiler.worker.ts)
- Ensure no cross-layer imports or circular deps.

## Acceptance Criteria

- Types build cleanly; no circular dependencies.
