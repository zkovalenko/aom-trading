const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

console.log('Raw DATABASE_URL:', DATABASE_URL);
console.log('DATABASE_URL length:', DATABASE_URL ? DATABASE_URL.length : 'undefined');
console.log('DATABASE_URL type:', typeof DATABASE_URL);

if (DATABASE_URL) {
  // Try to parse the URL manually
  try {
    const url = new URL(DATABASE_URL);
    console.log('Parsed URL components:');
    console.log('  Protocol:', url.protocol);
    console.log('  Username:', url.username);
    console.log('  Password:', url.password ? '***' : 'none');
    console.log('  Hostname:', url.hostname);
    console.log('  Port:', url.port);
    console.log('  Pathname:', url.pathname);
  } catch (e) {
    console.log('URL parsing error:', e.message);
  }

  // Try to create a client
  try {
    const client = new Client({
      connectionString: DATABASE_URL
    });
    console.log('Client created successfully');
    
    // Try to connect
    client.connect().then(() => {
      console.log('Connected successfully!');
      client.end();
    }).catch(err => {
      console.log('Connection error:', err.message);
      console.log('Error code:', err.code);
    });
    
  } catch (e) {
    console.log('Client creation error:', e.message);
  }
} else {
  console.log('No DATABASE_URL provided');
}