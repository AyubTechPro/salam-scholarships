/**
 * Helper functions for role-based access control
 * These are simpler wrappers for common permission checks
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireRoleOrRedirect(
  allowedRoles: string[],
  locale: string = 'tj',
  redirectTo: string = '/admin/access-denied'
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const userRole = session.user.role || 'USER';
  
  // SUPER_ADMIN has access to everything
  if (userRole === 'SUPER_ADMIN') {
    return session;
  }

  // Check if user role is in allowed roles
  if (allowedRoles.includes(userRole)) {
    return session;
  }

  // Redirect to access denied
  redirect(`/${locale}${redirectTo}`);
}

