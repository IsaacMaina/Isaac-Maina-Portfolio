// src/lib/image-service.ts
// This service can be used throughout the app to handle Supabase image URLs

import { createClient } from '@supabase/supabase-js';

export class ImageService {
  private static instance: ImageService;
  private supabase: any;

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use the ANON key

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables are not set in .env.local');
      // For development, we'll still create a client but it might not work properly
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Get the public URL for a Supabase storage file
   */
  getPublicUrl(filePath: string, bucketName: string = 'Images'): string | null {
    if (!filePath) return null;

    // If it's already a full URL, return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not set');
      return null;
    }

    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

    // Construct the public URL
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`;
  }

  /**
   * Generate a signed URL for a Supabase storage file (useful for private files)
   */
  async generateSignedUrl(filePath: string, expiresIn: number = 3600, bucketName: string = 'Images'): Promise<string | null> {
    if (!this.supabase) {
      console.error('Supabase client not initialized. Check your environment variables.');
      return null;
    }

    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error.message);
        return null;
      }

      return data?.signedUrl || null;
    } catch (error: any) {
      console.error('Unexpected error generating signed URL:', error?.message || error);
      return null;
    }
  }

  /**
   * Get the public URL, with fallback to signed URL if public doesn't work
   */
  async getOptimalUrl(filePath: string, bucketName: string = 'Images'): Promise<string | null> {
    if (!filePath) return null;

    // If it's already a full URL, return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }

    // Try to get public URL first
    const publicUrl = this.getPublicUrl(filePath, bucketName);
    if (publicUrl) {
      return publicUrl;
    }

    // If public URL fails, try to generate a signed URL
    return await this.generateSignedUrl(filePath, 3600, bucketName);
  }
}

// Get a singleton instance of the service
export const imageService = ImageService.getInstance();