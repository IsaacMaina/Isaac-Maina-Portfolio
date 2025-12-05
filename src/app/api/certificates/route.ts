// src/app/api/certificates/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define the certification structure
interface CertificateInfo {
  id: number;
  title: string;
  file: string;
  description: string;
  createdAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client using environment variables
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // List all files in the 'documents/certificates/' folder
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list('documents/certificates/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching certificates from Supabase storage:', error);
      return Response.json({ error: 'Failed to fetch certificates from storage' }, { status: 500 });
    }

    if (!files || files.length === 0) {
      console.log('No certificates found in Supabase storage');
      return Response.json([], { status: 200 });
    }

    // Process files to extract metadata (title/description) stored with the file
    const certificates: CertificateInfo[] = files.map((file, index) => {
      // Get the public URL for the file
      const { data } = supabase.storage
        .from('Images')
        .getPublicUrl(`documents/certificates/${file.name}`);
      const publicUrl = data?.publicUrl || '';

      // Use the file metadata if available, otherwise fall back to file name
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const title = file.metadata?.title || fileNameWithoutExt;
      const description = file.metadata?.description || `Certificate document: ${file.name}`;

      return {
        id: Date.now() + index, // Generate temporary ID based on timestamp
        title: title,
        file: publicUrl, // Use the generated public URL
        description: description,
        createdAt: file.created_at
      };
    });

    return Response.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return Response.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}