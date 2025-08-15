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

// Initialize storage bucket for user avatars
const initializeStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (!avatarBucket) {
      // Create avatars bucket
      const { error } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('Error creating avatars bucket:', error);
      } else {
        console.log('✅ Avatars bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
};

// Initialize storage on app start
initializeStorage();

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