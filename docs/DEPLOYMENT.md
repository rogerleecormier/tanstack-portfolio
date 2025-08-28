# Deployment Guide

Comprehensive guide for deploying the TanStack Portfolio site to Cloudflare with optimal configuration and performance.

## 🌐 Cloudflare Deployment

### Overview

This site is specifically optimized for Cloudflare deployment, utilizing:
- **Cloudflare Pages** for static site hosting
- **Cloudflare Workers** for serverless functions
- **Cloudflare Access** for authentication
- **Cloudflare AI** for intelligent features

### Prerequisites

- **Cloudflare Account**: Active account with verified domain
- **GitHub Repository**: Source code repository
- **Domain**: Custom domain for your portfolio
- **Node.js 18+**: For local build testing

## 🚀 Cloudflare Pages Setup

### 1. Connect Repository

1. **Login to Cloudflare Dashboard**
   - Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Select your account

2. **Create Pages Project**
   - Go to "Pages" section
   - Click "Create a project"
   - Select "Connect to Git"

3. **Connect GitHub**
   - Authorize Cloudflare to access GitHub
   - Select your portfolio repository
   - Choose the main branch

### 2. Build Configuration

Configure the build settings in Cloudflare Pages:

```yaml
# Build Configuration
Build command: npm run build
Build output directory: dist
Root directory: / (leave empty for root)
Node.js version: 18
```

### 3. Environment Variables

Set the following environment variables in Cloudflare Pages:

```bash
# Build Environment Variables
NODE_VERSION=18
NPM_VERSION=8

# Runtime Environment Variables (if needed)
NODE_ENV=production
```

### 4. Custom Domain Setup

1. **Add Custom Domain**
   - In Pages project settings, go to "Custom domains"
   - Click "Set up a custom domain"
   - Enter your domain (e.g., `portfolio.yourdomain.com`)

2. **DNS Configuration**
   - Cloudflare automatically configures DNS
   - Ensure your domain is using Cloudflare nameservers
   - Verify SSL/TLS encryption is enabled

## ⚡ Cloudflare Workers Configuration

### AI Contact Analyzer Worker

The site uses a Cloudflare AI Worker for intelligent contact form analysis:

1. **Worker Configuration**
   ```toml
   # wrangler.toml
   name = "ai-contact-analyzer"
   main = "functions/ai-contact-analyzer.js"
   compatibility_date = "2024-01-01"
   
   [ai]
   binding = "AI"
   ```

2. **Deploy Worker**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler
   
   # Login to Cloudflare
   wrangler login
   
   # Deploy worker
   wrangler deploy
   ```

3. **Environment Variables**
   ```bash
   # Set worker environment variables
   wrangler secret put AI_API_KEY
   wrangler secret put RATE_LIMIT_KEY
   ```

### Blog Subscription Worker

Newsletter and subscription management:

```toml
# wrangler-blog-subscription.toml
name = "blog-subscription-worker"
main = "functions/blog-subscription-worker.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }
```

### Email Service Worker

Secure email handling:

```toml
# wrangler-email.toml
name = "email-service"
main = "functions/send-email.js"
compatibility_date = "2024-01-01"
```

## 🔐 Cloudflare Access Setup

### 1. Access Application Configuration

1. **Create Access Application**
   - Go to "Access" section in Cloudflare Dashboard
   - Click "Add an application"
   - Choose "Self-hosted"

2. **Application Settings**
   ```
   Application name: Portfolio Site
   Session duration: 24 hours
   Application domain: your-portfolio-domain.com
   ```

### 2. Authentication Policies

Configure who can access protected content:

1. **Policy Configuration**
   ```
   Policy name: Portfolio Access
   Action: Allow
   Rules: Include
   ```

2. **User Group Setup**
   - Create user groups for different access levels
   - Add users to appropriate groups
   - Configure group-based policies

### 3. Integration with Site

The site automatically integrates with Cloudflare Access:

```typescript
// src/utils/cloudflareAuth.ts
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch('/cdn-cgi/access/get-identity', {
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
```

## 📊 Performance Optimization

### 1. Cloudflare Pages Optimization

1. **Build Optimization**
   ```bash
   # Ensure optimized build
   npm run build
   
   # Verify build output
   ls -la dist/
   ```

2. **Asset Optimization**
   - Images are automatically optimized
   - CSS and JS are minified
   - Static assets are cached

### 2. CDN Configuration

1. **Cache Settings**
   - Static assets: 1 year
   - HTML pages: 1 hour
   - API responses: 5 minutes

2. **Edge Functions**
   - Utilize Cloudflare Workers for dynamic content
   - Implement edge caching strategies
   - Optimize for global performance

### 3. Core Web Vitals

Monitor and optimize:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## 🔒 Security Configuration

### 1. Security Headers

Cloudflare automatically applies security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 2. Content Security Policy

Configure CSP in your site:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

### 3. Rate Limiting

Implement rate limiting in Cloudflare Workers:

```javascript
// Rate limiting configuration
const RATE_LIMITS = {
  requestsPerMinute: 5,
  requestsPerHour: 20,
  burstLimit: 3
};
```

## 📱 Mobile Optimization

### 1. Responsive Design

- Mobile-first approach with Tailwind CSS
- Touch-friendly interactions
- Optimized for all screen sizes

### 2. Performance

- Optimized images for mobile
- Reduced bundle size for mobile
- Fast loading on mobile networks

## 🔍 SEO Configuration

### 1. Meta Tags

Dynamic meta tags for all pages:

```typescript
// src/hooks/useDocumentTitle.tsx
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} - Portfolio Site`;
  }, [title]);
};
```

### 2. Structured Data

Implement JSON-LD for better search results:

```typescript
// Add structured data for portfolio items
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Portfolio",
  "name": item.title,
  "description": item.description
};
```

### 3. Sitemap

Generate sitemap for better indexing:

```bash
# Build sitemap after deployment
npm run build:sitemap
```

## 📊 Monitoring & Analytics

### 1. Cloudflare Analytics

- Built-in analytics in Cloudflare Dashboard
- Real-time performance metrics
- Error tracking and monitoring

### 2. Performance Monitoring

Monitor key metrics:
- Page load times
- Error rates
- User experience metrics
- Core Web Vitals

### 3. Error Tracking

Implement error tracking:

```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught:', error, errorInfo);
  }
}
```

## 🚀 Deployment Process

### 1. Pre-deployment Checklist

- [ ] All tests pass locally
- [ ] Build completes successfully
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] Security headers configured
- [ ] Environment variables set

### 2. Deployment Steps

1. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "feat: prepare for deployment"
   git push origin main
   ```

2. **Monitor Build**
   - Watch Cloudflare Pages build process
   - Check for build errors
   - Verify deployment success

3. **Post-deployment Verification**
   - Test all pages load correctly
   - Verify authentication works
   - Check AI features functionality
   - Test responsive design

### 3. Rollback Strategy

If issues arise:

1. **Immediate Rollback**
   - Use Cloudflare Pages rollback feature
   - Revert to previous successful deployment

2. **Hot Fixes**
   - Push quick fixes to main branch
   - Monitor for resolution

## 🔧 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build locally first
   npm run build
   
   # Verify all dependencies
   npm install
   ```

2. **Authentication Issues**
   - Verify Cloudflare Access configuration
   - Check user group policies
   - Test authentication flow

3. **Performance Issues**
   - Monitor Core Web Vitals
   - Check bundle size
   - Optimize images and assets

### Debug Tools

1. **Cloudflare Dashboard**
   - Real-time analytics
   - Error logs
   - Performance metrics

2. **Browser DevTools**
   - Network monitoring
   - Performance analysis
   - Console debugging

## 📚 Resources

### Cloudflare Documentation
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Access](https://developers.cloudflare.com/access/)
- [Cloudflare AI](https://developers.cloudflare.com/ai/)

### Performance Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

### Security Resources
- [OWASP Security Guidelines](https://owasp.org/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Security Headers](https://securityheaders.com/)

---

**This deployment guide ensures your TanStack Portfolio site is optimally configured for Cloudflare with maximum performance, security, and reliability.**
