import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// In-memory user storage (replace with database in production)
const users = [
  {
    id: '1',
    email: 'rcormier@rcormier.dev',
    name: 'RCormier',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'admin'
  },
  {
    id: '2',
    email: 'dev@rcormier.dev',
    name: 'Development User',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'user'
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user info (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'LOGIN_ERROR'
    });
  }
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Find user by ID
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Token is valid',
      user: userWithoutPassword,
      token: token, // Return the same token if still valid
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'VERIFY_ERROR'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Find user by ID
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new token
    const newToken = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Token refreshed successfully',
      user: userWithoutPassword,
      token: newToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'REFRESH_ERROR'
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ 
    message: 'Logout successful. Please remove the token from client storage.',
    code: 'LOGOUT_SUCCESS'
  });
});

// Get current user endpoint
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'GET_USER_ERROR'
    });
  }
});

export { router as authRouter };
