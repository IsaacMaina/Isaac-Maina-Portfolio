// src/lib/auth/utils.ts
import { compare } from 'bcryptjs';
import { UserRole } from '@/lib/authorization';

// Verify a plain password against a hashed password
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Check if a password is compromised (basic implementation - in production, use a service like Have I Been Pwned API)
export function isPasswordCompromised(password: string): boolean {
  // For development purposes, only check for the most obviously compromised passwords
  const obviouslyBadPasswords = [
    'password', 'admin', 'letmein', 'welcome', 'monkey', '123456', 'password123'
  ];

  // Convert to lowercase for comparison
  const lowerPassword = password.toLowerCase();

  // Check if it's an obviously bad password
  if (obviouslyBadPasswords.includes(lowerPassword)) {
    return true;
  }

  // Check for repeated characters or simple patterns (more than 3 repeating characters)
  if (/(.)\1{3,}/.test(password)) { // Only if 4+ characters repeat (aaa is okay, aaaa is not)
    return true;
  }

  // Check for completely sequential characters (not allowing any sequences for security)
  if (/123456789|987654321|abcdefghijklmnopqrstuvwxyz/.test(lowerPassword)) {
    return true;
  }

  return false;
}

// Mapping function to convert database role strings to UserRole enum
export function mapDatabaseRoleToEnum(role: string): UserRole {
  switch (role.toLowerCase()) {
    case 'admin':
      return UserRole.ADMIN;
    case 'manager':
      return UserRole.MANAGER;
    case 'user':
      return UserRole.USER;
    case 'viewer':
      return UserRole.VIEWER;
    default:
      return UserRole.USER; // Default to user role for safety
  }
}