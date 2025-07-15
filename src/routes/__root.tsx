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

    // Show loading spinner while auth is initializing with timeout
    const [showTimeout, setShowTimeout] = React.useState(false);
    const [forceRefresh, setForceRefresh] = React.useState(false);
    
    React.useEffect(() => {
      if (isLoading) {
        const timer = setTimeout(() => {
          setShowTimeout(true);
        }, 10000); // Show timeout message after 10 seconds
        
        return () => clearTimeout(timer);
      } else {
        setShowTimeout(false);
      }
    }, [isLoading]);

    // Force refresh handler
    const handleForceRefresh = () => {
      console.log('🔄 Force refreshing application...');
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    };

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
            {showTimeout && (
              <div className="mt-4">
                <p className="text-red-600 text-sm">Taking longer than expected...</p>
                <button 
                  onClick={handleForceRefresh}
                  className="mt-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            )}
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