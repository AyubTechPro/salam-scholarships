/**
 * Export Applications API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { exportToExcel, arrayToCSV } from '@/lib/export';

export async function GET(request: NextRequest) {
  try {
    // SUPER_ADMIN or GROWTH_MANAGER can export
    const superAdminResult = await requireSuperAdminAPI();
    let user;
    
    if (!superAdminResult.error && superAdminResult.user) {
      user = superAdminResult.user;
    } else {
      const growthManagerResult = await requireGrowthManagerAPI();
      if (growthManagerResult.error) return growthManagerResult.error;
      if (!growthManagerResult.user) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      user = growthManagerResult.user;
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'excel') as 'csv' | 'excel';

    // Fetch applications
    const applications = await prisma.application.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
            surname: true,
          },
        },
        program: {
          select: {
            title: true,
            country: true,
            institution: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const headers = [
        'ID',
        'Student Email',
        'Student Name',
        'Program Title',
        'Country',
        'Institution',
        'Status',
        'Submitted At',
        'Reviewed At',
      ];

      const csvData = applications.map(app => ({
        'ID': app.id,
        'Student Email': app.user.email,
        'Student Name': `${app.user.name || ''} ${app.user.surname || ''}`.trim(),
        'Program Title': app.program.title,
        'Country': app.program.country,
        'Institution': app.program.institution,
        'Status': app.status,
        'Submitted At': app.submittedAt?.toISOString() || '',
        'Reviewed At': app.reviewedAt?.toISOString() || '',
      }));

      const csv = arrayToCSV(csvData, headers);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="applications-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      const excelBuffer = await exportToExcel(
        applications.map(app => ({
          'ID': app.id,
          'Student Email': app.user.email,
          'Student Name': `${app.user.name || ''} ${app.user.surname || ''}`.trim(),
          'Program Title': app.program.title,
          'Country': app.program.country,
          'Institution': app.program.institution,
          'Status': app.status,
          'Submitted At': app.submittedAt?.toISOString() || '',
          'Reviewed At': app.reviewedAt?.toISOString() || '',
        })),
        [
          { header: 'ID', key: 'ID', width: 30 },
          { header: 'Student Email', key: 'Student Email', width: 30 },
          { header: 'Student Name', key: 'Student Name', width: 25 },
          { header: 'Program Title', key: 'Program Title', width: 40 },
          { header: 'Country', key: 'Country', width: 15 },
          { header: 'Institution', key: 'Institution', width: 30 },
          { header: 'Status', key: 'Status', width: 15 },
          { header: 'Submitted At', key: 'Submitted At', width: 25 },
          { header: 'Reviewed At', key: 'Reviewed At', width: 25 },
        ],
        'applications-export.xlsx'
      );

      return new NextResponse(excelBuffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="applications-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('Export applications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export applications' },
      { status: 500 }
    );
  }
}

