import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
  var supabase: any;
}

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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabaseClientSingleton = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Return a mock Supabase client that logs errors instead of crashing
    return {
      from: () => ({
        select: () => ({
          data: null,
          error: { message: 'Connection error' }
        })
      }),
      auth: {
        signIn: () => Promise.resolve({ error: { message: 'Connection error' } }),
        signOut: () => Promise.resolve({ error: null })
      }
    };
  }
};

export const supabase = global.supabase || supabaseClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
  global.supabase = supabase;
}

// Run Prisma generate to update the client with the new models
// This ensures the Prisma client is aware of all models defined in schema.prisma
// npx prisma generate
