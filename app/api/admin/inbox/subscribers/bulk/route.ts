import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = bulkDeleteSchema.parse(body);

    await prisma.newsletterSubscriber.deleteMany({
      where: {
        id: { in: validatedData.ids },
      },
    });

    return NextResponse.json({ success: true, message: 'Subscribers deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error bulk deleting subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscribers' },
      { status: 500 }
    );
  }
}

