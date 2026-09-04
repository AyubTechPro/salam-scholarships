import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Image upload service not configured' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'salam_consulting_profiles';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with circular crop transformation
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        fileBuffer,
        folder,
        'image'
      );
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Update user's profile picture
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: uploadResult.secure_url,
      },
      select: {
        id: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
      message: 'Profile picture updated successfully',
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

