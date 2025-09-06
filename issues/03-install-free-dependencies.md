# Install Free Dependencies

**Labels:** dependencies

## Description

Goal: Install editors, compiler, validation, and test libs (free only).

## Tasks

- Add @uiw/react-codemirror and @codemirror/lang-markdown.
- Add @tinymce/tinymce-react and tinymce (self-host assets; no CDN).
- Add unified toolchain: unified, remark-parse, remark-gfm, remark-rehype, rehype-stringify, rehype-parse, rehype-remark, remark-stringify, rehype-sanitize.
- Add Ajv for JSON schema validation.
- Add Vitest + @testing-library/react + @testing-library/user-event.

## Acceptance Criteria

- All packages resolve; local TinyMCE assets load.
- `npm test` runs.
