# Deployment Guide - Cloudflare Pages

This application is configured for deployment on Cloudflare Pages with clean, normal routing (no hash routing).

## Prerequisites

- Cloudflare account
- Git repository with your code

## Deployment Steps

### 1. Build Your Application

```bash
npm run build
```

This creates a `dist/` folder with your production build.

### 2. Deploy to Cloudflare Pages

#### Option A: Via Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty)
5. Click **Save and Deploy**

#### Option B: Via Wrangler CLI
1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Deploy: `wrangler pages publish dist --project-name=your-project-name`

### 3. Configure Custom Domain (Optional)

1. In your Cloudflare Pages project settings
2. Go to **Custom domains**
3. Add your domain and follow the DNS configuration steps

## Routing

Cloudflare Pages automatically handles SPA routing. Your routes like:
- `/strategy`
- `/leadership`
- `/analytics`

Will work correctly without any additional configuration.

## Environment Variables

If you need environment variables:
1. Go to your project settings in Cloudflare Pages
2. Navigate to **Environment variables**
3. Add your variables for production

## Future SSR Migration

When you're ready to convert to SSR:
1. The current clean routing setup will make migration easier
2. Remove TanStack Router and implement server-side routing
3. Update build configuration for your SSR framework
4. Cloudflare Pages supports various SSR frameworks (Next.js, Astro, etc.)

## Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json`
- **Routing issues**: Ensure you're using the latest build
- **Environment variables**: Verify they're set in Cloudflare Pages settings
