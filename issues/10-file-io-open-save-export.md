# File I/O — Open, Save, Export, Autosave

**Labels:** io

## Description

Goal: Robust authoring I/O without paid libraries.

## Tasks

- "Open .md": File System Access API with input fallback.
- "Save .md": FS Access API or Blob download.
- "Export .html": use current sanitized preview HTML; include minimal inline CSS if needed.
- Autosave to localStorage every 5s when dirty; restore on load.

## Acceptance Criteria

- Open/edit/save/reopen preserves content exactly.
- Crash/reload restores draft; exported HTML renders standalone.
