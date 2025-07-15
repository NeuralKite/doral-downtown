export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  PROFILE: '/profile',
  ADMIN: '/admin',
  BUSINESS: '/business'
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_EMAIL
];

export const PROTECTED_ROUTES = [
  ROUTES.PROFILE
];

export const ADMIN_ROUTES = [
  ROUTES.ADMIN
];

export const BUSINESS_ROUTES = [
  ROUTES.BUSINESS
];