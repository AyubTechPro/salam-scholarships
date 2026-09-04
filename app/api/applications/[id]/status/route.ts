import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Read the form data
    const formData = await request.formData();
    const status = formData.get('status') as ApplicationStatus;

    if (!['ACCEPTED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Verify if partner owns this application
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        program: true,
      }
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application Not Found' }, { status: 404 });
    }

    // Ensure the current user has permission (is ADMIN or the corresponding PARTNER)
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, partnerId: true }
    });

    const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';
    const isOwnerPartner = dbUser?.partnerId === application.program.partnerId;

    if (!isAdmin && !isOwnerPartner) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Update the status
    await prisma.application.update({
      where: { id: params.id },
      data: { status }
    });

    // Extract the locale from the referer to redirect correctly
    const referer = request.headers.get('referer');
    const redirectUrl = referer || '/en/partner/applicants';

    // Redirect the user back to the applicants page
    return NextResponse.redirect(redirectUrl, 303);
    
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
