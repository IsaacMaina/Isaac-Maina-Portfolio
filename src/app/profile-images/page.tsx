// src/app/profile-images/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { motion } from 'framer-motion';
import SupabaseImage from '@/components/SupabaseImage';
import AnimatedSection from '@/components/AnimatedSection';

interface ProfileImage {
  id: string;
  name: string;
  path: string;
  publicUrl: string;
  size: number;
  uploadedAt: string;
}

async function getProfileImages(): Promise<ProfileImage[]> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    // Get all items in profile-images folder
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the 'Images' bucket
      .list('profile-images/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching profile images from Supabase:', error);
      return [];
    }

    if (!files || files.length === 0) {
      console.log('No profile images found in Supabase');
      return [];
    }

    // Process the file list to create the appropriate response
    const profileImages = files
      .filter(file => file.id !== null) // Filter out folders (they usually have id: null)
      .map(file => {
        const filePath = `profile-images/${file.name}`;
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(filePath);

        return {
          id: file.id || file.name, // Use file name as fallback if id is null
          name: file.name,
          path: filePath,
          publicUrl: publicUrl,
          size: file.metadata?.size || 0,
          uploadedAt: file.created_at || new Date().toISOString(),
        };
      });

    return profileImages;
  } catch (error) {
    console.error('Unexpected error fetching profile images:', error);
    return [];
  }
}

export default async function ProfileImagesPage() {
  const profileImages = await getProfileImages();

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection
          className="text-4xl font-bold mb-4 text-center"
          animationType="fade"
        >
          Profile <span className="text-accent-cyan">Images</span>
        </AnimatedSection>

        <AnimatedSection
          className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto"
          animationType="fade"
          delay={0.1}
        >
          All images in the profile-images folder in Supabase storage
        </AnimatedSection>

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {profileImages.length > 0 ? (
            profileImages.map((image, index) => (
              <AnimatedSection
                key={image.path}
                animationType="slide-up"
                delay={index * 0.1}
              >
                <motion.div
                  className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="aspect-square">
                    <SupabaseImage
                      filePath={image.path}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      enableModal={true}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate" title={image.name}>
                      {image.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 truncate" title={image.path}>
                      Size: {(image.size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400 text-lg">No profile images found in Supabase storage</p>
              <p className="text-slate-500 mt-2">Upload images to the profile-images folder in your Images bucket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}