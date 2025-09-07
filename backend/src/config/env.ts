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
  if (process.env.NODE_ENV !== 'production') {
    // Local development - load from .env file
    const env = process.env.NODE_ENV || 'development';
    dotenv.config({ path: `.env.${env}` });
    console.log('🔧 Loaded environment from .env.development');
  } else {
    // Production - try to load from Render's /etc/secrets/ first
    const secretsPath = '/etc/secrets';
    
    if (fs.existsSync(secretsPath)) {
      console.log('🔐 Loading secrets from /etc/secrets/');
      
      // List of environment variables we need
      const requiredSecrets = [
        'DATABASE_URL',
        'JWT_SECRET', 
        'SESSION_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'STRIPE_SECRET_KEY',
        'NET_LICENCE_API_KEY',
        'NET_LICENCE_PRODUCT_ID',
        'FRONTEND_URL',
        'BACKEND_URL'
      ];
      
      // Load each secret file
      for (const secretName of requiredSecrets) {
        const secretFile = path.join(secretsPath, secretName);
        
        try {
          if (fs.existsSync(secretFile)) {
            const secretValue = fs.readFileSync(secretFile, 'utf8').trim();
            process.env[secretName] = secretValue;
            console.log(`✅ Loaded ${secretName} from /etc/secrets/`);
          } else if (!process.env[secretName]) {
            console.log(`⚠️  ${secretName} not found in /etc/secrets/ or environment`);
          }
        } catch (error) {
          console.error(`❌ Failed to read ${secretName} from /etc/secrets/:`, error);
        }
      }
    } else {
      console.log('🌐 Using environment variables directly (no /etc/secrets/ found)');
    }
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