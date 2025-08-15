import { createFileRoute } from '@tanstack/react-router';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { Navigate } from '@tanstack/react-router';
import AdminDashboard from '../../components/admin/AdminDashboard';

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" search={{ redirect: '/admin' }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/profile" />;
  }

  return <AdminDashboard />;
}