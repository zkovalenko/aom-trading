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
    console.log('📊 Creating database schema...');
    
    // Create tables directly instead of using schema.sql
    await client.query(`
      -- Create function
      CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;
      
      -- Create users table
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
      
      -- Create products table
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
      
      -- Create other essential tables
      CREATE TABLE IF NOT EXISTS payments (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          user_id uuid,
          stripe_payment_id character varying(255) NOT NULL,
          amount numeric(10,2) NOT NULL,
          currency character varying(3) DEFAULT 'USD',
          status character varying(20) DEFAULT 'pending',
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
    
    console.log('✅ Basic tables created');
    
    // Add constraints
    await client.query(`
      DO $$ BEGIN
          -- Primary keys
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
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_pkey') THEN
              ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);
          END IF;
          
          -- Unique constraints
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
              ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_key') THEN
              ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
          END IF;
      END $$;
    `);
    
    console.log('✅ Constraints added');
    
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
      // Set search path explicitly
      await client.query('SET search_path TO public');
      
      // Double-check products table exists before querying
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        );
      `);
      
      console.log('🔍 Products table exists check:', tableExists.rows[0].exists);
      
      if (!tableExists.rows[0].exists) {
        throw new Error('Products table still does not exist after schema creation');
      }
      
      // Try to describe the table structure first
      console.log('🔍 Checking products table structure...');
      const tableStructure = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
        ORDER BY ordinal_position
      `);
      
      console.log('Products table columns:');
      tableStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
      
      // Check if products already exist with explicit schema
      console.log('🔍 Querying products with explicit schema...');
      const existingProducts = await client.query('SELECT COUNT(*) as count FROM public.products');
      
      if (existingProducts.rows[0].count === '0') {
        await client.query(`
          INSERT INTO public.products (product_template_id, name, description, subscription_types, product_license_template, is_active) 
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
      
      const productsResult = await client.query('SELECT name FROM public.products WHERE is_active = true');
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