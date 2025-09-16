import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export type AuthenticatedRequest = Request & { 
  apiKey?: { 
    id: string; 
    key_name: string; 
    api_key: string 
  } 
};

/**
 * Middleware to authenticate API key requests
 */
export const authenticateApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        valid: false,
        message: 'API key required'
      });
      return;
    }

    // Check if API key exists and is active
    const result = await pool.query(
      'SELECT id, key_name, api_key FROM api_keys WHERE api_key = $1 AND is_active = true',
      [apiKey]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        valid: false,
        message: 'Invalid API key'
      });
      return;
    }

    // Attach API key info to request
    req.apiKey = result.rows[0];
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      valid: false,
      message: 'Internal server error'
    });
  }
};

export default authenticateApiKey;