// Safe Supabase client wrapper - prevents app crash when env vars are missing
// (e.g., on Vercel deployments without VITE_SUPABASE_URL configured)

import type { SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _initError: string | null = null;

try {
  // Dynamic import would be ideal but createClient runs at module level in client.ts
  // So we catch the error from the static import
  const mod = await import('@/integrations/supabase/client');
  _supabase = mod.supabase;
} catch (e) {
  _initError = e instanceof Error ? e.message : 'Supabase init failed';
  console.warn('Supabase not available:', _initError);
}

export const safeSupabase = _supabase;
export const supabaseError = _initError;
