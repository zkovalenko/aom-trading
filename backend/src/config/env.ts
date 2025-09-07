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
  console.log('🔄 loadEnvironmentVariables() called');
  console.log('🔍 Current NODE_ENV:', process.env.NODE_ENV);
  
  // Try Render's secret file first
  const renderSecretsPath = '/etc/secrets/.env.production';
  
  console.log('🔍 Checking for Render secrets file:', renderSecretsPath);
  if (fs.existsSync(renderSecretsPath)) {
    // On Render - load from /etc/secrets/.env.production
    console.log('🔐 Loading secrets from /etc/secrets/.env.production');
    const result = dotenv.config({ path: renderSecretsPath });
    if (result.error) {
      console.error('❌ Error loading .env.production:', result.error);
    } else {
      console.log('✅ Successfully loaded from .env.production');
    }
  } else if (process.env.NODE_ENV !== 'production') {
    // Local development - load from .env.development
    const env = process.env.NODE_ENV || 'development';
    const envPath = `.env.${env}`;
    console.log('🔧 Loading development environment from:', envPath);
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.error('❌ Error loading development env:', result.error);
    } else {
      console.log('✅ Successfully loaded from', envPath);
    }
  } else {
    // Other production environments - use process.env directly
    console.log('🌐 Using environment variables directly (no .env file)');
  }
  
  // Debug loaded variables (without showing actual values)
  console.log('🔍 Environment variables status after loading:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
}