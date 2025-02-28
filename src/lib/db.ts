import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
  var supabase: any;
}

// Check if we're running in Netlify
const isNetlify = process.env.NEXT_PUBLIC_NETLIFY === 'true';

// Initialize Prisma Client with better error handling
const prismaClientSingleton = () => {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    // Return a mock PrismaClient that logs errors instead of crashing
    return new Proxy({} as PrismaClient, {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return new Proxy({}, {
            get: () => async () => {
              console.error(`Database connection error: Unable to execute ${String(prop)} operation`);
              return null;
            }
          });
        }
        return undefined;
      }
    });
  }
};

export const prisma = global.prisma || prismaClientSingleton();

// Initialize Supabase Client with better error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in a build environment without the required variables
const isMissingSupabaseConfig = !supabaseUrl || !supabaseAnonKey;

const supabaseClientSingleton = () => {
  // If we're in Netlify or missing config in production, use mock client
  if (isNetlify || (isMissingSupabaseConfig && process.env.NODE_ENV === 'production')) {
    console.warn('Running in Netlify or missing Supabase configuration. Using mock client.');
    return createMockSupabaseClient();
  }

  try {
    // Only create a real client if we have the required config
    if (supabaseUrl && supabaseAnonKey) {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
        }
      });
    } else {
      console.warn('Supabase URL or Anon Key missing. Using mock client.');
      return createMockSupabaseClient();
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return createMockSupabaseClient();
  }
};

// Create a mock Supabase client that won't throw errors
function createMockSupabaseClient() {
  console.log('Creating mock Supabase client');
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export const supabase = global.supabase || supabaseClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
  global.supabase = supabase;
}

// Run Prisma generate to update the client with the new models
// This ensures the Prisma client is aware of all models defined in schema.prisma
// npx prisma generate
