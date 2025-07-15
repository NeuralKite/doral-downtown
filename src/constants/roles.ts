export enum UserRole {
  USER = 'user',
  BUSINESS = 'business',
  ADMIN = 'admin'
}

export const ROLE_LABELS = {
  [UserRole.USER]: 'User',
  [UserRole.BUSINESS]: 'Business Owner',
  [UserRole.ADMIN]: 'Administrator'
} as const;

export const ROLE_COLORS = {
  [UserRole.USER]: 'bg-green-500',
  [UserRole.BUSINESS]: 'bg-blue-500',
  [UserRole.ADMIN]: 'bg-red-500'
} as const;