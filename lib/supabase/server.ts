import {supabase, getSupabaseAdmin} from '@/lib/supabase';

// Simple factory to get a supabase client depending on environment
export function createClient() {
  if (typeof window !== 'undefined') {
    return supabase;
  }
  try {
    return getSupabaseAdmin();
  } catch {
    // Fallback to public client if admin is unavailable in some environments
    return supabase;
  }
}

export type {UserChart, AIAnalysis} from '@/lib/supabase';

