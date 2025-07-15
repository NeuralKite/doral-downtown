import { z } from 'zod';
import { UserRole } from '../constants/roles';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  businessAddress: z.string().optional(),
  businessWebsite: z.string().url().optional().or(z.literal(''))
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => {
  if (data.role === UserRole.BUSINESS) {
    return data.businessName && data.businessName.length > 0;
  }
  return true;
}, {
  message: "Business name is required for business accounts",
  path: ["businessName"]
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;