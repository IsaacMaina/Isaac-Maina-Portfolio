// src/app/api/admin/home/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { getDb } from '@/lib/db-connector';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Get user profile data
    const userProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, parseInt(session.user.id)))
      .limit(1);

    if (userProfile.length === 0) {
      // Return default values if no profile exists
      return Response.json({
        name: session.user.name || '',
        title: "Web Developer • IT Support • Data Analyst",
        about: "I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.",
        image: "/me.jpg",
        skills: ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
        location: "Kenya",
        phone: "+254758302725",
        careerFocus: "Web Development • IT Support • Data Analysis",
        email: session.user.email || ''
      });
    }

    // If skills is stored as JSON, parse it
    const profile = userProfile[0];
    let skills: string[] = [];

    if (Array.isArray(profile.skills)) {
      skills = profile.skills;
    } else if (typeof profile.skills === 'string') {
      try {
        skills = JSON.parse(profile.skills);
      } catch (e) {
        // If parsing fails, treat as a single string or empty array
        skills = [profile.skills];
      }
    } else if (profile.skills && typeof profile.skills === 'object') {
      // If it's already a parsed object
      skills = profile.skills as string[];
    }

    return Response.json({
      name: profile.name || session.user?.name || '',
      title: profile.title || "Web Developer • IT Support • Data Analyst",
      about: profile.about || "I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.",
      image: profile.image || "/me.jpg",
      skills: skills || ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
      location: profile.location || "Kenya",
      phone: profile.phone || "+254758302725",
      careerFocus: profile.careerFocus || "Web Development • IT Support • Data Analysis",
      email: session.user?.email || ''
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    return Response.json({ error: 'Failed to fetch home data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const body = await request.json();

    // Get the existing profile to get the old image path for deletion
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, parseInt(session.user.id)))
      .limit(1);

    // Normalize the image path - if it's a full URL from Supabase, extract just the path
    let normalizedImage = body.image;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && body.image && typeof body.image === 'string' && body.image.startsWith(supabaseUrl)) {
      // Extract the path after the supabase URL
      const pathStart = `${supabaseUrl}/storage/v1/object/public/Images/`;
      normalizedImage = body.image.replace(pathStart, '');
    }

    // Log for debugging
    console.log('Home PUT - Old image path:', existingProfile.length > 0 ? existingProfile[0].image : 'No existing profile');
    console.log('Home PUT - New image path:', normalizedImage);

    // Delete the old image from Supabase storage if a new one is provided and it's different
    // Only proceed with deletion if there was an existing profile with an image
    if (existingProfile.length > 0) {
      const oldImage = existingProfile[0].image;
      console.log('Home PUT - Comparing images:', { oldImage, newImage: normalizedImage, areDifferent: oldImage !== normalizedImage });

      if (oldImage && normalizedImage && oldImage !== normalizedImage) {
        try {
          // Check if the existing image is a path that should be deleted
          const oldImagePath = oldImage;
          console.log('Home PUT - Attempting to delete old image:', oldImagePath);

          // Only delete if it's a profile-images path to avoid deleting other images
          if (oldImagePath && oldImagePath.startsWith('profile-images/')) {
            // Initialize Supabase client to delete old image
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

            const { error } = await supabase.storage
              .from('Images')
              .remove([oldImagePath]);

            if (error) {
              console.error('Error deleting old image from Supabase:', error);
              // Continue anyway, don't fail the update if image deletion fails
            } else {
              console.log('Successfully deleted old image:', oldImagePath);
            }
          } else {
            console.log('Skipping deletion - not a profile-images path:', oldImagePath);
          }
        } catch (error) {
          console.error('Error initializing Supabase client for image deletion:', error);
          // Continue anyway, don't fail the update if image deletion fails
        }
      } else {
        console.log('No image deletion needed - conditions not met');
      }
    } else {
      console.log('No existing profile or no image to compare');
    }

    // Update user profile data
    const updatedProfile = await db
      .update(userProfiles)
      .set({
        name: body.name,
        title: body.title,
        about: body.about,
        image: normalizedImage,
        skills: Array.isArray(body.skills) ? body.skills : (body.skills || []),
        location: body.location,
        phone: body.phone,
        careerFocus: body.careerFocus,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, parseInt(session.user.id)))
      .returning();

    if (updatedProfile.length === 0) {
      // If no profile exists, create one
      const newProfile = await db
        .insert(userProfiles)
        .values({
          userId: parseInt(session.user.id),
          name: body.name,
          title: body.title,
          about: body.about,
          image: normalizedImage,
          skills: Array.isArray(body.skills) ? body.skills : (body.skills || []),
          location: body.location,
          phone: body.phone,
          careerFocus: body.careerFocus,
        })
        .returning();

      // Cache invalidation after update
      revalidateTag('home');

      return Response.json(newProfile[0]);
    }

    // Cache invalidation after update
    revalidateTag('home');

    return Response.json(updatedProfile[0]);
  } catch (error) {
    console.error('Error updating home data:', error);
    return Response.json({ error: 'Failed to update home data' }, { status: 500 });
  }
}