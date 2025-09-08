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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Executing schema...');
    try {
      await client.query(schema);
      console.log('✅ Schema executed successfully');
    } catch (schemaError) {
      console.error('❌ Schema execution failed:', schemaError.message);
      await client.query('ROLLBACK');
      throw schemaError;
    }
    
    await client.query('COMMIT');
    console.log('✅ Schema committed');
    
    // Start new transaction for data insertion
    await client.query('BEGIN');
    
    // Verify tables exist before proceeding
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`📋 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check if products table exists
    const hasProductsTable = tablesResult.rows.some(row => row.table_name === 'products');
    
    if (!hasProductsTable) {
      await client.query('ROLLBACK');
      throw new Error('Products table was not created successfully');
    }
    
    // Insert default products (only if they don't exist)
    console.log('📦 Adding default products...');
    
    try {
      // Check if products already exist
      const existingProducts = await client.query('SELECT COUNT(*) as count FROM products');
      
      if (existingProducts.rows[0].count === '0') {
        await client.query(`
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
      
      const productsResult = await client.query('SELECT name FROM products WHERE is_active = true');
      console.log(`📦 Total active products: ${productsResult.rows.length}`);
      productsResult.rows.forEach(row => console.log(`  - ${row.name}`));
      
      await client.query('COMMIT');
      console.log('✅ Data insertion committed');
      
    } catch (productError) {
      console.error('❌ Product insertion failed:', productError.message);
      await client.query('ROLLBACK');
      throw productError;
    }
    
    console.log('✅ Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };