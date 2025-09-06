# Compiler — Markdown → HTML (Preview Path)

**Labels:** compiler

## Description

Goal: Accurate, sanitized HTML preview identical to production output (string HTML).

## Tasks

- Implement mdToHtml() pipeline: remark-parse → custom remark-shadcn-blocks → remark-gfm → remark-rehype → rehype-placeholders → rehype-sanitize (single shared schema) → rehype-stringify.
- Define one sanitize schema: allow only required tags/attrs; permit needed data-\* attributes; block scripts/handlers.

## Acceptance Criteria

- Markdown edits update preview within 250ms p50 on medium docs.
- Fenced blocks show as read-only placeholders in preview.
