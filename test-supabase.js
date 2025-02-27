import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Defined' : 'Undefined');

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to fetch some data from a table
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabaseConnection(); 