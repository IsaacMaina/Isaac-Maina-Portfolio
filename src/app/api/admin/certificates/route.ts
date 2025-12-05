// src/app/api/admin/certificates/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { createClient } from '@supabase/supabase-js';

// Define structure for a certificate
interface CertificateInfo {
  id: number;
  title: string;
  file: string;
  description: string;
  createdAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // List all files in the certificates folder
    const { data: files, error } = await supabase.storage
      .from('Images')
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
      return Response.json([], { status: 200 });
    }

    // Process files to extract metadata (title/description) stored with the file
    const certificates: CertificateInfo[] = files.map((file, index) => {
      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('Images')
        .getPublicUrl(`documents/certificates/${file.name}`);

      // Use the file metadata if available, otherwise fall back to file name
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const title = file.metadata?.title || fileNameWithoutExt;
      const description = file.metadata?.description || `Certificate file: ${file.name}`;
      
      return {
        id: Date.now() + index, // Generate temporary ID based on timestamp
        title: title,
        file: publicUrl,
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Update metadata for each certificate in storage
    if (data && Array.isArray(data)) {
      for (const cert of data) {
        if (cert.file) {
          try {
            // Extract just the path part from the URL
            // Format: https://xyz.supabase.co/storage/v1/object/public/Images/documents/certificates/filename.pdf
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            
            if (supabaseUrl && cert.file.includes(supabaseUrl)) {
              const pathStart = `${supabaseUrl}/storage/v1/object/public/Images/`;
              const filePath = cert.file.replace(pathStart, '');
              
              // Update the file's metadata in storage
              const { error: updateError } = await supabase.storage
                .from('Images')
                .updateMetadata(filePath, {
                  title: cert.title,
                  description: cert.description
                });

              if (updateError) {
                console.error('Error updating file metadata:', updateError);
                // Continue processing other files
              }
            }
          } catch (e) {
            console.error('Error processing file path for metadata update:', e);
          }
        }
      }
    }

    return Response.json({ message: 'Certificate metadata updated successfully' });
  } catch (error) {
    console.error('Error updating certificate metadata:', error);
    return Response.json({ error: 'Failed to update certificate metadata' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const data = await request.json();
    const { title, description, filePath } = data;

    if (!filePath) {
      return Response.json({ error: 'File path is required' }, { status: 400 });
    }

    // Update metadata for the existing file
    const { error } = await supabase.storage
      .from('Images')
      .updateMetadata(filePath, {
        title: title,
        description: description
      });

    if (error) {
      console.error('Error updating certificate metadata:', error);
      return Response.json({ error: 'Failed to update certificate metadata' }, { status: 500 });
    }

    return Response.json({ 
      message: 'Certificate metadata updated successfully',
      filePath: filePath
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return Response.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file } = await request.json();

    if (!file) {
      return Response.json({ error: 'File path is required' }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Extract the file path from the full URL
    let filePath = file;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (supabaseUrl && file.startsWith(supabaseUrl)) {
      const pathStart = `${supabaseUrl}/storage/v1/object/public/Images/`;
      if (file.startsWith(pathStart)) {
        filePath = file.replace(pathStart, '');
      }
    }

    // Delete the file from Supabase storage
    const { error } = await supabase.storage
      .from('Images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file from storage:', error);
      return Response.json({ error: 'Failed to delete file from storage' }, { status: 500 });
    }

    return Response.json({ message: 'Certificate file deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return Response.json({ error: 'Failed to delete certificate' }, { status: 500 });
  }
}