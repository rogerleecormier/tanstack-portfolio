# Cloudflare Zero Trust OAuth Setup Guide

This guide walks you through setting up OAuth authentication through Cloudflare Zero Trust (formerly Cloudflare Access) for your TanStack Portfolio site.

## Prerequisites

- Cloudflare account with Zero Trust enabled
- Domain configured in Cloudflare
- iCloud account with `rcormier.dev` email domain

## Step 1: Enable Cloudflare Zero Trust

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain
3. Go to **Zero Trust** → **Overview**
4. Click **Get started** if Zero Trust is not enabled
5. Choose a plan (Free plan includes 50 users)

## Step 2: Configure Identity Provider for iCloud

Since you're using an iCloud account (`roger@rcormier.dev`), the recommended method available in Cloudflare Zero Trust is **One-time PIN**:

### One-Time PIN Authentication (Recommended for iCloud)

1. **In Cloudflare Zero Trust Dashboard:**
   - Go to **Zero Trust** → **Settings** → **Authentication**
   - Click **Add identity provider**
   - Select **One-time PIN**

2. **Configure One-Time PIN:**
   - **Provider name**: "iCloud PIN Auth"
   - **Email domain**: `rcormier.dev`
   - **PIN length**: 6 digits (recommended)
   - **PIN expiration**: 10 minutes (recommended)

3. **Additional Settings:**
   - **Email attribute**: `email`
   - **Name attribute**: `name` (optional)
   - **Picture attribute**: `picture` (optional)

### Alternative: Google OAuth (If you prefer OAuth)

If you prefer OAuth and have a Google account:

1. **In Cloudflare Zero Trust Dashboard:**
   - Go to **Zero Trust** → **Settings** → **Authentication**
   - Click **Add identity provider**
   - Select **Google**

2. **Configure Google OAuth:**
   - **Provider name**: "Google Authentication"
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
   - **Email domain**: `rcormier.dev` (to restrict access)

### Note: Email Magic Links Not Available
Cloudflare Zero Trust does not currently support Email Magic Links as a native identity provider. One-time PIN is the recommended email-based authentication method for iCloud accounts.

## Step 3: Create Zero Trust Application

1. **Go to Zero Trust Applications:**
   - Navigate to **Zero Trust** → **Access** → **Applications**
   - Click **Add an application**

2. **Configure Application:**
   - **Application name**: "Portfolio App"
   - **Application type**: Choose **Self-hosted**
   - **Session duration**: Choose your preference (e.g., 24 hours)
   - **Domain**: Your domain (e.g., `rcormier.dev`)
   - **Subdomain**: Leave blank (for root domain) or set a subdomain

3. **Additional Settings:**
   - **Application launcher**: Enabled (optional)
   - **Logo**: Upload your app logo (optional)
   - **Background color**: Customize (optional)

## Step 4: Configure Access Policies

### For HealthBridge Page
1. **Add Policy:**
   - In your application, click **Add a policy**
   - **Policy name**: "HealthBridge Access"
   - **Action**: **Require**
   - **Rules**: **Identity providers** → Select your iCloud provider
   - **Include**: `rcormier.dev/healthbridge-analysis`
   - **Additional rules** → **Email** → `roger@rcormier.dev`
   - **Additional settings**: 
     - **Device posture**: None (or configure if needed)

### For Protected Page
1. **Add Policy:**
   - Click **Add a policy**
   - **Policy name**: "Protected Page Access"
   - **Action**: **Require**
   - **Rules**: **Identity providers** → Select your iCloud provider
   - **Include**: `rcormier.dev/protected`
   - **Additional rules** → **Email** → `roger@rcormier.dev`
   - **Additional settings**: 
     - **Device posture**: None (or configure if needed)

### For API Endpoints (if needed)
1. **Add Policy:**
   - Click **Add a policy**
   - **Policy name**: "API Access"
   - **Action**: **Require**
   - **Rules**: **Identity providers** → Select your iCloud provider
   - **Include**: `rcormier.dev/api/*`
   - **Additional rules** → **Email** → `roger@rcormier.dev`

## Step 5: Configure Device Posture (Optional)

1. **Go to Device Posture:**
   - Navigate to **Zero Trust** → **Settings** → **Device Posture**
   - Click **Add device posture check**

2. **Configure Checks:**
   - **Operating system**: Windows, macOS, Linux
   - **Disk encryption**: Require FileVault (macOS) or BitLocker (Windows)
   - **Firewall**: Require enabled
   - **Antivirus**: Require active protection

3. **Apply to Policies:**
   - Go back to your access policies
   - Add **Device posture** rules as needed

## Step 6: Set Up Network Policies (Optional)

1. **Go to Network Policies:**
   - Navigate to **Zero Trust** → **Access** → **Networks**
   - Click **Add a network**

2. **Configure Network:**
   - **Name**: "Portfolio App Network"
   - **Type**: Include
   - **Subnets**: Your office/home IP ranges
   - **Description**: "Trusted networks for portfolio access"

3. **Apply to Policies:**
   - Go back to access policies
   - Add **Network** rules to allow access from trusted locations

## Step 7: Test Authentication

1. **Build and Deploy:**
   ```bash
   npm run build
   ```
   Deploy the `dist/` folder to Cloudflare Pages

2. **Test Protected Routes:**
   - Visit `/healthbridge-analysis` - should redirect to iCloud authentication
   - Visit `/protected` - should redirect to iCloud authentication
   - After authentication, should access protected content

3. **Test from Different Locations:**
   - Test from your office/home (trusted network)
   - Test from mobile network (untrusted network)
   - Verify device posture requirements (if configured)

## Step 8: Customize User Experience

### Allowed Users
You can restrict access to specific users by adding email-based rules:

1. **In Access Policy:**
   - Add **Additional rules** → **Email**
   - Set to your specific email(s): `roger@rcormier.dev`

### iCloud Account Configuration
Since you're using an iCloud account (`roger@rcormier.dev`), ensure your identity provider is configured correctly:

1. **One-Time PIN (Recommended):**
   - Set **Email domain**: `rcormier.dev`
   - Users will receive a PIN code via email
   - PIN expires after a set time for security
   - **Available in Cloudflare Zero Trust**: ✅ Yes

2. **Google OAuth (Alternative):**
   - Requires Google Cloud Console setup
   - Set **Email domain**: `rcormier.dev`
   - **Available in Cloudflare Zero Trust**: ✅ Yes

3. **Email Magic Links:**
   - **Available in Cloudflare Zero Trust**: ❌ No
   - Not currently supported as a native option

### Custom Login Page
Cloudflare Zero Trust provides a default login page, but you can customize:

1. **Go to Zero Trust** → **Settings** → **Customization**
2. **Custom login page**: Upload your custom HTML
3. **Logo**: Upload your company logo
4. **Colors**: Customize the color scheme
5. **Branding**: Set company name and contact information

### Application Launcher
1. **Go to Zero Trust** → **Settings** → **App launcher**
2. **Customize launcher**: Upload logo, set colors
3. **App discovery**: Enable/disable app suggestions

## Step 9: Monitoring and Analytics

1. **Access Logs:**
   - Go to **Zero Trust** → **Logs** → **Access**
   - Monitor authentication attempts and failures
   - Set up alerts for suspicious activity

2. **Analytics Dashboard:**
   - View user access patterns
   - Monitor policy effectiveness
   - Track device posture compliance

## Troubleshooting

### Common Issues

1. **"Invalid email domain" error:**
   - Ensure your identity provider is configured for `rcormier.dev` domain
   - Check that PIN codes are being sent to the correct domain

2. **Authentication loop:**
   - Check that your policies are correctly configured
   - Verify domain names in policies match your actual routes
   - Ensure device posture checks aren't blocking access

3. **"Access denied" errors:**
   - Check that your email is in the allowed users list: `roger@rcormier.dev`
   - Verify One-time PIN identity provider configuration
   - Check device posture requirements

4. **PIN not received:**
   - Check spam/junk folders
   - Verify email domain configuration in Zero Trust
   - Ensure your iCloud account can receive emails

5. **CORS issues:**
   - Ensure your API endpoints are protected by Zero Trust policies
   - Check that Cloudflare is proxying your domain (orange cloud)

### Debug Steps

1. **Check Zero Trust Logs:**
   - Go to **Zero Trust** → **Logs** → **Access**
   - Look for authentication attempts and failures
   - Check device posture and network policy results

2. **Verify Policy Configuration:**
   - Ensure policies are in the correct order
   - Check that include/exclude rules are correct
   - Verify identity provider settings

3. **Test Identity Provider:**
   - Try logging in with your iCloud account
   - Check PIN code delivery via email
   - Verify domain restrictions are working

4. **Check Device Posture:**
   - Verify device meets posture requirements
   - Check network location policies
   - Test from different devices/networks

## Security Best Practices

1. **Session Management:**
   - Set appropriate session duration
   - Enable session timeout warnings
   - Configure idle session termination

2. **Access Control:**
   - Use least-privilege access
   - Regularly review access policies
   - Implement device posture checks
   - Use network location policies

3. **Monitoring:**
   - Enable Zero Trust logs
   - Set up alerts for suspicious activity
   - Monitor device posture compliance
   - Track access patterns

4. **Backup Access:**
   - Keep admin access to Cloudflare separate from app access
   - Document recovery procedures
   - Set up emergency access procedures

## Advanced Features

### Service Tokens
1. **Create Service Token:**
   - Go to **Zero Trust** → **Settings** → **Service Auth**
   - Click **Add service token**
   - Use for API access without user authentication

### WARP Client
1. **Install WARP:**
   - Download from [Cloudflare WARP](https://1.1.1.1/)
   - Configure for your organization
   - Enable device posture checks

### Browser Isolation
1. **Enable Remote Browser:**
   - Go to **Zero Trust** → **Settings** → **Browser Isolation**
   - Configure for sensitive applications
   - Set isolation policies

## Next Steps

After setup:
1. Test all protected routes from different locations
2. Customize the login experience and branding
3. Set up monitoring, alerts, and analytics
4. Configure device posture and network policies
5. Document the setup for your team
6. Train users on the new authentication flow

Your TanStack Portfolio is now protected with enterprise-grade Zero Trust authentication through Cloudflare!
