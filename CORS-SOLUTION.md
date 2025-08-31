# CORS Issue Resolution

## Problem
Your application is experiencing CORS (Cross-Origin Resource Sharing) errors when trying to fetch content from `https://files.rcormier.dev` from your main site `https://rcormier.dev`.

**Error:**
```
Access to fetch at 'https://files.rcormier.dev/portfolio/analytics.md' from origin 'https://rcormier.dev' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
The `files.rcormier.dev` domain points directly to your Cloudflare R2 bucket, which doesn't have CORS headers configured. When your frontend application tries to fetch content from this domain, the browser blocks the request due to missing CORS headers.

## Solution: R2 Content Proxy Worker

I've created a Cloudflare Worker that will proxy requests to your R2 bucket with proper CORS headers.

### Files Created:
1. **`workers/r2-content-proxy.ts`** - The Cloudflare Worker code
2. **`wrangler-r2-proxy.toml`** - Worker configuration
3. **`deploy-r2-proxy.bat`** - Windows deployment script
4. **`deploy-r2-proxy.ps1`** - PowerShell deployment script

### How It Works:
1. The worker receives requests for content (e.g., `/portfolio/analytics.md`)
2. It fetches the content from your R2 bucket
3. It returns the content with proper CORS headers
4. Your frontend can now access the content without CORS issues

### Deployment Steps:

#### Option 1: Using the Batch File (Windows)
```bash
deploy-r2-proxy.bat
```

#### Option 2: Using PowerShell
```powershell
.\deploy-r2-proxy.ps1
```

#### Option 3: Manual Deployment
```bash
# Build the project
npm run build

# Deploy the worker
wrangler deploy --config wrangler-r2-proxy.toml --env production
```

### After Deployment:
1. The worker will be available at your custom domain
2. Update your `src/config/r2Config.ts` to use the new URL:

```typescript
export const R2_CONFIG = {
  // Use the worker instead of direct R2 access
  BASE_URL: 'https://r2-content-proxy.rcormier.dev',
  // ... rest of config
}
```

## Alternative Solutions

### Option 1: Configure CORS on R2 Bucket
You could configure CORS directly on your R2 bucket, but this requires additional setup and may not work with custom domains.

### Option 2: Use Same-Origin Content
Move your content to be served from the same domain as your application, eliminating the need for cross-origin requests.

### Option 3: API Proxy Endpoint
Create an API endpoint on your main domain that fetches content from R2 and serves it to your frontend.

## Recommendation
Use the **R2 Content Proxy Worker** solution as it:
- ✅ Resolves the CORS issue completely
- ✅ Maintains your current architecture
- ✅ Provides proper caching and error handling
- ✅ Is easy to deploy and maintain
- ✅ Follows Cloudflare best practices

## Testing
After deployment, test by visiting:
- `https://r2-content-proxy.rcormier.dev/portfolio/analytics.md`
- `https://r2-content-proxy.rcormier.dev/blog/pmbok-agile-methodology-blend.md`

The content should load without CORS errors, and your application should work normally.
