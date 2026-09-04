/**
 * Cloudinary Credentials Test Script
 * 
 * This script tests if Cloudinary credentials are valid by attempting
 * to upload a simple test image to Cloudinary.
 * 
 * Usage: npx tsx scripts/test-cloudinary.ts
 */

import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });

async function testCloudinary() {
  console.log('🧪 Testing Cloudinary Credentials...\n');

  // Check environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('📋 Environment Variables Check:');
  console.log('  CLOUDINARY_CLOUD_NAME:', cloudName ? `${cloudName.substring(0, 3)}... (${cloudName.length} chars)` : '❌ NOT SET');
  console.log('  CLOUDINARY_API_KEY:', apiKey ? `${apiKey.substring(0, 3)}... (${apiKey.length} chars)` : '❌ NOT SET');
  console.log('  CLOUDINARY_API_SECRET:', apiSecret ? `${apiSecret.substring(0, 3)}... (${apiSecret.length} chars)` : '❌ NOT SET');
  console.log('');

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ ERROR: Missing Cloudinary credentials in .env file');
    console.error('Please ensure all three variables are set:');
    console.error('  CLOUDINARY_CLOUD_NAME=...');
    console.error('  CLOUDINARY_API_KEY=...');
    console.error('  CLOUDINARY_API_SECRET=...');
    process.exit(1);
  }

  // Configure Cloudinary
  console.log('⚙️  Configuring Cloudinary...');
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log('✅ Cloudinary configured successfully\n');
  } catch (error) {
    console.error('❌ ERROR: Failed to configure Cloudinary:', error);
    process.exit(1);
  }

  // Create a simple test image (1x1 pixel PNG as base64)
  console.log('🖼️  Creating test image...');
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  const testImageDataUrl = `data:image/png;base64,${testImageBase64}`;
  console.log('✅ Test image created (1x1 pixel PNG)\n');

  // Test 1: Upload using base64 string (same method as our code)
  console.log('🚀 Test 1: Uploading test image (base64 method)...');
  try {
    const result1 = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        testImageDataUrl,
        {
          folder: 'test_uploads',
          resource_type: 'image',
          public_id: `test_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    console.log('✅ Upload successful!');
    console.log('   Public ID:', (result1 as any).public_id);
    console.log('   Secure URL:', (result1 as any).secure_url);
    console.log('   Format:', (result1 as any).format);
    console.log('   Size:', (result1 as any).bytes, 'bytes\n');

    // Clean up: Delete test image
    console.log('🧹 Cleaning up test image...');
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy((result1 as any).public_id, (error: any, result: any) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    console.log('✅ Test image deleted\n');
  } catch (error: any) {
    console.error('❌ Upload failed!');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    if (error.http_code) {
      console.error('   HTTP Code:', error.http_code);
    }
    if (error.message.includes('Invalid API Key')) {
      console.error('\n💡 SUGGESTION: Check if your API Key is correct');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n💡 SUGGESTION: Check if your API Secret is correct');
    } else if (error.message.includes('Invalid cloud_name')) {
      console.error('\n💡 SUGGESTION: Check if your Cloud Name is correct');
    }
    process.exit(1);
  }

  // Test 2: Upload using buffer (alternative method)
  console.log('🚀 Test 2: Uploading test image (buffer method)...');
  try {
    const result2 = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'test_uploads',
          resource_type: 'image',
          public_id: `test_buffer_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(testImageBuffer);
    });

    console.log('✅ Upload successful!');
    console.log('   Public ID:', (result2 as any).public_id);
    console.log('   Secure URL:', (result2 as any).secure_url);
    console.log('   Format:', (result2 as any).format);
    console.log('   Size:', (result2 as any).bytes, 'bytes\n');

    // Clean up: Delete test image
    console.log('🧹 Cleaning up test image...');
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy((result2 as any).public_id, (error: any, result: any) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    console.log('✅ Test image deleted\n');
  } catch (error: any) {
    console.error('❌ Upload failed!');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    if (error.http_code) {
      console.error('   HTTP Code:', error.http_code);
    }
    process.exit(1);
  }

  console.log('🎉 All tests passed! Cloudinary credentials are valid.');
  console.log('\n✅ Your Cloudinary setup is working correctly.');
  console.log('   If uploads still fail in the app, check:');
  console.log('   1. Server console logs for detailed error messages');
  console.log('   2. Network tab in browser DevTools');
  console.log('   3. File size limits (5MB max)');
  console.log('   4. File format (JPG, PNG, WebP only)');
}

// Run the test
testCloudinary().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

