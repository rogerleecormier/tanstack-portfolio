# Paste Policy & Sanitization (Free-Only)

**Labels:** security, ux

## Description

Goal: Decent paste from Google Docs/Office with a strict allow-list.

## Tasks

- TinyMCE: enable paste plugin; configure valid_elements/extended_valid_elements to match sanitize schema.
- Add custom paste pre-processor: strip inline styles except allow-listed attributes.
- Tests with multi-level lists and tables from Google Docs.

## Acceptance Criteria

- No rogue inline styles/spans after sanitize; structure preserved (lists/tables).
