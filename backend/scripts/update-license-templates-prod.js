const crypto = require('crypto');

// Get confirmation argument
const confirm = process.argv[2];

if (confirm !== '--confirm') {
  console.log('This will update product license templates in PRODUCTION database.');
  console.log('Usage: node scripts/update-license-templates-prod.js --confirm');
  process.exit(1);
}

// Environment variables - set these manually or pass via command line
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'password'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'aom_trading'}`;

async function updateLicenseTemplates() {
  let client;
  try {
    const { Client } = require('pg');
    
    console.log('🔍 Using connection string:', DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
    
    // Use SSL only for remote databases (like Render)
    const isRemoteDB = DATABASE_URL.includes('render.com') || DATABASE_URL.includes('amazonaws.com') || DATABASE_URL.includes('heroku');
    
    client = new Client({
      connectionString: DATABASE_URL,
      ...(isRemoteDB && {
        ssl: {
          rejectUnauthorized: false
        }
      })
    });
    
    await client.connect();
    console.log('🔗 Connected to database');
    
    // Show current templates
    console.log('📋 Current license templates:');
    const currentTemplates = await client.query(
      'SELECT name, product_license_template FROM products WHERE is_active = true ORDER BY name'
    );
    
    currentTemplates.rows.forEach(row => {
      console.log(`   ${row.name}: ${JSON.stringify(row.product_license_template)}`);
    });
    
    console.log('\n🔄 Updating license templates...');
    
    // Update Basic Trading Plan
    await client.query(`
      UPDATE products 
      SET product_license_template = $1 
      WHERE name = 'Basic Trading Plan' AND is_active = true
    `, [JSON.stringify({"monthly": "EEDGXIUE3", "annual": "EW6SDU936"})]);
    
    console.log('✅ Updated Basic Trading Plan templates');
    
    // Update Premium Trading Plan
    await client.query(`
      UPDATE products 
      SET product_license_template = $1 
      WHERE name = 'Premium Trading Plan' AND is_active = true
    `, [JSON.stringify({"monthly": "E6RYSASXI", "annual": "EJ29VT6QY"})]);
    
    console.log('✅ Updated Premium Trading Plan templates');
    
    // Verify updates
    console.log('\n🔍 Verification - Updated templates:');
    const updatedTemplates = await client.query(
      'SELECT name, product_license_template FROM products WHERE is_active = true ORDER BY name'
    );
    
    updatedTemplates.rows.forEach(row => {
      console.log(`   ${row.name}: ${JSON.stringify(row.product_license_template)}`);
    });
    
    console.log('\n✅ License template update completed successfully!');
    console.log('\nNew template mapping:');
    console.log('  Basic Trading Plan:');
    console.log('    - Monthly: EEDGXIUE3');
    console.log('    - Annual: EW6SDU936');
    console.log('  Premium Trading Plan:');
    console.log('    - Monthly: E6RYSASXI');
    console.log('    - Annual: EJ29VT6QY');
    
  } catch (error) {
    console.error('❌ Error updating license templates:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

updateLicenseTemplates();