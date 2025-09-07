import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Load environment variables for different deployment environments
 * - Local development: Load from .env.development
 * - Render production: Load from /etc/secrets/ files
 * - Other production: Use process.env directly
 */
export function loadEnvironmentVariables() {
  // Try Render's secret file first
  const renderSecretsPath = '/etc/secrets/.env.production';
  
  if (fs.existsSync(renderSecretsPath)) {
    // On Render - load from /etc/secrets/.env.production
    console.log('🔐 Loading secrets from /etc/secrets/.env.production');
    dotenv.config({ path: renderSecretsPath });
  } else if (process.env.NODE_ENV !== 'production') {
    // Local development - load from .env.development
    const env = process.env.NODE_ENV || 'development';
    dotenv.config({ path: `.env.${env}` });
    console.log('🔧 Loaded environment from .env.development');
  } else {
    // Other production environments - use process.env directly
    console.log('🌐 Using environment variables directly');
  }
  
  // Debug loaded variables (without showing actual values)
  console.log('🔍 Environment variables status:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
}