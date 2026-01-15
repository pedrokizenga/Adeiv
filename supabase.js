import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Prevent crash if env vars are missing
export const supabase = (supabaseUrl && supabaseUrl !== 'https://your-project-url.supabase.co')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
