// src/lib/auth/session-utils.ts
// This file handles session-related operations that work properly with Next.js App Router

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { AuthenticatedUser } from '@/lib/authorization';
import { mapDatabaseRoleToEnum } from './utils';

// Function to get the current user from the session in App Router context
export async function getCurrentUserFromSession(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    // Redirect to login by throwing a redirect
    // However, throwing an error is also appropriate in server components
    // when users should be authenticated
    throw new Error('User is not authenticated');
  }

  const user = session.user;

  if (!user.id || !user.role) {
    throw new Error('Incomplete user information in session');
  }

  // Convert the role to UserRole enum if it's a string
  const role = typeof user.role === 'string'
    ? mapDatabaseRoleToEnum(user.role)
    : user.role;

  return {
    id: user.id,
    email: user.email || '',
    name: user.name || '',
    role: role,
  };
}

// Function that returns null if not authenticated instead of throwing an error
export async function getCurrentUserFromSessionOrNull(): Promise<AuthenticatedUser | null> {
  try {
    return await getCurrentUserFromSession();
  } catch (error) {
    // If not authenticated, return null instead of throwing
    return null;
  }
}