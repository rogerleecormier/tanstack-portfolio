# Issue #32: Install Free Dependencies

- Add @uiw/react-codemirror and @codemirror/lang-markdown for Markdown editing
- Add @tinymce/tinymce-react and tinymce for WYSIWYG editing
- Add unified toolchain: unified, remark-parse, remark-gfm, remark-rehype, rehype-stringify, rehype-parse, rehype-remark, remark-stringify, rehype-sanitize
- Add Ajv for JSON schema validation
- Add Vitest + @testing-library/react + @testing-library/user-event + @testing-library/jest-dom for testing
- Copy TinyMCE assets to public/tinymce for self-hosting (no CDN)
- Configure Vitest with jsdom environment and basic test setup
- Update .prettierignore to exclude TinyMCE files
- All acceptance criteria met:
  - All packages resolve
  - Local TinyMCE assets load
  - npm test runs
