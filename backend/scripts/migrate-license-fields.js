const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting license validation fields migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../migrations/add_license_validation_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    
    // Show the generated API key
    const result = await client.query('SELECT api_key FROM api_keys ORDER BY created_at DESC LIMIT 1');
    if (result.rows.length > 0) {
      console.log('🔑 Generated API Key:', result.rows[0].api_key);
      console.log('📝 Save this API key for license validation requests');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);