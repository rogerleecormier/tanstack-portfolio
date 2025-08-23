# Cloudflare Access Setup for rcormier.dev Portfolio

This guide provides the complete setup for Cloudflare Access authentication on your TanStack Portfolio site at `rcormier.dev`. The portfolio uses modern web technologies including React 19, TanStack Router, shadcn/ui, and Fuse.js for search.

## 🚀 Technology Overview

Your portfolio leverages cutting-edge web technologies:

- **React 19** with TypeScript for modern UI development
- **TanStack Router** for type-safe, file-based routing
- **shadcn/ui** components with Tailwind CSS for consistent design
- **Fuse.js** for powerful fuzzy search across all content
- **Recharts** with shadcn/ui integration for data visualization
- **Cloudflare Access** with One-Time PIN (OTP) for enterprise-grade security

## 🔐 Authentication Architecture

### **Dual-Mode Authentication System**
The application automatically detects the environment and switches authentication modes:

- **Development Mode** (`localhost`): Mock authentication for testing
- **Production Mode** (`rcormier.dev`): Cloudflare Access with OTP

### **Protected Routes**
- `/protected` - General protected content
- `/healthbridge-analysis` - HealthBridge analysis tools with Recharts integration

### **Public Routes**
- `/` - About page
- `/strategy` - Strategy content
- `/leadership` - Leadership content
- `/devops` - DevOps content
- `/saas` - SaaS content
- `/talent` - Talent content
- `/analytics` - Analytics content
- `/project-analysis` - Project analysis

## 🛠️ Prerequisites

- Cloudflare account with Zero Trust enabled
- Domain `rcormier.dev` configured in Cloudflare
- iCloud account with `roger@rcormier.dev` email
- Portfolio application built with React 19 and TanStack Router

## 📋 Step-by-Step Setup

### **Step 1: Enable Cloudflare Zero Trust**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain (`rcormier.dev`)
3. Go to **Zero Trust** → **Overview**
4. Click **Get started** if Zero Trust is not enabled
5. Choose a plan (Free plan includes 50 users)

### **Step 2: Configure One-Time PIN Identity Provider**

1. **In Cloudflare Zero Trust Dashboard:**
   - Go to **Zero Trust** → **Settings** → **Authentication**
   - Under **Login methods**, select **Add new**
   - Select **One-time PIN**

2. **Configure One-Time PIN:**
   - **Provider name**: "Portfolio OTP Auth"
   - **Email domain**: `rcormier.dev`
   - **PIN length**: 6 digits (default)
   - **PIN expiration**: 10 minutes (default)

:::tip **Important**: If your organization uses a third-party email scanning service (for example, Mimecast or Barracuda), add `noreply@notify.cloudflare.com` to the email scanning allowlist to ensure OTP emails are delivered. :::

### **Step 3: Create Zero Trust Application**

1. **Go to Zero Trust Applications:**
   - Navigate to **Zero Trust** → **Access** → **Applications**
   - Click **Add an application**

2. **Configure Application:**
   - **Application name**: "Portfolio App"
   - **Application type**: Self-hosted
   - **Session duration**: 24 hours
   - **Domain**: `rcormier.dev`

### **Step 4: Configure Access Policies**

#### **Policy 1: Public Access (Bypass) - FIRST**
**CRITICAL**: This policy must be created first and use Bypass action.

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

#### **Policy 2: Protected Routes (Allow) - SECOND**
1. Click **Add a policy**
2. Configure:
   - **Policy name**: "Protected Routes"
   - **Action**: **Allow** (requires authentication)
   - **Rules**:
     - **Include**: Common Name = `rcormier.dev/protected`
     - **Include**: Common Name = `rcormier.dev/healthbridge-analysis`
     - **Require**: Emails = `roger@rcormier.dev`

## 🧪 Testing Your Configuration

### **Test Public Pages (should work immediately):**
- Visit `rcormier.dev/`
- Visit `rcormier.dev/strategy`
- These should load without any authentication

### **Test Protected Pages (should require OTP):**
- Visit `rcormier.dev/protected`
- Should redirect to Cloudflare Access OTP login
- Enter `roger@rcormier.dev`
- Check email for PIN code
- Enter PIN to access

## 🔄 OTP Login Process

### **How Users Log In with OTP**

1. **Access the Protected Application:**
   - Users navigate to any protected route (e.g., `/protected`, `/healthbridge-analysis`)
   - They are automatically redirected to the Cloudflare Access login page

2. **Request One-Time PIN:**
   - On the Access login page, users enter their email address
   - Click **"Send me a code"** to request the OTP
   - If the email is allowed by an Access policy, they receive a PIN in their inbox

3. **Enter PIN and Sign In:**
   - Users paste the 6-digit PIN into the Access login page
   - Click **"Sign in"** to authenticate
   - If valid, they are redirected to the protected application
   - If invalid, they see "That account does not have access"

## ⚠️ Policy Order is Critical

According to Cloudflare documentation, policies are evaluated in this order:
1. **Service Auth** policies (first)
2. **Bypass** policies (second)
3. **Allow/Block** policies (third)

Make sure your policies are in this exact order:
1. **Public Access** (Bypass) - FIRST
2. **Protected Routes** (Allow) - SECOND

## 🔍 Understanding Policy Actions

### **Bypass Action**
- **Purpose**: Disables Access enforcement for matching traffic
- **Use case**: Public portfolio pages that don't need authentication
- **Security**: No security controls enforced, requests not logged
- **Rule types**: Cannot use identity-based selectors (like email)

### **Allow Action**
- **Purpose**: Requires authentication, then allows access
- **Use case**: Protected content that needs user verification
- **Security**: Full Access security controls enforced
- **Rule types**: Can use identity-based selectors

## 🚀 Integration with Your Portfolio

### **Authentication Flow**
Your TanStack Portfolio application is configured to work seamlessly with Cloudflare Access:

1. **Route Protection**: Protected routes automatically redirect to authentication
2. **Authentication State**: Managed by the `useAuth` hook
3. **User Information**: Retrieved from Cloudflare Access cookies
4. **Session Management**: JWT tokens handled securely

### **Development vs Production**
The application automatically detects the environment:

```typescript
// Development mode (localhost)
if (isDevelopment()) {
  // Mock authentication for testing
  return mockAuth();
}

// Production mode (rcormier.dev)
if (isProduction()) {
  // Cloudflare Access authentication
  return cloudflareAuth();
}
```

### **Protected Components**
Components like `HealthBridge` are wrapped with authentication:

```tsx
<ProtectedRoute>
  <HealthBridge />
</ProtectedRoute>
```

## 🔧 Troubleshooting

### **Main Site Blocked (403 Error)**
**Problem**: Your main site is blocked by Cloudflare Access
**Solution**: 
1. Temporarily disable the entire application
2. Test your main site - should work
3. Re-enable and create Bypass policy first
4. Check policy order - Bypass must come before Allow

### **OTP Emails Not Delivered**
**Problem**: Users don't receive OTP emails
**Solution**:
1. **Check spam/junk folders** - OTP emails might be filtered
2. **Email scanning services**: Add `noreply@notify.cloudflare.com` to allowlists for:
   - Mimecast
   - Barracuda
   - Proofpoint
   - Other enterprise email security services
3. **Domain reputation**: Ensure `rcormier.dev` has good email reputation
4. **Email provider**: Verify iCloud can receive emails from Cloudflare

### **Authentication Loop**
**Problem**: Users get stuck in authentication loop
**Solution**:
1. Check policy order (Bypass → Allow)
2. Verify identity provider configuration
3. Ensure email domain matches `rcormier.dev`

### **Access Denied**
**Problem**: Authenticated users still get access denied
**Solution**:
1. Verify email rule is set to `roger@rcormier.dev`
2. Check that user email matches exactly
3. Ensure identity provider is properly configured

## ✅ Expected Result

- ✅ Main site (`rcormier.dev/`) accessible without login
- ✅ All portfolio pages accessible without login
- ✅ `/protected` requires OTP authentication
- ✅ `/healthbridge-analysis` requires OTP authentication
- ✅ Only `roger@rcormier.dev` emails can access protected content
- ✅ Search functionality works across all public content
- ✅ Charts and data visualization accessible after authentication

## 🎯 Benefits of This Setup

### **For Your Portfolio Use Case**
- **Simple Setup**: No complex identity provider integration required
- **Guest Access**: Perfect for sharing protected content with external collaborators
- **Email-Based**: Users only need their email address to authenticate
- **Secure**: 10-minute PIN expiration provides strong security
- **Audit Trail**: Complete logging of authentication attempts

### **Technology Advantages**
- **React 19**: Latest React features and performance improvements
- **TanStack Router**: Type-safe routing with excellent developer experience
- **shadcn/ui**: Consistent, accessible UI components
- **Fuse.js**: Powerful search with fuzzy matching
- **Recharts**: Professional data visualization
- **Tailwind CSS**: Utility-first styling with custom design system

### **Future Expansion Options**
You can simultaneously configure OTP login and other identity providers (like Okta, Google, or Microsoft 365) to allow users to select their preferred authentication method. This is useful if you later want to:
- Add SSO for your organization
- Integrate with existing identity systems
- Provide multiple authentication options
- Maintain OTP for guest access while adding enterprise SSO

## 🔮 Advanced Features

### **Search Integration**
The Fuse.js search system works seamlessly with your authentication:
- Public content is searchable by everyone
- Protected content requires authentication
- Search results respect access permissions

### **Data Visualization**
Protected routes like `/healthbridge-analysis` provide:
- Interactive charts with Recharts
- Real-time data filtering
- Responsive design for all devices
- Export capabilities for authenticated users

### **Performance Optimization**
Your portfolio leverages:
- React 19 concurrent features
- TanStack Query for efficient data fetching
- Code splitting for optimal bundle sizes
- Cloudflare's global CDN for fast delivery

## 📚 Additional Resources

- [Cloudflare Zero Trust Documentation](https://developers.cloudflare.com/zero-trust/)
- [Cloudflare Access Policies](https://developers.cloudflare.com/zero-trust/identity-access-management/)
- [One-Time PIN Setup](https://developers.cloudflare.com/zero-trust/identity-access-management/authentication/one-time-pin/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Fuse.js Search](https://fusejs.io/)

---

**Your portfolio now has enterprise-grade security with modern web technologies! 🚀**
