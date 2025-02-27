import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user or redirect to sign in
 */
export async function getCurrentUser() {
  const session = await getServerAuthSession();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }
  
  return session.user;
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated() {
  const session = await getServerAuthSession();
  return !!session?.user;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const session = await getServerAuthSession();
  return !!session?.user?.isAdmin;
}

/**
 * Format a date for database storage
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString();
}

/**
 * Parse a date from database storage
 */
export function parseDateFromDB(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Generate a secure random string
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}

/**
 * Validate an email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 