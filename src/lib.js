// Re-exports the single canonical Supabase client so the whole app
// (public site + admin) shares one auth/session instance.
export { supabase } from "./lib/supabase";
