# Cloudflare Access Setup Guide

This guide explains how to set up Cloudflare Access with email-based authentication to protect your routes `/protected` and `/healthbridge-analysis`.

## Overview

Cloudflare Access provides enterprise-grade authentication without requiring a backend server. It handles:
- Email-based authentication
- Route protection
- User identity management
- Session management

## Prerequisites

1. **Cloudflare Account** with Access enabled
2. **Domain** pointing to Cloudflare
3. **Identity Provider** (Google SSO, Microsoft, etc.)

## Step 1: Configure Cloudflare Access Application

### 1.1 Create Application
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Access** → **Applications**
3. Click **Add an application**
4. Choose **Self-hosted**

### 1.2 Application Settings
- **Application name**: `Portfolio App`
- **Session Duration**: `24 hours` (or your preference)
- **Application domain**: `yourdomain.com` (or subdomain)

### 1.3 Protected Routes
Add these paths to protect:
- `/protected`
- `/healthbridge-analysis`

## Step 2: Configure Identity Provider

### 2.1 Google SSO Setup (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `https://yourdomain.com/cdn-cgi/access/callback`
   - `https://yourdomain.com/cdn-cgi/access/callback/`

### 2.2 Configure Cloudflare Access
1. In your Access application, go to **Authentication**
2. Add **Google** as an identity provider
3. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Configure allowed domains (optional):
   - `rcormier.dev`
   - `gmail.com` (if allowing specific Gmail users)

## Step 3: Access Policies

### 3.1 Create Access Policy
1. In your Access application, go to **Policies**
2. Click **Add a policy**
3. Configure:
   - **Policy name**: `Authenticated Users`
   - **Action**: `Allow`
   - **Rules**: 
     - **Include**: `Emails` → Add allowed emails:
       - `roger@rcormier.dev`
       - `rogerleecormier@gmail.com`
     - **Include**: `Emails ending in` → `@rcormier.dev`

### 3.2 Apply Policy to Routes
1. Go to **Applications** → **Portfolio App**
2. Under **Routes**, select each protected route
3. Assign the **Authenticated Users** policy

## Step 4: DNS and Proxy Settings

### 4.1 DNS Configuration
1. Ensure your domain points to Cloudflare
2. Set DNS records to **Proxied** (orange cloud)
3. Verify SSL/TLS is set to **Full (strict)**

### 4.2 Page Rules (Optional)
Create page rules for better performance:
- **URL**: `yourdomain.com/protected*`
- **Settings**: 
  - Cache Level: `Bypass`
  - SSL: `Full (strict)`

## Step 5: Application Configuration

### 5.1 Update Access Control
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

### 5.2 Environment Variables
Set these in your deployment environment:
```bash
VITE_CLOUDFLARE_DOMAIN=yourdomain.com
```

## Step 6: Testing

### 6.1 Test Authentication Flow
1. Visit `/protected` or `/healthbridge-analysis`
2. Should redirect to Google SSO (or your identity provider)
3. After authentication, should return to protected page
4. No refresh should be needed

### 6.2 Verify User Info
1. Check browser console for authentication status
2. Verify user email is displayed correctly
3. Test logout functionality

## Troubleshooting

### Common Issues

#### 1. Authentication Loop
- Check redirect URIs in Google OAuth
- Verify Cloudflare Access application domain
- Clear browser cookies and cache

#### 2. Route Not Protected
- Verify policy is assigned to routes
- Check DNS proxy settings
- Ensure SSL is properly configured

#### 3. User Not Recognized
- Verify email is in allowed list in `accessControl.ts`
- Check Google OAuth domain restrictions
- Review Cloudflare Access logs

### Debug Steps
1. Check browser network tab for failed requests
2. Verify Cloudflare Access logs in dashboard
3. Test with different browsers/incognito mode
4. Check browser console for JavaScript errors

## Security Considerations

### 1. Session Management
- Set appropriate session duration
- Enable logout on all devices
- Monitor access logs

### 2. Rate Limiting
- Configure rate limiting for authentication endpoints
- Monitor for suspicious activity

### 3. Audit Logs
- Enable comprehensive logging
- Regular review of access patterns
- Monitor for unauthorized access attempts

## Performance Optimization

### 1. Caching
- Use Cloudflare's edge caching for static assets
- Bypass cache for protected routes
- Optimize authentication response times

### 2. CDN Settings
- Enable Brotli compression
- Use HTTP/3 when available
- Optimize image delivery

## Maintenance

### 1. Regular Updates
- Keep OAuth credentials secure
- Monitor Cloudflare Access updates
- Review access policies quarterly

### 2. User Management
- Regular review of allowed users in `accessControl.ts`
- Remove access for departed users
- Update policies as needed

## Support

For issues with:
- **Cloudflare Access**: Contact Cloudflare Support
- **Google OAuth**: Check Google Cloud Console
- **Application Code**: Review this codebase

## Next Steps

After setup:
1. Test all protected routes
2. Verify user experience is seamless
3. Monitor authentication logs
4. Consider additional security measures
5. Document any custom configurations

---

**Note**: This setup provides enterprise-grade authentication with minimal backend complexity. The application handles email-based access control while Cloudflare Access manages the authentication flow.
