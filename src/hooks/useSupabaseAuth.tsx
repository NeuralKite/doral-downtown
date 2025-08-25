import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { supabase, UserProfile } from "../lib/supabase";
import { UserRole } from "../types";
import type { Session } from '@supabase/supabase-js';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole; // 'user' | 'business' (tipo de cuenta, no seguridad)
  phone?: string;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessWebsite?: string;
}

interface AuthState {
  user: UserProfile | null; // perfil
  isLoading: boolean; // spinner general del hook
  isAuthenticated: boolean; // hay sesión válida
  profileVerified?: boolean;

  // NUEVO
  authReady: boolean; // ya determinamos si hay o no sesión
  profileReady: boolean; // ya intentamos cargar el perfil (exista o no)
  hasProfile: boolean; // Boolean(user)
  jwtRole: string; // role del JWT (app_metadata.role) -> 'admin' | 'user' | ''
}

// ========== Internal hook ==========
const useSupabaseAuthInternal = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    profileVerified: false,
    authReady: false,
    profileReady: false,
    hasProfile: false,
    jwtRole: "",
  });

  // --- helpers ---
  const setJwtRoleFromSession = (session: Session | null) => {
    const role = (session?.user?.app_metadata?.role as string) || "";
    setAuthState((prev) => ({ ...prev, jwtRole: role }));
  };

  // Carga de perfil SIN bloquear la app
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(); // evita lanzar por "no rows"

      if (error) {
        console.warn("⚠️ Profile fetch error (non-blocking):", error);
        setAuthState((prev) => ({
          ...prev,
          user: null,
          profileVerified: false,
          profileReady: true,
          hasProfile: false,
        }));
        return;
      }

      if (!profile) {
        setAuthState((prev) => ({
          ...prev,
          user: null,
          profileVerified: false,
          profileReady: true,
          hasProfile: false,
        }));
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        user: profile,
        profileVerified: Boolean(profile?.is_verified),
        profileReady: true,
        hasProfile: true,
      }));
    } catch (e) {
      console.error("❌ Profile loading error:", e);
      setAuthState((prev) => ({
        ...prev,
        user: null,
        profileReady: true,
        hasProfile: false,
      }));
    }
  };

  // Determinar sesión al cargar
  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        setJwtRoleFromSession(session);

        if (session?.user) {
          // hay sesión
          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isLoading: false, // NO bloquees la app por el perfil
            authReady: true,
          }));
          // carga de perfil en paralelo
          loadUserProfile(session.user.id);
        } else {
          // no hay sesión
          setAuthState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authReady: true,
            profileReady: true,
            hasProfile: false,
            jwtRole: "",
          }));
        }
      } catch (error) {
        console.error("❌ Session error:", error);
        if (!mounted) return;
        setAuthState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authReady: true,
          profileReady: true,
          hasProfile: false,
          jwtRole: "",
        }));
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      try {
        setJwtRoleFromSession(session);

        if (session?.user) {
          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            authReady: true,
          }));
          loadUserProfile(session.user.id);
        } else {
          setAuthState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authReady: true,
            profileReady: true,
            hasProfile: false,
            jwtRole: "",
          }));
        }
      } catch (e) {
        console.error("❌ onAuthStateChange error:", e);
      } finally {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ---- login ----
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) {
        console.error("❌ Login error:", error?.message || "No user");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        authReady: true,
      }));

      // perfil en paralelo
      loadUserProfile(data.user.id);

      // failsafe
      setTimeout(() => {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }, 800);

      return true;
    } catch (e) {
      console.error("❌ Unexpected login error:", e);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // ---- register (arreglado) ----
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      console.log("📝 Starting registration for:", data.email);

      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/confirm`
          : undefined;

      // Enviamos SOLO user_metadata (options.data). Nada de app_metadata aquí.
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo,
          data: {
            // CLAVES alineadas a tu trigger
            name: data.name,
            phone: data.phone || null,
            business_name: data.businessName || null,
            business_description: data.businessDescription || null,
            business_address: data.businessAddress || null,
            business_website: data.businessWebsite || null,

            // informativo para tu UI (no seguridad)
            role: data.role, // 'user' | 'business'
          },
        },
      });

      if (authError) {
        console.error("❌ Registration error:", authError);
        return false;
      }

      console.log("✅ Registration accepted by Supabase Auth");
      return true; // con verificación por email, user puede venir null y está OK
    } catch (error) {
      console.error("❌ Registration unexpected error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("👋 Logging out...");
      await supabase.auth.signOut();
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      return !error;
    } catch {
      return false;
    }
  };

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<boolean> => {
    if (!authState.user) return false;
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", authState.user.id);

      if (!error) {
        setAuthState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...updates } : null,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Update profile error:", error);
      return false;
    }
  };

  const checkVerificationStatus = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { emailVerified: false, profileVerified: false, profile: null };
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    return {
      emailVerified: !!session.user.email_confirmed_at,
      profileVerified: !!profile,
      profile,
    };
  };

  const getRoleBasedRedirectPath = (role: UserRole): string => {
    switch (role) {
      case "admin":
        return "/admin";
      case "business":
        return "/business";
      default:
        return "/profile";
    }
  };

  return {
    ...authState, // incluye authReady, profileReady, hasProfile, jwtRole
    login,
    register,
    logout,
    resendVerification,
    updateProfile,
    checkVerificationStatus,
    getRoleBasedRedirectPath,
  };
};

// Context + provider
const AuthContext = createContext<ReturnType<
  typeof useSupabaseAuthInternal
> | null>(null);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useSupabaseAuthInternal();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return context;
};
