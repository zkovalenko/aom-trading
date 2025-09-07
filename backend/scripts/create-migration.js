const fs = require('fs');
const path = require('path');

function createMigration(migrationName) {
  if (!migrationName) {
    console.error('❌ Migration name is required');
    console.log('Usage: npm run create-migration "add_new_column_to_users"');
    process.exit(1);
  }

  // Create migrations directory if it doesn't exist
  const migrationsDir = path.join(__dirname, '../migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  // Generate timestamp
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const fileName = `${timestamp}_${migrationName.replace(/[^a-zA-Z0-9_]/g, '_')}.sql`;
  const filePath = path.join(migrationsDir, fileName);

  // Migration template
  const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your SQL commands here
-- Example:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- Remember to:
-- 1. Test your migration locally first
-- 2. Make changes that are backwards compatible when possible
-- 3. Consider adding indexes for new columns if needed
-- 4. Update any related application code before running this migration
`;

  fs.writeFileSync(filePath, template);
  
  console.log('✅ Migration file created:');
  console.log(`📁 ${filePath}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Edit the migration file and add your SQL commands');
  console.log('2. Test locally: npm run migrate');
  console.log('3. Deploy and run: npm run migrate (on production)');
}

// Get migration name from command line arguments
const migrationName = process.argv[2];
createMigration(migrationName);