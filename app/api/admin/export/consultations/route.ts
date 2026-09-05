export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireConsultantAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { exportToExcel, arrayToCSV } from '@/lib/export';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireConsultantAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'excel';

    // Fetch consultation requests
    const consultations = await prisma.consultationRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const headers = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'English Level',
        'Target Country',
        'Target Level',
        'Preferred Language',
        'Status',
        'Message',
        'Created At',
      ];

      const csvData = consultations.map(consultation => ({
        'ID': consultation.id,
        'Name': consultation.name,
        'Email': consultation.email,
        'Phone': consultation.phone || '',
        'English Level': consultation.englishLevel || '',
        'Target Country': consultation.targetCountry || '',
        'Target Level': consultation.targetLevel || '',
        'Preferred Language': consultation.preferredLanguage,
        'Status': consultation.status,
        'Message': consultation.message.replace(/"/g, '""'), // Escape quotes
        'Created At': consultation.createdAt.toISOString(),
      }));

      const csv = arrayToCSV(csvData, headers);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="consultations-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Excel format
      const headers = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'English Level', key: 'englishLevel', width: 15 },
        { header: 'Target Country', key: 'targetCountry', width: 20 },
        { header: 'Target Level', key: 'targetLevel', width: 15 },
        { header: 'Preferred Language', key: 'preferredLanguage', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Message', key: 'message', width: 50 },
        { header: 'Created At', key: 'createdAt', width: 25 },
      ];

      const excelData = consultations.map(consultation => ({
        id: consultation.id,
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone || '',
        englishLevel: consultation.englishLevel || '',
        targetCountry: consultation.targetCountry || '',
        targetLevel: consultation.targetLevel || '',
        preferredLanguage: consultation.preferredLanguage,
        status: consultation.status,
        message: consultation.message,
        createdAt: consultation.createdAt.toISOString(),
      }));

      const buffer = await exportToExcel(excelData, headers, `consultations-${new Date().toISOString().split('T')[0]}.xlsx`);

      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="consultations-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting consultations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export consultations' },
      { status: 500 }
    );
  }
}

