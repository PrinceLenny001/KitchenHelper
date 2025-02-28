import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pg;

// Use explicit connection parameters instead of connection string
const client = new Client({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlnxxfacrakohbwejfs',
  password: 'RI1keijDFNXxOCT0',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
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