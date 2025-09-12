# Content Indexing System

This document explains how the new content indexing system works and how to use it.

## Overview

The content indexing system solves the issue of related content hanging on skeleton loading by pre-indexing all content from R2 buckets at build time and creating a local KV cache. This eliminates the need to fetch content from R2 on every page load.

## How It Works

1. **Build Time**: During the build process, the system attempts to fetch all content from R2 and create JSON cache files
2. **Runtime**: The `CachedContentService` uses these pre-built cache files instead of making network requests
3. **Fallback**: If R2 is not accessible during build, empty cache files are created and the system gracefully degrades

## Files

- `scripts/rebuild-kv-cache.js` - Build script that processes content from local files and pushes to KV cache
- `src/api/cachedContentService.ts` - Service that uses cached content
- `src/data/` - Directory containing cached content JSON files
- `src/components/UnifiedRelatedContent.tsx` - Updated component using cached service

## Usage

### Development

For development builds without content indexing:

```bash
npm run build:dev
```

### KV Cache Management

The KV cache is always populated using the production Cloudflare Pages endpoint:

```bash
npm run build          # Automatically processes content and pushes to production KV
npm run rebuild-kv     # Manually rebuild production KV cache
npm run deploy:pages   # Deploy with fresh KV cache
```

**Note**: KV cache updates always use the production endpoint (`https://tanstack-portfolio.pages.dev`) to ensure consistency across all environments.

### Manual Content Indexing

To manually index content when R2 is accessible:

```bash
npm run index-content
```

## Build Process

The build process now includes:

1. **Content Indexing**: Attempts to fetch content from R2 and create cache files
2. **TypeScript Compilation**: Compiles TypeScript code
3. **Vite Build**: Builds the production bundle

If R2 is not accessible during build:

- Empty cache files are created
- Build continues successfully
- Related content will show "no recommendations" instead of hanging

## Content Cache Structure

The system creates several JSON files:

- `content-cache.json` - Main cache with metadata
- `portfolio-items.json` - Portfolio content items
- `blog-items.json` - Blog content items
- `project-items.json` - Project content items
- `search-index.json` - Search index for fast lookups

## Fallback Mechanism

If the cached content service fails to load:

1. The service checks if JSON files are available
2. If not, it attempts to fetch from R2 as a fallback
3. If that fails, it gracefully degrades with empty results

## Benefits

- **Performance**: No network requests for related content
- **Reliability**: Eliminates hanging skeleton loading
- **Scalability**: Content is indexed once at build time
- **Fallback**: Graceful degradation when R2 is unavailable

## Troubleshooting

### Content Not Loading

1. Check if cache files exist in `src/data/`
2. Run `npm run index-content` to manually index content
3. Verify R2 worker is accessible

### Build Fails

1. Check R2 worker status
2. Use `npm run build:dev` for development builds
3. Check network connectivity to R2 endpoints

### Related Content Still Hanging

1. Verify `UnifiedRelatedContent` component is using `cachedContentService`
2. Check browser console for errors
3. Ensure cache files are properly generated

## Migration

The system automatically migrates from the old R2-based service:

1. Old service: `workerContentService` (fetches from R2 on every request)
2. New service: `cachedContentService` (uses pre-built cache)

Components using the old service will automatically use the new cached service.
