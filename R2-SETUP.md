# Cloudflare R2 Setup for Portfolio Content

This document explains how to set up Cloudflare R2 to serve your portfolio content instead of using the GitHub API, eliminating rate limiting issues.

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Access to your content files

## Step 1: Create R2 Bucket

1. **Login to Wrangler:**
   ```bash
   npx wrangler login
   ```

2. **Create R2 bucket:**
   ```bash
   npx wrangler r2 bucket create portfolio-content
   ```

## Step 2: Upload Content Files

1. **Run the upload script:**
   ```bash
   # On Windows
   upload-to-r2.bat
   
   # Or manually upload each file:
   npx wrangler r2 object put portfolio/strategy.md --file "../tanstack-portfolio-content/src/content/portfolio/strategy.md"
   npx wrangler r2 object put portfolio/leadership.md --file "../tanstack-portfolio-content/src/content/portfolio/leadership.md"
   # ... continue for all files
   ```

## Step 3: Configure R2 Public Access

1. **Enable public access to your R2 bucket:**
   - Go to Cloudflare Dashboard > R2 Object Storage
   - Select your `portfolio-content` bucket
   - Go to Settings > Public Access
   - Enable "Allow public access to this bucket"
   - Note the public URL (e.g., `https://your-bucket.your-subdomain.r2.cloudflarestorage.com`)

## Step 4: Update Configuration

1. **Update the R2 base URL in `src/config/r2Config.ts`:**
   ```typescript
   export const R2_CONFIG = {
     BASE_URL: 'https://your-bucket.your-subdomain.r2.cloudflarestorage.com', // ← Update this
     // ... rest of config
   }
   ```

## Step 5: Test the Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Check the browser console** for R2 loading logs
3. **Verify portfolio items load** without GitHub API errors

## File Structure in R2

Your R2 bucket should contain:
```
portfolio-content/
├── portfolio/
│   ├── strategy.md
│   ├── leadership.md
│   ├── talent.md
│   └── ... (other portfolio files)
├── blog/
│   ├── pmbok-agile-methodology-blend.md
│   ├── serverless-ai-workflows-azure-functions.md
│   └── ... (other blog files)
└── projects/
    └── project-analysis.md
```

## Benefits of R2 Approach

- ✅ **No rate limits** - Unlimited requests
- ✅ **Global CDN** - Fast worldwide access
- ✅ **Better performance** - Direct file serving
- ✅ **Lower costs** - No API call charges
- ✅ **More control** - Custom caching and headers
- ✅ **Scalability** - Handles high traffic easily

## Troubleshooting

### Files not loading?
- Check the R2 base URL in `r2Config.ts`
- Verify files are uploaded to R2
- Check browser network tab for 404 errors

### CORS issues?
- R2 buckets are CORS-enabled by default
- If issues persist, check Cloudflare R2 CORS settings

### Performance issues?
- R2 automatically uses Cloudflare's global CDN
- Files are cached at edge locations worldwide

## Maintenance

### Adding new content:
1. Upload new markdown files to R2
2. Update the file arrays in `r2PortfolioLoader.ts`
3. Update the configuration if needed

### Updating existing content:
1. Upload the updated file to R2 (overwrites existing)
2. No code changes needed

## Cost Considerations

- **R2 Storage**: ~$0.015 per GB/month
- **R2 Class A Operations** (writes): ~$4.50 per million
- **R2 Class B Operations** (reads): ~$0.36 per million
- **Bandwidth**: Included with Cloudflare plan

For typical portfolio usage, costs are minimal (usually <$1/month).

## Next Steps

After setup:
1. Test all portfolio pages load correctly
2. Verify blog and project pages work
3. Monitor performance improvements
4. Consider implementing caching strategies
5. Set up automated uploads for content updates
