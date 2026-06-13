import { supabase, isSupabaseReady } from '../lib/supabaseClient.js';

const ADMIN_STORAGE_KEY = 'elitechrono_admin';
const ADMIN_EMAIL = 'admin@elitechrono.com';

export const Auth = {
  async signIn(email, password) {
    // Try Supabase first if ready
    if (isSupabaseReady()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
        return { success: true, user: data.user };
      }
    }
    // Fallback: localStorage-based admin
    if (email === ADMIN_EMAIL && password === 'admin123') {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  async signOut() {
    if (isSupabaseReady()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  },

  isAdmin() {
    if (isSupabaseReady()) {
      // Session check is handled by onAuthStateChange; fallback to localStorage
    }
    return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  },

  onAuthChange(callback) {
    if (!isSupabaseReady()) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLoggedIn = !!session;
      localStorage.setItem(ADMIN_STORAGE_KEY, isLoggedIn ? 'true' : 'false');
      callback(isLoggedIn);
    });
    return data?.subscription?.unsubscribe || (() => {});
  },
};
