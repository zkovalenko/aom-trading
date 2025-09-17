const crypto = require('crypto');

// Get arguments
const confirm = process.argv[2];

if (confirm !== '--confirm') {
  console.log('This will add device_ids and max_devices columns to user_subscriptions table in PRODUCTION.');
  console.log('Usage: node scripts/add-device-columns-prod.js --confirm');
  process.exit(1);
}

// Environment variables - set these manually or pass via command line
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'password'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'aom_trading'}`;

async function addDeviceColumns() {
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
    console.log('🔗 Connected to production database');
    
    // Check if columns already exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_subscriptions' 
      AND column_name IN ('device_ids', 'max_devices')
    `);
    
    if (checkColumns.rows.length > 0) {
      console.log('⚠️  Device columns already exist in user_subscriptions table');
      const existingColumns = checkColumns.rows.map(row => row.column_name);
      console.log('   Existing columns:', existingColumns.join(', '));
      await client.end();
      return;
    }
    
    console.log('📝 Adding device_ids and max_devices columns to user_subscriptions...');
    
    // Add the columns
    await client.query(`
      ALTER TABLE user_subscriptions 
      ADD COLUMN IF NOT EXISTS device_ids JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 2
    `);
    
    console.log('✅ Successfully added device columns to user_subscriptions table:');
    console.log('   - device_ids: JSONB column for storing device information');
    console.log('   - max_devices: INTEGER column with default value 2');
    
    // Verify the columns were added
    const verifyColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_subscriptions' 
      AND column_name IN ('device_ids', 'max_devices')
      ORDER BY column_name
    `);
    
    console.log('\n📊 Column verification:');
    verifyColumns.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding device columns:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

addDeviceColumns();