import { UserRole } from '../types';

export const getRoleBasedRoute = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'business':
      return '/business';
    case 'user':
    default:
      return '/profile';
  }
};

export const getDefaultRoute = (): string => {
  return '/';
};

export const isProtectedRoute = (path: string): boolean => {
  const protectedRoutes = ['/admin', '/business', '/profile'];
  return protectedRoutes.some(route => path.startsWith(route));
};

export const hasRoleAccess = (userRole: UserRole, path: string): boolean => {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // Business users can access business routes and their profile
  if (userRole === 'business') {
    return path.startsWith('/business') || path.startsWith('/profile') || !isProtectedRoute(path);
  }
  
  // Regular users can access their profile and public routes
  if (userRole === 'user') {
    return path.startsWith('/profile') || !isProtectedRoute(path);
  }
  
  return false;
};

export const getUnauthorizedRedirect = (userRole: UserRole): string => {
  return getRoleBasedRoute(userRole);
};