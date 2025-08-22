# Cloudflare Access Authentication Overview

## Overview

This document provides a comprehensive overview of the authentication system implemented for your TanStack Portfolio at `rcormier.dev`. The system uses **Cloudflare Access** with **One-Time PIN (OTP)** authentication to protect sensitive content while keeping your main portfolio pages publicly accessible.

## Authentication Architecture

### Core Components

1. **Cloudflare Access** - Enterprise-grade authentication service
2. **One-Time PIN (OTP)** - Email-based authentication method
3. **Protected Routes** - Secure content requiring authentication
4. **Login Button** - User interface for initiating authentication
5. **Authentication Hooks** - React hooks for managing auth state

### Protected Content

- **HealthBridge Analysis** (`/healthbridge-analysis`) - Health analysis tools and data
- **Protected Projects** (`/protected`) - General protected content
- **Private Files** - Sensitive documents and resources

### Public Content

- **Main Portfolio** (`/`) - About page and introduction
- **Strategy** (`/strategy`) - Strategic consulting content
- **Leadership** (`/leadership`) - Leadership development content
- **DevOps** (`/devops`) - DevOps and infrastructure content
- **SaaS** (`/saas`) - Software-as-a-Service insights
- **Talent** (`/talent`) - Talent management content
- **Analytics** (`/analytics`) - Data analytics content
- **Project Analysis** (`/project-analysis`) - Project management insights

## How Authentication Works

### 1. User Experience Flow

```
User visits protected route → Redirected to login → Enters email → Receives PIN → Enters PIN → Access granted
```

### 2. Technical Flow

1. **Route Protection**: Protected routes are wrapped with `<ProtectedRoute>` component
2. **Authentication Check**: `useAuth` hook verifies authentication status
3. **Login Button**: Triggers Cloudflare Access OTP flow
4. **OTP Verification**: User receives 6-digit PIN via email
5. **Access Grant**: Upon successful verification, user gains access to protected content

### 3. Authentication Methods

#### Production (rcormier.dev)
- **Cloudflare Access OTP**: Primary authentication method
- **Email Domain**: Restricted to `@rcormier.dev` addresses
- **Session Duration**: 24 hours
- **Security**: Enterprise-grade with JWT tokens

#### Development (localhost)
- **Mock Authentication**: Simulated authentication for development
- **Local Storage**: Authentication state stored locally
- **Bypass**: No actual OTP required during development

## Login Button Implementation

### Component: `LoginPage.tsx`

The login button is implemented as a modal component that:

- **Triggers OTP Flow**: Calls `handleOTPFlow()` function
- **User Experience**: Provides clear instructions and feedback
- **Visual Design**: Uses teal color scheme with shield icon
- **Responsive**: Works on both desktop and mobile devices

### Key Features

```tsx
<Button 
  onClick={handleCloudflareLogin}
  className="w-full bg-teal-600 hover:bg-teal-700"
  size="lg"
>
  <span>Access Protected Content</span>
  <ArrowRight className="h-4 w-4 ml-2" />
</Button>
```

### Integration Points

1. **Header Component**: Login button appears in site header
2. **Protected Routes**: Automatically redirects unauthenticated users
3. **Navigation**: Protected content appears in navigation after authentication
4. **State Management**: Integrates with `useAuth` hook

## Protected Route Implementation

### Component: `ProtectedRoute.tsx`

Protected routes use a wrapper component that:

- **Authentication Check**: Verifies user authentication status
- **Loading States**: Shows loading spinner during verification
- **Fallback UI**: Displays authentication required message
- **Seamless Integration**: Wraps protected content components

### Usage Example

```tsx
export const HealthBridge: React.FC = () => {
  return (
    <ProtectedRoute>
      <HealthBridgeContent />
    </ProtectedRoute>
  );
};
```

### HealthBridge Protection

The HealthBridge analysis page is specifically protected:

- **Route**: `/healthbridge-analysis`
- **Content**: Health analysis tools and data
- **Access**: Requires OTP authentication
- **Security**: Enterprise-grade protection via Cloudflare Access

## Authentication State Management

### Hook: `useAuth.ts`

The authentication state is managed through a custom React hook that:

- **Real-time Updates**: Monitors authentication status changes
- **User Information**: Provides current user details
- **Loading States**: Handles authentication verification
- **Automatic Refresh**: Updates state when authentication changes

### State Properties

```tsx
interface AuthState {
  isAuthenticated: boolean;
  user: CloudflareUser | null;
  isLoading: boolean;
}
```

### User Information

```tsx
interface CloudflareUser {
  email: string;
  name?: string;
  picture?: string;
  sub?: string; // Subject identifier
}
```

## Cloudflare Access Integration

### Utility: `cloudflareAuth.ts`

The authentication utilities handle:

- **OTP Flow**: Manages One-Time PIN authentication process
- **Cookie Management**: Handles Cloudflare Access cookies
- **Token Storage**: Manages JWT tokens and user data
- **Route Protection**: Checks if routes require authentication
- **Development Mode**: Provides mock authentication for local development

### Key Functions

- `isAuthenticated()` - Check authentication status
- `getUserInfo()` - Retrieve current user information
- `handleOTPFlow()` - Initiate OTP authentication
- `hasAccess()` - Verify user access permissions
- `logout()` - Clear authentication and redirect

## Security Features

### 1. Email Domain Restriction

- **Allowed Domains**: `rcormier.dev` only
- **Specific Emails**: `roger@rcormier.dev` explicitly allowed
- **Domain Validation**: Automatic domain verification

### 2. Session Management

- **JWT Tokens**: Secure token-based authentication
- **Automatic Expiry**: 24-hour session duration
- **Secure Cookies**: HTTP-only cookies for token storage

### 3. Route Protection

- **Automatic Redirects**: Unauthenticated users redirected to login
- **Content Isolation**: Protected content completely separated from public
- **Access Control**: Granular control over who can access what

## Development vs Production

### Development Mode (localhost)

```tsx
if (isDevelopment()) {
  // Mock authentication for development
  localStorage.setItem('dev_auth', 'true');
  localStorage.setItem('dev_user', JSON.stringify(user));
}
```

**Features:**
- No actual OTP required
- Local storage-based authentication
- Immediate access to protected content
- Debug logging enabled

### Production Mode (rcormier.dev)

```tsx
// Production uses actual Cloudflare Access
window.location.href = '/cdn-cgi/access/login';
```

**Features:**
- Full Cloudflare Access OTP flow
- Enterprise-grade security
- Email-based authentication
- 24-hour session management

## Troubleshooting

### Common Issues

1. **Authentication Loop**
   - Check policy order in Cloudflare Zero Trust
   - Ensure Bypass policies come before Allow policies

2. **OTP Not Received**
   - Verify email domain configuration
   - Check spam/junk folders
   - Ensure iCloud account can receive emails

3. **Access Denied After Authentication**
   - Verify email matches `roger@rcormier.dev`
   - Check Cloudflare Access policies
   - Clear browser cookies and retry

### Debug Tools

```tsx
// Enable debug logging
import { debugAuthState } from '../utils/cloudflareAuth';

// Call in browser console
debugAuthState();
```

## Best Practices

### 1. Security
- Never store sensitive data in localStorage in production
- Always use HTTPS for authentication
- Implement proper session timeout handling

### 2. User Experience
- Provide clear feedback during authentication
- Show loading states during verification
- Gracefully handle authentication errors

### 3. Development
- Use mock authentication for local development
- Test both authenticated and unauthenticated states
- Verify protected route behavior

## Configuration Files

### Cloudflare Zero Trust
- **Application**: Portfolio App
- **Identity Provider**: One-Time PIN
- **Policies**: Public Access (Bypass) + Protected Routes (Allow)

### Environment Variables
- **Domain**: `rcormier.dev`
- **Email**: `roger@rcormier.dev`
- **Session Duration**: 24 hours

## Integration Summary

Your authentication system provides:

✅ **Secure Access**: Enterprise-grade protection for sensitive content  
✅ **Seamless UX**: Smooth authentication flow with clear feedback  
✅ **Flexible Protection**: Granular control over what content is protected  
✅ **Development Friendly**: Mock authentication for local development  
✅ **Production Ready**: Full Cloudflare Access integration for live site  
✅ **HealthBridge Security**: Protected access to health analysis tools  
✅ **User Management**: Automatic user state management and persistence  

The system automatically handles authentication challenges, provides a professional user experience, and ensures your sensitive content (like HealthBridge analysis) remains secure while keeping your portfolio publicly accessible.

## Adding New Protected Routes

To add a new protected route:

1. **Add to navigation config** (`src/config/navigation.ts`):
   ```typescript
   export const protectedProjectItems = [
     // ... existing items
     {
       title: "New Protected Page",
       url: "new-protected-page",
       icon: YourIcon,
       requiresAuth: true,
     },
   ];
   ```

2. **Add route to router** (`src/router.tsx`):
   ```typescript
   const newProtectedRoute = createRoute({
     getParentRoute: () => rootRoute,
     path: 'new-protected-page',
     component: NewProtectedPage,
   });
   ```

3. **Wrap component with ProtectedRoute**:
   ```typescript
   export const NewProtectedPage: React.FC = () => {
     return (
       <ProtectedRoute>
         <div>Your protected content here</div>
       </ProtectedRoute>
     );
   };
   ```

4. **Update Cloudflare Access policies** (if needed):
   - Add the new route to your "Protected Routes" policy in Cloudflare Zero Trust
   - Ensure the route requires authentication

## Testing Your Authentication System

### Development Testing
1. **Start your development server**
2. **Visit any page** - protected routes should be hidden
3. **Click "Login" button** in the header
4. **Click "Access Protected Content"**
5. **Check sidebar** - "Protected Projects" section should appear
6. **Navigate to protected routes** - they should be accessible

### Production Testing
1. **Deploy to rcormier.dev**
2. **Visit protected routes** - should redirect to Cloudflare Access login
3. **Enter your email** (`roger@rcormier.dev`)
4. **Check email for PIN** - should receive 6-digit code
5. **Enter PIN** - should gain access to protected content
6. **Verify session** - should remain authenticated for 24 hours

## Additional Troubleshooting

### **Protected routes not showing after login**
- Check browser console for errors
- Verify `localStorage` contains `dev_auth: "true"` (development)
- Ensure `useAuth` hook is working properly
- Check Cloudflare Access cookies (production)

### **Login button not working**
- Check if `handleOTPFlow` function is being called
- Verify authentication state is being set
- Check for JavaScript errors in console
- Ensure Cloudflare Access is properly configured (production)

### **Routes not accessible**
- Ensure routes are properly configured in the router
- Check that components are wrapped with `ProtectedRoute`
- Verify the route paths match exactly
- Check Cloudflare Access policies (production)

### **Cloudflare Access Issues**
- Verify policy order (Bypass → Allow)
- Check identity provider configuration
- Ensure email domain matches `rcormier.dev`
- Clear browser cookies and retry

## Implementation Summary

Your authentication system provides enterprise-grade security through Cloudflare Access while maintaining a seamless user experience. The system automatically handles the complexity of OTP authentication, route protection, and user state management, allowing you to focus on your portfolio content rather than authentication infrastructure.
