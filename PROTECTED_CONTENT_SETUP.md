# Protected Content Setup

This document explains how the simplified protected content system works in your TanStack Portfolio.

## Overview

Instead of using Cloudflare Access, this system uses **client-side authentication** to control access to specific protected pages. This approach is simpler and doesn't require any external service configuration.

## How It Works

### 1. **Public Pages (Always Accessible)**
- `/` - About page
- `/strategy` - Strategy content
- `/leadership` - Leadership content
- `/devops` - DevOps content
- `/saas` - SaaS content
- `/talent` - Talent content
- `/analytics` - Analytics content
- `/project-analysis` - Project analysis

### 2. **Protected Pages (Require Authentication)**
- `/protected` - General protected content
- `/healthbridge-analysis` - HealthBridge analysis tools

### 3. **Navigation Behavior**
- **Before Login**: Protected pages are hidden from the sidebar navigation
- **After Login**: Protected pages appear in a "Protected Projects" section in the sidebar
- **Authentication**: Simple client-side authentication using localStorage

## Authentication Flow

1. **User clicks "Login" button** in the header
2. **Login modal appears** with authentication options
3. **User clicks "Access Protected Content"**
4. **Authentication happens** (currently simulated)
5. **User is redirected** to `/protected` page
6. **Protected pages appear** in the navigation menu
7. **User can access** both `/protected` and `/healthbridge-analysis`

## Technical Implementation

### **Authentication State**
- Stored in `localStorage` with keys:
  - `dev_auth`: Set to `"true"` when authenticated
  - `dev_user`: Contains user information

### **Route Protection**
- `useAuth` hook manages authentication state
- `ProtectedRoute` component wraps protected pages
- `isRouteProtected()` function checks if a route requires auth

### **Navigation Control**
- `AppSidebar` conditionally shows protected routes
- `protectedProjectItems` array contains protected navigation items
- Only visible when `isAuthenticated` is true

## Benefits of This Approach

1. **No External Dependencies**: Works without Cloudflare Access or other services
2. **Simple Setup**: No complex policy configuration needed
3. **Immediate Testing**: Works in both development and production
4. **Easy Customization**: Simple to add/remove protected routes
5. **User Experience**: Protected content appears seamlessly after login

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

## Security Considerations

- **Client-side only**: Authentication state is stored in localStorage
- **No server validation**: Routes are protected at the UI level only
- **Development use**: Suitable for portfolio sites and demo applications
- **Production use**: Consider adding server-side validation for sensitive content

## Testing

1. **Start your development server**
2. **Visit any page** - protected routes should be hidden
3. **Click "Login" button** in the header
4. **Click "Access Protected Content"**
5. **Check sidebar** - "Protected Projects" section should appear
6. **Navigate to protected routes** - they should be accessible

## Troubleshooting

### **Protected routes not showing after login**
- Check browser console for errors
- Verify `localStorage` contains `dev_auth: "true"`
- Ensure `useAuth` hook is working properly

### **Login button not working**
- Check if `handleOTPFlow` function is being called
- Verify authentication state is being set in localStorage
- Check for JavaScript errors in console

### **Routes not accessible**
- Ensure routes are properly configured in the router
- Check that components are wrapped with `ProtectedRoute`
- Verify the route paths match exactly

This system provides a clean, simple way to protect specific content while keeping the rest of your portfolio publicly accessible.
