import { NextRequest, NextResponse } from 'next/server';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Validate credentials first
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      const missing = [];
      if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
      if (!apiKey) missing.push('CLOUDINARY_API_KEY');
      if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
      
      console.error('❌ Cloudinary credentials missing:', missing.join(', '));
      return NextResponse.json(
        { 
          success: false, 
          error: `Cloudinary credentials missing: ${missing.join(', ')}. Please check your .env file.` 
        },
        { status: 503 }
      );
    }

    const { error } = await requireGrowthManagerAPI();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string || 'salam_consulting_docs/success_stories').trim();

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary (minimal call - only folder)
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(fileBuffer, folder, 'image');
      
      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        // Upload successful
      }
    } catch (uploadError: any) {
        // Cloudinary upload error
      
      // Check for SSL certificate errors
      if (
        uploadError?.message?.includes('UNABLE_TO_GET_ISSUER_CERT_LOCALLY') ||
        uploadError?.message?.includes('certificate') ||
        uploadError?.message?.includes('SSL') ||
        uploadError?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'
      ) {
        // SSL Certificate Error - check environment configuration
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'SSL/connectivity issue with Cloudinary. Check your network and Cloudinary credentials.' 
          },
          { status: 500 }
        );
      }
      
      // Re-throw to be caught by outer catch
      throw uploadError;
    }

    return NextResponse.json({
      success: true,
      data: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for SSL certificate errors in outer catch as well
    if (
      errorMessage.includes('UNABLE_TO_GET_ISSUER_CERT_LOCALLY') ||
      errorMessage.includes('certificate') ||
      errorMessage.includes('SSL')
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'SSL certificate error. Please add NODE_TLS_REJECT_UNAUTHORIZED=0 to your .env file for local development.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage.includes('Cloudinary') 
          ? `Cloudinary error: ${errorMessage}` 
          : 'Failed to upload image. Please check your Cloudinary credentials and try again.' 
      },
      { status: 500 }
    );
  }
}

