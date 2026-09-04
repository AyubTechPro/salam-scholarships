import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
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
  telegramSupportUsername: z.string().optional(),
  whatsappUrl: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  maintenanceMessageRu: z.string().optional(),
  maintenanceMessageTj: z.string().optional(),
  
  // Telegram Settings
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  telegramNotificationsEnabled: z.boolean().optional(),
  
  // AI Settings
  aiProvider: z.enum(['openai', 'claude']).optional().or(z.literal('')),
  aiApiKey: z.string().optional(),
  aiEnabled: z.boolean().optional(),
  
  // Branding Settings
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFontFamily: z.string().optional().or(z.literal('')),
  
  // Logo Settings
  logoUrl: z.string().url().optional().or(z.literal('')),
  logoLightUrl: z.string().url().optional().or(z.literal('')),
  logoDarkUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  
  // Analytics Settings
  googleAnalyticsId: z.string().optional().or(z.literal('')),
  
  // Hero Section Control Center
  heroTickerMode: z.enum(['AUTO', 'MANUAL']).optional(),
  heroTickerText: z.string().optional(),
  heroTickerTextRu: z.string().optional(),
  heroTickerTextTj: z.string().optional(),
  heroTickerLink: z.string().url().optional().or(z.literal('')),
  heroHeadlineWords: z.array(z.object({
    en: z.string(),
    ru: z.string(),
    tj: z.string(),
  })).optional(),
  
  // Content Management
  trustBarItems: z.array(z.object({
    icon: z.string(),
    statKey: z.string(),
    labelEn: z.string(),
    labelRu: z.string().optional(),
    labelTj: z.string().optional(),
    color: z.string(),
    order: z.number(),
  })).optional(),
  footerPhone: z.string().optional(),
  footerEmail: z.string().email().optional().or(z.literal('')),
  footerAddress: z.string().optional(),
});

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
    });

    // If no settings exist, create default with all required fields
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
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
          linkedinUrl: null,
          instagramUrl: null,
          telegramChannelUrl: null,
          telegramSupportUsername: null,
          whatsappUrl: null,
          contactEmail: null,
          maintenanceMode: false,
          maintenanceMessage: null,
          maintenanceMessageRu: null,
          maintenanceMessageTj: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}

export async function PATCH(request: NextRequest) {
  try {
    // Allow both SUPER_ADMIN and GROWTH_MANAGER for social links
    const superAdminResult = await requireSuperAdminAPI();
    const growthMgrResult = await requireGrowthManagerAPI();
    
    if (superAdminResult.error && growthMgrResult.error) {
      return superAdminResult.error; // Return first error
    }
    
    const { user } = superAdminResult.error ? growthMgrResult : superAdminResult;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Check if user is trying to update social links only (GROWTH_MANAGER can only update social links)
    const isSocialLinksOnly = Object.keys(body).every((key) =>
      ['instagramUrl', 'telegramChannelUrl', 'telegramSupportUsername', 'whatsappUrl', 'linkedinUrl'].includes(key)
    );
    
    // GROWTH_MANAGER can only update social links, not other settings
    if (user.role === 'GROWTH_MANAGER' && !isSocialLinksOnly) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: GROWTH_MANAGER can only update social links' },
        { status: 403 }
      );
    }

    const validatedData = siteSettingsSchema.parse(body);

    // Clean up empty strings to null
    const updateData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value !== undefined) {
        updateData[key] = value === '' ? null : value;
      }
    });

    // Update or create settings
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        siteName: updateData.siteName || 'Salam Scholarships',
        primaryColor: updateData.primaryColor || '#0a192f',
        secondaryColor: updateData.secondaryColor || '#1e3a5f',
        accentColor: updateData.accentColor || '#eab308',
        fontFamily: updateData.fontFamily || 'Inter, sans-serif',
        ...updateData,
      },
    });

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

