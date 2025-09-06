# Dual-Mode Shell with Real-Time Preview

**Labels:** ui

## Description

Goal: Two-pane editor with Markdown or Visual on the left and real-time HTML preview on the right.

## Tasks

- Build DualModeEditor.tsx with mode toggle (Markdown ↔ Visual).
- On entering Visual: compile MD to HTML, load into TinyMCE.
- On return to Markdown: read TinyMCE HTML, convert to MD.
- Debounce compile 150–250ms.

## Acceptance Criteria

- Seamless mode switching; no flicker; preview stays in sync.
