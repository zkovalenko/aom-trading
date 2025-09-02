import express from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Traditional email/password registration and login
router.post('/register', register);
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

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
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const user = req.user as any;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Check for subscription redirect parameters from session
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let redirectUrl = `${frontendUrl}/auth/callback?token=${token}&redirect=/services`;
    
    if ((req.session as any).subscriptionRedirect) {
      const { redirect, product, type } = (req.session as any).subscriptionRedirect;
      console.log('Google OAuth callback - using stored params:', { redirect, product, type });
      redirectUrl = `${frontendUrl}/auth/callback?token=${token}&redirect=/services&subscriptionRedirect=${redirect}&product=${product}&type=${type}`;
      console.log('Google OAuth callback - redirect URL:', redirectUrl);
      // Clear the session data
      delete (req.session as any).subscriptionRedirect;
    }
    
    res.redirect(redirectUrl);
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