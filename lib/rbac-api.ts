import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

/**
 * API-Safe RBAC Functions
 * 
 * These functions return NextResponse errors instead of redirecting,
 * which is required for API routes.
 */

/**
 * Require authentication for API routes
 */
export async function requireAuthAPI() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
      user: null,
      session: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      ),
      user: null,
      session: null,
    };
  }

  return { error: null, user, session };
}

/**
 * Require Super Admin access for API routes
 */
export async function requireSuperAdminAPI() {
  const authResult = await requireAuthAPI();
  if (authResult.error) return authResult;

  const { user } = authResult;

  if (user!.role !== 'SUPER_ADMIN') {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden: Super Admin access required' },
        { status: 403 }
      ),
      user: null,
      session: null,
    };
  }

  return authResult;
}

/**
 * Require Content Director access (or Super Admin) for API routes
 */
export async function requireContentDirectorAPI() {
  const authResult = await requireAuthAPI();
  if (authResult.error) return authResult;

  const { user } = authResult;
  const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'CONTENT_DIRECTOR', 'ADMIN'];

  if (!allowedRoles.includes(user!.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden: Content Director access required' },
        { status: 403 }
      ),
      user: null,
      session: null,
    };
  }

  return authResult;
}

/**
 * Require Growth Manager access (or Super Admin) for API routes
 */
export async function requireGrowthManagerAPI() {
  const authResult = await requireAuthAPI();
  if (authResult.error) return authResult;

  const { user } = authResult;
  const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'GROWTH_MANAGER'];

  if (!allowedRoles.includes(user!.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden: Growth Manager access required' },
        { status: 403 }
      ),
      user: null,
      session: null,
    };
  }

  return authResult;
}

/**
 * Require any admin role for API routes
 */
export async function requireAnyAdminAPI() {
  const authResult = await requireAuthAPI();
  if (authResult.error) return authResult;

  const { user } = authResult;
  const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'CONSULTANT', 'ADMIN'];

  if (!allowedRoles.includes(user!.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      ),
      user: null,
      session: null,
    };
  }

  return authResult;
}

/**
 * Require Consultant access (or Super Admin) for API routes
 */
export async function requireConsultantAPI() {
  const authResult = await requireAuthAPI();
  if (authResult.error) return authResult;

  const { user } = authResult;
  const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'CONSULTANT'];

  if (!allowedRoles.includes(user!.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden: Consultant access required' },
        { status: 403 }
      ),
      user: null,
      session: null,
    };
  }

  return authResult;
}
