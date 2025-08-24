# 🚀 Quick Start Guide

## What's New

You now have a **complete server-side JWT authentication system** that provides secure, stateless authentication with role-based access control.

## 🎯 Key Benefits

- ✅ **JWT-based authentication** - Secure and stateless
- ✅ **Role-based access control** - Admin and user roles
- ✅ **Automatic token refresh** - Seamless user experience
- ✅ **Server-side validation** - More secure and reliable
- ✅ **Clean, modern UI** - Professional login experience
- ✅ **Development mode** - Mock authentication for testing

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy the example file
cp server.env.example .env

# Edit with your values
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Start the Servers
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend on port 5173
npm run dev:backend   # Backend on port 3001
```

## 🔐 Demo Credentials

Use these credentials to test the system:

```
Email: dev@rcormier.dev
Password: password
Role: user

Email: rcormier@rcormier.dev
Password: password
Role: admin
```

## 🧪 Test the Authentication

1. **Start the backend server** (`npm run dev:backend`)
2. **Start the frontend** (`npm run dev:frontend`)
3. **Check the frontend** - Visit `http://localhost:5173`
4. **Try the demo page** - Navigate to the ServerProtectedDemo page
5. **Test login** - Use the demo credentials above

## 📱 Frontend Usage

### Protected Routes
```tsx
import { ServerProtectedRoute } from './components/ServerProtectedRoute';

export const MyPage = () => (
  <ServerProtectedRoute>
    <div>This content is protected!</div>
  </ServerProtectedRoute>
);
```

### Authentication Hook
```tsx
import { useServerAuth } from './hooks/useServerAuth';

export const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useServerAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.name}!</div>;
};
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### API Endpoints
- **Login**: `POST /api/auth/login`
- **Verify**: `POST /api/auth/verify`
- **Profile**: `GET /api/auth/me`
- **Logout**: `POST /api/auth/logout`
- **Protected**: `GET /api/protected/*`

## 🚨 Troubleshooting

### Backend won't start?
- Check if port 3001 is available
- Verify all dependencies are installed
- Check your `.env` file

### Authentication not working?
- Ensure backend is running on port 3001
- Check CORS configuration
- Verify JWT secret is set

### Frontend can't connect?
- Check API_BASE_URL in useServerAuth hook
- Verify backend is accessible
- Check network tab for errors

## 📚 Next Steps

1. **Test the system** with the demo credentials
2. **Explore the components** in `src/components/`
3. **Check the demo page** at `src/pages/ServerProtectedDemo.tsx`
4. **Read the full documentation** in `DEVELOPMENT.md`
5. **Customize for your needs** - add more users, roles, or endpoints

## 🎉 You're All Set!

Your new server-side JWT authentication system is ready to use. Secure, reliable, and easy to develop with!

---

**Need help?** Check the full documentation in `DEVELOPMENT.md` or review the authentication examples in `AUTH_USAGE_EXAMPLES.md`.
