/**
 * Admin Activity Log API
 * Returns recent user activities for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { getRecentActivities } from '@/lib/user-activity';

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const activities = await getRecentActivities(limit);

    // Transform activities to match AdminDashboard component expectations
    const transformedActivities = activities.map((activity) => {
      // Map activityType to component type
      let type: 'user_signup' | 'program_view' | 'application' | 'consultation' = 'program_view';
      if (activity.activityType === 'APPLY') {
        type = 'application';
      } else if (activity.activityType === 'VIEW' && activity.entityType === 'PROGRAM') {
        type = 'program_view';
      } else if (activity.activityType === 'VIEW' && activity.entityType === 'PAGE') {
        type = 'consultation';
      }

      // Generate user-friendly message
      let message = '';
      const metadata = activity.metadata as any;
      const userName = activity.user?.name || 'Guest';
      
      switch (activity.activityType) {
        case 'VIEW':
          if (activity.entityType === 'PROGRAM') {
            message = `${userName} viewed ${metadata?.title || 'an opportunity'}`;
          } else {
            message = `${userName} viewed ${activity.entityType.toLowerCase()}`;
          }
          break;
        case 'SEARCH':
          message = `${userName} searched for "${metadata?.query || 'opportunities'}"`;
          break;
        case 'SAVE':
          message = `${userName} saved ${metadata?.title || 'an opportunity'}`;
          break;
        case 'APPLY':
          message = `${userName} applied to ${metadata?.programTitle || 'an opportunity'}`;
          break;
        default:
          message = `${userName} performed ${activity.activityType.toLowerCase()} action`;
      }

      return {
        id: activity.id,
        type,
        message,
        timestamp: activity.createdAt, // Use createdAt instead of timestamp
        user: activity.user ? {
          name: activity.user.name || 'Unknown',
          email: activity.user.email || '',
        } : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedActivities,
      count: transformedActivities.length,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
