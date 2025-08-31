# Migrate from front-matter to gray-matter package

## Issue Description
Currently using the older `front-matter` package (v4.0.2) but have `gray-matter` (v4.0.3) already installed. Need to migrate all code to use the more modern and maintained `gray-matter` package.

## Current State
- **Installed but unused**: `gray-matter` v4.0.3
- **Currently using**: `front-matter` v4.0.2 (older, less maintained)

## Files to Update
The following files currently import and use `front-matter`:

### Core Utilities
- `src/utils/blogUtils.ts` - Blog post parsing
- `src/utils/r2PortfolioLoader.ts` - Portfolio/blog/project content loading

### Pages
- `src/pages/AboutPage.tsx` - About page content parsing

### Build Scripts
- `scripts/build-content-index.js` - Content indexing during build

## Migration Steps
1. **Uninstall old package**: `npm uninstall front-matter`
2. **Update imports**: Change `import fm from 'front-matter'` to `import fm from 'gray-matter'`
3. **Verify API compatibility**: Both packages return `{ attributes, body }` from `fm(content)`
4. **Test build process**: Ensure content indexing still works
5. **Test content loading**: Verify blog/portfolio pages still render correctly

## Benefits of Migration
- **Better maintenance**: `gray-matter` is actively maintained
- **Modern features**: Better TypeScript support, performance improvements
- **Standard choice**: Industry standard for frontmatter parsing
- **Reduced dependencies**: Remove unused package

## Testing Checklist
- [ ] Build script runs without errors
- [ ] Blog posts load and display correctly
- [ ] Portfolio items load and display correctly
- [ ] About page renders correctly
- [ ] Content indexing works during build
- [ ] No console errors in browser

## Priority
Medium - This is a maintenance improvement that reduces technical debt and improves package consistency.

## Labels
- `maintenance`
- `dependencies`
- `refactor`
