# Fix: TinyMCE license validator and self-hosted script

## Summary

- Load TinyMCE from local assets (/public/tinymce/tinymce.js) via tinymceScriptSrc.
- Use React integration prop licenseKey=gpl (not init.license_key), resolving the Cloud API validator/readonly errors.
- Keep free noneditable plugin enabled and map .shadcn-block-placeholder via noneditable_class.
- ESLint: ignore public/tinymce/\*\* globally to prevent third-party lint noise.

## Files

- src/editor/VisualEditor.tsx: add tinymceScriptSrc, move licenseKey, retain noneditable protections.
- eslint.config.js: add public/tinymce/\*\* to global ignores.

## Result

- No more Tiny Cloud key warnings; editor is editable with noneditable placeholders respected.
