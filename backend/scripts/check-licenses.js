const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
});

async function checkLicenses() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking licenses in the database...\n');
    
    // Check if the new license fields exist (from migration)
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'software_licenses' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 software_licenses table structure:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    console.log('');
    
    // Get all users with their licenses
    const licensesResult = await client.query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        sl.id as license_id,
        sl.license_type,
        sl.product_number,
        sl.is_basic,
        sl.is_premium,
        sl.is_active,
        sl.expires_at,
        sl.max_devices,
        sl.created_at,
        sl.updated_at
      FROM users u
      LEFT JOIN software_licenses sl ON u.id = sl.user_id
      ORDER BY u.email, sl.created_at
    `);
    
    if (licensesResult.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Group results by user
    const userLicenses = {};
    
    licensesResult.rows.forEach(row => {
      const userKey = row.email;
      
      if (!userLicenses[userKey]) {
        userLicenses[userKey] = {
          user_id: row.user_id,
          email: row.email,
          name: `${row.first_name} ${row.last_name}`,
          licenses: []
        };
      }
      
      if (row.license_id) {
        userLicenses[userKey].licenses.push({
          license_id: row.license_id,
          license_type: row.license_type,
          product_number: row.product_number,
          is_basic: row.is_basic,
          is_premium: row.is_premium,
          is_active: row.is_active,
          expires_at: row.expires_at,
          max_devices: row.max_devices,
          created_at: row.created_at
        });
      }
    });
    
    // Display results
    console.log('👥 Users and their licenses:\n');
    
    Object.values(userLicenses).forEach(user => {
      console.log(`📧 ${user.email} (${user.name})`);
      console.log(`   User ID: ${user.user_id}`);
      
      if (user.licenses.length === 0) {
        console.log('   ❌ No licenses');
      } else {
        user.licenses.forEach((license, index) => {
          console.log(`   📜 License ${index + 1}:`);
          console.log(`      - ID: ${license.license_id}`);
          console.log(`      - Type: ${license.license_type || 'N/A'}`);
          console.log(`      - Product: ${license.product_number || 'N/A'}`);
          console.log(`      - Basic: ${license.is_basic || false}`);
          console.log(`      - Premium: ${license.is_premium || false}`);
          console.log(`      - Active: ${license.is_active}`);
          console.log(`      - Expires: ${license.expires_at || 'Never'}`);
          console.log(`      - Max Devices: ${license.max_devices || 'N/A'}`);
          console.log(`      - Created: ${license.created_at}`);
        });
      }
      console.log('');
    });
    
    // Summary
    const totalUsers = Object.keys(userLicenses).length;
    const usersWithLicenses = Object.values(userLicenses).filter(u => u.licenses.length > 0).length;
    const totalLicenses = Object.values(userLicenses).reduce((sum, u) => sum + u.licenses.length, 0);
    
    console.log('📊 Summary:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Users with Licenses: ${usersWithLicenses}`);
    console.log(`   Total Licenses: ${totalLicenses}`);
    
  } catch (error) {
    console.error('❌ Error checking licenses:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
checkLicenses().catch(console.error);