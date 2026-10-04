import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// A throwaway client that never stores or shares a session. Used to check a password
// ("re-authenticate") without replacing the real session, which would downgrade a 2FA
// session (aal2) back to aal1.
export const createEphemeralClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
