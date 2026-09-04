import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const { id } = params;

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

