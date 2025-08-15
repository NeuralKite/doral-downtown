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
      console.log('🔄 Starting initial session check...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Clear any stale session data
          localStorage.removeItem('sb-jrtncjdputyorrxxfmvo-auth-token');
          sessionStorage.clear();
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
          console.log('✅ Session found, loading profile for user:', session.user.id);
          const emailVerified = Boolean(session.user.email_confirmed_at);
          await loadUserProfile(session.user.id, emailVerified);
        } else {
          console.log('❌ No session found, user not authenticated');
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
        // Clear any corrupted session data
        localStorage.clear();
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
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
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
      console.log('📋 Loading user profile for:', userId);
      
      // Set loading state
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 30000)
      );
      
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error loading user profile:', error.message);
        
        // If profile doesn't exist, don't treat it as an error during signup
        if (error.code === 'PGRST116') {
          console.log('⚠️ User profile not found, user may still be in signup process');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            emailVerified,
            profileVerified: false
          });
          return;
        }
        
        // For other errors, also set loading to false
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          emailVerified,
          profileVerified: false
        });
        return;
      }

      console.log('✅ User profile loaded successfully:', profile.name, 'Role:', profile.role);
      setAuthState({
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        emailVerified,
        profileVerified: Boolean(profile?.is_verified)
      });
    } catch (error) {
      console.error('❌ Unexpected error loading user profile:', error);
      
      // Handle timeout specifically
      if (error instanceof Error && error.message === 'Profile loading timeout') {
        console.error('❌ Profile loading timed out after 30 seconds');
      }
      
      // Don't leave user in loading state
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
      setAuthState(prev => ({ ...prev, isLoading: true }));

      console.log('🔐 Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (!data.user) {
        console.error('❌ Login error: No user data returned');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      console.log('✅ Login successful, auth state will be updated by listener');
      // Don't set loading to false here, let the auth state change listener handle it
      return true;
    } catch (error) {
      console.error('❌ Unexpected login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
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

      // Paso 1: registro mínimo (sin metadata al principio)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
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

      // Paso 2: añadir metadata mínima después del registro exitoso
      try {
        await supabase.auth.updateUser({ 
          data: { 
            full_name: data.name, 
            role: data.role,
            ...(data.phone && { phone: data.phone }),
            ...(data.role === 'business' && data.businessName && { business_name: data.businessName }),
            ...(data.role === 'business' && data.businessDescription && { business_description: data.businessDescription }),
            ...(data.role === 'business' && data.businessAddress && { business_address: data.businessAddress }),
            ...(data.role === 'business' && data.businessWebsite && { business_website: data.businessWebsite })
          } 
        });
        console.log('✅ User metadata updated successfully');
      } catch (metadataError) {
        console.warn('⚠️ Could not update user metadata, but registration was successful:', metadataError);
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