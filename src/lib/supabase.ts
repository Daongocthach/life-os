import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqvlpfcxnywacebpxtdz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdmxwZmN4bnl3YWNlYnB4dGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4OTU1MDUsImV4cCI6MjEwNDQ3MTUwNX0.PlDGwXDJNhYwnkMTZ9lHhAkzGkHqzQCBMF4FDAxaMFY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})
