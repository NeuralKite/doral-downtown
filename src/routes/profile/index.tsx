import { createFileRoute } from '@tanstack/react-router';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { Navigate } from '@tanstack/react-router';
import UserProfile from '../../components/profile/UserProfile';

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" search={{ redirect: '/profile' }} />;
  }

  // Redirect based on role
  if (user.role === 'admin') {
    return <Navigate to="/admin" />;
  }
  
  if (user.role === 'business') {
    return <Navigate to="/business" />;
  }

  return <UserProfile />;
}