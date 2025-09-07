const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Import our environment loading function
const { loadEnvironmentVariables } = require('../dist/config/env');

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
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
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of executed migrations
    const executedResult = await pool.query('SELECT migration_name FROM schema_migrations ORDER BY id');
    const executedMigrations = new Set(executedResult.rows.map(row => row.migration_name));

    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 No migrations directory found. Creating...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✅ Migrations directory created');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order

    if (migrationFiles.length === 0) {
      console.log('📄 No migration files found');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration files`);

    let executedCount = 0;

    for (const fileName of migrationFiles) {
      if (executedMigrations.has(fileName)) {
        console.log(`⏭️  Skipping ${fileName} (already executed)`);
        continue;
      }

      console.log(`🚀 Executing ${fileName}...`);
      
      const filePath = path.join(migrationsDir, fileName);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute migration in a transaction
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [fileName]);
        await pool.query('COMMIT');
        console.log(`✅ Successfully executed ${fileName}`);
        executedCount++;
      } catch (error) {
        await pool.query('ROLLBACK');
        throw new Error(`Failed to execute ${fileName}: ${error.message}`);
      }
    }

    if (executedCount === 0) {
      console.log('✨ All migrations are up to date');
    } else {
      console.log(`🎉 Successfully executed ${executedCount} new migrations`);
    }

    // Show current schema version
    const latestResult = await pool.query('SELECT migration_name FROM schema_migrations ORDER BY id DESC LIMIT 1');
    if (latestResult.rows.length > 0) {
      console.log(`📌 Current schema version: ${latestResult.rows[0].migration_name}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };