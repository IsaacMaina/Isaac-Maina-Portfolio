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

    // Look for CV/resume documents in specific locations
    // Try common paths where CV might be stored
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

    // Look for the CV file in storage
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

    if (!downloadUrl) {
      // If no CV found in standard locations, return a 404
      return Response.json(
        { error: 'CV document not found in standard locations' }, 
        { status: 404 }
      );
    }

    // Redirect to the Supabase download URL
    // This will trigger the browser to download the file directly
    return Response.redirect(downloadUrl);
  } catch (error) {
    console.error('Error downloading CV:', error);
    return Response.json(
      { error: 'Failed to download CV' }, 
      { status: 500 }
    );
  }
}