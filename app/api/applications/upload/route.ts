/**
 * Application File Upload API
 * Handles CV, Transcript, and Passport uploads via Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const uploadSchema = z.object({
  fileType: z.enum(['cv', 'transcript', 'passport', 'receipt']),
  applicationId: z.string().optional(), // Optional for draft applications
});

/**
 * Upload file for application
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to upload files.' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('fileType') as string | null;
    const applicationId = formData.get('applicationId') as string | null;

    // Validate input
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!fileType) {
      return NextResponse.json(
        { success: false, error: 'File type is required (cv, transcript, passport, or receipt)' },
        { status: 400 }
      );
    }

    // Validate file type
    const validatedData = uploadSchema.parse({ fileType, applicationId });

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, JPG, and PNG are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const folder = `applications/${session.user.id}/${validatedData.fileType}`;
    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';

    const uploadResult = await uploadToCloudinary(
      buffer,
      folder,
      resourceType
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileType: validatedData.fileType,
          fileName: file.name,
          fileSize: file.size,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('File upload error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

