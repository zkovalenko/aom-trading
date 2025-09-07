import { Pool } from 'pg';
import { loadEnvironmentVariables } from './env';

// Load environment variables using our centralized system
loadEnvironmentVariables();

console.log('🔧 Setting up database connection...');
console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔍 DATABASE_URL preview:', process.env.DATABASE_URL ? 
  process.env.DATABASE_URL.substring(0, 20) + '...' + process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 10) : 
  'NOT_SET');
console.log('🔍 SSL mode:', process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  application_name: 'aom-trading-backend'
});

// Test the connection
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database');
  console.log('🔍 Connected as:', (client as any).processID ? `PID ${(client as any).processID}` : 'unknown');
});

pool.on('error', (err: any, client) => {
  console.error('❌ PostgreSQL connection error:', err);
  console.error('❌ Error details:', {
    code: err.code || 'unknown',
    message: err.message || 'unknown',
    host: err.hostname || 'unknown',
    port: err.port || 'unknown'
  });
  if (client) {
    console.error('❌ Client details:', {
      processID: (client as any).processID || 'unknown',
      database: (client as any).database || 'unknown',
      user: (client as any).user || 'unknown'
    });
  }
  process.exit(-1);
});

export default pool;