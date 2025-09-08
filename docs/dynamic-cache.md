# Dynamic Content Cache System

## Overview

This document describes the dynamic content caching system implemented for the TanStack portfolio site. The system transitions from static JSON files and hardcoded data to a dynamic cache generated from Markdown frontmatter, enabling easier content management without rebuilding the entire site or hardcoding values.

### Key Benefits
- **Content Management**: Edit Markdown files (portfolio/, blog/, projects/) with frontmatter for metadata (title, description, tags, date, etc.).
- **Build-Time Generation**: Cache is automatically rebuilt during `npm run build` using `scripts/rebuild-cache.js`.
- **Local Development**: File watcher (`npm run watch-cache` or included in `npm run dev:full`) regenerates cache on MD file saves.
- **Dynamic Loading**: Pages and components use `cachedContentService` to fetch from `src/data/content-cache.json` without R2 access or static imports.
- **Type Safety**: All data uses `CachedContentItem` interface for consistency.

### Data Structure
The cache (`src/data/content-cache.json`) contains:
- `portfolio: CachedContentItem[]`
- `blog: CachedContentItem[]`
- `projects: CachedContentItem[]`
- `all: CachedContentItem[]`
- `metadata: { portfolioCount, blogCount, projectCount, lastUpdated, version }`

Where `CachedContentItem` is:
```typescript
interface CachedContentItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date?: string;
  content: string;
  contentType: 'portfolio' | 'blog' | 'project';
  category?: string; // Derived from tags or frontmatter
}
```

## Build Process

During `npm run build`:
1. TypeScript compilation (`tsc`).
2. Vite build (`vite build`).
3. KV cache rebuild (`node scripts/rebuild-kv-cache.js`): Processes markdown files from portfolio/, blog/, projects/; parses frontmatter; creates cache data structure; pushes to Cloudflare KV.

For Cloudflare Pages deployment, the build script runs on CI, ensuring fresh cache on each deploy.

## Local Development

Run `npm run dev:full` to start:
- Vite dev server.
- Wrangler for functions.

**KV Cache Management:**
- Content updates are pushed to production KV cache
- Local development reads from the same production KV
- Run `npm run rebuild-kv` to manually update the KV cache during development

## Integration in Code

### cachedContentService
- `getContentByType(type: 'blog' | 'portfolio' | 'project')`: Returns CachedContentItem[] from cache.
- `getRecommendations(options)`: Fuse.js-based search across cache, excluding current page.

### Pages Refactored
- **BlogListPage.tsx**: useEffect loads `getContentByType('blog')`; filters manually; maps to BlogPostCard with hardcoded author/readTime.
- **PortfolioListPage.tsx**: Loads `getContentByType('portfolio')`; derives category from tags[0]; manual filtering; maps to cards with derived urls.
- **ProjectsListPage.tsx**: Loads `getContentByType('project')`; similar filtering.

### Components
- **UnifiedRelatedContent.tsx**: Uses `getRecommendations` for related items; derives urls; extends CachedContentItem with relevanceScore/url.

### Contact Form
- Uses cached service indirectly via UnifiedRelatedContent for related content suggestions.
- No direct static dependencies; AI analysis in contactAnalyzer.ts is independent.

## Workflow Diagram

```mermaid
graph TD
    A[Markdown Files<br/>portfolio/*.md<br/>blog/*.md<br/>projects/*.md] --> B[Build Script<br/>npm run build]
    B --> C[rebuild-cache.js<br/>- Read MD files<br/>- Parse frontmatter w/ gray-matter<br/>- Derive category/tags<br/>- Sort items]
    C --> D[content-cache.json<br/>src/data/]
    D --> E[cachedContentService.ts<br/>- getContentByType()<br/>- getRecommendations()]
    E --> F[Pages/Components<br/>BlogListPage<br/>PortfolioListPage<br/>UnifiedRelatedContent]
    F --> G[Dynamic Rendering<br/>Filtering/Search<br/>Related Content]

    H[Local Dev: MD Save] --> I[watch-dev.js<br/>chokidar watcher<br/>Debounce 1s]
    I --> C

    subgraph "Build/Deploy"
        B
        C
    end

    subgraph "Runtime"
        D
        E
        F
        G
    end

    subgraph "Local Dev"
        H
        I
    end
```

## Troubleshooting

- **Cache Not Updating**: Run `node scripts/rebuild-cache.js` manually; check console for skipped files (if MD missing).
- **TS Errors**: Ensure `CachedContentItem` import from `@/api/cachedContentService`; verify cache JSON structure.
- **No Data in Pages**: Check `content-cache.json` exists post-build; verify file lists in rebuild-cache.js match actual MD files.
- **Watcher Not Triggering**: Ensure dirs exist (create empty if needed); check chokidar patterns.

## Future Improvements
- Auto-detect MD files instead of hardcoded lists.
- Integrate with R2 for prod cache updates via API.
- Add cache versioning/invalidation.
- Expand recommendations with more Fuse.js options (e.g., boost tags/date).

Last Updated: 2025-09-08