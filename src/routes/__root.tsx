import { createRootRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export const Route = createRootRoute({
  component: () => {
    const { user, isAuthenticated, logout, isLoading } = useSupabaseAuth();

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