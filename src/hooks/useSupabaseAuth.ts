import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { UserRole } from '../types'; 
import { RegisterData } from '../routes/auth/register';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  emailVerified?: boolean;
  profileVerified?: boolean;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    emailVerified: false,
    profileVerified: false
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            emailVerified: false,
            profileVerified: false
          });
          return;
        }
        
        if (session?.user) {
          const emailVerified = Boolean(session.user.email_confirmed_at);
          await loadUserProfile(session.user.id, emailVerified);
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            emailVerified: false,
            profileVerified: false
          });
        }
      } catch (error) {
        console.error('Unexpected error in getInitialSession:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          emailVerified: false,
          profileVerified: false
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          const emailVerified = Boolean(session.user.email_confirmed_at);
          await loadUserProfile(session.user.id, emailVerified);
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            emailVerified: false,
            profileVerified: false
          });
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          emailVerified: false,
          profileVerified: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, emailVerified: boolean = false) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, user may still be in signup process');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            emailVerified,
            profileVerified: false
          });
          return;
        }
        
        console.error('Error loading user profile:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          emailVerified,
          profileVerified: false
        });
        return;
      }

      setAuthState({
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        emailVerified,
        profileVerified: Boolean(profile?.is_verified)
      });
    } catch (error) {
      console.error('Unexpected error loading user profile:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        emailVerified: false,
        profileVerified: false
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {

      console.log('Attempting login...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('Login error: No user data returned');
        return false;
      }

      console.log('Login successful');
      return true;
    } catch (error) {
      console.error('Unexpected login error:', error);
      return false;
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

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      console.log('📝 Starting registration process...', { 
        email: data.email, 
        role: data.role,
        name: data.name 
      });

      // Registro con todos los datos en una sola llamada
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


      if (authError) {
        console.error('❌ Registration error:', authError);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (!authData.user) {
        console.error('❌ No user data returned from registration');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      console.log('✅ Registration successful!');
      console.log('📧 Verification email sent to:', data.email);
      console.log('👤 User ID:', authData.user.id);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('❌ Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      // Clear local storage before signing out
      localStorage.removeItem('sb-jrtncjdputyorrxxfmvo-auth-token');
      sessionStorage.clear();
      await supabase.auth.signOut();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
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

      if (error) {
        console.error('Resend verification error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      return false;
    }
  };

  const checkVerificationStatus = async (): Promise<{ emailVerified: boolean; profileVerified: boolean; profile?: UserProfile }> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        return { emailVerified: false, profileVerified: false };
      }

      const emailVerified = Boolean(session?.user?.email_confirmed_at);
      
      if (!session?.user || !emailVerified) {
        return { emailVerified, profileVerified: false };
      }

      // Check if profile exists and is verified
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

       if (profileError) {
         if (profileError.code === 'PGRST116') {
           console.log('⚠️ Profile not found, may still be creating...');
           return { emailVerified, profileVerified: false };
         }
         console.error('Error loading profile:', profileError);
         return { emailVerified, profileVerified: false };
       }
 
       const profileVerified = Boolean(profile?.is_verified);
       return { emailVerified, profileVerified, profile };
     } catch (error) {
       console.error('Error checking verification status:', error);
       return { emailVerified: false, profileVerified: false };
     }
   };
 
   const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
     try {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session?.user) {
         console.error('No session found for profile update');
         return false;
       }
 
       const { error } = await supabase
         .from('user_profiles')
         .update({
           ...updates,
           updated_at: new Date().toISOString()
         })
         .eq('user_id', session.user.id);
 
       if (error) {
         console.error('Error updating profile:', error);
         return false;
       }
 
       console.log('✅ Profile updated successfully');
       // Reload the profile to get updated data
       const emailVerified = Boolean(session.user.email_confirmed_at);
       await loadUserProfile(session.user.id, emailVerified);
       return true;
     } catch (error) {
       console.error('Error in updateUserProfile:', error);
       return false;
     }
   };
 
   return {
     ...authState,
     login,
     getRoleBasedRedirectPath,
     register,
     logout,
     resendVerification,
     checkVerificationStatus,
     updateUserProfile
   };
};