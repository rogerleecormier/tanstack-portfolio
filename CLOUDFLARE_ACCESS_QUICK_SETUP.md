# Cloudflare Access Quick Setup Guide

## Current Issue
Your main site is being blocked because Cloudflare Access policies are too broad. This guide will fix that.

## Step 1: Access Cloudflare Zero Trust
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain (`rcormier.dev`)
3. Go to **Zero Trust** → **Access** → **Applications**

## Step 2: Create/Edit Your Application
1. Click **Add an application** (or edit existing)
2. Configure:
   - **Application name**: "Portfolio App"
   - **Application type**: Self-hosted
   - **Domain**: `rcormier.dev`
   - **Session duration**: 24 hours

## Step 3: Configure Identity Provider
1. In your application, go to **Authentication** section
2. Click **Add identity provider**
3. Select **One-time PIN**
4. Configure:
   - **Provider name**: "iCloud PIN Auth"
   - **Email domain**: `rcormier.dev`
   - **PIN length**: 6
   - **PIN expiration**: 10 minutes

## Step 4: Delete Existing Policies (if any)
1. Go to **Policies** section
2. Delete any existing policies that might be blocking your main site
3. Start fresh with the correct policies

## Step 5: Add Public Access Policy (FIRST)
1. Click **Add a policy**
2. Configure:
   - **Policy name**: "Public Access"
   - **Action**: **Bypass** (this allows access without authentication)
   - **Include**: `rcormier.dev/`
   - **Include**: `rcormier.dev/strategy`
   - **Include**: `rcormier.dev/leadership`
   - **Include**: `rcormier.dev/devops`
   - **Include**: `rcormier.dev/saas`
   - **Include**: `rcormier.dev/talent`
   - **Include**: `rcormier.dev/analytics`
   - **Include**: `rcormier.dev/project-analysis`

## Step 6: Add Protected Routes Policy (SECOND)
1. Click **Add a policy**
2. Configure:
   - **Policy name**: "Protected Routes"
   - **Action**: **Allow** (this requires authentication)
   - **Include**: `rcormier.dev/protected`
   - **Include**: `rcormier.dev/healthbridge-analysis`
   - **Additional rules** (if available): Email = `roger@rcormier.dev`

## Step 7: Test Your Configuration
1. **Test public pages** (should work immediately):
   - Visit `rcormier.dev/`
   - Visit `rcormier.dev/strategy`
   - These should load without any authentication

2. **Test protected pages** (should require OTP):
   - Visit `rcormier.dev/protected`
   - Should redirect to Cloudflare Access OTP login
   - Enter `roger@rcormier.dev`
   - Check email for PIN code
   - Enter PIN to access

## Policy Order is Critical
Make sure your policies are in this exact order:
1. **Public Access** (Bypass) - FIRST
2. **Protected Routes** (Allow) - SECOND

## If Still Blocked
1. **Temporarily disable** the entire application
2. **Test your main site** - should work
3. **Re-enable** and follow steps above
4. **Check policy order** - Bypass must come before Allow

## Troubleshooting
- **Main site blocked**: Policy includes `rcormier.dev/*` instead of specific routes
- **Authentication loop**: Wrong policy order or identity provider not configured
- **OTP not received**: Check spam folder, verify email domain
- **Access denied**: Email rule not set to `roger@rcormier.dev`

## Expected Result
- ✅ Main site (`rcormier.dev/`) accessible without login
- ✅ All portfolio pages accessible without login
- ✅ `/protected` requires OTP authentication
- ✅ `/healthbridge-analysis` requires OTP authentication
- ✅ Only `roger@rcormier.dev` emails can access protected content
