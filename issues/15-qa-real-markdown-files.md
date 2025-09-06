# QA with Real Markdown Files

**Labels:** qa

## Description

Goal: Validate end-to-end with my actual content.

## Tasks

- Use `about.md` and `project-method-analysis-budget-tiers-complexity (2).md` as fixtures.
- Run acceptance tests: round-trip, block protection, paste, performance, security, a11y, I/O.

## Acceptance Criteria

- Both files pass the entire QA checklist.
- No fenced block drift; preview vs production HTML diff is empty after normalization.
