import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseAnonKey ? 'Present' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format. Please ensure VITE_SUPABASE_URL includes the protocol (https://)', {
    providedUrl: supabaseUrl
  });
  throw new Error('Invalid Supabase URL format. Expected format: https://your-project-id.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  }
});

// Add error handler for auth errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('🚪 User signed out');
    // Clear any remaining session data
    localStorage.removeItem('sb-jrtncjdputyorrxxfmvo-auth-token');
  }
});

// Database types
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: 'user' | 'business' | 'admin';
  avatar_url?: string;
  phone?: string;
  business_name?: string;
  business_description?: string;
  business_address?: string;
  business_website?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}