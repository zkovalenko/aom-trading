const { Pool } = require('pg');
const { loadEnvironmentVariables } = require('../dist/config/env');

async function updateProducts() {
  console.log('🔄 Updating existing products...');
  
  loadEnvironmentVariables();
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Get current products
    const currentProducts = await pool.query('SELECT * FROM products ORDER BY created_at');
    console.log('📋 Current products:');
    currentProducts.rows.forEach(product => {
      console.log(`  - ${product.name}: ${JSON.stringify(product.subscription_types)}`);
    });

    // Update products to match expected structure
    if (currentProducts.rows.length >= 2) {
      // Update first product (Basic)
      await pool.query(`
        UPDATE products 
        SET 
          product_template_id = 'basic-trading-plan',
          name = 'Basic Trading Plan',
          description = 'Essential trading tools and live trading room access',
          subscription_types = '{"monthly": 6000, "annual": 64800}',
          product_license_template = '{"monthly": "LT001", "annual": "LT002"}'
        WHERE id = $1
      `, [currentProducts.rows[0].id]);
      
      // Update second product (Premium)  
      await pool.query(`
        UPDATE products 
        SET 
          product_template_id = 'premium-trading-plan',
          name = 'Premium Trading Plan', 
          description = 'Advanced trading tools, live rooms, and semi-automated trading',
          subscription_types = '{"monthly": 7000, "annual": 74800}',
          product_license_template = '{"monthly": "LT003", "annual": "LT004"}'
        WHERE id = $1
      `, [currentProducts.rows[1].id]);
      
      console.log('✅ Products updated successfully');
    }
    
    // Show updated products
    const updatedProducts = await pool.query('SELECT * FROM products ORDER BY created_at');
    console.log('📋 Updated products:');
    updatedProducts.rows.forEach(product => {
      console.log(`  - ${product.name}: ${JSON.stringify(product.subscription_types)}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to update products:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  updateProducts();
}

module.exports = { updateProducts };