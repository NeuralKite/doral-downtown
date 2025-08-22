import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import BusinessDashboard from "../../components/business/BusinessDashboard";

export const Route = createFileRoute("/business/")({
  component: BusinessPage,
});

function BusinessPage() {
  const { authReady, profileReady, isAuthenticated, user } = useSupabaseAuth();

  // 1) Espera a saber si hay o no sesión
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-brand-primary border-t-transparent" />
      </div>
    );
  }

  // 2) Si no hay sesión -> login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" search={{ redirect: "/business" }} />;
  }

  // 3) Espera a que el perfil termine de cargar (sin bloquear toda la app antes)
  if (!profileReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-brand-primary border-t-transparent" />
        <span className="sr-only">Loading profile…</span>
      </div>
    );
  }

  // 4) Si no hay perfil o no es 'business' -> fuera
  if (!user || user.role !== "business") {
    return <Navigate to="/profile" />;
  }

  // 5) OK
  return <BusinessDashboard />;
}
