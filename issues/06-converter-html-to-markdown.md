# Converter — HTML → Markdown (Mode Switch Back)

**Labels:** compiler

## Description

Goal: Loss-minimized round-trip from Visual to Markdown.

## Tasks

- Implement htmlToMd(): rehype-parse → rehype-to-remark (placeholders → fenced blocks) → rehype-remark → remark-stringify (fences enabled).
- Add snapshot tests: MD → HTML → MD equals original for all fenced blocks.

## Acceptance Criteria

- Fenced JSON blocks are byte-identical after Visual↔Markdown switch.
- Non-block text differs only by whitespace at most.
