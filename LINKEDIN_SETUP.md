# LinkedIn Integration Setup Guide

This guide will help you set up the LinkedIn integration feature for your portfolio website to display your LinkedIn articles and posts.

## Overview

The LinkedIn integration allows you to:
- Display your LinkedIn articles and posts on your portfolio
- Show engagement metrics (likes, comments, shares)
- Search and filter your content
- Automatically fetch and update your latest publications

## Prerequisites

1. A LinkedIn Developer Account
2. A LinkedIn Application
3. Your LinkedIn User ID
4. Cloudflare Workers (for server-side API calls)

## Step 1: Create a LinkedIn Application

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in the application details:
   - App name: `Your Portfolio LinkedIn Integration`
   - LinkedIn Page: Your LinkedIn profile URL
   - App Logo: Your profile picture or logo
4. Click "Create App"

## Step 2: Configure LinkedIn App Settings

### OAuth 2.0 Settings

1. In your LinkedIn app dashboard, go to "Auth" tab
2. Add the following redirect URLs:
   - Development: `http://localhost:5173/auth/linkedin/callback`
   - Production: `https://yourdomain.com/auth/linkedin/callback`
3. Request the following scopes:
   - `r_liteprofile` - Read basic profile
   - `r_emailaddress` - Read email address
   - `w_member_social` - Write posts (optional)
   - `r_organization_social` - Read organization posts (optional)

### API Credentials

1. Go to "Products" tab
2. Request access to "Marketing Developer Platform"
3. Note down your:
   - Client ID
   - Client Secret

## Step 3: Get Your LinkedIn User ID

1. Go to your LinkedIn profile
2. Right-click and "View Page Source"
3. Search for `"publicIdentifier"`
4. Copy the value (this is your username)
5. Or use the LinkedIn API to get your URN:
   ```bash
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
        "https://api.linkedin.com/v2/me"
   ```

## Step 4: Environment Variables

Create a `.env.local` file in your project root:

```env
# LinkedIn API Configuration
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
VITE_LINKEDIN_USER_ID=your_linkedin_user_id
VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# Cloudflare Workers (for production)
VITE_LINKEDIN_WORKER_URL=https://your-linkedin-worker.your-subdomain.workers.dev
```

## Step 5: Deploy Cloudflare Worker

The LinkedIn API has CORS restrictions, so we use a Cloudflare Worker to handle API calls server-side.

### Option A: Use Wrangler CLI

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a new worker:
   ```bash
   wrangler init linkedin-api-worker
   cd linkedin-api-worker
   ```

4. Replace the worker code with the provided `functions/linkedin-api-worker.js`

5. Add environment variables:
   ```bash
   wrangler secret put LINKEDIN_USER_ID
   ```

6. Deploy the worker:
   ```bash
   wrangler deploy
   ```

### Option B: Use Cloudflare Dashboard

1. Go to [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers)
2. Click "Create a Service"
3. Choose "HTTP handler"
4. Copy the worker code from `functions/linkedin-api-worker.js`
5. Add environment variables in the Settings tab
6. Deploy the worker

## Step 6: Update Worker URLs

Update the worker endpoints in `src/api/linkedinService.ts`:

```typescript
const LINKEDIN_WORKER_ENDPOINT = import.meta.env.PROD 
  ? 'https://your-linkedin-worker.your-subdomain.workers.dev'
  : 'https://your-linkedin-worker.your-subdomain.workers.dev'
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/publications` in your browser

3. Click "Connect LinkedIn Account"

4. Authorize the application on LinkedIn

5. You should see your LinkedIn articles displayed

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Cloudflare Worker is properly deployed and accessible

2. **Authentication Errors**: 
   - Check that your redirect URI matches exactly
   - Verify your client ID and secret are correct
   - Ensure you've requested the correct scopes

3. **No Articles Showing**:
   - Verify your LinkedIn User ID is correct
   - Check that you have published articles on LinkedIn
   - Ensure your articles are public

4. **Rate Limiting**:
   - LinkedIn has rate limits on API calls
   - Implement caching if needed
   - Consider using a longer refresh interval

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
VITE_DEBUG_LINKEDIN=true
```

This will log API calls and responses to the browser console.

## Security Considerations

1. **Never expose your Client Secret** in client-side code
2. **Use HTTPS** in production
3. **Implement proper token storage** (consider using httpOnly cookies)
4. **Validate all API responses** before displaying
5. **Implement rate limiting** to prevent abuse

## Production Deployment

1. Update environment variables for production
2. Deploy your Cloudflare Worker to production
3. Update worker URLs in your code
4. Test the OAuth flow in production
5. Monitor API usage and errors

## API Limitations

LinkedIn API has some limitations:
- Rate limits on API calls
- Limited access to engagement metrics
- No direct access to comments count
- Requires user authorization for each session

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your LinkedIn app settings
3. Test the API endpoints directly
4. Check Cloudflare Worker logs
5. Review LinkedIn API documentation

## Additional Features

Consider implementing:
- Article caching to reduce API calls
- Automatic refresh of articles
- Export functionality for articles
- Analytics dashboard for engagement metrics
- Social sharing buttons
- Article categories and tags

## Resources

- [LinkedIn API Documentation](https://developer.linkedin.com/docs)
- [LinkedIn OAuth 2.0 Guide](https://developer.linkedin.com/docs/oauth2)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [React Query Documentation](https://tanstack.com/query/latest)
