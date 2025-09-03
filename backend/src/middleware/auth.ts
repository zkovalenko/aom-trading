import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for JWT token in Authorization header FIRST (prioritize JWT over session)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token && process.env.JWT_SECRET) {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

        // Get user from database
        const userResult = await pool.query(
          'SELECT id, email, first_name, last_name, google_id, created_at, updated_at FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (userResult.rows.length > 0) {
          // JWT token is valid, use JWT user data (override any session data)
          req.user = userResult.rows[0];
          return next();
        }
      } catch (jwtError) {
        // JWT token is invalid, fall through to check session or return error
        console.log('JWT verification failed, checking session authentication');
      }
    }

    // Fallback: Check if user is authenticated via session (Google OAuth)
    if (req.user) {
      return next();
    }

    // No valid authentication found
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    // JWT token provided but invalid
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: 'JWT secret not configured'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
    return;
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for JWT token in Authorization header FIRST (prioritize JWT over session)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token && process.env.JWT_SECRET) {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

        // Get user from database
        const userResult = await pool.query(
          'SELECT id, email, first_name, last_name, google_id, created_at, updated_at FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (userResult.rows.length > 0) {
          // JWT token is valid, use JWT user data (override any session data)
          req.user = userResult.rows[0];
          return next();
        }
      } catch (jwtError) {
        // JWT token is invalid, fall through to check session
        console.log('Optional JWT verification failed, checking session authentication');
      }
    }

    // Fallback: Check if user is authenticated via session (Google OAuth)
    if (req.user) {
      return next();
    }

    // No authentication found, continue without authentication
    next();
  } catch (error) {
    // Log error but continue without authentication
    console.error('Optional authentication error:', error);
    next();
  }
};