# Cloudflare Access Setup for rcormier.dev Portfolio

This guide provides the complete setup for Cloudflare Access authentication on your TanStack Portfolio site at `rcormier.dev`.

## Overview

Your portfolio site uses Cloudflare Access with One-Time PIN (OTP) authentication to protect sensitive content while keeping the main portfolio pages publicly accessible.

### Protected Routes
- `/protected` - General protected content
- `/healthbridge-analysis` - HealthBridge analysis tools

### Public Routes
- `/` - About page
- `/strategy` - Strategy content
- `/leadership` - Leadership content
- `/devops` - DevOps content
- `/saas` - SaaS content
- `/talent` - Talent content
- `/analytics` - Analytics content
- `/project-analysis` - Project analysis

## Prerequisites

- Cloudflare account with Zero Trust enabled
- Domain `rcormier.dev` configured in Cloudflare
- iCloud account with `roger@rcormier.dev` email

## Step 1: Enable Cloudflare Zero Trust

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain (`rcormier.dev`)
3. Go to **Zero Trust** → **Overview**
4. Click **Get started** if Zero Trust is not enabled
5. Choose a plan (Free plan includes 50 users)

## Step 2: Configure One-Time PIN Identity Provider

1. **In Cloudflare Zero Trust Dashboard:**
   - Go to **Zero Trust** → **Settings** → **Authentication**
   - Click **Add identity provider**
   - Select **One-time PIN**

2. **Configure One-Time PIN:**
   - **Provider name**: "iCloud PIN Auth"
   - **Email domain**: `rcormier.dev`
   - **PIN length**: 6 digits
   - **PIN expiration**: 10 minutes

## Step 3: Create Zero Trust Application

1. **Go to Zero Trust Applications:**
   - Navigate to **Zero Trust** → **Access** → **Applications**
   - Click **Add an application**

2. **Configure Application:**
   - **Application name**: "Portfolio App"
   - **Application type**: Self-hosted
   - **Session duration**: 24 hours
   - **Domain**: `rcormier.dev`

## Step 4: Configure Access Policies

### Policy 1: Public Access (Bypass) - FIRST
**IMPORTANT**: This policy must be created first and use Bypass action.

1. Click **Add a policy**
2. Configure:
   - **Policy name**: "Public Access"
   - **Action**: **Bypass** (disables Access enforcement)
   - **Rule type**: Include
   - **Selector**: Everyone
   - **Value**: Everyone

**Alternative - Specific Public Routes**:
If you prefer to be more specific:
- **Policy name**: "Public Pages"
- **Action**: Bypass
- **Rules** (add multiple Include rules):
  - **Include**: Common Name = `rcormier.dev/`
  - **Include**: Common Name = `rcormier.dev/strategy`
  - **Include**: Common Name = `rcormier.dev/leadership`
  - **Include**: Common Name = `rcormier.dev/devops`
  - **Include**: Common Name = `rcormier.dev/saas`
  - **Include**: Common Name = `rcormier.dev/talent`
  - **Include**: Common Name = `rcormier.dev/analytics`
  - **Include**: Common Name = `rcormier.dev/project-analysis`

### Policy 2: Protected Routes (Allow) - SECOND
1. Click **Add a policy**
2. Configure:
   - **Policy name**: "Protected Routes"
   - **Action**: **Allow** (requires authentication)
   - **Rules**:
     - **Include**: Common Name = `rcormier.dev/protected`
     - **Include**: Common Name = `rcormier.dev/healthbridge-analysis`
     - **Require**: Emails = `roger@rcormier.dev`

## Step 5: Test Your Configuration

### Test Public Pages (should work immediately):
- Visit `rcormier.dev/`
- Visit `rcormier.dev/strategy`
- These should load without any authentication

### Test Protected Pages (should require OTP):
- Visit `rcormier.dev/protected`
- Should redirect to Cloudflare Access OTP login
- Enter `roger@rcormier.dev`
- Check email for PIN code
- Enter PIN to access

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
- **Use case**: Public portfolio pages that don't need authentication
- **Security**: No security controls enforced, requests not logged
- **Rule types**: Cannot use identity-based selectors (like email)

### Allow Action
- **Purpose**: Requires authentication, then allows access
- **Use case**: Protected content that needs user verification
- **Security**: Full Access security controls enforced
- **Rule types**: Can use identity-based selectors

## Troubleshooting

### Main Site Blocked (403 Error)
**Problem**: Your main site is blocked by Cloudflare Access
**Solution**: 
1. Temporarily disable the entire application
2. Test your main site - should work
3. Re-enable and create Bypass policy first
4. Check policy order - Bypass must come before Allow

### Authentication Loop
**Problem**: Users get stuck in authentication loop
**Solution**:
1. Check policy order (Bypass → Allow)
2. Verify identity provider configuration
3. Ensure email domain matches `rcormier.dev`

### OTP Not Received
**Problem**: PIN codes not arriving via email
**Solution**:
1. Check spam/junk folders
2. Verify email domain configuration in Zero Trust
3. Ensure iCloud account can receive emails

### Access Denied
**Problem**: Authenticated users still get access denied
**Solution**:
1. Verify email rule is set to `roger@rcormier.dev`
2. Check that user email matches exactly
3. Ensure identity provider is properly configured

## Expected Result

- ✅ Main site (`rcormier.dev/`) accessible without login
- ✅ All portfolio pages accessible without login
- ✅ `/protected` requires OTP authentication
- ✅ `/healthbridge-analysis` requires OTP authentication
- ✅ Only `roger@rcormier.dev` emails can access protected content

## Important Notes

- **Bypass policies are evaluated first** and disable all Access security controls
- **Bypass does not support identity-based selectors** (like email)
- **Policy order matters**: Bypass → Service Auth → Allow/Block
- **Bypass requests are not logged** for security auditing
- **Test Bypass policies before production** deployment

## Integration with Your Portfolio

Your TanStack Portfolio application is configured to work with Cloudflare Access:

- **Login Button**: Triggers Cloudflare Access OTP flow
- **Protected Routes**: Automatically redirect to authentication
- **Authentication State**: Managed by `useAuth` hook
- **User Information**: Retrieved from Cloudflare Access cookies

The authentication flow is handled entirely by Cloudflare Access, providing enterprise-grade security for your protected content while keeping your portfolio publicly accessible.
