# Security & Accessibility

**Labels:** security, accessibility

## Description

Goal: Ship-safe sanitization and accessible editing.

## Tasks

- Security tests: attempt <script>, onerror, javascript: URLs. Ensure sanitizer strips all.
- A11y: placeholders labeled and announced (type + summary); modals focus-trapped; full keyboard navigation; ARIA errors for validation.

## Acceptance Criteria

- All injection attempts neutralized in preview.
- Screen reader announces blocks; keyboard-only editing works.
