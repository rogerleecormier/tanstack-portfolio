# Server-Side Authentication System

This project now includes a complete server-side authentication system that replaces the cookie-based Cloudflare Access approach with JWT-based authentication.

## 🚀 Features

- **JWT-based authentication** - Secure, stateless authentication
- **Express.js backend** - Full-featured Node.js server
- **No more cookie dependencies** - Eliminates refresh issues and console logs
- **Automatic token refresh** - Seamless user experience
- **Role-based access control** - Admin and user roles
- **Secure endpoints** - Protected routes with middleware
- **Development and production ready** - Environment-based configuration

## 📁 Project Structure

```
├── server/                    # Backend server code
│   ├── index.js              # Main Express server
│   ├── middleware/           # Authentication middleware
│   │   └── auth.js          # JWT verification and generation
│   └── routes/               # API routes
│       ├── auth.js           # Authentication endpoints
│       └── protected.js      # Protected route examples
├── src/
│   ├── hooks/
│   │   └── useServerAuth.ts  # New authentication hook
│   ├── components/
│   │   ├── ServerLoginPage.tsx      # Login form
│   │   └── ServerProtectedRoute.tsx # Route protection
│   └── pages/
│       └── ServerProtectedDemo.tsx  # Demo protected page
└── server.env.example        # Environment configuration
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp server.env.example .env

# Edit with your values
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend  # Frontend on port 5173
npm run dev:backend   # Backend on port 3001
```

## 🔐 Authentication Flow

### Login Process
1. User enters email/password
2. Frontend sends credentials to `/api/auth/login`
3. Server validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. Token is automatically included in subsequent requests

### Protected Routes
1. Component wrapped with `<ServerProtectedRoute>`
2. Hook checks token validity with server
3. If valid, renders protected content
4. If invalid, redirects to login page

### Token Management
- **Storage**: JWT tokens stored in localStorage
- **Expiration**: 24 hours (configurable)
- **Refresh**: Automatic refresh every 23 hours
- **Security**: Tokens verified with server on each check

## 🧪 Demo Credentials

For testing purposes, the system includes demo users:

```
Email: dev@rcormier.dev
Password: password
Role: user

Email: rcormier@rcormier.dev  
Password: password
Role: admin
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Protected Routes
- `GET /api/protected/test` - Test protected endpoint
- `GET /api/protected/profile` - User profile
- `PUT /api/protected/profile` - Update profile
- `GET /api/protected/admin` - Admin-only endpoint

## 🔧 Usage Examples

### Basic Protected Route

```tsx
import { ServerProtectedRoute } from './components/ServerProtectedRoute';

export const MyProtectedPage = () => (
  <ServerProtectedRoute>
    <div>This content is only visible to authenticated users</div>
  </ServerProtectedRoute>
);
```

### Using Authentication Hook

```tsx
import { useServerAuth } from './hooks/useServerAuth';

export const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useServerAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Custom Login Form

```tsx
import { useServerAuth } from './hooks/useServerAuth';

export const CustomLogin = () => {
  const { login, error, isLoading } = useServerAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // Redirect or update UI
    }
  };
  
  // ... form JSX
};
```

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
JWT_SECRET=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com
```

### Build Commands
```bash
# Build backend
npm run build:backend

# Build frontend
npm run build

# Start production server
npm start
```

### Security Considerations
- Change default JWT secret
- Use HTTPS in production
- Implement rate limiting (already included)
- Add database for user storage
- Consider refresh token rotation

## 🔄 Migration from Old System

### What's Replaced
- ❌ Cookie-based authentication
- ❌ Cloudflare Access dependencies
- ❌ Console logging for debugging
- ❌ Manual refresh requirements

### What's New
- ✅ JWT token authentication
- ✅ Server-side validation
- ✅ Automatic token refresh
- ✅ Clean, modern UI components
- ✅ Better error handling
- ✅ Role-based access control

### Migration Steps
1. Replace `useAuth` with `useServerAuth` in components
2. Wrap protected content with `<ServerProtectedRoute>`
3. Update login/logout flows to use new endpoints
4. Remove old cookie-based authentication code

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 3001 is available
- Verify all dependencies are installed
- Check environment file configuration

**Authentication not working:**
- Ensure backend is running on port 3001
- Check CORS configuration
- Verify JWT secret is set

**Frontend can't connect:**
- Check API_BASE_URL in useServerAuth hook
- Verify backend is accessible
- Check network tab for errors

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT token debugging
- [Express.js](https://expressjs.com/) - Backend framework
- [React Hooks](https://react.dev/reference/react/hooks) - Frontend state management

## 🤝 Contributing

When making changes to the authentication system:
1. Test both development and production modes
2. Verify token expiration handling
3. Test protected route access
4. Ensure error handling is comprehensive
5. Update this README if needed

---

**Note**: This system is designed to be production-ready but includes demo users for development. Remember to implement proper user management and database storage for production use.
