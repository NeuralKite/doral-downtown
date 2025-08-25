import { supabase } from '../lib/supabase';
import { UserRole } from '../constants/roles';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessWebsite?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterData) {
    try {
      console.log('AuthService: Starting registration...', {
        email: data.email,
        role: data.role,
        name: data.name
      });

      // Pre-registration check: verify if email already exists in user_profiles
      const { data: existingProfile, error: existingError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (existingError) {
        console.error('AuthService: Email check failed:', existingError);
      }
      if (existingProfile) {
        throw new Error('Email already registered');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: data.name,
            role: data.role,
            ...(data.role === UserRole.BUSINESS && {
              business_name: data.businessName,
              business_description: data.businessDescription,
              business_address: data.businessAddress,
              business_website: data.businessWebsite
            }),
            phone: data.phone
          }
        }
      });

      if (authError) {
        console.error('AuthService: Registration error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from registration');
      }

      console.log('AuthService: Registration successful:', authData.user.id);
      return { success: true, user: authData.user };
    } catch (error) {
      console.error('AuthService: Registration failed:', error);
      return { success: false, error };
    }
  }

  static async login(data: LoginData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        throw authError;
      }

      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error('User profile not found');
      }

      return { success: true, user: authData.user, profile };
    } catch (error) {
      console.error('AuthService: Login failed:', error);
      return { success: false, error };
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('AuthService: Logout failed:', error);
      return { success: false, error };
    }
  }

  static async resendVerification(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('AuthService: Resend verification failed:', error);
      return { success: false, error };
    }
  }
}