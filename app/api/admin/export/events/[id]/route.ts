/**
 * Export Event Registrations API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { exportToExcel, arrayToCSV } from '@/lib/export';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'excel') as 'csv' | 'excel';

    // Fetch event with bookings
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
                surname: true,
                telegramOrPhone: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (format === 'csv') {
      const headers = [
        'ID',
        'Email',
        'Name',
        'Surname',
        'Contact',
        'QR Code',
        'Checked In',
        'Registered At',
      ];

      const csvData = event.bookings.map(booking => ({
        'ID': booking.id,
        'Email': booking.user.email,
        'Name': booking.user.name || '',
        'Surname': booking.user.surname || '',
        'Contact': booking.user.telegramOrPhone || '',
        'QR Code': booking.qrCode,
        'Checked In': booking.checkedIn ? 'Yes' : 'No',
        'Registered At': booking.createdAt.toISOString(),
      }));

      const csv = arrayToCSV(csvData, headers);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="event-${event.id}-registrations-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      const excelBuffer = await exportToExcel(
        event.bookings.map(booking => ({
          'ID': booking.id,
          'Email': booking.user.email,
          'Name': booking.user.name || '',
          'Surname': booking.user.surname || '',
          'Contact': booking.user.telegramOrPhone || '',
          'QR Code': booking.qrCode,
          'Checked In': booking.checkedIn ? 'Yes' : 'No',
          'Registered At': booking.createdAt.toISOString(),
        })),
        [
          { header: 'ID', key: 'ID', width: 30 },
          { header: 'Email', key: 'Email', width: 30 },
          { header: 'Name', key: 'Name', width: 20 },
          { header: 'Surname', key: 'Surname', width: 20 },
          { header: 'Contact', key: 'Contact', width: 20 },
          { header: 'QR Code', key: 'QR Code', width: 30 },
          { header: 'Checked In', key: 'Checked In', width: 12 },
          { header: 'Registered At', key: 'Registered At', width: 25 },
        ],
        `event-${event.id}-registrations.xlsx`
      );

      return new NextResponse(excelBuffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="event-${event.id}-registrations-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('Export event registrations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export event registrations' },
      { status: 500 }
    );
  }
}

