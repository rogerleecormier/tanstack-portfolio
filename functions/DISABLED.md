# Pages Functions Disabled

These Pages Functions have been disabled in favor of using the dedicated R2 worker.

All content operations now go through: `https://r2-content-full.rcormier.workers.dev`

## Disabled Functions:

- `api/content/write.ts` - Now handled by worker
- `api/content/read.ts` - Now handled by worker
- `api/content/list.ts` - Now handled by worker
- `api/content/exists.ts` - Now handled by worker
- `api/content/delete.ts` - Now handled by worker
- `api/generate.ts` - Now handled by worker
- `api/validate/frontmatter.ts` - Now handled by worker

## Why Worker Instead of Pages Functions?

1. **Better CORS control** - No CORS issues with localhost
2. **Dedicated resources** - Not shared with Pages site
3. **Simpler deployment** - Single worker vs multiple functions
4. **Better error handling** - Centralized error responses
5. **Performance** - Direct R2 access without Pages overhead

## Configuration:

Frontend configured in `src/config/environment.ts`:

```typescript
api: {
  baseUrl: 'https://r2-content-full.rcormier.workers.dev/api';
}
```
