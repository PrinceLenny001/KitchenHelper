import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pg;

// Extract the connection details from the URL
const directUrl = process.env.DIRECT_URL;
console.log('Using connection URL:', directUrl);

async function testConnection() {
  const client = new Client({
    connectionString: directUrl,
    ssl: {
      rejectUnauthorized: false // This allows self-signed certificates
    }
  });

  try {
    console.log('Attempting to connect to the database...');
    await client.connect();
    console.log('Connected to the database successfully!');
    const result = await client.query('SELECT NOW()');
    console.log('Current time from database:', result.rows[0]);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await client.end();
  }
}

testConnection(); 