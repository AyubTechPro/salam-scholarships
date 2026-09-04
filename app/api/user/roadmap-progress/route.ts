/**
 * Live Roadmap Progress API
 * Scans the database in real-time to calculate user progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch all data in parallel for optimal performance
    const [user, savedPrograms, applications, watchedVideos] = await Promise.all([
      // Get user profile data
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          profession: true,
          city: true,
          telegramOrPhone: true,
          name: true,
          surname: true,
          image: true,
          bio: true,
        },
      }),
      // Count saved programs
      prisma.savedProgram.count({
        where: { userId },
      }),
      // Get applications with document info
      prisma.application.findMany({
        where: { userId },
        select: {
          cvUrl: true,
          motivationLetter: true,
          status: true,
        },
        take: 1, // Just need to check if they have documents
      }),
      // Check if user has watched any videos (via UserActivity)
      prisma.userActivity.findFirst({
        where: {
          userId,
          activityType: 'VIEW',
          entityType: 'VIDEO',
        },
        select: {
          id: true,
        },
      }),
    ]);

    const hasName = !!(user?.name && user?.surname);
    const hasImage = !!user?.image;
    const hasBio = !!user?.bio;

    // Calculate profile completion percentage (name, surname, profession, city, image, bio)
    const profileFields = [
      hasName,
      !!user?.profession,
      !!user?.city,
      hasImage,
      hasBio,
    ];
    const profileCompletionPercentage = Math.round(
      (profileFields.filter(Boolean).length / profileFields.length) * 100
    );

    // Step 1: Complete Profile - Check if strictly 100%
    const profileComplete = profileCompletionPercentage === 100;

    // Step 2: Connect Telegram - Check if telegramOrPhone exists
    const hasTelegram = !!(user?.telegramOrPhone && user.telegramOrPhone.trim().length > 0);

    // Step 3: First Save - Check if user has any SavedProgram
    const hasFirstSave = savedPrograms > 0;

    // Step 4: First Application - Check if user has any application
    const hasApplication = applications.length > 0;
    
    // Additional steps: CV and Motivation Letter
    const hasCV = applications.some(app => !!app.cvUrl);
    const hasMotivationLetter = applications.some(app => !!app.motivationLetter && app.motivationLetter.trim().length > 0);
    
    // Check if user has watched videos
    const hasWatchedVideo = !!watchedVideos;

    // Calculate progress (now includes 7 steps)
    const steps = [
      { id: 'profile', completed: profileComplete, progress: profileCompletionPercentage },
      { id: 'telegram', completed: hasTelegram },
      { id: 'video', completed: hasWatchedVideo },
      { id: 'cv', completed: hasCV },
      { id: 'motivationLetter', completed: hasMotivationLetter },
      { id: 'firstSave', completed: hasFirstSave },
      { id: 'application', completed: hasApplication },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    // Calculate progress percentage (weighted: profile completion contributes more)
    const profileProgress = profileComplete ? 100 : profileCompletionPercentage;
    const totalProgress = (
      (profileProgress * 0.18) + // Profile: 18% weight
      (hasTelegram ? 100 : 0) * 0.14 + // Telegram: 14% weight
      (hasWatchedVideo ? 100 : 0) * 0.14 + // Video: 14% weight
      (hasCV ? 100 : 0) * 0.14 + // CV: 14% weight
      (hasMotivationLetter ? 100 : 0) * 0.14 + // Motivation Letter: 14% weight
      (hasFirstSave ? 100 : 0) * 0.13 + // First Save: 13% weight
      (hasApplication ? 100 : 0) * 0.13 // Application: 13% weight
    );
    const progressPercentage = Math.round(totalProgress);

    return NextResponse.json({
      success: true,
      data: {
        steps,
        completedCount,
        totalSteps: steps.length,
        progressPercentage,
        details: {
          profile: {
            completed: profileComplete,
            progress: profileCompletionPercentage,
            hasName: hasName,
            hasProfession: !!user?.profession,
            hasCity: !!user?.city,
            hasImage: hasImage,
            hasBio: hasBio,
          },
          telegram: {
            completed: hasTelegram,
            hasTelegram: hasTelegram,
          },
          video: {
            completed: hasWatchedVideo,
            hasWatchedVideo: hasWatchedVideo,
          },
          cv: {
            completed: hasCV,
            hasCV: hasCV,
          },
          motivationLetter: {
            completed: hasMotivationLetter,
            hasMotivationLetter: hasMotivationLetter,
          },
          firstSave: {
            completed: hasFirstSave,
            count: savedPrograms,
          },
          application: {
            completed: hasApplication,
            count: applications.length,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching roadmap progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roadmap progress' },
      { status: 500 }
    );
  }
}

