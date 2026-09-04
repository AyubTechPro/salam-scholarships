import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { z } from 'zod';

const siteSettingsSchema = z.object({
  siteName: z.string().optional(),
  siteNameRu: z.string().optional(),
  siteNameTj: z.string().optional(),
  supportEmail: z.string().email().optional().or(z.literal('')),
  supportPhone: z.string().optional(),
  officeAddress: z.string().optional(),
  officeAddressRu: z.string().optional(),
  officeAddressTj: z.string().optional(),
  footerText: z.string().optional(),
  footerTextRu: z.string().optional(),
  footerTextTj: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  telegramChannelUrl: z.string().url().optional().or(z.literal('')),
  telegramSupportUsername: z.string().optional().or(z.literal('')),
  whatsappUrl: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  maintenanceMessageRu: z.string().optional(),
  maintenanceMessageTj: z.string().optional(),
});

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
    });

    // If no settings exist, return defaults with all fields
    if (!settings) {
      const defaults = {
        id: 'global',
        siteName: 'Salam Scholarships',
        siteNameRu: null,
        siteNameTj: null,
        supportEmail: null,
        supportPhone: null,
        officeAddress: null,
        officeAddressRu: null,
        officeAddressTj: null,
        footerText: null,
        footerTextRu: null,
        footerTextTj: null,
        logoUrl: null,
        faviconUrl: null,
        primaryColor: '#0a192f',
        secondaryColor: '#1e3a5f',
        accentColor: '#eab308',
        fontFamily: 'Inter, sans-serif',
        headingFontFamily: null,
        linkedinUrl: null,
        instagramUrl: null,
        telegramChannelUrl: null,
        telegramSupportUsername: null,
        whatsappUrl: null,
        contactEmail: null,
        telegramBotToken: null,
        telegramChatId: null,
        telegramNotificationsEnabled: false,
        aiProvider: null,
        aiApiKey: null,
        aiEnabled: false,
        maintenanceMode: false,
        maintenanceMessage: null,
        maintenanceMessageRu: null,
        maintenanceMessageTj: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      settings = defaults;
    }

    const session = await getServerSession(authOptions);
    let isAdmin = false;
    if (session?.user?.id) {
      const u = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      isAdmin = !!u && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_DIRECTOR'].includes(u.role);
    }

    const sensitiveKeys = ['aiApiKey', 'telegramBotToken', 'telegramChatId'];
    const data = isAdmin ? settings : (() => {
      const s = { ...settings } as Record<string, unknown>;
      sensitiveKeys.forEach((k) => delete s[k]);
      return s;
    })();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminResult = await requireSuperAdminAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only Super Admins can update site settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = siteSettingsSchema.parse(body);

    // Clean empty strings to null
    const cleanedData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      cleanedData[key] = value === '' ? null : value;
    });

    // Upsert settings
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'global' },
      update: cleanedData,
      create: {
        id: 'global',
        ...cleanedData,
      },
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'SITE_SETTINGS',
      'global',
      'Updated site settings',
      cleanedData
    );

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Site settings updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

