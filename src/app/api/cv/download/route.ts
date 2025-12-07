import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Look for CV/resume documents in common locations
    // This is just to provide a default download if a specific CV exists
    const possiblePaths = [
      'documents/career/CV.pdf',
      'documents/career/Resume.pdf',
      'documents/career/cv.pdf',
      'documents/career/resume.pdf',
      'documents/CV.pdf',
      'documents/Resume.pdf',
      'documents/cv.pdf',
      'documents/resume.pdf',
      'rootdocs/career/CV.pdf',
      'rootdocs/career/Resume.pdf',
      'rootdocs/career/cv.pdf',
      'rootdocs/career/resume.pdf',
      'rootdocs/CV.pdf',
      'rootdocs/Resume.pdf',
      'rootdocs/cv.pdf',
      'rootdocs/resume.pdf'
    ];

    let downloadUrl = null;
    let fileName = 'CV.pdf';

    // Try to find an existing CV file in storage
    for (const path of possiblePaths) {
      const { data, error } = await supabase.storage
        .from('Images') // Using Images bucket
        .download(path);

      if (!error && data) {
        // Get the public URL for the file
        const { data: publicData } = supabase.storage
          .from('Images')
          .getPublicUrl(path);

        if (publicData?.publicUrl) {
          downloadUrl = publicData.publicUrl;
          fileName = path.split('/').pop() || fileName;
          break;
        }
      }
    }

    if (downloadUrl) {
      // If a CV file exists in storage, redirect to its download URL
      return Response.redirect(downloadUrl);
    } else {
      // If no CV file exists in storage, default to the documents page
      // where users can browse for CV/resume documents
      return Response.redirect(`${request.nextUrl.origin}/documents`);
    }
  } catch (error) {
    console.error('Error in CV download route:', error);

    // On error, redirect to the documents page rather than showing an error
    return Response.redirect(`${request.nextUrl.origin}/documents`);
  }
}