const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Import our environment loading function
const { loadEnvironmentVariables } = require('../dist/config/env');

async function initializeDatabase() {
  console.log('🚀 Initializing database (simple approach)...');
  
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
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Just try to insert products directly into existing table
    console.log('📦 Attempting to insert products...');
    
    try {
      // Check if products table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        );
      `);
      
      console.log('Products table exists:', tableCheck.rows[0].exists);
      
      if (!tableCheck.rows[0].exists) {
        console.log('❌ Products table does not exist. Please run schema creation first.');
        return;
      }
      
      // Check current products
      const existingProducts = await pool.query('SELECT COUNT(*) as count, array_agg(name) as names FROM products');
      console.log(`Current products: ${existingProducts.rows[0].count}`);
      console.log('Product names:', existingProducts.rows[0].names);
      
      if (existingProducts.rows[0].count === '0') {
        // Insert products
        const insertResult = await pool.query(`
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
          RETURNING id, name
        `);
        
        console.log('✅ Products inserted successfully:');
        insertResult.rows.forEach(row => console.log(`  - ${row.name} (${row.id})`));
      } else {
        console.log('📦 Products already exist, skipping insertion');
      }
      
    } catch (productError) {
      console.error('❌ Product operation failed:', productError.message);
      console.error('Full error:', productError);
    }
    
  } catch (error) {
    console.error('❌ Database operation failed:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };