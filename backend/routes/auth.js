const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google OAuth login
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.CLIENT_URL + '/login',
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to dashboard
      res.redirect(process.env.CLIENT_URL + '/dashboard');
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(process.env.CLIENT_URL + '/login?error=auth_failed');
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Check auth status
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.json({ isAuthenticated: false, user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId).select('-googleId');

    if (!user) {
      return res.json({ isAuthenticated: false, user: null });
    }

    res.json({ 
      isAuthenticated: true, 
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar,
        auraPoints: user.auraPoints
      }
    });
  } catch (error) {
    res.json({ isAuthenticated: false, user: null });
  }
});

module.exports = router;
