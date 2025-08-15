import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { UserRole } from '../types'; 

interface RegisterData {
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

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  profileVerified?: boolean;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    profileVerified: false
  });

  // A) loadUserProfile — no bloquear y no "desloguear" si no hay perfil aún
  const loadUserProfile = async (userId: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // PGRST116 = no hay filas; NO tratamos esto como error fatal
        if ((error as any).code === 'PGRST116') {
          console.log('📝 No profile found, user needs onboarding');
          // Marcamos autenticado, pero perfil incompleto
          setAuthState(prev => ({
            ...prev,
            user: null,
            isLoading: false,
            isAuthenticated: true,
            profileVerified: false,
          }));
          return;
        }

        console.warn('⚠️ Profile error (non-blocking):', error);
        // Otros errores: no bloquees la app
        setAuthState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          isAuthenticated: true,
        }));
        return;
      }

      console.log('✅ Profile loaded successfully:', profile.name);
      setAuthState(prev => ({
        ...prev,
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        profileVerified: Boolean(profile?.is_verified),
      }));
    } catch (e) {
      console.error('❌ Profile loading error (fallback to authenticated):', e);
      // Fallback: sesión válida => autenticado
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
      }));
    }
  };

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('🔄 Initial session found, loading profile...');
          await loadUserProfile(session.user.id);
        } else if (mounted) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('❌ Session error:', error);
        if (mounted) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      }
    };

    getInitialSession();

    // C) Listener onAuthStateChange — siempre limpiar isLoading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state change:', event, session?.user?.id);

      try {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (e) {
        console.error('❌ Auth state change error:', e);
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAuthenticated: Boolean(session?.user) 
        }));
      } finally {
        // Pase lo que pase, no te quedes "cargando"
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // B) login — limpiar loading y navegar sin depender solo del listener
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔐 Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error || !data.user) {
        console.error('❌ Login error:', error?.message || 'No user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      console.log('✅ Login successful, access_token received');
      
      // Carga de perfil en paralelo; no bloquea la UI
      const userId = data.user.id;
      loadUserProfile(userId).catch(() => {
        console.warn('⚠️ Profile loading failed, but login was successful');
      });

      // Fallback: si en 2s nadie limpió, lo limpiamos aquí
      setTimeout(() => {
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAuthenticated: true 
        }));
      }, 2000);

      return true;
    } catch (e) {
      console.error('❌ Unexpected login error:', e);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      console.log('📝 Starting registration for:', data.email);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            full_name: data.name,
            role: data.role,
            phone: data.phone || '',
            business_name: data.businessName || '',
            business_description: data.businessDescription || '',
            business_address: data.businessAddress || '',
            business_website: data.businessWebsite || ''
          }
        }
      });

      if (authError) {
        console.error('❌ Registration error:', authError);
        return false;
      }

      console.log('✅ Registration successful');
      return !!authData.user;
    } catch (error) {
      console.error('❌ Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      await supabase.auth.signOut();
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

      return !error;
    } catch (error) {
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!authState.user) return false;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', authState.user.id);

      if (!error) {
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...updates } : null
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return false;
    }
  };

  const checkVerificationStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { emailVerified: false, profileVerified: false, profile: null };
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    return {
      emailVerified: !!session.user.email_confirmed_at,
      profileVerified: !!profile,
      profile
    };
  };

  const getRoleBasedRedirectPath = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'business':
        return '/business';
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
    updateProfile,
    checkVerificationStatus,
    getRoleBasedRedirectPath
  };
};