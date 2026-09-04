import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
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

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Event Participants');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Surname', key: 'surname', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Telegram', key: 'telegram', width: 20 },
      { header: 'QR Code', key: 'qrCode', width: 30 },
      { header: 'Checked In', key: 'checkedIn', width: 15 },
      { header: 'Registered At', key: 'registeredAt', width: 20 },
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    event.bookings.forEach((booking) => {
      worksheet.addRow({
        id: booking.user.id,
        name: booking.user.name || '',
        surname: booking.user.surname || '',
        email: booking.user.email,
        phone: booking.user.phone || '',
        telegram: booking.user.telegramOrPhone || '',
        qrCode: booking.qrCode,
        checkedIn: booking.checkedIn ? 'Yes' : 'No',
        registeredAt: booking.createdAt.toISOString(),
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return as download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="event-${event.id}-participants.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting event participants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export participants' },
      { status: 500 }
    );
  }
}

