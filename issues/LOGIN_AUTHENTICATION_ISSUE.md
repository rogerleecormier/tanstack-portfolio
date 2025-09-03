# Login Authentication Issue

## Problem Description

After recent changes to the website, users cannot login to the website. This appears to be related to cookie storage, cookie retrieval, or cross-origin policies. The issue likely stems from the recent implementation of a content proxy to prevent CORS issues, which may have introduced configuration conflicts with the authentication system.

## Current Authentication System

The website uses a dual authentication approach:

### Development Mode
- Uses mock authentication with localStorage token storage
- Token stored in `localStorage.getItem('auth_token')`
- API calls to `http://localhost:3001/api/auth/*`

### Production Mode
- Uses Cloudflare Access authentication
- Relies on Cloudflare Access cookies (`CF_*` cookies)
- Identity verification via `/cdn-cgi/access/get-identity`
- Redirects to `/cdn-cgi/access/login` for authentication

## Recent Changes That May Have Caused the Issue

### 1. R2 Content Proxy Implementation
- **File**: `src/config/r2Config.ts`
- **Change**: Switched from direct R2 domain to proxy worker
- **Before**: `https://files.rcormier.dev`
- **After**: `https://r2-content-proxy.rcormier.workers.dev`
- **Impact**: This change may have affected cookie domain policies

### 2. Content Indexing Script Updates
- **File**: `scripts/build-content-index.js`
- **Change**: Updated to use the new R2 proxy URLs
- **Impact**: May have introduced timing issues during build process

## Potential Root Causes

### 1. Cookie Domain Issues
- The R2 content proxy worker may be interfering with Cloudflare Access cookies
- Cross-origin requests to the proxy worker may be affecting cookie storage
- Domain mismatch between main site and proxy worker

### 2. CORS Configuration Conflicts
- The content proxy adds CORS headers that may conflict with authentication
- Cloudflare Access may not be properly handling requests through the proxy
- Security headers may be blocking authentication cookies

### 3. Authentication Flow Interruption
- The proxy worker may be intercepting authentication requests
- Cloudflare Access identity endpoint may not be accessible
- Cookie retrieval may be failing due to domain restrictions

## Investigation Steps

### 1. Check Cookie Storage
- Verify if Cloudflare Access cookies (`CF_*`) are being set
- Check if cookies are accessible from the main domain
- Test cookie retrieval in browser developer tools

### 2. Test Authentication Endpoints
- Verify `/cdn-cgi/access/get-identity` is accessible
- Check if `/cdn-cgi/access/login` redirects work properly
- Test authentication flow in both development and production

### 3. Review Proxy Configuration
- Check if the R2 content proxy is interfering with authentication
- Verify CORS headers don't conflict with Cloudflare Access
- Test if disabling the proxy resolves the login issue

### 4. Check Security Headers
- Review `src/config/securityHeaders.ts` for conflicts
- Verify CORS configuration allows authentication cookies
- Check if security policies are blocking authentication

## Files to Investigate

### Authentication Files
- `src/hooks/useAuth.ts` - Main authentication hook
- `src/hooks/usePassiveAuth.ts` - Alternative authentication hook
- `src/config/environment.ts` - Environment and API configuration
- `src/components/ProtectedRoute.tsx` - Route protection logic

### Configuration Files
- `src/config/r2Config.ts` - R2 proxy configuration
- `src/config/securityHeaders.ts` - Security and CORS configuration
- `workers/r2-content-proxy.ts` - Content proxy worker

### Worker Configuration
- `wrangler-r2-proxy.toml` - R2 proxy worker configuration
- `wrangler.toml` - Main site configuration

## Expected Behavior

### Development Mode
- Mock authentication should work with localStorage tokens
- API calls should succeed to localhost:3001
- No Cloudflare Access dependencies

### Production Mode
- Cloudflare Access should handle authentication automatically
- Cookies should be set and accessible
- Identity endpoint should return user information
- Protected routes should redirect to login when not authenticated

## Priority

**HIGH** - This is a critical issue that prevents users from accessing the website.

## Acceptance Criteria

- [ ] Users can successfully login in both development and production modes
- [ ] Authentication cookies are properly set and accessible
- [ ] Cloudflare Access integration works correctly
- [ ] R2 content proxy doesn't interfere with authentication
- [ ] All protected routes are accessible after authentication
- [ ] Logout functionality works properly

## Additional Notes

- The issue may be related to the recent content proxy implementation
- Consider temporarily disabling the R2 content proxy to test if it resolves the issue
- Check Cloudflare Access logs for any authentication failures
- Verify that the proxy worker domain is properly configured in Cloudflare Access policies
