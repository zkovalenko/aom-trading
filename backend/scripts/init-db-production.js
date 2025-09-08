const { Pool } = require('pg');
const { loadEnvironmentVariables } = require('../dist/config/env');

async function initializeDatabase() {
  console.log('🚀 Initializing database for production...');
  
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

    // Create function first
    console.log('📊 Creating update function...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;
    `);

    // Create tables one by one
    console.log('📊 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          email character varying(255) NOT NULL,
          password character varying(255),
          first_name character varying(100) NOT NULL,
          last_name character varying(100) NOT NULL,
          google_id character varying(255),
          is_email_verified boolean DEFAULT false,
          reset_token character varying(255),
          reset_token_expires timestamp without time zone,
          created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          methodology_disclaimer_viewed boolean DEFAULT false,
          methodology_disclaimer_viewed_date timestamp without time zone
      );
    `);

    console.log('📊 Creating products table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          product_template_id character varying(255) NOT NULL,
          name character varying(255) NOT NULL,
          description text,
          subscription_types jsonb NOT NULL,
          is_active boolean DEFAULT true,
          created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          product_license_template jsonb
      );
    `);

    console.log('📊 Creating other tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          user_id uuid,
          stripe_payment_id character varying(255) NOT NULL,
          amount numeric(10,2) NOT NULL,
          currency character varying(3) DEFAULT 'USD'::character varying,
          status character varying(20) DEFAULT 'pending'::character varying,
          product_type character varying(20) NOT NULL,
          product_id uuid,
          metadata jsonb,
          created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          stripe_payment_intent_id character varying(255)
      );
      
      CREATE TABLE IF NOT EXISTS session (
          sid character varying NOT NULL,
          sess json NOT NULL,
          expire timestamp(6) without time zone NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS software_licenses (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          user_id uuid,
          license_type character varying(50) NOT NULL,
          is_active boolean DEFAULT true,
          purchased_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          expires_at timestamp without time zone,
          created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS user_subscriptions (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          user_id uuid NOT NULL,
          subscriptions jsonb DEFAULT '[]'::jsonb NOT NULL,
          created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
          licensee_number character varying(255),
          license_number character varying(255)
      );
    `);

    // Add primary keys if they don't exist
    console.log('📊 Adding constraints...');
    await pool.query(`
      DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey') THEN
              ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_pkey') THEN
              ALTER TABLE products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_pkey') THEN
              ALTER TABLE payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
              ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'software_licenses_pkey') THEN
              ALTER TABLE software_licenses ADD CONSTRAINT software_licenses_pkey PRIMARY KEY (id);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_pkey') THEN
              ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);
          END IF;
      END $$;
    `);

    // Add unique constraints
    await pool.query(`
      DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
              ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_key') THEN
              ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_stripe_payment_id_key') THEN
              ALTER TABLE payments ADD CONSTRAINT payments_stripe_payment_id_key UNIQUE (stripe_payment_id);
          END IF;
      END $$;
    `);

    // Verify tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`📋 Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // Insert products
    console.log('📦 Adding default products...');
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
    
    const productsResult = await pool.query('SELECT name FROM products WHERE is_active = true');
    console.log(`📦 Total active products: ${productsResult.rows.length}`);
    productsResult.rows.forEach(row => console.log(`  - ${row.name}`));
    
    console.log('✅ Database initialized successfully!');
    
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