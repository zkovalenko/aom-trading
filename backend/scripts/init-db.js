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
    
    // Insert default products (only if they don't exist)
    console.log('📦 Adding default products...');
    
    // Check if products already exist
    const existingProducts = await pool.query('SELECT COUNT(*) as count FROM products');
    
    if (existingProducts.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO products (product_template_id, name, description, subscription_types, product_license_template, is_active) 
        VALUES 
        (
          'basic-trading-plan',
          'Basic Trading Plan',
          'Essential trading tools and live trading room access',
          '{"monthly": 6000, "annual": 64800}',
          '{"monthly": "LT001", "annual": "LT002"}',
          true
        ),
        (
          'premium-trading-plan',
          'Premium Trading Plan',
          'Advanced trading tools, live rooms, and semi-automated trading',
          '{"monthly": 7000, "annual": 74800}',
          '{"monthly": "LT003", "annual": "LT004"}',
          true
        )
      `);
      console.log('✅ Products added successfully');
    } else {
      console.log('📦 Products already exist, skipping insertion');
    }
    
    console.log('✅ Database initialized successfully!');
    
    // Test connection by counting tables and products
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const productsResult = await pool.query('SELECT name FROM products WHERE is_active = true');
    
    console.log(`📋 Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    console.log(`📦 Added ${productsResult.rows.length} products:`);
    productsResult.rows.forEach(row => console.log(`  - ${row.name}`));
    
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