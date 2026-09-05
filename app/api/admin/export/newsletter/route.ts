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

    // Fetch newsletter subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    if (format === 'csv') {
      const headers = [
        'ID',
        'Email',
        'Name',
        'Locale',
        'Is Active',
        'Subscribed At',
        'Unsubscribed At',
      ];

      const csvData = subscribers.map(sub => ({
        'ID': sub.id,
        'Email': sub.email,
        'Name': sub.name || '',
        'Locale': sub.locale,
        'Is Active': sub.isActive ? 'Yes' : 'No',
        'Subscribed At': sub.subscribedAt.toISOString(),
        'Unsubscribed At': sub.unsubscribedAt ? sub.unsubscribedAt.toISOString() : '',
      }));

      const csv = arrayToCSV(csvData, headers);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Excel format
      const headers = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Locale', key: 'locale', width: 10 },
        { header: 'Is Active', key: 'isActive', width: 12 },
        { header: 'Subscribed At', key: 'subscribedAt', width: 25 },
        { header: 'Unsubscribed At', key: 'unsubscribedAt', width: 25 },
      ];

      const excelData = subscribers.map(sub => ({
        id: sub.id,
        email: sub.email,
        name: sub.name || '',
        locale: sub.locale,
        isActive: sub.isActive ? 'Yes' : 'No',
        subscribedAt: sub.subscribedAt.toISOString(),
        unsubscribedAt: sub.unsubscribedAt ? sub.unsubscribedAt.toISOString() : '',
      }));

      const buffer = await exportToExcel(excelData, headers, `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.xlsx`);

      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting newsletter subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export newsletter subscribers' },
      { status: 500 }
    );
  }
}

