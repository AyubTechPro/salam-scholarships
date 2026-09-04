import { v2 as cloudinary } from 'cloudinary';

/**
 * Validate and load Cloudinary credentials
 * Throws clear error if credentials are missing
 */
function validateCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    throw new Error(
      `❌ Cloudinary credentials missing in .env file: ${missing.join(', ')}\n` +
      `Please ensure all three variables are set:\n` +
      `  CLOUDINARY_CLOUD_NAME=your_cloud_name\n` +
      `  CLOUDINARY_API_KEY=your_api_key\n` +
      `  CLOUDINARY_API_SECRET=your_api_secret`
    );
  }

  return { cloudName, apiKey, apiSecret };
}

// Configure Cloudinary with validated credentials
// Note: NODE_TLS_REJECT_UNAUTHORIZED=0 must be set in .env file (not in code)
// This is only for local development - NEVER use in production
try {
  const { cloudName, apiKey, apiSecret } = validateCredentials();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true, // Force HTTPS
  });
} catch (error) {
  // Configuration error will be caught when upload is attempted
  // Cloudinary not configured
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

/**
 * Upload file to Cloudinary
 * 
 * Simplified upload with minimal parameters to ensure valid signatures.
 * Only folder and timestamp are used for signature generation.
 * Transformations can be applied later via Cloudinary URL parameters.
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'sgop-documents',
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<UploadResult> {
  // Validate credentials before upload
  const { cloudName, apiKey, apiSecret } = validateCredentials();
  
  // Re-configure to ensure credentials are set (in case module loaded before .env)
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    // Minimal upload options - ONLY folder (resource_type is handled separately by SDK)
    // The SDK will add timestamp automatically for signature
    const uploadOptions: any = {
      folder: folder.trim(),
    };

    // Only add resource_type if it's not 'auto' (default)
    if (resourceType !== 'auto') {
      uploadOptions.resource_type = resourceType;
    }

    try {
      if (Buffer.isBuffer(file)) {
        // Convert buffer to base64 string for reliable upload
        const base64String = `data:image/${resourceType === 'image' ? 'jpeg' : 'application/octet-stream'};base64,${file.toString('base64')}`;
        
        cloudinary.uploader.upload(
          base64String,
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              reject(error);
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                format: result.format || '',
                width: result.width,
                height: result.height,
                bytes: result.bytes,
              });
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          }
        );
      } else {
        // If it's a base64 string or URL
        cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              format: result.format || '',
              width: result.width,
              height: result.height,
              bytes: result.bytes,
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Generate secure download URL (signed URL with expiration)
 */
export function getSecureDownloadUrl(publicId: string, expiresIn: number = 3600): string {
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
}

