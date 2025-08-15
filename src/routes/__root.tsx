import { createRootRoute, Outlet } from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export const Route = createRootRoute({
  component: () => {
    const { user, isAuthenticated, logout, isLoading } = useSupabaseAuth();

    // Simple loading state
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Header 
            user={user}
            isAuthenticated={isAuthenticated}
            onLogout={logout}
          />
          <main>
            <Outlet />
          </main>
          <Footer />
          <TanStackRouterDevtools />
        </div>
      </ErrorBoundary>
    );
  },
});