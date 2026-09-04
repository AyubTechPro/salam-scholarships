import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  // Simplified profile fields
  name: z.string().min(1).optional(),
  surname: z.string().optional(),
  profession: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  educationPlace: z.string().optional(),
  languageLevel: z.string().optional(),
  telegramOrPhone: z.string().optional(),
  bio: z.string().optional(),
  preferredCountries: z.array(z.string()).optional(),
  preferredFields: z.array(z.string()).optional(),
  cvUrl: z.string().optional(),
  passportUrl: z.string().optional(),
  transcriptUrl: z.string().optional(),
  identitySelfieUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        image: true,
        profession: true,
        city: true,
        country: true,
        educationPlace: true,
        languageLevel: true,
        telegramOrPhone: true,
        bio: true,
        emailVerified: true,
        profileStatus: true,
        academicHistory: true,
        profileCompletionPercentage: true,
        cvUrl: true,
        passportUrl: true,
        transcriptUrl: true,
        identitySelfieUrl: true,
        isVerified: true,
        applicationTokens: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        surname: true,
        profession: true,
        city: true,
        country: true,
        educationPlace: true,
        languageLevel: true,
        telegramOrPhone: true,
        bio: true,
        image: true,
        profileCompletionPercentage: true,
        phone: true,
        fieldOfInterest: true,
        targetDestinations: true,
        languageScores: true,
        cvUrl: true,
        passportUrl: true,
        transcriptUrl: true,
        identitySelfieUrl: true,
        isVerified: true,
        applicationTokens: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Merge validated data with current data
    const mergedData = {
      ...(validatedData.name !== undefined && { name: validatedData.name }),
      ...(validatedData.surname !== undefined && { surname: validatedData.surname }),
      ...(validatedData.profession !== undefined && { profession: validatedData.profession }),
      ...(validatedData.city !== undefined && { city: validatedData.city }),
      ...(validatedData.country !== undefined && { country: validatedData.country }),
      ...(validatedData.educationPlace !== undefined && { educationPlace: validatedData.educationPlace }),
      ...(validatedData.languageLevel !== undefined && { languageLevel: validatedData.languageLevel }),
      ...(validatedData.telegramOrPhone !== undefined && { telegramOrPhone: validatedData.telegramOrPhone }),
      ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
      ...(validatedData.preferredCountries !== undefined && { preferredCountries: validatedData.preferredCountries }),
      ...(validatedData.preferredFields !== undefined && { preferredFields: validatedData.preferredFields }),
      ...(validatedData.cvUrl !== undefined && { cvUrl: validatedData.cvUrl }),
      ...(validatedData.passportUrl !== undefined && { passportUrl: validatedData.passportUrl }),
      ...(validatedData.transcriptUrl !== undefined && { transcriptUrl: validatedData.transcriptUrl }),
      ...(validatedData.identitySelfieUrl !== undefined && { identitySelfieUrl: validatedData.identitySelfieUrl }),
    };

    // Calculate profile completion percentage based on simplified fields
    const finalData = {
      ...currentUser,
      ...mergedData,
    };

    let completionScore = 0;
    const totalFields = 8; // name, surname, profession, city, country, educationPlace, languageLevel, telegramOrPhone

    if (finalData.name) completionScore++;
    if (finalData.surname) completionScore++;
    if (finalData.profession) completionScore++;
    if (finalData.city) completionScore++;
    if (finalData.country) completionScore++;
    if (finalData.educationPlace) completionScore++;
    if (finalData.languageLevel) completionScore++;
    if (finalData.telegramOrPhone) completionScore++;

    const newCompletionPercentage = Math.round((completionScore / totalFields) * 100);
    const previousCompletionPercentage = currentUser.profileCompletionPercentage || 0;

    // Update user with simplified profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...mergedData,
        profileCompletionPercentage: newCompletionPercentage,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        image: true,
        profession: true,
        city: true,
        country: true,
        educationPlace: true,
        languageLevel: true,
        telegramOrPhone: true,
        bio: true,
        profileStatus: true,
        profileCompletionPercentage: true,
        cvUrl: true,
        passportUrl: true,
        transcriptUrl: true,
        identitySelfieUrl: true,
        isVerified: true,
        applicationTokens: true,
      },
    });

    // Notify Admin when profile reaches 100% completion
    if (newCompletionPercentage === 100 && previousCompletionPercentage < 100) {
      // Get all admins and consultants
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['SUPER_ADMIN', 'GROWTH_MANAGER', 'CONSULTANT'],
          },
        },
        select: { id: true },
      });

      // Create notifications for admins
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'PROFILE_COMPLETE',
            title: 'Student Profile Completed! ✅',
            message: `${updatedUser.name || updatedUser.email} has completed their profile to 100%. Ready for consultation!`,
            link: `/admin/users?userId=${updatedUser.id}`,
            priority: 'NORMAL',
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

