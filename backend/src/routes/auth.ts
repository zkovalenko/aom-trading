import express from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import { register, login, getProfile, updateMethodologyDisclaimer } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { loadEnvironmentVariables } from '../config/env';

const router = express.Router();

// Traditional email/password registration and login
router.post('/register', register);
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

// Update methodology disclaimer status (protected route)
router.post('/methodology-disclaimer', authenticateToken, updateMethodologyDisclaimer);

// Google OAuth routes
router.get('/google', 
  (req, res, next) => {
    // Store subscription redirect parameters in session
    const { redirect, product, type } = req.query;
    console.log('Google OAuth - received params:', { redirect, product, type });
    if ((redirect === 'subscribe' || redirect === 'subscribe-direct') && product && type) {
      (req.session as any).subscriptionRedirect = {
        redirect,
        product,
        type
      };
      console.log('Google OAuth - stored in session:', (req.session as any).subscriptionRedirect);
    }
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback', 
  (req, res, next) => {
    console.log('🔍 Google OAuth callback received:', req.url);
    next();
  },
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: '/login',
      failureFlash: false 
    })(req, res, (err) => {
      if (err) {
        console.error('❌ Passport authentication error:', err);
        return res.status(500).json({ success: false, message: 'OAuth authentication failed', error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    console.log('🔄 Passport authentication passed, entering callback handler');
    try {
      console.log('🔄 Google OAuth callback started');
      
      // Check if user exists
      if (!req.user) {
        console.error('❌ No user found in callback');
        return res.status(500).json({ success: false, message: 'Authentication failed - no user' });
      }
      
      const user = req.user as any;
      console.log('✅ User authenticated:', { id: user.id, email: user.email });
      console.log('🔍 Full user object:', user);
      
      // Ensure environment variables are loaded
      loadEnvironmentVariables();
      
      // Check JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET not found in environment');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
      }
      
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('🎫 JWT token generated successfully');
      
      // Check for subscription redirect parameters from session
      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' ? 'https://aom-trading.onrender.com' : 'http://localhost:3001');
      let redirectUrl = `${frontendUrl}/auth/callback?token=${token}&redirect=/learn-to-trade`;
      
      if ((req.session as any).subscriptionRedirect) {
        const { redirect, product, type } = (req.session as any).subscriptionRedirect;
        console.log('Google OAuth callback - using stored params:', { redirect, product, type });
        redirectUrl = `${frontendUrl}/auth/callback?token=${token}&redirect=/learn-to-trade&subscriptionRedirect=${redirect}&product=${product}&type=${type}`;
        console.log('Google OAuth callback - redirect URL:', redirectUrl);
        // Clear the session data
        delete (req.session as any).subscriptionRedirect;
      }
      
      console.log('🔗 Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
      return;
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        res.status(500).json({
          success: false,
          message: 'Session cleanup failed'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.user) {
    const user = req.user as any; // Type assertion for Express User
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        google_id: user.google_id
      }
    });
  } else {
    res.json({
      success: true,
      authenticated: false
    });
  }
});

export default router;