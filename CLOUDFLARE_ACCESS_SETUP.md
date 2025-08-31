# Cloudflare Access Setup for Branch Testing

## Problem
Cloudflare Pages creates new preview URLs for each commit, making it difficult to test Cloudflare Access consistently.

## Solutions

### Solution 1: Use Dedicated Testing Branch (Recommended)

1. **Create a dedicated testing branch:**
   ```bash
   git checkout -b cloudflare-access-test
   git push -u origin cloudflare-access-test
   ```

2. **Configure Cloudflare Pages:**
   - Go to Cloudflare Pages dashboard
   - Select your project
   - Go to "Settings" → "Builds & deployments"
   - Under "Branch deployments", add:
     - Branch: `cloudflare-access-test`
     - Environment: `cloudflare-access-test`

3. **Configure Cloudflare Access:**
   - Go to Cloudflare Access dashboard
   - Click "Add an application"
   - Choose "Self-hosted"
   - Set subdomain: `cloudflare-access-test.your-project.pages.dev`
   - Configure authentication policies

### Solution 2: Use Environment Variables

1. **Set up environment-specific URLs:**
   ```bash
   # In your Cloudflare Pages environment variables
   CLOUDFLARE_ACCESS_URL=https://cloudflare-access-test.your-project.pages.dev
   ```

2. **Update your application to use the environment URL:**
   ```typescript
   const accessUrl = process.env.CLOUDFLARE_ACCESS_URL || 'https://rcormier.dev';
   ```

### Solution 3: Use Custom Domain for Testing

1. **Set up a custom subdomain:**
   - Create DNS record: `test.rcormier.dev` → CNAME to your Pages deployment
   - Configure Cloudflare Access for `test.rcormier.dev`

2. **Deploy to the custom domain:**
   ```bash
   # Deploy to test subdomain
   wrangler pages deploy dist --project-name your-project --branch cloudflare-access-test
   ```

## Testing Steps

### 1. Local Testing
```bash
# Start development server
npm run dev

# Test Cloudflare Access endpoints
npm run test-cloudflare

# Visit debug page
http://localhost:5174/cloudflare-debug
```

### 2. Branch Testing
```bash
# Push to testing branch
git add .
git commit -m "Test Cloudflare Access configuration"
git push origin cloudflare-access-test

# Wait for deployment, then test:
https://cloudflare-access-test.your-project.pages.dev/protected
```

### 3. Debugging
- Visit `/cloudflare-debug` on your deployment
- Check browser console for authentication errors
- Verify Cloudflare Access cookies are present
- Test identity endpoint: `/cdn-cgi/access/get-identity`

## Common Issues

### Issue: "No Cloudflare Cookies Found"
**Cause:** Cloudflare Access not configured for the domain
**Solution:** Add the branch URL to Cloudflare Access applications

### Issue: "Identity Endpoint Returns 404"
**Cause:** Domain not protected by Cloudflare Access
**Solution:** Ensure the domain is added to Access applications

### Issue: "Protected Route Doesn't Redirect"
**Cause:** Route not configured in Access policies
**Solution:** Add `/protected` to protected paths in Access policy

## Configuration Files

### _headers (Cloudflare Headers)
```
# Cloudflare Access Headers
/cdn-cgi/access/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/protected
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### _redirects (SPA Routing)
```
# Handle SPA routing
/assets/* /assets/:splat 200
/* /index.html 200
```

## Testing Checklist

- [ ] Dedicated testing branch created
- [ ] Cloudflare Pages branch deployment configured
- [ ] Cloudflare Access application added for branch URL
- [ ] Authentication policies configured
- [ ] Protected route (`/protected`) added to Access policy
- [ ] Local testing with debugger working
- [ ] Branch deployment accessible
- [ ] Cloudflare Access redirects working
- [ ] Identity endpoint responding correctly
- [ ] Cookies being set properly

## Commands Reference

```bash
# Create and switch to testing branch
git checkout -b cloudflare-access-test
git push -u origin cloudflare-access-test

# Build and test locally
npm run build
npm run dev

# Test Cloudflare endpoints
npm run test-cloudflare

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name your-project --branch cloudflare-access-test
```
