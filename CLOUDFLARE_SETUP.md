# Cloudflare Access & Workers Setup Guide

This guide provides essential setup instructions for Cloudflare Access authentication and Workers deployment for the Roger Lee Cormier Portfolio.

## 🎯 Overview

This setup provides:
- **Cloudflare Access**: Enterprise-grade Zero Trust authentication
- **Contact Form**: Professional contact form with email integration via Resend
- **AI Workers**: Serverless AI processing for intelligent contact analysis
- **Email Delivery**: Reliable email sending via Resend API

## 🚀 Quick Start

### **What You'll Get**
✅ **Protected routes** with Cloudflare Access  
✅ **Working contact form** that sends real emails  
✅ **AI-powered contact analysis** with intelligent insights  
✅ **Professional email templates** with your branding  
✅ **No CORS issues** - emails sent server-side  
✅ **Free tier** - 100k requests/day on Cloudflare, 3k emails/month on Resend  

## 📋 Prerequisites

1. **Cloudflare Account** with Access and Workers enabled
2. **Resend Account** at [resend.com](https://resend.com)
3. **Domain** pointing to Cloudflare (e.g., `rcormier.dev`)
4. **Identity Provider** (Google SSO, Microsoft, etc.)

## 🔐 Step 1: Cloudflare Access Authentication

### **1.1 Create Access Application**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Access** → **Applications**
3. Click **Add an application**
4. Choose **Self-hosted**

### **1.2 Application Settings**
- **Application name**: `Portfolio App`
- **Session Duration**: `24 hours` (or your preference)
- **Application domain**: `yourdomain.com` (or subdomain)

### **1.3 Protected Routes**
Add these paths to protect:
- `/protected`
- `/healthbridge-analysis`

### **1.4 Configure Identity Provider**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `https://yourdomain.com/cdn-cgi/access/callback`

### **1.5 Access Policies**
Create an access policy:
- **Policy name**: `Authenticated Users`
- **Action**: `Allow`
- **Rules**: 
  - **Include**: `Emails` → Add allowed emails:
    - `roger@rcormier.dev`
    - `rogerleecormier@gmail.com`
  - **Include**: `Emails ending in` → `@rcormier.dev`

**📖 For detailed access control configuration, see [ACCESS_CONTROL.md](./ACCESS_CONTROL.md)**

## 📧 Step 2: Contact Form & Email Setup

### **2.1 Install Wrangler CLI**
```bash
npm install -g wrangler
```

### **2.2 Login to Cloudflare**
```bash
wrangler login
```

### **2.3 Create Resend Account**
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address
4. Go to **API Keys** section

### **2.4 Get Resend API Key**
1. In Resend dashboard, click **"Create API Key"**
2. Give it a name (e.g., "Portfolio Contact Form")
3. Copy the API key (starts with `re_`)
4. **Keep this secure** - you'll need it for the next step

### **2.5 Verify Your Domain with Resend**
1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `rcormier.dev`)
4. Follow the DNS verification steps:
   - Add the required TXT records to your domain
   - Wait for verification (usually takes a few minutes)
5. **Important**: Domain must be verified before you can send emails

### **2.6 Configure Cloudflare Worker**
Your `wrangler.toml` should look like this:

```toml
name = "tanstack-portfolio-email-worker"
main = "functions/send-email.js"
compatibility_date = "2024-01-01"

# Environment-specific configurations
[env.production]
# Production environment - no additional config needed

[env.development]
# Development environment - no additional config needed
```

### **2.7 Set Your Resend API Key as a Secret**
```bash
# For development environment
wrangler secret put RESEND_API_KEY --env development

# For production environment
wrangler secret put RESEND_API_KEY --env production
```

When prompted, paste your Resend API key.

### **2.8 Deploy Your Worker**
```bash
# Deploy to development
wrangler deploy --env development

# Deploy to production
wrangler deploy --env production
```

**📖 For detailed email system documentation, see [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md)**

## 🤖 Step 3: AI Workers Setup

### **3.1 AI Worker Configuration**
The AI contact analyzer worker is configured in `wrangler-ai.toml`:

```toml
name = "tanstack-portfolio-ai-worker"
main = "functions/ai-contact-analyzer.js"
compatibility_date = "2024-01-01"

# AI binding for Llama 2
[[ai]]
binding = "AI"
```

### **3.2 Deploy AI Worker**
```bash
# Deploy AI worker to development
wrangler deploy --env development --config wrangler-ai.toml

# Deploy AI worker to production
wrangler deploy --env production --config wrangler-ai.toml
```

### **3.3 Update Worker URLs**
After deployment, update the URLs in `src/api/aiContactAnalyzer.ts`:

```typescript
const AI_WORKER_ENDPOINT = import.meta.env.PROD 
  ? 'https://YOUR-AI-WORKER-PRODUCTION-URL.workers.dev'
  : 'https://YOUR-AI-WORKER-DEVELOPMENT-URL.workers.dev'
```

**📖 For comprehensive AI features documentation, see [AI_FEATURE_README.md](./AI_FEATURE_README.md)**

## 🔧 Step 4: Frontend Configuration

### **4.1 Environment Variables**
Create `.env.local` for local development:
```bash
VITE_DEV_MODE=true
VITE_CLOUDFLARE_DOMAIN=rcormier.dev
```

### **4.2 Access Control Configuration**
Edit `src/config/accessControl.ts` to manage user access:

```typescript
export const accessControl: AccessControlConfig = {
  allowedEmails: [
    'roger@rcormier.dev',
    'rogerleecormier@gmail.com'
  ],
  allowedDomains: [
    'rcormier.dev'
  ]
};
```

## 🧪 Step 5: Testing

### **5.1 Test Authentication**
1. Start your development server: `npm run dev`
2. Navigate to a protected route (e.g., `/protected`)
3. Verify authentication flow works correctly

### **5.2 Test Contact Form**
1. Go to `/contact` page
2. Fill out the contact form
3. Verify email is sent successfully
4. Check AI analysis appears for messages >20 characters

### **5.3 Test AI Features**
1. Type a substantial message in the contact form
2. Verify AI analysis card appears
3. Check that analysis provides relevant insights
4. Test fallback mode by temporarily disabling AI worker

### **5.4 Test Site Assistant**
1. Navigate to any page on the site
2. Look for the floating AI assistant button
3. Click to open the assistant
4. Test various queries and recommendations

## 🚨 Troubleshooting

### **Common Issues**

1. **Authentication Not Working**
   - Verify Cloudflare Access application is configured correctly
   - Check that your domain is pointing to Cloudflare
   - Ensure identity provider is properly configured

2. **Emails Not Sending**
   - Verify Resend domain verification is complete
   - Check that API key is set as a Cloudflare secret
   - Verify worker deployment was successful

3. **AI Analysis Not Working**
   - Check AI worker deployment status
   - Verify AI binding is configured in wrangler-ai.toml
   - Check browser console for network errors

4. **CORS Issues**
   - Ensure emails are sent via Cloudflare Workers (server-side)
   - Check that frontend is not making direct API calls to Resend

5. **Site Assistant Not Loading**
   - Check that SiteAssistant component is imported in AppLayout
   - Verify portfolio items are loading correctly
   - Check browser console for component errors

### **Debug Steps**
1. Check Cloudflare Worker logs in the dashboard
2. Verify browser console for frontend errors
3. Test worker endpoints directly using curl or Postman
4. Check Cloudflare Access logs for authentication issues

### **Worker Debugging**
```bash
# View worker logs
wrangler tail --env development

# Test worker directly
curl -X POST https://your-worker-url.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check worker status
wrangler whoami
```

## 📊 Monitoring & Maintenance

### **Performance Monitoring**
- Monitor Cloudflare Worker performance in the dashboard
- Track AI analysis response times and accuracy
- Monitor email delivery rates and bounce rates
- Check Cloudflare Access usage and authentication patterns

### **Cost Management**
- Cloudflare Workers: 100k requests/day free tier
- Cloudflare AI: Pay-per-use inference pricing
- Resend: 3k emails/month free tier
- Cloudflare Access: Free for up to 50 users

### **Regular Maintenance**
- Update worker dependencies regularly
- Monitor Cloudflare Access policies and user access
- Review and update allowed email addresses as needed
- Check worker performance and error rates

## 🔒 Security Considerations

### **Worker Security**
- **API Key Storage**: Store sensitive keys as Cloudflare secrets
- **Input Validation**: Validate all incoming requests
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Error Handling**: Don't expose sensitive information in error messages

### **Access Control Security**
- **Email Validation**: Strict email-based access control
- **Session Management**: Proper session handling and cleanup
- **HTTPS Enforcement**: All communications encrypted
- **Regular Review**: Periodically review access policies

**📖 For comprehensive security documentation, see [SECURITY.md](./SECURITY.md)**

## 🔗 Additional Resources

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide and architecture details
- **[AI_FEATURE_README.md](./AI_FEATURE_README.md)** - Comprehensive AI features documentation
- **[EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md)** - Email system and meeting confirmation documentation
- **[ACCESS_CONTROL.md](./ACCESS_CONTROL.md)** - Authentication and access control configuration
- **[SECURITY.md](./SECURITY.md)** - Security features and best practices

## 📚 Cloudflare Documentation

- [Cloudflare Access Documentation](https://developers.cloudflare.com/access/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare AI Documentation](https://developers.cloudflare.com/ai/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

---

**Cloudflare Setup powered by Cloudflare Access & Workers** 🚀✨
