import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { loadEnvironmentVariables } from '../config/env';

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
  console.log('🎫 generateToken called for user:', { id: user.id, email: user.email });
  
  // Ensure environment variables are loaded
  console.log('🔄 Loading environment variables...');
  loadEnvironmentVariables();
  
  console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('🔍 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not configured');
    throw new Error('JWT_SECRET is not configured');
  }

  const payload = {
    userId: user.id,
    email: user.email
  };
  
  console.log('📦 JWT payload:', payload);
  
  try {
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log('🔍 Token length:', token.length);
    console.log('🔍 Token preview:', token.substring(0, 50) + '...');
    
    return token;
  } catch (error) {
    console.error('❌ JWT signing failed:', error);
    throw error;
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📝 Register request received:', { 
      hasEmail: !!req.body.email, 
      hasPassword: !!req.body.password, 
      hasFirstName: !!req.body.firstName,
      hasLastName: !!req.body.lastName 
    });
    
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      console.log('❌ Missing required fields for registration');
      res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
      return;
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists:', email.toLowerCase());
    const existingUserResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUserResult.rows.length > 0) {
      console.log('❌ User already exists:', email.toLowerCase());
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Create user
    console.log('👤 Creating new user in database...');
    const newUserResult = await pool.query(
      'INSERT INTO users (email, first_name, last_name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, email, first_name, last_name, created_at, updated_at',
      [email.toLowerCase(), firstName, lastName, passwordHash]
    );

    const newUser = newUserResult.rows[0];
    console.log('✅ User created successfully:', { id: newUser.id, email: newUser.email });
    
    console.log('🎫 Generating JWT token...');
    const token = generateToken(newUser);
    console.log('✅ JWT token generated successfully');

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
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 Login request received:', { 
      hasEmail: !!req.body.email, 
      hasPassword: !!req.body.password 
    });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password for login');
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Get user from database
    console.log('🔍 Looking up user:', email.toLowerCase());
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, password, google_id, created_at, updated_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found:', email.toLowerCase());
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const foundUser = userResult.rows[0];
    console.log('✅ User found:', { id: foundUser.id, email: foundUser.email, hasPassword: !!foundUser.password });

    // Check if user has a password (not just Google OAuth)
    if (!foundUser.password) {
      console.log('❌ User has no password (Google OAuth only)');
      res.status(401).json({
        success: false,
        message: 'Please login with Google'
      });
      return;
    }

    // Verify password
    console.log('🔒 Verifying password...');
    const passwordValid = await bcrypt.compare(password, foundUser.password);
    
    if (!passwordValid) {
      console.log('❌ Invalid password for user:', email.toLowerCase());
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    console.log('✅ Password verified, generating token...');
    const token = generateToken(foundUser);
    console.log('✅ Login successful for user:', email.toLowerCase());

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