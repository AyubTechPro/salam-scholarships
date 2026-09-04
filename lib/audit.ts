import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { logAuditAction } from './rbac';

/**
 * Audit Trail Helper
 * Automatically logs actions with user context
 */

export async function auditAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  entityType: string,
  entityId?: string,
  description?: string,
  metadata?: Record<string, any>
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    // Audit action attempted without user session
    return;
  }

  await logAuditAction(
    session.user.id,
    action,
    entityType,
    entityId,
    description,
    metadata
  );
}

/**
 * Convenience functions for common audit actions
 */
export const audit = {
  program: {
    created: (programId: string, title: string) =>
      auditAction('CREATE', 'PROGRAM', programId, `Created program: ${title}`),
    
    updated: (programId: string, title: string) =>
      auditAction('UPDATE', 'PROGRAM', programId, `Updated program: ${title}`),
    
    deleted: (programId: string, title: string) =>
      auditAction('DELETE', 'PROGRAM', programId, `Deleted program: ${title}`),
  },
  
  user: {
    created: (userId: string, email: string) =>
      auditAction('CREATE', 'USER', userId, `Created user: ${email}`),
    
    updated: (userId: string, email: string) =>
      auditAction('UPDATE', 'USER', userId, `Updated user: ${email}`),
    
    deleted: (userId: string, email: string) =>
      auditAction('DELETE', 'USER', userId, `Deleted user: ${email}`),
    
    roleChanged: (userId: string, oldRole: string, newRole: string) =>
      auditAction('UPDATE', 'USER', userId, `Changed role from ${oldRole} to ${newRole}`),
  },
  
  application: {
    created: (applicationId: string, programId: string) =>
      auditAction('CREATE', 'APPLICATION', applicationId, `Created application for program ${programId}`),
    
    statusChanged: (applicationId: string, oldStatus: string, newStatus: string) =>
      auditAction('UPDATE', 'APPLICATION', applicationId, `Changed status from ${oldStatus} to ${newStatus}`),
  },
  
  event: {
    created: (eventId: string, title: string) =>
      auditAction('CREATE', 'EVENT', eventId, `Created event: ${title}`),
    
    updated: (eventId: string, title: string) =>
      auditAction('UPDATE', 'EVENT', eventId, `Updated event: ${title}`),
    
    deleted: (eventId: string, title: string) =>
      auditAction('DELETE', 'EVENT', eventId, `Deleted event: ${title}`),
  },
};

