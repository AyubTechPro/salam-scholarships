/**
 * Export Users API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { exportToExcel, arrayToCSV } from '@/lib/export';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireSuperAdminAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'excel') as 'csv' | 'excel';

    // Fetch users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        profession: true,
        city: true,
        country: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
        profileCompletionPercentage: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const headers = [
        'ID',
        'Email',
        'Name',
        'Surname',
        'Profession',
        'City',
        'Country',
        'Role',
        'Language',
        'Profile Completion %',
        'Created At',
      ];

      const csvData = users.map(user => ({
        'ID': user.id,
        'Email': user.email,
        'Name': user.name || '',
        'Surname': user.surname || '',
        'Profession': user.profession || '',
        'City': user.city || '',
        'Country': user.country || '',
        'Role': user.role,
        'Language': user.preferredLanguage,
        'Profile Completion %': user.profileCompletionPercentage,
        'Created At': user.createdAt.toISOString(),
      }));

      const csv = arrayToCSV(csvData, headers);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Excel format
      const excelBuffer = await exportToExcel(
        users.map(user => ({
          'ID': user.id,
          'Email': user.email,
          'Name': user.name || '',
          'Surname': user.surname || '',
          'Profession': user.profession || '',
          'City': user.city || '',
          'Country': user.country || '',
          'Role': user.role,
          'Language': user.preferredLanguage,
          'Profile Completion %': user.profileCompletionPercentage,
          'Created At': user.createdAt.toISOString(),
        })),
        [
          { header: 'ID', key: 'ID', width: 30 },
          { header: 'Email', key: 'Email', width: 30 },
          { header: 'Name', key: 'Name', width: 20 },
          { header: 'Surname', key: 'Surname', width: 20 },
          { header: 'Profession', key: 'Profession', width: 20 },
          { header: 'City', key: 'City', width: 15 },
          { header: 'Country', key: 'Country', width: 15 },
          { header: 'Role', key: 'Role', width: 15 },
          { header: 'Language', key: 'Language', width: 10 },
          { header: 'Profile Completion %', key: 'Profile Completion %', width: 20 },
          { header: 'Created At', key: 'Created At', width: 25 },
        ],
        'users-export.xlsx'
      );

      return new NextResponse(excelBuffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('Export users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export users' },
      { status: 500 }
    );
  }
}

