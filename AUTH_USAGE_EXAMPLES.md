# 🔐 Controlled Authentication Usage Examples

## 🎯 **No More Automatic Redirects!**

Your authentication system now gives you **full control** over when to show login forms and protected content. No more automatic refreshing or redirects!

## 📱 **Basic Usage - No Authentication Required**

```tsx
import React from 'react';
import { ControlledAuthWrapper } from './components/ControlledAuthWrapper';

export const MyPage = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <ControlledAuthWrapper showLogin={showLogin} onToggleLogin={() => setShowLogin(!showLogin)}>
      <div>
        <h1>My Content</h1>
        <p>This content is visible to everyone!</p>
        
        {/* Optional: Show login button */}
        <button onClick={() => setShowLogin(true)}>
          Sign In (Optional)
        </button>
      </div>
    </ControlledAuthWrapper>
  );
};
```

## 🔒 **Conditional Content Based on Auth Status**

```tsx
import React, { useState } from 'react';
import { ControlledAuthWrapper } from './components/ControlledAuthWrapper';
import { useServerAuth } from './hooks/useServerAuth';

export const SmartPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user } = useServerAuth();

  return (
    <ControlledAuthWrapper showLogin={showLogin} onToggleLogin={() => setShowLogin(!showLogin)}>
      <div>
        <h1>Smart Content Page</h1>
        
        {/* Content for everyone */}
        <div className="public-content">
          <h2>Public Information</h2>
          <p>Anyone can see this content.</p>
        </div>

        {/* Content only for authenticated users */}
        {isAuthenticated && (
          <div className="private-content">
            <h2>Welcome, {user?.name}!</h2>
            <p>This content is only visible to authenticated users.</p>
            <p>Your role: {user?.role}</p>
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!isAuthenticated && (
          <div className="login-prompt">
            <p>Want to see more? Sign in for additional features!</p>
            <button onClick={() => setShowLogin(true)}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </ControlledAuthWrapper>
  );
};
```

## 🎮 **Manual Login Control**

```tsx
import React, { useState } from 'react';
import { ControlledAuthWrapper } from './components/ControlledAuthWrapper';
import { useServerAuth } from './hooks/useServerAuth';

export const ManualAuthPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user, logout } = useServerAuth();

  return (
    <ControlledAuthWrapper showLogin={showLogin} onToggleLogin={() => setShowLogin(!showLogin)}>
      <div>
        <h1>Manual Authentication Control</h1>
        
        {/* Always visible content */}
        <div className="always-visible">
          <p>This content is always visible regardless of login status.</p>
        </div>

        {/* Authentication controls */}
        <div className="auth-controls">
          {isAuthenticated ? (
            <div>
              <p>Logged in as: {user?.name}</p>
              <button onClick={logout}>Logout</button>
              <button onClick={() => setShowLogin(true)}>Switch Account</button>
            </div>
          ) : (
            <div>
              <p>Not logged in</p>
              <button onClick={() => setShowLogin(true)}>Login</button>
            </div>
          )}
        </div>

        {/* Conditional content */}
        {isAuthenticated && (
          <div className="authenticated-content">
            <h2>Private Dashboard</h2>
            <p>This is your personal dashboard.</p>
          </div>
        )}
      </div>
    </ControlledAuthWrapper>
  );
};
```

## 🚫 **What's Different Now**

### ❌ **Before (Automatic Redirects)**
- Page automatically checked for authentication
- Automatically redirected to login if not authenticated
- Couldn't view content without logging in
- Constant refreshing and redirects

### ✅ **Now (Controlled)**
- **No automatic redirects** - you control when to show login
- **Content always visible** - users can see your page without logging in
- **Optional authentication** - login is a choice, not a requirement
- **Manual control** - you decide when to show login forms

## 🔧 **Key Components**

### `ControlledAuthWrapper`
- Wraps your content
- Shows authentication status in header
- Provides login/logout controls
- **Never automatically redirects**

### `useServerAuth` Hook
- Provides authentication state
- Gives you `isAuthenticated`, `user`, `login`, `logout`
- **No automatic behavior** - just state management

## 🎨 **Customization Options**

```tsx
// Show login by default
<ControlledAuthWrapper showLogin={true}>

// Hide authentication controls completely
<ControlledAuthWrapper showLogin={false} onToggleLogin={undefined}>

// Custom toggle behavior
<ControlledAuthWrapper 
  showLogin={showLogin} 
  onToggleLogin={() => {
    setShowLogin(!showLogin);
    // Add your custom logic here
    console.log('Login toggled!');
  }}
>
```

## 🚀 **Benefits**

1. **No more refreshing** - content loads once and stays
2. **Better UX** - users can browse before deciding to login
3. **Flexible** - you control the authentication flow
4. **Professional** - clean, modern authentication experience
5. **Accessible** - content available to everyone

## 💡 **Pro Tips**

- Use `showLogin={false}` by default for public pages
- Only show login when user explicitly requests it
- Display different content based on `isAuthenticated` status
- Use the authentication header for user info and controls
- Keep login optional for better user experience

---

**Remember**: Your pages now load normally without any authentication checks or redirects. Users can view content freely and choose to login when they want to! 🎉
