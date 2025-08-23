# Authentication System Overview

This portfolio application uses a dual-mode authentication system that automatically switches between development and production modes based on the environment.

## How It Works

### Development Mode
- **Triggered when**: Running on `localhost`, `127.0.0.1`, or any local network IP (e.g., `192.168.x.x`, `10.0.x.x`)
- **Authentication**: Mock/simulated authentication using localStorage
- **Benefits**: 
  - No external dependencies
  - Instant login/logout for testing
  - Works offline
  - Easy to toggle authentication state

### Production Mode
- **Triggered when**: Running on production domains (e.g., `rcormier.dev`)
- **Authentication**: Real Cloudflare Access authentication
- **Benefits**:
  - Secure enterprise-grade authentication
  - SSO integration
  - Audit logging
  - Multi-factor authentication support

## Components

### Core Authentication Hook (`useAuth`)
```tsx
import { useAuth } from '../hooks/useAuth';

const { 
  user, 
  isAuthenticated, 
  isLoading, 
  login, 
  logout, 
  isDevelopment, 
  isProduction 
} = useAuth();
```

### Protected Route Wrapper
```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

### Development Authentication Toggle
```tsx
import { DevAuthToggle } from '../components/DevAuthToggle';

// Only appears in development mode
<DevAuthToggle />
```

### Authentication Status Indicator
```tsx
import { AuthStatus } from '../components/AuthStatus';

// Shows current auth state and environment
<AuthStatus />
```

## Usage Examples

### Protecting a Route
```tsx
// In your router or component
<ProtectedRoute>
  <HealthBridge />
</ProtectedRoute>
```

### Conditional Rendering Based on Auth
```tsx
const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  return <div>Welcome, {user?.name}!</div>;
} else {
  return <div>Please log in</div>;
}
```

### Environment-Aware Actions
```tsx
const { isDevelopment, login } = useAuth();

const handleLogin = () => {
  if (isDevelopment) {
    // Simulate login
    login();
  } else {
    // Redirect to Cloudflare Access
    login();
  }
};
```

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access Protected Routes**
   - Navigate to `/protected` or `/healthbridge-analysis`
   - You'll see the "Development Authentication" toggle

3. **Simulate Authentication**
   - Click "Simulate Login" to authenticate
   - Click "Simulate Logout" to de-authenticate
   - Authentication state persists across page refreshes

4. **Test Protected Content**
   - Once authenticated, you can access all protected routes
   - The `AuthStatus` component shows your current state

## Production Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   - The app automatically detects production environment
   - Authentication switches to Cloudflare Access
   - No code changes needed

3. **Configure Cloudflare Access**
   - Set up authentication policies in Cloudflare dashboard
   - Configure allowed users/domains
   - Set up SSO if needed

## Environment Detection

The system automatically detects the environment using:

```tsx
// Development triggers
- import.meta.env.DEV (Vite environment variable)
- localhost
- 127.0.0.1
- 192.168.x.x (local network)
- 10.0.x.x (local network)

// Production triggers
- import.meta.env.PROD (Vite environment variable)
- Any other domain
```

## Security Considerations

### Development Mode
- **Mock authentication is NOT secure**
- **Only use for development/testing**
- **Never deploy with mock auth enabled**

### Production Mode
- **Full Cloudflare Access security**
- **JWT token validation**
- **Secure cookie handling**
- **Enterprise-grade protection**

## Troubleshooting

### Development Issues
- **Authentication not working**: Check if you're on localhost/127.0.0.1
- **State not persisting**: Check localStorage in browser dev tools
- **Toggle not appearing**: Verify `isDevelopment()` returns true

### Production Issues
- **Cloudflare Access not working**: Check domain configuration
- **Cookies not set**: Verify Cloudflare Access is properly configured
- **Redirect loops**: Check authentication policies in Cloudflare dashboard

## Customization

### Adding New Protected Routes
```tsx
// In your router
<Route path="/new-protected-route" element={
  <ProtectedRoute>
    <NewProtectedComponent />
  </ProtectedRoute>
} />
```

### Custom Authentication Logic
```tsx
// Extend the useAuth hook
const { isAuthenticated, user } = useAuth();

// Add your custom logic
const hasSpecialAccess = user?.email === 'admin@rcormier.dev';
```

### Environment-Specific Features
```tsx
const { isDevelopment } = useAuth();

if (isDevelopment) {
  // Development-only features
  console.log('Debug mode enabled');
}
```

## Best Practices

1. **Always wrap protected content** with `<ProtectedRoute>`
2. **Use the `useAuth` hook** for authentication state
3. **Test both environments** before deploying
4. **Keep development auth simple** - it's just for testing
5. **Use environment detection** for conditional features
6. **Handle loading states** properly in your components

## Migration from Old System

If you're upgrading from the previous authentication system:

1. **Replace old imports** with new `useAuth` hook
2. **Update component props** to use new auth properties
3. **Remove old Cloudflare auth utilities** (they're now integrated)
4. **Test both development and production modes**

The new system is backward-compatible and should work as a drop-in replacement for most use cases.
