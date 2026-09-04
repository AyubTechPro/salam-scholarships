import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

/**
 * Get seminar participants with export-ready format
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'json' or 'csv'

    const seminar = await prisma.seminar.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        date: true,
        maxParticipants: true,
        registrations: {
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

    if (!seminar) {
      return NextResponse.json(
        { success: false, error: 'Seminar not found' },
        { status: 404 }
      );
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Name', 'Email', 'Phone', 'Country', 'Registered At'];
      const rows = seminar.registrations.map((reg) => [
        `${reg.user.name || ''} ${reg.user.surname || ''}`.trim() || 'N/A',
        reg.user.email || 'N/A',
        reg.user.phoneNumber || 'N/A',
        reg.user.country || 'N/A',
        new Date(reg.registeredAt).toLocaleString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="seminar-${seminar.id}-participants.csv"`,
        },
      });
    }

    // Return JSON
    return NextResponse.json({
      success: true,
      data: {
        seminar: {
          id: seminar.id,
          title: seminar.title,
          date: seminar.date,
          maxParticipants: seminar.maxParticipants,
          currentRegistrations: seminar.registrations.length,
          capacityPercentage: Math.round((seminar.registrations.length / seminar.maxParticipants) * 100),
        },
        participants: seminar.registrations.map((reg) => ({
          id: reg.id,
          name: `${reg.user.name || ''} ${reg.user.surname || ''}`.trim() || 'N/A',
          email: reg.user.email,
          phone: reg.user.phoneNumber,
          country: reg.user.country,
          registeredAt: reg.registeredAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching seminar participants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

