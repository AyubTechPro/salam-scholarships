import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logUserActivity } from '@/lib/user-activity';

const saveProgramSchema = z.object({
  programId: z.string().min(1, 'Program ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { programId } = saveProgramSchema.parse(body);

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedProgram.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: programId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Program already saved' },
        { status: 400 }
      );
    }

    // Save program
    const savedProgram = await prisma.savedProgram.create({
      data: {
        userId: session.user.id,
        programId: programId,
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            titleRu: true,
            titleTj: true,
            country: true,
            imageUrl: true,
            deadline: true,
            category: true,
            level: true,
          },
        },
      },
    });

    // Log activity
    await logUserActivity(
      session.user.id,
      'SAVE',
      'PROGRAM',
      programId,
      {
        title: savedProgram.program.title,
        country: savedProgram.program.country,
        category: savedProgram.program.category,
        level: savedProgram.program.level,
      }
    );

    return NextResponse.json({
      success: true,
      data: savedProgram,
      message: 'Program saved successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Program already saved' },
        { status: 400 }
      );
    }

    console.error('Error saving program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save program' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const savedPrograms = await prisma.savedProgram.findMany({
      where: { userId: session.user.id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            titleRu: true,
            titleTj: true,
            country: true,
            imageUrl: true,
            deadline: true,
            level: true,
            category: true,
            fundingType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: savedPrograms,
    });
  } catch (error) {
    console.error('Error fetching saved programs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved programs' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      return NextResponse.json(
        { success: false, error: 'Program ID is required' },
        { status: 400 }
      );
    }

    await prisma.savedProgram.delete({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: programId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Program removed from saved list',
    });
  } catch (error) {
    console.error('Error removing saved program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove program' },
      { status: 500 }
    );
  }
}

