import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

/**
 * Get event participants with export-ready format
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'json', 'csv', or 'excel'

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        startDate: true,
        maxParticipants: true,
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phoneNumber: true,
                country: true,
              },
            },
          },
          orderBy: { registeredAt: 'asc' },
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
      // Generate CSV
      const headers = ['Name', 'Email', 'Phone', 'Country', 'Registered At'];
      const rows = event.bookings.map((booking) => [
        `${booking.user.name || ''} ${booking.user.surname || ''}`.trim() || 'N/A',
        booking.user.email || 'N/A',
        booking.user.phoneNumber || 'N/A',
        booking.user.country || 'N/A',
        new Date(booking.registeredAt || booking.createdAt).toLocaleString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="event-${event.id}-participants.csv"`,
        },
      });
    }

    if (format === 'excel') {
      // Generate Excel using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Participants');

      // Set column headers
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Country', key: 'country', width: 20 },
        { header: 'Registered At', key: 'registeredAt', width: 25 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEAB308' }, // Brand gold color
      };

      // Add data rows
      event.bookings.forEach((booking) => {
        worksheet.addRow({
          name: `${booking.user.name || ''} ${booking.user.surname || ''}`.trim() || 'N/A',
          email: booking.user.email || 'N/A',
          phone: booking.user.phoneNumber || 'N/A',
          country: booking.user.country || 'N/A',
          registeredAt: new Date(booking.registeredAt || booking.createdAt).toLocaleString(),
        });
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="event-${event.id}-participants.xlsx"`,
        },
      });
    }

    // Return JSON
    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          maxParticipants: event.maxParticipants,
          currentRegistrations: event.bookings.length,
          capacityPercentage: event.maxParticipants
            ? Math.round((event.bookings.length / event.maxParticipants) * 100)
            : 0,
        },
        participants: event.bookings.map((booking) => ({
          id: booking.id,
          name: `${booking.user.name || ''} ${booking.user.surname || ''}`.trim() || 'N/A',
          email: booking.user.email,
          phone: booking.user.phoneNumber,
          country: booking.user.country,
          registeredAt: booking.registeredAt || booking.createdAt,
          checkedIn: booking.checkedIn,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

