import { createFileRoute } from '@tanstack/react-router';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { Navigate } from '@tanstack/react-router';
import BusinessDashboard from '../../components/business/BusinessDashboard';

export const Route = createFileRoute('/business/')({
  component: BusinessPage,
});

function BusinessPage() {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" search={{ redirect: '/business' }} />;
  }

  if (user.role !== 'business') {
    return <Navigate to="/profile" />;
  }

  return <BusinessDashboard />;
}