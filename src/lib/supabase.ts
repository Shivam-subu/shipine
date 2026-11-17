import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable accessor for Node and Vite environments
function getEnv(key: string, viteKey?: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  if (viteKey && typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[viteKey] || '';
  }
  return '';
}

export const SUPABASE_URL = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

/**
 * Checks if Supabase credentials are configured and not placeholder values
 */
export function isSupabaseConfigured(): boolean {
  const url = SUPABASE_URL.trim();
  const key = (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY).trim();

  if (!url || !key) return false;
  if (url.includes('your-project') || key.includes('your-anon') || key.includes('your-service')) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Client for general queries (with anon key fallback or service key)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Admin client using service role key (bypasses RLS for secure backend operations)
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Helper to get the active Supabase client for backend operations
 */
export function getSupabaseBackendClient(): SupabaseClient | null {
  return supabaseAdmin || supabase;
}
