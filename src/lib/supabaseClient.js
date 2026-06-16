import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://zlqribkbrcquowqqosov.supabase.co';
const FALLBACK_KEY = 'sb_publishable_gCjq1FNtov6hlC9bXXCO2Q_cnnkbldG';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

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
