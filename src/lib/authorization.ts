// src/lib/authorization.ts

// Define user roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

// Define permissions
export enum Permission {
  // User management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Project management
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',

  // Document management
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_UPDATE = 'document:update',
  DOCUMENT_DELETE = 'document:delete',

  // Gallery management
  GALLERY_CREATE = 'gallery:create',
  GALLERY_READ = 'gallery:read',
  GALLERY_UPDATE = 'gallery:update',
  GALLERY_DELETE = 'gallery:delete',

  // Skill management
  SKILL_CREATE = 'skill:create',
  SKILL_READ = 'skill:read',
  SKILL_UPDATE = 'skill:update',
  SKILL_DELETE = 'skill:delete',

  // Education management
  EDUCATION_CREATE = 'education:create',
  EDUCATION_READ = 'education:read',
  EDUCATION_UPDATE = 'education:update',
  EDUCATION_DELETE = 'education:delete',

  // Experience management
  EXPERIENCE_CREATE = 'experience:create',
  EXPERIENCE_READ = 'experience:read',
  EXPERIENCE_UPDATE = 'experience:update',
  EXPERIENCE_DELETE = 'experience:delete',

  // Certification management
  CERTIFICATION_CREATE = 'certification:create',
  CERTIFICATION_READ = 'certification:read',
  CERTIFICATION_UPDATE = 'certification:update',
  CERTIFICATION_DELETE = 'certification:delete',

  // Admin access
  ADMIN_ACCESS = 'admin:access',
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admins have all permissions
  [UserRole.MANAGER]: [
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.GALLERY_READ,
    Permission.GALLERY_UPDATE,
    Permission.SKILL_READ,
    Permission.SKILL_UPDATE,
    Permission.EDUCATION_READ,
    Permission.EDUCATION_UPDATE,
    Permission.EXPERIENCE_READ,
    Permission.EXPERIENCE_UPDATE,
    Permission.CERTIFICATION_READ,
    Permission.CERTIFICATION_UPDATE,
    Permission.ADMIN_ACCESS,
  ],
  [UserRole.USER]: [
    Permission.PROJECT_READ,
    Permission.DOCUMENT_READ,
    Permission.GALLERY_READ,
    Permission.SKILL_READ,
    Permission.EDUCATION_READ,
    Permission.EXPERIENCE_READ,
    Permission.CERTIFICATION_READ,
  ],
  [UserRole.VIEWER]: [
    Permission.PROJECT_READ,
    Permission.DOCUMENT_READ,
    Permission.GALLERY_READ,
    Permission.SKILL_READ,
  ],
};

// User interface
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Check if a user has a specific permission
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

// Check if a user has any of the specified permissions
export function hasAnyPermission(user: AuthenticatedUser, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

// Check if a user has all of the specified permissions
export function hasAllPermissions(user: AuthenticatedUser, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

// Check user role
export function hasRole(user: AuthenticatedUser, role: UserRole): boolean {
  return user.role === role;
}

// Check if user has any of the specified roles (for hierarchical access)
export function hasAnyRole(user: AuthenticatedUser, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

// Check if user has admin role
export function isAdmin(user: AuthenticatedUser): boolean {
  return hasRole(user, UserRole.ADMIN);
}

// Check if user has manager role or above
export function isManagerOrAbove(user: AuthenticatedUser): boolean {
  return hasAnyRole(user, [UserRole.ADMIN, UserRole.MANAGER]);
}

// Resource ownership check
export function isOwner(resourceOwnerId: string, currentUserId: string): boolean {
  return resourceOwnerId === currentUserId;
}

// Enhanced access control function that checks both role and resource ownership
export function canAccessResource(
  user: AuthenticatedUser,
  requiredPermission: Permission,
  resourceOwnerId?: string
): boolean {
  // Check basic permission
  if (hasPermission(user, requiredPermission)) {
    return true;
  }

  // If resource owner ID is provided, check ownership
  if (resourceOwnerId) {
    // Users can access their own resources
    if (isOwner(resourceOwnerId, user.id)) {
      // But they still need the read permission at minimum
      return hasPermission(user, Permission.PROJECT_READ);
    }
  }

  return false;
}

// Access control middleware-like function for API routes
export function requirePermission(user: AuthenticatedUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Access denied: User does not have permission '${permission}'`);
  }
}

// Access control for specific resource operations
export function requireResourceAccess(
  user: AuthenticatedUser,
  requiredPermission: Permission,
  resourceOwnerId?: string
): void {
  if (!canAccessResource(user, requiredPermission, resourceOwnerId)) {
    throw new Error(`Access denied: Insufficient permissions for this resource`);
  }
}