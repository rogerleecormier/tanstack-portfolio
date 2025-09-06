# Performance — Web Worker & Metrics

**Labels:** performance

## Description

Goal: Smooth typing and fast compiles on large docs.

## Tasks

- Move both conversions to compiler.worker.ts.
- Debounce inputs; batch state updates.
- Log p50/p95 compile timings; target <200ms p50, <500ms p95 on ~3k lines.

## Acceptance Criteria

- Typing stays smooth (FPS >55); timings recorded.
