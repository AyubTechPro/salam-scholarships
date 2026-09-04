import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

/**
 * Scalable Permission System
 * 
 * No hardcoded UI - sections render based on permission checks
 * This allows for dynamic role management without code changes
 */

export type PermissionSection =
  | 'dashboard_overview'
  | 'programs_manage'
  | 'programs_create'
  | 'programs_delete'
  | 'applications_manage'
  | 'applications_review'
  | 'users_manage'
  | 'users_view'
  | 'users_assign_consultant'
  | 'users_view_notes'
  | 'events_manage'
  | 'seminars_manage'
  | 'success_stories_manage'
  | 'analytics_view'
  | 'leads_manage'
  | 'consultation_requests'
  | 'team_management'
  | 'audit_logs'
  | 'system_settings'
  | 'notifications_manage';

/**
 * Permission matrix: Role -> Section -> Allowed
 */
const PERMISSION_MATRIX: Record<UserRole, Set<PermissionSection>> = {
  SUPER_ADMIN: new Set([
    'dashboard_overview',
    'programs_manage',
    'programs_create',
    'programs_delete',
    'applications_manage',
    'applications_review',
    'users_manage',
    'users_view',
    'users_assign_consultant',
    'users_view_notes',
    'events_manage',
    'seminars_manage',
    'success_stories_manage',
    'analytics_view',
    'leads_manage',
    'consultation_requests',
    'team_management',
    'audit_logs',
    'system_settings',
    'notifications_manage',
  ]),

  CONTENT_DIRECTOR: new Set([
    'dashboard_overview',
    'programs_manage',
    'programs_create',
    'programs_delete',
    'applications_manage',
    'applications_review',
    'users_view',
    'events_manage',
    'seminars_manage',
    'success_stories_manage',
    'consultation_requests',
    'notifications_manage',
  ]),

  GROWTH_MANAGER: new Set([
    'dashboard_overview',
    'success_stories_manage',
    'analytics_view',
    'leads_manage',
    'users_view',
    'applications_review',
    'consultation_requests',
    'notifications_manage',
  ]),

  CONSULTANT: new Set([
    'dashboard_overview',
    'users_view',
    'users_assign_consultant',
    'users_view_notes',
    'applications_review',
    'consultation_requests',
    'notifications_manage',
  ]),

  ADMIN: new Set([
    // Legacy admin - same as CONTENT_DIRECTOR
    'dashboard_overview',
    'programs_manage',
    'programs_create',
    'programs_delete',
    'applications_manage',
    'applications_review',
    'users_view',
    'events_manage',
    'seminars_manage',
    'success_stories_manage',
    'consultation_requests',
    'notifications_manage',
  ]),

  PARTNER: new Set([
    'dashboard_overview',
  ]),

  USER: new Set([
    // Students have no admin permissions
  ]),
};

/**
 * Check if current user can access a section
 */
export async function canAccess(section: PermissionSection): Promise<boolean> {
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

  const permissions = PERMISSION_MATRIX[user.role];
  if (!permissions) {
    return false;
  }

  return permissions.has(section);
}

/**
 * Get all accessible sections for current user
 */
export async function getAccessibleSections(): Promise<Set<PermissionSection>> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Set();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return new Set();
  }

  return PERMISSION_MATRIX[user.role] || new Set();
}

/**
 * Check multiple permissions at once
 */
export async function canAccessAny(sections: PermissionSection[]): Promise<boolean> {
  for (const section of sections) {
    if (await canAccess(section)) {
      return true;
    }
  }
  return false;
}

export async function canAccessAll(sections: PermissionSection[]): Promise<boolean> {
  for (const section of sections) {
    if (!(await canAccess(section))) {
      return false;
    }
  }
  return true;
}

/**
 * Client-side permission hook (for React components)
 * Note: This should be used carefully - always verify on server side
 */
export function usePermissions() {
  // This will be implemented as a client-side hook
  // For now, permissions are checked server-side
  return {
    canAccess: async (section: PermissionSection) => {
      const response = await fetch(`/api/permissions/check?section=${section}`);
      const data = await response.json();
      return data.allowed || false;
    },
  };
}

