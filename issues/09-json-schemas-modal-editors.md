# JSON Schemas & Modal Editors for Blocks

**Labels:** validation, blocks

## Description

Goal: Edit block payloads via schema-validated dialogs; never inline.

## Tasks

- Define Ajv schemas per block type (Card, Bar/Line/Scatter/Histogram, Table).
- Click placeholder → open shadcn modal form bound to schema.
- On save: update underlying Markdown fenced block payload (not HTML placeholder); refresh preview and Visual state.

## Acceptance Criteria

- Invalid payloads show precise errors (e.g., series[1].data[3] must be number).
- Unchanged blocks remain byte-stable.
