import express from 'express';

const router = express.Router();

// Test protected endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Get user profile
router.get('/profile', (req, res) => {
  res.json({
    message: 'Profile accessed successfully',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Update user profile (example)
router.put('/profile', (req, res) => {
  const { name, email } = req.body;
  
  if (!name && !email) {
    return res.status(400).json({
      error: 'At least one field (name or email) is required',
      code: 'MISSING_FIELDS'
    });
  }

  // In a real app, you'd update the database
  // For now, just return success
  res.json({
    message: 'Profile updated successfully',
    updatedFields: { name, email },
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Admin-only endpoint
router.get('/admin', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Admin role required.',
      code: 'ADMIN_REQUIRED'
    });
  }

  res.json({
    message: 'Admin access granted',
    user: req.user,
    adminData: {
      totalUsers: 2,
      systemStatus: 'healthy',
      lastBackup: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

export { router as protectedRouter };
