import { z } from 'zod';

// Input validation schemas
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.string().optional(),
});

// Validate and sanitize email
export function validateAndSanitizeEmail(email: string): string {
  // Use the zod schema to validate
  const result = z.string().email().safeParse(email);
  
  if (!result.success) {
    throw new Error('Invalid email format');
  }
  
  // Sanitize by trimming whitespace and converting to lowercase
  return result.data.trim().toLowerCase();
}

// Validate login credentials
export function validateLoginCredentials(credentials: { email: string; password: string }): void {
  // Validate using zod schema
  const result = loginSchema.safeParse(credentials);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => err.message).join(', ');
    throw new Error(errors);
  }
}

// Validate user data
export function validateUser(userData: any): void {
  const result = userSchema.safeParse(userData);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => err.message).join(', ');
    throw new Error(errors);
  }
}