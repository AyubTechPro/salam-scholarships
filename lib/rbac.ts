import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Role Hierarchy:
 * - SUPER_ADMIN: Full system access
 * - CONTENT_DIRECTOR: Programs, Forums, Events, Seminars
 * - GROWTH_MANAGER: Success Stories, Analytics, Leads
 * - ADMIN: Legacy admin role (treated as CONTENT_DIRECTOR)
 * - USER: Student dashboard only
 */

export type AllowedRole = UserRole | UserRole[];

/**
 * Check if user has required role(s)
 */
export async function hasRole(requiredRoles: AllowedRole): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return false;
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // SUPER_ADMIN has access to everything
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  return roles.includes(user.role);
}

/**
 * Require specific role(s) - throws redirect if not authorized
 */
export async function requireRole(requiredRoles: AllowedRole) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (!user) {
    redirect('/login');
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // SUPER_ADMIN has access to everything
  if (user.role === 'SUPER_ADMIN') {
    return { user, session };
  }

  if (!roles.includes(user.role)) {
    // Redirect based on user's actual role
    if (user.role === 'USER') {
      redirect('/dashboard');
    } else {
      redirect('/admin');
    }
  }

  return { user, session };
}

/**
 * Require Super Admin access
 */
export async function requireSuperAdmin() {
  return requireRole('SUPER_ADMIN');
}

/**
 * Require Content Director access (or Super Admin)
 */
export async function requireContentDirector() {
  return requireRole(['SUPER_ADMIN', 'CONTENT_DIRECTOR', 'ADMIN']);
}

/**
 * Require Growth Manager access (or Super Admin)
 */
export async function requireGrowthManager() {
  return requireRole(['SUPER_ADMIN', 'GROWTH_MANAGER']);
}

/**
 * Require any admin role (Super Admin, Content Director, Growth Manager, or legacy Admin)
 */
export async function requireAnyAdmin() {
  return requireRole(['SUPER_ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'ADMIN']);
}

/**
 * Check if user can perform action on entity
 */
export async function canPerformAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  entityType: 'PROGRAM' | 'USER' | 'APPLICATION' | 'EVENT' | 'SEMINAR' | 'SUCCESS_STORY' | 'ACHIEVEMENT' | 'ANALYTICS'
): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return false;
  }

  // SUPER_ADMIN can do everything
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Role-based permissions
  const permissions: Record<UserRole, Record<string, string[]>> = {
    SUPER_ADMIN: {
      PROGRAM: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      USER: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      APPLICATION: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      EVENT: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      SEMINAR: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      SUCCESS_STORY: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      ACHIEVEMENT: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      ANALYTICS: ['VIEW'],
    },
    CONTENT_DIRECTOR: {
      PROGRAM: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      EVENT: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      SEMINAR: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      APPLICATION: ['VIEW'],
      USER: ['VIEW'],
      SUCCESS_STORY: ['VIEW'],
      ACHIEVEMENT: ['VIEW'],
      ANALYTICS: [],
    },
    GROWTH_MANAGER: {
      SUCCESS_STORY: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      ACHIEVEMENT: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      ANALYTICS: ['VIEW'],
      APPLICATION: ['VIEW'],
      USER: ['VIEW'],
      PROGRAM: ['VIEW'],
      EVENT: ['VIEW'],
      SEMINAR: [],
    },
    ADMIN: {
      // Legacy admin - same as CONTENT_DIRECTOR
      PROGRAM: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      EVENT: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      SEMINAR: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
      APPLICATION: ['VIEW'],
      USER: ['VIEW'],
      SUCCESS_STORY: ['VIEW'],
      ACHIEVEMENT: ['VIEW'],
      ANALYTICS: [],
    },
    CONSULTANT: {
      APPLICATION: ['VIEW', 'UPDATE'],
      USER: ['VIEW'],
      PROGRAM: ['VIEW'],
      EVENT: ['VIEW'],
      SEMINAR: [],
      SUCCESS_STORY: [],
      ACHIEVEMENT: [],
      ANALYTICS: [],
    },
    PARTNER: {
      PROGRAM: ['VIEW'],
      USER: [],
      APPLICATION: [],
      EVENT: ['VIEW'],
      SEMINAR: ['VIEW'],
      SUCCESS_STORY: [],
      ACHIEVEMENT: [],
      ANALYTICS: [],
    },
    USER: {
      APPLICATION: ['CREATE', 'VIEW'],
      USER: ['UPDATE'], // Can update own profile
      PROGRAM: ['VIEW'],
      EVENT: ['VIEW'],
      SEMINAR: [],
      SUCCESS_STORY: [],
      ACHIEVEMENT: [],
      ANALYTICS: [],
    },
  };

  const rolePermissions = permissions[user.role];
  if (!rolePermissions) {
    return false;
  }

  const entityPermissions = rolePermissions[entityType];
  if (!entityPermissions) {
    return false;
  }

  return entityPermissions.includes(action);
}

/**
 * Log admin action to audit log
 */
export async function logAuditAction(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  entityType: string,
  entityId?: string,
  description?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw - audit logging should not break the application
  }
}

/**
 * Create notification for team members
 */
export async function createNotification(
  userId: string | null, // null = all admins
  type: 'CONSULTATION_REQUEST' | 'NEW_APPLICATION' | 'SYSTEM' | 'TEAM',
  title: string,
  message: string,
  link?: string,
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        priority,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications should not break the application
  }
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrator',
    CONTENT_DIRECTOR: 'Content Director',
    GROWTH_MANAGER: 'Growth Manager',
    ADMIN: 'Administrator',
    CONSULTANT: 'Consultant',
    PARTNER: 'Partner',
    USER: 'Student',
  };
  return roleNames[role] || role;
}

