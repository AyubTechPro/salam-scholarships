import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createNotification } from '@/lib/rbac';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'File upload service not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['CV', 'TRANSCRIPT', 'CERTIFICATE', 'OTHER'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Determine resource type based on file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension);
    const resourceType = isImage ? 'image' : 'raw';

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        fileBuffer,
        `salam_consulting_docs/${type.toLowerCase()}`,
        resourceType
      );
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file to cloud storage' },
        { status: 500 }
      );
    }

    // Document model was removed during privacy purge
    // File upload is still supported for profile pictures and other non-sensitive content
    // But document storage in database has been removed
    
    // For profile pictures, update user.image directly
    if (type === 'PROFILE_PICTURE' || type === 'IMAGE') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          image: uploadResult.secure_url,
        },
      });
    }
    
    // Return upload result without creating document record
    const document = {
      id: 'deprecated',
      userId: session.user.id,
      type: type,
      fileName: file.name,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileSize: uploadResult.bytes,
      mimeType: file.type,
      isVerified: false,
      createdAt: new Date(),
    };

    // Create notification for team (especially consultants)
    await createNotification(
      null, // All admins
      'TEAM',
      'New Document Uploaded',
      `${session.user.name || session.user.email} uploaded a ${type}`,
      `/admin/documents?userId=${session.user.id}`,
      'NORMAL'
    );

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document uploaded successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
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

    // Document model was removed during privacy purge
    // Return empty array for backward compatibility
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Document management has been removed for privacy reasons.',
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
