# Production Renderer — React Mapping (No InnerHTML)

**Labels:** production

## Description

Goal: Interactive shadcn components in production; preview remains HTML string.

## Tasks

- Add production path: remark-parse → remark-shadcn-blocks → remark-rehype → rehype → React mapping to real shadcn components.
- Keep preview as sanitized string HTML for author feedback.

## Acceptance Criteria

- Live routes render real components (no dangerouslySetInnerHTML in prod).
- Visual parity with preview within expected layout differences.
