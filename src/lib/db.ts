import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
  var supabase: ReturnType<typeof createClient> | undefined;
}

// Initialize Prisma Client
export const prisma = global.prisma || new PrismaClient();

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = global.supabase || createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
  global.supabase = supabase;
}

// Run Prisma generate to update the client with the new models
// This ensures the Prisma client is aware of all models defined in schema.prisma
// npx prisma generate
