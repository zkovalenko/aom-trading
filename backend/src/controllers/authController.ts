import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  google_id?: string;
  created_at: Date;
  updated_at: Date;
}

const generateToken = (user: User): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
      return;
    }

    // Check if user already exists
    const existingUserResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUserResult.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUserResult = await pool.query(
      'INSERT INTO users (email, first_name, last_name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, email, first_name, last_name, created_at, updated_at',
      [email.toLowerCase(), firstName, lastName, passwordHash]
    );

    const newUser = newUserResult.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, password, google_id, created_at, updated_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const foundUser = userResult.rows[0];

    // Check if user has a password (not just Google OAuth)
    if (!foundUser.password) {
      res.status(401).json({
        success: false,
        message: 'Please login with Google'
      });
      return;
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, foundUser.password);
    
    if (!passwordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const token = generateToken(foundUser);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: foundUser.id,
          email: foundUser.email,
          first_name: foundUser.first_name,
          last_name: foundUser.last_name,
          created_at: foundUser.created_at,
          updated_at: foundUser.updated_at
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    // Get updated user data from database
    const currentUser = req.user as any; // Type assertion for Express User
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, google_id, created_at, updated_at, methodology_disclaimer_viewed, methodology_disclaimer_viewed_date FROM users WHERE id = $1',
      [currentUser.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userRecord = userResult.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: userRecord.id,
          email: userRecord.email,
          first_name: userRecord.first_name,
          last_name: userRecord.last_name,
          google_id: userRecord.google_id,
          created_at: userRecord.created_at,
          updated_at: userRecord.updated_at,
          methodology_disclaimer_viewed: userRecord.methodology_disclaimer_viewed,
          methodology_disclaimer_viewed_date: userRecord.methodology_disclaimer_viewed_date
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

export const updateMethodologyDisclaimer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const currentUser = req.user as any;
    
    // Update methodology disclaimer viewed status
    await pool.query(
      'UPDATE users SET methodology_disclaimer_viewed = TRUE, methodology_disclaimer_viewed_date = CURRENT_TIMESTAMP WHERE id = $1',
      [currentUser.id]
    );

    res.json({
      success: true,
      message: 'Methodology disclaimer status updated successfully'
    });
  } catch (error) {
    console.error('Update methodology disclaimer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update methodology disclaimer status'
    });
  }
};