import { createFileRoute, Navigate } from '@tanstack/react-router';
import NewsArticleForm from '../../../components/admin/NewsArticleForm';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

export const Route = createFileRoute('/admin/news/new')({
  component: NewArticlePage,
});

function NewArticlePage() {
  const { authReady, profileReady, isAuthenticated, user } = useSupabaseAuth();

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" search={{ redirect: '/admin/news/new' }} />;
  }

  if (!profileReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-brand-primary mb-6">Create Article</h1>
      <NewsArticleForm onSuccess={() => {}} />
    </div>
  );
}
