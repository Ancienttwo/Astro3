import { getSupabaseAnonClient, getSupabaseAdminClient, type SupabaseClient } from '@/lib/server/db';

// Simple factory to get a supabase client depending on environment
export function createClient() {
  if (typeof window !== 'undefined') {
    return getSupabaseAnonClient();
  }
  try {
    return getSupabaseAdminClient();
  } catch {
    // Fallback to public client if admin is unavailable in some environments
    return getSupabaseAnonClient();
  }
}

export type { SupabaseClient };
