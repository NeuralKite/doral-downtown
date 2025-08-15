import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { UserRole } from '../types'; 
import { RegisterData } from '../routes/auth/register';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('Session error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
        return;
      }

      setAuthState({
        user: profile,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Profile error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            full_name: data.name,
            role: data.role
          }
        }
      });

      if (authError || !authData.user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      });

      return !error;
    } catch (error) {
      return false;
    }
  };

  const checkVerificationStatus = async (): Promise<{ emailVerified: boolean; profileVerified: boolean; profile?: UserProfile }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const emailVerified = Boolean(session?.user?.email_confirmed_at);
      
      if (!session?.user || !emailVerified) {
        return { emailVerified, profileVerified: false };
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      const profileVerified = Boolean(profile?.is_verified);
      return { emailVerified, profileVerified, profile };
    } catch (error) {
      return { emailVerified: false, profileVerified: false };
    }
  };

  const getRoleBasedRedirectPath = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'business':
        return '/business';
      case 'user':
      default:
        return '/profile';
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    resendVerification,
    checkVerificationStatus,
    getRoleBasedRedirectPath
  };
};