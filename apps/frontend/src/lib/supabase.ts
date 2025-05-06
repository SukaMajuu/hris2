import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase URL or Anon Key environment variables.");
}

// Create a single Supabase client for interacting with your database
export const supabase: SupabaseClient = createClient(
	supabaseUrl,
	supabaseAnonKey
);
