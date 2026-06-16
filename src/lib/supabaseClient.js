import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof window !== 'undefined' && window.__SUPABASE_URL) || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env file based on .env.example. The app will fall back to localStorage.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function isSupabaseReady() {
  return supabase !== null;
}
