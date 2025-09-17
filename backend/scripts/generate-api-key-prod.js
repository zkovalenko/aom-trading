const crypto = require('crypto');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

// Simple standalone script - minimal dependencies
const keyName = process.argv[2];
const description = process.argv[3] || '';

if (!keyName) {
  console.log('Usage: node generate-api-key-prod.js <key-name> [description]');
  process.exit(1);
}

function generateSecureApiKey(prefix = 'ak') {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

async function generateApiKeyProd() {
  try {
    // Use pg directly to avoid any potential imports
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 
        `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
    });
    
    await client.connect();
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
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error generating API key:', error.message);
    process.exit(1);
  }
}

generateApiKeyProd();