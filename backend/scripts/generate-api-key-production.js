const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Get arguments
const keyName = process.argv[2];
const description = process.argv[3] || '';

if (!keyName) {
  console.log('Usage: node generate-api-key-production.js <key-name> [description]');
  process.exit(1);
}

// Load production environment variables manually
function loadProductionEnv() {
  const envPath = path.join(__dirname, '../.env.production');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  }
}

// Load production env
loadProductionEnv();

// Use production DATABASE_URL or construct from parts
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

function generateSecureApiKey(prefix = 'ak') {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

async function generateApiKey() {
  let client;
  try {
    const { Client } = require('pg');
    
    console.log('🔍 Using connection string:', DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
    
    client = new Client({
      connectionString: DATABASE_URL
    });
    
    await client.connect();
    console.log(`🔑 Generating API key for: ${keyName}`);
    
    // Create api_keys table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key_name VARCHAR(255) NOT NULL,
        api_key VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
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
    
  } catch (error) {
    console.error('❌ Error generating API key:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

generateApiKey();