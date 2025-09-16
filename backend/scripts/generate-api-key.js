const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '../.env.production' 
  : '../.env.development';

require('dotenv').config({ path: path.join(__dirname, envFile) });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
});

function generateSecureApiKey(prefix = 'ak') {
  // Generate 32 random bytes and convert to hex
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

async function generateApiKey(keyName, description = '') {
  const client = await pool.connect();
  
  try {
    console.log(`🔑 Generating API key for: ${keyName}`);
    
    const apiKey = generateSecureApiKey();
    
    const result = await client.query(`
      INSERT INTO api_keys (key_name, api_key, is_active, created_at)
      VALUES ($1, $2, true, CURRENT_TIMESTAMP)
      RETURNING id, key_name, api_key, created_at
    `, [keyName, apiKey]);
    
    const newKey = result.rows[0];
    
    console.log('✅ API Key generated successfully:');
    console.log(`   ID: ${newKey.id}`);
    console.log(`   Name: ${newKey.key_name}`);
    console.log(`   Key: ${newKey.api_key}`);
    console.log(`   Created: ${newKey.created_at}`);
    console.log('');
    console.log('🚨 IMPORTANT: Store this API key securely!');
    console.log('   This key will not be shown again.');
    console.log('');
    
    if (description) {
      console.log(`📝 Description: ${description}`);
    }
    
    return newKey;
    
  } catch (error) {
    console.error('❌ Error generating API key:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Get command line arguments
const keyName = process.argv[2];
const description = process.argv[3] || '';

if (!keyName) {
  console.log('Usage: node generate-api-key.js <key-name> [description]');
  console.log('');
  console.log('Examples:');
  console.log('  node generate-api-key.js "Production App" "Main production API key"');
  console.log('  node generate-api-key.js "Mobile App" "iOS/Android mobile app"');
  console.log('  node generate-api-key.js "Test Environment"');
  process.exit(1);
}

generateApiKey(keyName, description).catch(console.error);