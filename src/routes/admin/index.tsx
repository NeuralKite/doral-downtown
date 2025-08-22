import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import AdminDashboard from "../../components/admin/AdminDashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

function AdminPage() {
  const { authReady, profileReady, isAuthenticated, user } = useSupabaseAuth();

  // 1) Espera a saber si hay sesión
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-brand-primary border-t-transparent" />
      </div>
    );
  }

  // 2) Si no hay sesión -> login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" search={{ redirect: "/admin" }} />;
  }

  // 3) Espera a que el perfil termine de cargar
  if (!profileReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-brand-primary border-t-transparent" />
        <p className="sr-only">Loading profile…</p>
      </div>
    );
  }

  // 4) Si no hay perfil o no es admin -> fuera
  if (!user || user.role !== "admin") {
    return <Navigate to="/profile" />;
  }

  // 5) Admin OK
  return <AdminDashboard />;
}
