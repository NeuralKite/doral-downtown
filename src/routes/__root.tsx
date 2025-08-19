import { createRootRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { SupabaseAuthProvider, useSupabaseAuth } from '../hooks/useSupabaseAuth';

// Root layout that consumes the authentication context. Having this as a
// separate component keeps the provider mounting logic simple above.
const RootLayout = () => {
  const { user, isAuthenticated, logout } = useSupabaseAuth();

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
};

export const Route = createRootRoute({
  component: () => (
    <SupabaseAuthProvider>
      <RootLayout />
    </SupabaseAuthProvider>
  ),
});