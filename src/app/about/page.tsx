import { getAboutData } from "@/lib/db-service";
import { createClient } from "@supabase/supabase-js";
import AboutContentClient from "./AboutContentClient";

// Define the certification structure to match the expected format
interface Certification {
  id: number;
  title: string;
  file: string;
  description: string;
}

// Function to fetch certificates from Supabase storage (server-side)
async function getCertificatesFromStorage(): Promise<Certification[]> {
  try {
    // For server-side operations, we would normally use a service role key
    // But for public content like certificates, we'll use the anon key and make sure RLS is configured properly
    // First, let's try a simple approach using the anon key with proper error handling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // List files in the 'documents/certificates/' folder
    // Using a try/catch to properly handle any errors
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list('documents/certificates/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching certificates from Supabase storage:', error);
      // If there's an error, it could be due to RLS policies
      // Let's return a more descriptive error but continue gracefully
      console.log('Attempting to continue without certificates...');
      return [];
    }

    if (!files || files.length === 0) {
      console.log('No certificates found in Supabase storage');
      return [];
    }

    // Process files to extract metadata (title/description) stored with the file
    const certificates: Certification[] = files.map((file, index) => {
      // Get the public URL for the file - handle this more carefully
      try {
        const { data } = supabase.storage
          .from('Images')
          .getPublicUrl(`documents/certificates/${file.name}`);
        const publicUrl = data?.publicUrl || `${supabaseUrl}/storage/v1/object/public/Images/documents/certificates/${file.name}`;

        // Use the file metadata if available, otherwise fall back to file name
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const title = file.metadata?.title || fileNameWithoutExt;
        const description = file.metadata?.description || `Certificate document: ${file.name}`;

        return {
          id: Date.now() + index, // Generate temporary ID based on timestamp
          title: title,
          file: publicUrl, // Use the constructed public URL
          description: description
        };
      } catch (urlError) {
        console.warn('Error generating public URL for file:', file.name, urlError);
        // Return a basic certificate object even if URL generation fails
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        return {
          id: Date.now() + index,
          title: fileNameWithoutExt, // Use filename as fallback title
          file: '', // Empty URL if we can't generate it
          description: `Certificate document: ${file.name}`
        };
      }
    });

    return certificates;
  } catch (error) {
    console.error('Unexpected error fetching certificates from storage:', error);
    // Return empty array to gracefully handle the error
    return [];
  }
}

export default async function AboutPage() {
  // Get basic about data from the database (excluding certifications)
  const aboutData = await getAboutData();

  // Get certificates directly from Supabase storage (with metadata including custom titles and descriptions)
  const certificatesFromStorage = await getCertificatesFromStorage();

  // Create updated about data with certificates from storage (metadata-enabled)
  const updatedAboutData = {
    profile: aboutData.profile,
    education: aboutData.education,
    experiences: aboutData.experiences,
    certifications: certificatesFromStorage
  };

  return (
    <AboutContentClient aboutData={updatedAboutData} />
  );
}