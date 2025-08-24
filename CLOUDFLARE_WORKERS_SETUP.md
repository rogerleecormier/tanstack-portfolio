# Cloudflare Workers & Resend Email Setup Guide

This guide explains how to set up a fully functional contact form using Cloudflare Workers and Resend for reliable email delivery.

## 🎯 Overview

The contact form system consists of:
- **Frontend Contact Form**: React component with validation
- **Cloudflare Worker**: Serverless function for email processing
- **Resend API**: Modern email service for reliable delivery
- **Domain Verification**: Verified domain for professional email sending

## 🚀 Quick Start

### **What You'll Get**
✅ **Working contact form** that sends real emails  
✅ **Professional email templates** with your branding  
✅ **Spam protection** and validation  
✅ **No CORS issues** - emails sent server-side  
✅ **Free tier** - 100k requests/day on Cloudflare, 3k emails/month on Resend  

## 📋 Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **Resend Account** at [resend.com](https://resend.com)
3. **Domain** (e.g., `rcormier.dev`) for professional email addresses
4. **Node.js** and **Wrangler CLI** installed

## 🔧 Step-by-Step Setup

### **Step 1: Install Wrangler CLI**

```bash
npm install -g wrangler
```

### **Step 2: Login to Cloudflare**

```bash
wrangler login
```

### **Step 3: Create Resend Account**

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address
4. Go to **API Keys** section

### **Step 4: Get Your Resend API Key**

1. In Resend dashboard, click **"Create API Key"**
2. Give it a name (e.g., "Portfolio Contact Form")
3. Copy the API key (starts with `re_`)
4. **Keep this secure** - you'll need it for the next step

### **Step 5: Verify Your Domain with Resend**

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `rcormier.dev`)
4. Follow the DNS verification steps:
   - Add the required TXT records to your domain
   - Wait for verification (usually takes a few minutes)
5. **Important**: Domain must be verified before you can send emails

### **Step 6: Configure Your Worker**

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

### **Step 7: Set Your Resend API Key as a Secret**

```bash
# For development environment
wrangler secret put RESEND_API_KEY --env development

# For production environment
wrangler secret put RESEND_API_KEY --env production
```

When prompted, paste your Resend API key.

### **Step 8: Deploy Your Worker**

```bash
# Deploy to development
wrangler deploy --env development

# Deploy to production (when ready)
wrangler deploy --env production
```

### **Step 9: Test Your Setup**

Test the worker directly:

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

## 🔍 How It Works

### **1. User Submits Form**
```
Contact Form → React Component → Validation → API Call
```

### **2. Cloudflare Worker Processes Request**
```
Worker → Validates Input → Calls Resend API → Returns Response
```

### **3. Resend Sends Email**
```
Resend → SMTP → Recipient's Email Server → Inbox
```

### **4. Success Response**
```
Worker → Frontend → Success Message → Form Reset
```

## 📧 Email Configuration

### **Development vs Production**

The worker automatically detects the environment and uses appropriate email addresses:

```javascript
// Development: Uses Resend testing domain
const fromEmail = 'onboarding@resend.dev';
const toEmail = 'rogerleecormier@gmail.com';

// Production: Uses your verified domain
const fromEmail = 'noreply@rcormier.dev';
const toEmail = 'roger@rcormier.dev';
```

### **Email Template Features**

- **Professional HTML design** with your branding
- **Plain text fallback** for accessibility
- **Reply-to functionality** for easy responses
- **Company information** captured in form
- **Subject line** categorization
- **Timestamp** for tracking

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

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

#### **4. "CORS error" in Browser**
- Ensure worker is deployed and accessible
- Check worker logs: `wrangler tail --env development`
- Verify the worker URL in your frontend code

### **Debug Commands**

```bash
# View worker logs
wrangler tail --env development --format pretty

# Check worker status
wrangler whoami

# List deployments
wrangler deployments list --env development

# Check secrets
wrangler secret list --env development
```

## 🔒 Security Features

### **Built-in Protection**

- **Input Validation**: Required fields and format checking
- **Rate Limiting**: Prevents spam and abuse
- **API Key Security**: Stored as Cloudflare secrets
- **CORS Handling**: Proper cross-origin request handling
- **Error Sanitization**: No sensitive data in error messages

### **Best Practices**

1. **Never commit API keys** to version control
2. **Use environment-specific secrets** for dev/prod
3. **Monitor worker logs** for suspicious activity
4. **Regular secret rotation** for production
5. **Domain verification** before sending emails

## 📊 Monitoring & Analytics

### **Worker Logs**

```bash
# Real-time logs
wrangler tail --env development

# Historical logs
wrangler tail --env development --format json
```

### **Resend Dashboard**

- **Email delivery status** in real-time
- **Bounce and spam reports**
- **Send volume analytics**
- **Domain reputation monitoring**

## 🚀 Production Deployment

### **1. Verify Domain**
Ensure your domain is verified with Resend before production.

### **2. Deploy to Production**
```bash
wrangler deploy --env production
```

### **3. Update Frontend**
Update your `emailService.ts` to use the production worker URL.

### **4. Test Thoroughly**
Send test emails to verify everything works in production.

## 💰 Cost Analysis

### **Free Tier Limits**

- **Cloudflare Workers**: 100,000 requests/day
- **Resend**: 3,000 emails/month
- **Perfect for portfolio use**

### **Paid Plans** (if needed)

- **Cloudflare Workers**: $5/month for 10M requests
- **Resend**: $20/month for 50k emails

## 🔄 Maintenance

### **Regular Tasks**

1. **Monitor worker logs** for errors
2. **Check Resend dashboard** for delivery issues
3. **Rotate API keys** quarterly
4. **Update worker code** as needed
5. **Monitor domain reputation** in Resend

### **Updates**

```bash
# Update wrangler CLI
npm update -g wrangler

# Redeploy after code changes
wrangler deploy --env development
```

## 📚 Additional Resources

### **Documentation**
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Resend API](https://resend.com/docs)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### **Support**
- **Cloudflare**: [Community Forum](https://community.cloudflare.com/)
- **Resend**: [Discord Community](https://discord.gg/resend)

## ✅ Success Checklist

- [ ] Wrangler CLI installed and logged in
- [ ] Resend account created and verified
- [ ] Domain verified with Resend
- [ ] API key obtained from Resend
- [ ] Worker deployed to development
- [ ] Secrets configured in Cloudflare
- [ ] Contact form tested and working
- [ ] Production deployment ready

## 🎉 You're Done!

Your contact form should now be fully functional! Users can:
- Fill out the contact form
- Submit inquiries with company details
- Receive confirmation when emails are sent
- You'll receive professional emails at your domain

The system automatically handles:
- ✅ **CORS issues** (solved by Cloudflare Worker)
- ✅ **Email delivery** (handled by Resend)
- ✅ **Spam protection** (built into Resend)
- ✅ **Professional templates** (custom HTML emails)
- ✅ **Environment switching** (dev vs prod)

---

**Need help?** Check the troubleshooting section or open an issue in your repository.
