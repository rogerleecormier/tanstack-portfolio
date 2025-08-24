# Access Control Configuration

This document explains how to manage user access control for the portfolio application's server-side JWT authentication system.

## Quick Configuration

To modify which users can access protected content, you can update the server-side user management in `server/routes/auth.js`:

### **Current Demo Users**
```javascript
// server/routes/auth.js
const users = [
  {
    email: 'dev@rcormier.dev',
    password: 'password', // In production, use hashed passwords
    name: 'Development User',
    role: 'user'
  },
  {
    email: 'rcormier@rcormier.dev',
    password: 'password',
    name: 'Roger Cormier',
    role: 'admin'
  }
];
```

### **Adding New Users**
```javascript
// Add new users to the users array
const users = [
  // ... existing users
  {
    email: 'newuser@example.com',
    password: 'securepassword',
    name: 'New User',
    role: 'user' // or 'admin' for admin access
  }
];
```

## Current Access Rules

- **dev@rcormier.dev** - ✅ Allowed (user role)
- **rcormier@rcormier.dev** - ✅ Allowed (admin role)
- **All other emails** - ❌ Denied (not in user list)

## How It Works

1. **User Registration**: Users must be added to the server-side user list
2. **Authentication**: Login validates credentials against the user list
3. **Role Assignment**: Users get specific roles (user/admin) with different permissions
4. **Access Control**: Protected routes check authentication and role requirements

## Important Notes

- **Users are managed server-side** - no client-side access control
- **Passwords should be hashed** in production environments
- **Role-based access** provides different permission levels
- **Changes require server restart** - update the users array and restart
- **The config file is version controlled** - changes will be tracked in git

## Example Scenarios

### Add a new user
```javascript
// In server/routes/auth.js
const users = [
  // ... existing users
  {
    email: 'newuser@gmail.com',
    password: 'securepassword',
    name: 'New User',
    role: 'user'
  }
];
```

### Change user role
```javascript
// Change from user to admin
{
  email: 'dev@rcormier.dev',
  password: 'password',
  name: 'Development User',
  role: 'admin'  // Changed from 'user' to 'admin'
}
```

### Remove user access
```javascript
// Comment out or remove the user object
const users = [
  // {
  //   email: 'olduser@example.com',
  //   password: 'password',
  //   name: 'Old User',
  //   role: 'user'
  // },
  // ... other users
];
```

## File Location

- **Configuration**: `server/routes/auth.js`
- **Documentation**: `ACCESS_CONTROL.md` (this file)
- **Implementation**: `server/middleware/auth.js`

## Production Considerations

### **Database Integration**
For production, consider replacing the static user array with a database:

```javascript
// Example with database
const getUser = async (email) => {
  return await db.users.findOne({ email });
};

const validateUser = async (email, password) => {
  const user = await getUser(email);
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    return user;
  }
  return null;
};
```

### **Password Security**
- Use bcrypt or similar for password hashing
- Implement password complexity requirements
- Add password reset functionality
- Use environment variables for sensitive data

### **User Management**
- Add user registration endpoints
- Implement email verification
- Add password reset flows
- Create admin user management interface

## Security Best Practices

1. **Never store plain text passwords**
2. **Use environment variables for secrets**
3. **Implement rate limiting on auth endpoints**
4. **Add logging for authentication attempts**
5. **Use HTTPS in production**
6. **Regular security audits**

---

**Note**: This system is designed for development and small-scale production use. For larger applications, consider implementing a full user management system with database storage and additional security measures.
