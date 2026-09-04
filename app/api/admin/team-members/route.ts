import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const teamMemberSchema = z.object({
  name: z.string().min(1),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  role: z.string().min(1),
  roleRu: z.string().optional(),
  roleTj: z.string().optional(),
  photo: z.string().url(),
  instagram: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  telegram: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const cleanedData: any = {};
    Object.keys(body).forEach((key) => {
      const value = (body as any)[key];
      cleanedData[key] = value === '' ? null : value;
    });
    const validatedData = teamMemberSchema.parse(cleanedData);

    const member = await prisma.teamMember.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'TEAM_MEMBER',
      member.id,
      `Created team member: ${member.name}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: member,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...restData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const cleanedData: any = {};
    Object.keys(restData).forEach((key) => {
      const value = (restData as any)[key];
      cleanedData[key] = value === '' ? null : value;
    });
    const validatedData = teamMemberSchema.partial().parse(cleanedData);

    const member = await prisma.teamMember.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'TEAM_MEMBER',
      member.id,
      `Updated team member: ${member.name}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.delete({
      where: { id },
    });

    await logAuditAction(
      adminResult.user.id,
      'DELETE',
      'TEAM_MEMBER',
      member.id,
      `Deleted team member: ${member.name}`,
      undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}

