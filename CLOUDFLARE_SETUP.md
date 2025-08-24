# Cloudflare Access & Email Setup Guide

This guide explains how to set up Cloudflare Access with email-based authentication and a fully functional contact form using Cloudflare Workers and Resend.

## 🎯 Overview

This setup provides:
- **Cloudflare Access**: Enterprise-grade Zero Trust authentication
- **Contact Form**: Professional contact form with email integration
- **Email Delivery**: Reliable email sending via Resend API
- **Serverless Architecture**: No backend server required

## 🚀 Quick Start

### **What You'll Get**
✅ **Protected routes** with Cloudflare Access  
✅ **Working contact form** that sends real emails  
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
   - `https://yourdomain.com/cdn-cgi/access/callback/`

### **1.5 Access Policies**
Create an access policy:
- **Policy name**: `Authenticated Users`
- **Action**: `Allow`
- **Rules**: 
  - **Include**: `Emails` → Add allowed emails:
    - `roger@rcormier.dev`
    - `rogerleecormier@gmail.com`
  - **Include**: `Emails ending in` → `@rcormier.dev`

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

### **2.7 Set Resend API Key as Secret**
```bash
# For development environment
wrangler secret put RESEND_API_KEY --env development

# For production environment
wrangler secret put RESEND_API_KEY --env production
```

### **2.8 Deploy Worker**
```bash
# Deploy to development
wrangler deploy --env development

# Deploy to production (when ready)
wrangler deploy --env production
```

## 🔧 Step 3: Application Configuration

### **3.1 Update Access Control**
Edit `src/config/accessControl.ts` to match your Cloudflare Access policy:

```typescript
export const accessControl: AccessControlConfig = {
  allowedEmails: [
    'roger@rcormier.dev',
    'rogerleecormier@gmail.com',
    // Add any additional emails here
  ],
  allowedDomains: [
    'rcormier.dev',
    // Add any additional domains here
  ]
};
```

### **3.2 Environment Variables**
Set these in your deployment environment:
```bash
VITE_CLOUDFLARE_DOMAIN=yourdomain.com
```

### **3.3 Resend Configuration**
```typescript
// Configured via Cloudflare Workers secrets
// No local config file needed - API keys stored securely
```

## 🧪 Step 4: Testing

### **4.1 Test Authentication Flow**
1. Visit `/protected` or `/healthbridge-analysis`
2. Should redirect to Google SSO (or your identity provider)
3. After authentication, should return to protected page
4. No refresh should be needed

### **4.2 Test Contact Form**
1. Fill out the contact form on your site
2. Submit the form
3. Check your email - you should receive a real email!
4. Check browser console for success/error messages

### **4.3 Test Worker Directly**
```bash
curl -X POST https://your-worker-url.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "from_name": "Test User",
    "from_email": "test@example.com",
    "subject": "Test",
    "message": "Test message"
  }'
```

## 🔍 How It All Works

### **Authentication Flow**
```
User → Protected Route → Cloudflare Access → Google SSO → Authenticated → Access Granted
```

### **Contact Form Flow**
```
User → Contact Form → Validation → Cloudflare Worker → Resend API → Email Sent → Success
```

### **Email Processing**
- **Frontend**: React component with validation
- **Worker**: Serverless function for email processing
- **Resend**: Modern email service for reliable delivery
- **Domain**: Verified domain for professional email addresses

## 🛠️ Troubleshooting

### **Authentication Issues**

#### **1. Authentication Loop**
- Check redirect URIs in Google OAuth
- Verify Cloudflare Access application domain
- Clear browser cookies and cache

#### **2. Route Not Protected**
- Verify policy is assigned to routes
- Check DNS proxy settings
- Ensure SSL is properly configured

#### **3. User Not Recognized**
- Verify email is in allowed list in `accessControl.ts`
- Check Google OAuth domain restrictions
- Review Cloudflare Access logs

### **Email Issues**

#### **1. "Worker not found" Error**
```bash
# Check if worker is deployed
wrangler deployments list --env development

# Redeploy if needed
wrangler deploy --env development
```

#### **2. "Invalid API key" Error**
```bash
# Verify secret is set
wrangler secret list --env development

# Reset the secret
wrangler secret delete RESEND_API_KEY --env development
wrangler secret put RESEND_API_KEY --env development
```

#### **3. "Domain not verified" Error**
- Go to [resend.com/domains](https://resend.com/domains)
- Verify your domain status
- Complete DNS verification if pending

### **Debug Commands**
```bash
# Check worker logs
wrangler tail --env development --format pretty

# Check worker status
wrangler whoami

# List deployments
wrangler deployments list --env development

# Check secrets
wrangler secret list --env development
```

## 🔒 Security Features

### **Authentication Security**
- Cloudflare Access Zero Trust
- Email-based access control
- Secure cookie handling
- Rate limiting support

### **Email Security**
- API key stored as Cloudflare secrets
- Input validation and sanitization
- Rate limiting on contact form
- Spam protection measures

### **Content Security**
- XSS protection
- Content sanitization
- Secure markdown rendering
- Input validation

### **Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## 📊 Monitoring & Analytics

### **Cloudflare Access**
- User authentication logs
- Access policy violations
- Session management
- Route protection status

### **Email System**
- Worker logs and errors
- Email delivery status
- Bounce and spam reports
- Send volume analytics

## 🚀 Production Deployment

### **1. Verify Everything Works**
- Test authentication in production
- Test contact form functionality
- Verify email delivery

### **2. Deploy to Production**
```bash
wrangler deploy --env production
```

### **3. Update DNS**
- Ensure domain points to Cloudflare
- Verify SSL/TLS settings
- Check proxy status

### **4. Monitor Performance**
- Watch authentication logs
- Monitor email delivery
- Check worker performance

## 💰 Cost Analysis

### **Free Tier Limits**
- **Cloudflare Access**: Included with Cloudflare plan
- **Cloudflare Workers**: 100,000 requests/day
- **Resend**: 3,000 emails/month
- **Perfect for portfolio use**

### **Paid Plans** (if needed)
- **Cloudflare Workers**: $5/month for 10M requests
- **Resend**: $20/month for 50k emails

## 🔄 Maintenance

### **Regular Tasks**
1. **Monitor access logs** for suspicious activity
2. **Check worker logs** for errors
3. **Review email delivery** in Resend dashboard
4. **Rotate API keys** quarterly
5. **Update policies** as needed

### **Updates**
```bash
# Update wrangler CLI
npm update -g wrangler

# Redeploy after code changes
wrangler deploy --env development
```

## 📚 Additional Resources

### **Documentation**
- [Cloudflare Access](https://developers.cloudflare.com/access/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Resend API](https://resend.com/docs)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### **Support**
- **Cloudflare**: [Community Forum](https://community.cloudflare.com/)
- **Resend**: [Discord Community](https://discord.gg/resend)

## ✅ Success Checklist

- [ ] Cloudflare Access application created
- [ ] Google OAuth configured
- [ ] Access policies set up
- [ ] Resend account created and verified
- [ ] Domain verified with Resend
- [ ] API key obtained from Resend
- [ ] Worker deployed to development
- [ ] Secrets configured in Cloudflare
- [ ] Authentication tested and working
- [ ] Contact form tested and working
- [ ] Production deployment ready

## 🎉 You're Done!

Your portfolio now has:
- ✅ **Enterprise-grade authentication** with Cloudflare Access
- ✅ **Working contact form** that sends real emails
- ✅ **Professional email templates** with your branding
- ✅ **Protected routes** for sensitive content
- ✅ **No CORS issues** - everything works server-side

The system automatically handles:
- **Authentication**: Cloudflare Access with Zero Trust
- **Email delivery**: Resend API via Cloudflare Workers
- **Route protection**: Automatic redirects to login
- **Environment switching**: Dev vs prod configurations

---

**Need help?** Check the troubleshooting section or open an issue in your repository.
