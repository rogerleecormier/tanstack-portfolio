# AI-Powered Blog Recommendations

This feature provides intelligent portfolio page recommendations on blog posts using AI analysis of content, titles, and tags.

## Overview

The AI blog recommendations system analyzes blog post content and automatically suggests the most relevant portfolio pages for readers to explore. This creates a seamless content discovery experience and increases engagement with portfolio content.

## Architecture

### Components

1. **Cloudflare Worker** (`functions/blog-recommendations-worker.js`)
   - AI-powered content analysis using Cloudflare AI
   - Rate limiting and security measures
   - Fallback to tag-based matching

2. **React Component** (`src/components/BlogRecommendations.tsx`)
   - Displays recommendations with modern UI
   - Loading states and error handling
   - Responsive design

3. **API Service** (`src/api/blogRecommendationsService.ts`)
   - Handles communication with the worker
   - Type-safe interfaces
   - Error handling and caching support

### Portfolio Pages Database

The system includes metadata for all portfolio pages:

- **military-leadership**: Leadership & Culture
- **leadership**: Leadership & Culture  
- **strategy**: Strategy & Consulting
- **ai-automation**: Technology & Operations
- **devops**: Technology & Operations
- **analytics**: Data & Analytics
- **governance-pmo**: Governance & PMO
- **risk-compliance**: Risk & Compliance
- **talent**: Talent & HR
- **product-ux**: Product & UX
- **saas**: Technology & Operations
- **education-certifications**: Education & Certifications

## Features

### AI Analysis
- Content similarity analysis using Cloudflare AI
- Thematic alignment detection
- Skill and expertise overlap identification
- Practical application matching

### Smart Fallback
- Tag-based matching when AI is unavailable
- Default recommendations for edge cases
- Graceful degradation

### User Experience
- Loading skeletons during analysis
- Error handling with retry functionality
- Responsive card-based layout
- Hover effects and animations

### Performance
- Rate limiting (10 requests/minute, 50/hour)
- Content sanitization and length limits
- Efficient AI model usage

## Setup

### 1. Deploy the Worker

```bash
# Deploy to Cloudflare Workers
wrangler deploy --config wrangler-blog-recommendations.toml
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
VITE_BLOG_RECOMMENDATIONS_URL=https://blog-recommendations.your-domain.com
```

### 3. Update Wrangler Configuration

Edit `wrangler-blog-recommendations.toml`:

```toml
name = "blog-recommendations"
main = "functions/blog-recommendations-worker.js"
compatibility_date = "2024-01-15"
compatibility_flags = ["nodejs_compat"]

[ai]
binding = "AI"

[[kv_namespaces]]
binding = "KV"
id = "your-actual-kv-namespace-id"
preview_id = "your-actual-preview-kv-namespace-id"

[env.production]
name = "blog-recommendations"
route = "blog-recommendations.your-domain.com/*"
```

### 4. KV Namespace Setup

Create KV namespaces for rate limiting:

```bash
# Create production namespace
wrangler kv:namespace create "BLOG_RECS_KV" --preview

# Create preview namespace  
wrangler kv:namespace create "BLOG_RECS_KV" --preview
```

## Usage

### In Blog Pages

The `BlogRecommendations` component is automatically integrated into blog pages:

```tsx
<BlogRecommendations 
  blogContent={content}
  blogTitle={frontmatter.title}
  blogTags={frontmatter.tags}
/>
```

### API Endpoint

The worker accepts POST requests with:

```json
{
  "content": "Blog post content...",
  "title": "Blog post title",
  "tags": ["tag1", "tag2"]
}
```

Returns:

```json
{
  "success": true,
  "recommendations": [
    {
      "id": "military-leadership",
      "title": "Military Leadership",
      "description": "Signal Corps NCO experience...",
      "tags": ["leadership", "military"],
      "category": "Leadership & Culture",
      "url": "/military-leadership"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Customization

### Adding New Portfolio Pages

1. Update the `PORTFOLIO_PAGES` array in the worker
2. Add metadata including title, description, tags, and category
3. Ensure the URL matches your routing structure

### Modifying AI Prompts

Edit the context in `generateRecommendations()` function to change how the AI analyzes content and makes recommendations.

### Styling

The component uses Tailwind CSS classes and can be customized by:
- Modifying the component's className prop
- Updating the card styling in the component
- Adjusting the color scheme and animations

## Security

- Rate limiting prevents abuse
- Content sanitization removes sensitive data
- CORS headers for secure cross-origin requests
- Input validation and error handling

## Monitoring

### Logs
Monitor worker logs in Cloudflare dashboard for:
- Rate limit violations
- AI processing errors
- Performance metrics

### Metrics
Track usage patterns:
- Recommendation generation frequency
- User engagement with recommendations
- Error rates and response times

## Troubleshooting

### Common Issues

1. **Worker not responding**
   - Check Cloudflare dashboard for deployment status
   - Verify AI binding is configured correctly
   - Check KV namespace permissions

2. **No recommendations returned**
   - Verify content is being sent correctly
   - Check AI model availability
   - Review fallback logic

3. **Rate limiting errors**
   - Adjust rate limits in worker configuration
   - Check KV namespace setup
   - Monitor usage patterns

### Debug Mode

Enable debug logging by adding to worker:

```javascript
const DEBUG = true;

if (DEBUG) {
  console.log('Request data:', { content: content.substring(0, 100), title, tags });
}
```

## Future Enhancements

- **Caching**: Implement recommendation caching for better performance
- **Personalization**: User-based recommendation filtering
- **Analytics**: Track recommendation click-through rates
- **A/B Testing**: Test different recommendation algorithms
- **Content Embedding**: Use vector embeddings for better similarity matching
