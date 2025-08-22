# Cloudflare Access Quick Setup Guide

## Introduction
This guide provides the correct policy configuration for Cloudflare Access based on official Cloudflare documentation. It helps you set up public and protected routes while avoiding common blocking issues.

## Prerequisites
- Cloudflare account with Zero Trust enabled
- Domain configured in Cloudflare
- Identity provider configured (One-time PIN, Google OAuth, etc.)

## Step 1: Access Cloudflare Zero Trust
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain
3. Go to **Zero Trust** → **Access** → **Applications**

## Step 2: Create/Edit Your Application
1. Click **Add an application** (or edit existing)
2. Configure:
   - **Application name**: "Your App Name"
   - **Application type**: Self-hosted
   - **Domain**: `yourdomain.com`
   - **Session duration**: 24 hours (or your preference)

## Step 3: Configure Identity Provider
1. In your application, go to **Authentication** section
2. Click **Add identity provider**
3. Select your preferred method:
   - **One-time PIN** (for email-based authentication)
   - **Google OAuth** (for Google accounts)
   - **Microsoft Entra ID** (for Microsoft accounts)
   - **Other SAML/OIDC providers**
4. Configure according to your provider's requirements

## Step 4: Delete Existing Policies (if any)
1. Go to **Policies** section
2. Delete any existing policies that might be blocking your main site
3. Start fresh with the correct policies

## Step 5: Add Public Access Policy (FIRST - Bypass)
**IMPORTANT**: Bypass policies are evaluated first according to Cloudflare documentation.

1. Click **Add a policy**
2. Configure:
   - **Policy name**: "Public Access"
   - **Action**: **Bypass** (this disables Access enforcement)
   - **Rule type**: Include
   - **Selector**: Everyone
   - **Value**: Everyone

**Alternative - More Specific Public Access**:
If you prefer to be more specific about which pages are public:
- **Policy name**: "Public Pages"
- **Action**: Bypass
- **Rules** (add multiple Include rules):
  - **Include**: Common Name = `yourdomain.com/`
  - **Include**: Common Name = `yourdomain.com/about`
  - **Include**: Common Name = `yourdomain.com/contact`
  - **Include**: Common Name = `yourdomain.com/blog`
  - **Include**: Common Name = `yourdomain.com/services`
  - **Include**: Common Name = `yourdomain.com/portfolio`

## Step 6: Add Protected Routes Policy (SECOND - Allow)
1. Click **Add a policy**
2. Configure:
   - **Policy name**: "Protected Routes"
   - **Action**: **Allow** (this requires authentication)
   - **Rules**:
     - **Include**: Common Name = `yourdomain.com/admin`
     - **Include**: Common Name = `yourdomain.com/dashboard`
     - **Include**: Common Name = `yourdomain.com/private`
     - **Require**: Emails = `admin@yourdomain.com` (or your specific email)

## Step 7: Test Your Configuration
1. **Test public pages** (should work immediately):
   - Visit `yourdomain.com/`
   - Visit `yourdomain.com/about`
   - These should load without any authentication

2. **Test protected pages** (should require authentication):
   - Visit `yourdomain.com/admin`
   - Should redirect to Cloudflare Access login
   - Complete authentication flow
   - Should grant access after successful authentication

## Policy Order is Critical
According to Cloudflare documentation, policies are evaluated in this order:
1. **Service Auth** policies (first)
2. **Bypass** policies (second)
3. **Allow/Block** policies (third)

Make sure your policies are in this exact order:
1. **Public Access** (Bypass) - FIRST
2. **Protected Routes** (Allow) - SECOND

## Understanding Policy Actions

### Bypass Action
- **Purpose**: Disables Access enforcement for matching traffic
- **Use case**: Public pages that don't need authentication
- **Security**: No security controls enforced, requests not logged
- **Rule types**: Cannot use identity-based selectors (like email)

### Allow Action
- **Purpose**: Requires authentication, then allows access
- **Use case**: Protected content that needs user verification
- **Security**: Full Access security controls enforced
- **Rule types**: Can use identity-based selectors

### Block Action
- **Purpose**: Prevents access completely
- **Use case**: Denying access to specific users or locations

## Common Use Cases

### Public Website with Admin Section
- **Public**: Homepage, about, contact, blog
- **Protected**: Admin panel, dashboard, user management

### SaaS Application
- **Public**: Landing page, pricing, documentation
- **Protected**: User dashboard, settings, billing

### Internal Application
- **Public**: Health checks, status pages
- **Protected**: All application features

## If Still Blocked
1. **Temporarily disable** the entire application
2. **Test your main site** - should work
3. **Re-enable** and follow steps above
4. **Check policy order** - Bypass must come before Allow

## Troubleshooting
- **Main site blocked**: Policy includes `yourdomain.com/*` instead of specific routes
- **Authentication loop**: Wrong policy order or identity provider not configured
- **Login not working**: Check identity provider configuration
- **Access denied**: Email rule not set correctly
- **403 Forbidden**: Bypass policy not configured correctly

## Expected Result
- ✅ Main site (`yourdomain.com/`) accessible without login
- ✅ All public pages accessible without login
- ✅ Protected routes require authentication
- ✅ Only authorized users can access protected content

## Important Notes from Cloudflare Documentation
- **Bypass policies are evaluated first** and disable all Access security controls
- **Bypass does not support identity-based selectors** (like email)
- **Policy order matters**: Bypass → Service Auth → Allow/Block
- **Bypass requests are not logged** for security auditing
- **Test Bypass policies before production** deployment

## Customization Options
- **Session duration**: Adjust based on security requirements
- **Identity providers**: Use multiple providers for different user types
- **Device posture**: Add device security requirements
- **Network policies**: Restrict access by IP ranges or countries
- **Custom branding**: Customize login page appearance
