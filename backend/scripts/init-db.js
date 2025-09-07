const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Import our environment loading function
const { loadEnvironmentVariables } = require('../dist/config/env');

async function initializeDatabase() {
  console.log('🚀 Initializing database...');
  
  // Load environment variables
  loadEnvironmentVariables();
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Executing schema...');
    await pool.query(schema);
    
    console.log('✅ Database initialized successfully!');
    
    // Test connection by counting tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`📋 Created ${result.rows.length} tables:`);
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };