// src/lib/auth/server.ts
import { AuthenticatedUser, hasPermission, Permission, isOwner, UserRole } from '@/lib/authorization';
import { mapDatabaseRoleToEnum } from './utils';

// For App Router with NextAuth, the recommended approach is to pass user context
// from authenticated pages rather than accessing session directly in server actions
// This is now a placeholder that will be called from properly authenticated contexts

// Get the currently authenticated user from the session
// This will be called from contexts where the session is already verified
// to avoid issues with getServerSession in server actions in App Router
export async function getCurrentUser(): Promise<AuthenticatedUser> {
  // This function must be called from a context where the session is already verified
  // to avoid issues with getServerSession in server actions in App Router
  throw new Error('getCurrentUser must be called from an authenticated context. Pass user info from the authenticated page component.');
}

// Alternative implementation that accepts user context
export async function getCurrentUserWithContext(userContext: AuthenticatedUser): Promise<AuthenticatedUser> {
  if (!userContext || !userContext.id) {
    throw new Error('User context is not provided or invalid');
  }
  return userContext;
}

// Check if the current user has a specific permission
export async function checkPermission(permission: Permission, userContext?: AuthenticatedUser): Promise<boolean> {
  try {
    if (!userContext) {
      throw new Error('User context must be provided for permission checks in App Router');
    }

    return hasPermission(userContext, permission);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

// Require a specific permission - throws error if user doesn't have it
export async function requirePermission(permission: Permission, userContext?: AuthenticatedUser): Promise<AuthenticatedUser> {
  if (!userContext) {
    throw new Error('User context must be provided for permission checks in App Router');
  }

  if (!hasPermission(userContext, permission)) {
    throw new Error(`Access denied: User does not have permission '${permission}'`);
  }

  return userContext;
}

// Check if the current user is the owner of a specific resource
export async function checkOwnership(resourceOwnerId: string, userContext?: AuthenticatedUser): Promise<boolean> {
  try {
    if (!userContext) {
      throw new Error('User context must be provided for ownership checks in App Router');
    }

    return isOwner(resourceOwnerId, userContext.id);
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
}

// Require resource ownership - throws error if user doesn't own the resource
export async function requireOwnership(resourceOwnerId: string, userContext?: AuthenticatedUser): Promise<AuthenticatedUser> {
  if (!userContext) {
    throw new Error('User context must be provided for ownership checks in App Router');
  }

  if (!isOwner(resourceOwnerId, userContext.id)) {
    throw new Error('Access denied: User does not own this resource');
  }

  return userContext;
}

// Check if the current user can access a specific resource
export async function canAccessResource(
  permission: Permission,
  resourceOwnerId?: string,
  userContext?: AuthenticatedUser
): Promise<boolean> {
  try {
    if (!userContext) {
      throw new Error('User context must be provided for resource access checks in App Router');
    }

    // First check basic permission
    if (hasPermission(userContext, permission)) {
      return true;
    }

    // If resource owner ID is provided, check ownership
    if (resourceOwnerId) {
      // Users can access their own resources with basic read permission
      if (isOwner(resourceOwnerId, userContext.id)) {
        return hasPermission(userContext, Permission.PROJECT_READ); // Require at least read permission
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking resource access:', error);
    return false;
  }
}