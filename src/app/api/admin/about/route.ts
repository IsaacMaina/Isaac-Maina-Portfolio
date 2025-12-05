// src/app/api/admin/about/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { getDb } from '@/lib/db-connector';
import { userProfiles, education, experience, certifications } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    // The education, experience, and certifications tables don't have a direct relationship with user
    // Let me adjust the query to get all records since they're not user-specific yet in the schema
    const educationData = await db
      .select()
      .from(education)
      .orderBy(asc(education.orderIndex));

    const experienceData = await db
      .select()
      .from(experience)
      .orderBy(asc(experience.orderIndex));

    const certificationsData = await db
      .select()
      .from(certifications)
      .orderBy(asc(certifications.orderIndex));

    if (userProfile.length === 0) {
      // Return default values if no profile exists
      return Response.json({
        name: session.user.name || "Isaac Maina",
        title: "Web Developer • IT Support • Data Analyst",
        about: "I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.",
        image: "/me.jpg",
        location: "Kenya",
        phone: "+254758302725",
        careerFocus: "Web Development • IT Support • Data Analysis",
        email: session.user.email || "mainaisaacwachira2000@gmail.com",
        education: [
          {
            id: 1,
            school: "University Name",
            degree: "Bachelor of Science in Computer Science",
            period: "20XX - 20XX",
            description: "Relevant coursework included software engineering, databases, algorithms, and data structures."
          }
        ],
        experiences: [
          {
            id: 1,
            title: "Technical Support Intern",
            company: "Kiambu County",
            period: "2023",
            description: "Provided technical support for hardware and software issues, managed user accounts, and maintained network infrastructure. Developed strong problem-solving and communication skills."
          },
          {
            id: 2,
            title: "Freelance Web Developer",
            company: "",
            period: "2022 - Present",
            description: "Developed and maintained web applications for clients using modern technologies including React, Next.js, and various backend solutions. Focused on creating responsive, user-friendly interfaces with optimal performance."
          }
        ],
        certifications: [
          {
            id: 1,
            title: "IBM Database Certificate",
            description: "Database Management and Design"
          },
          {
            id: 2,
            title: "Google Technical Support Certificate",
            description: "Technical Support Fundamentals"
          },
          {
            id: 3,
            title: "Oracle Cloud Certificate",
            description: "Oracle Cloud Infrastructure Foundations"
          }
        ]
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
      name: profile.name || session.user?.name || "Isaac Maina",
      title: profile.title || "Web Developer • IT Support • Data Analyst",
      about: profile.about || "I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.",
      image: profile.image || "/me.jpg",
      location: profile.location || "Kenya",
      phone: profile.phone || "+254758302725",
      careerFocus: profile.careerFocus || "Web Development • IT Support • Data Analysis",
      email: session.user?.email || "mainaisaacwachira2000@gmail.com",
      education: educationData,
      experiences: experienceData,
      certifications: certificationsData
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    return Response.json({ error: 'Failed to fetch about data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the Supabase client to handle image deletion
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
    console.log('About PUT - Old image path:', existingProfile.length > 0 ? existingProfile[0].image : 'No existing profile');
    console.log('About PUT - New image path:', normalizedImage);

    // Delete the old image from Supabase storage if a new one is provided and it's different
    // Only proceed with deletion if there was an existing profile with an image
    if (existingProfile.length > 0) {
      const oldImage = existingProfile[0].image;
      console.log('About PUT - Comparing images:', { oldImage, newImage: normalizedImage, areDifferent: oldImage !== normalizedImage });

      if (oldImage && normalizedImage && oldImage !== normalizedImage) {
        try {
          // Check if the existing image is a path that should be deleted
          const oldImagePath = oldImage;
          console.log('About PUT - Attempting to delete old image:', oldImagePath);

          // Only delete if it's a profile-images path to avoid deleting other images
          if (oldImagePath && oldImagePath.startsWith('profile-images/')) {
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
          console.error('Error deleting old image from Supabase:', error);
          // Continue anyway, don't fail the update if image deletion fails
        }
      } else {
        console.log('No image deletion needed - conditions not met');
      }
    } else {
      console.log('No existing profile or no image to compare');
    }

    // Update user profile data
    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({
          name: body.name,
          title: body.title,
          about: body.about,
          image: normalizedImage,
          location: body.location,
          phone: body.phone,
          careerFocus: body.careerFocus,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, parseInt(session.user.id)));
    } else {
      // Create new profile
      await db
        .insert(userProfiles)
        .values({
          userId: parseInt(session.user.id),
          name: body.name,
          title: body.title,
          about: body.about,
          image: normalizedImage,
          location: body.location,
          phone: body.phone,
          careerFocus: body.careerFocus,
        });
    }

    // For education, experience, and certifications, we need to determine if they should be user-specific
    // Currently, the schema doesn't have a user ID field for these tables, so we're updating globally
    // This might need adjustment depending on the intended use case

    // Clear and update education records (for now, we'll clear all and re-add)
    await db.delete(education);
    if (body.education && Array.isArray(body.education)) {
      await db.insert(education).values(
        body.education.map((edu: any, index: number) => ({
          id: edu.id || index + 1,  // Use provided id or generate one
          school: edu.school,
          degree: edu.degree,
          period: edu.period,
          description: edu.description,
          orderIndex: index,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );
    }

    // Clear and update experience records
    await db.delete(experience);
    if (body.experiences && Array.isArray(body.experiences)) {
      await db.insert(experience).values(
        body.experiences.map((exp: any, index: number) => ({
          id: exp.id || index + 1,  // Use provided id or generate one
          title: exp.title,
          company: exp.company,
          period: exp.period,
          description: exp.description,
          orderIndex: index,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );
    }

    // Clear and update certification records
    await db.delete(certifications);
    if (body.certifications && Array.isArray(body.certifications)) {
      await db.insert(certifications).values(
        body.certifications.map((cert: any, index: number) => ({
          id: cert.id || index + 1,  // Use provided id or generate one
          title: cert.title,
          description: cert.description,
          orderIndex: index,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );
    }

    // Return updated data
    return Response.json({ success: true, message: 'About data updated successfully' });
  } catch (error) {
    console.error('Error updating about data:', error);
    return Response.json({ error: 'Failed to update about data' }, { status: 500 });
  }
}