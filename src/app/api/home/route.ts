// src/app/api/home/route.ts
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db-connector';
import { userProfiles, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidateTag, unstable_cache as cache } from 'next/cache';

// Cache the home data with a tag for invalidation
const getCachedHomeData = cache(
  async () => {
    const db = getDb();

    // Execute the database query with additional error handling
    let result;
    try {
      result = await db
        .select({
          // User profile fields
          profileId: userProfiles.id,
          profileName: userProfiles.name,
          title: userProfiles.title,
          about: userProfiles.about,
          image: userProfiles.image, // This will be the Supabase image URL
          skills: userProfiles.skills,
          location: userProfiles.location,
          phone: userProfiles.phone,
          careerFocus: userProfiles.careerFocus,
          // User fields
          userName: users.name,
          userEmail: users.email
        })
        .from(userProfiles)
        .leftJoin(users, eq(userProfiles.userId, users.id))
        .orderBy(desc(userProfiles.id)) // Get the most recent profile
        .limit(1);
    } catch (dbError) {
      console.error('Database query error in API route:', dbError);
      // If database query fails, return error response
      return Response.json({
        error: 'Database query failed'
      }, { status: 500 });
    }

    if (Array.isArray(result) && result.length > 0) {
      const rawRecord = result[0];

      // Create a defensive copy to avoid mutation issues
      const record = { ...rawRecord };

      // Ensure record is an object and not null/undefined
      if (record && typeof record === 'object') {
        // Parse skills if it's stored as JSON string
        let skills: string[] = ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'];
        const recordSkills = record?.skills;
        if (recordSkills) {
          if (Array.isArray(recordSkills)) {
            skills = recordSkills as string[];
          } else if (typeof recordSkills === 'string') {
            try {
              skills = JSON.parse(recordSkills);
              if (!Array.isArray(skills)) {
                skills = [recordSkills];
              }
            } catch (e) {
              skills = [recordSkills];
            }
          } else if (typeof recordSkills === 'object') {
            skills = recordSkills as string[];
          }
        }

        // Prioritize profile name over user name if available, with null checks
        const name = record?.profileName || record?.userName || "Isaac Maina";

        // Return data with Neon PostgreSQL (using Drizzle with Neon) and Supabase image URL
        return {
          name: name,
          title: record?.title || "Web Developer • IT Support • Data Analysis",
          about: record?.about || "I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.",
          image: record?.image || "/me.png", // The image field now contains the Supabase URL from Neon PostgreSQL, fallback to proper profile image
          skills: skills,
          location: record?.location || "Kenya",
          phone: record?.phone || "+254758302725",
          careerFocus: record?.careerFocus || "Web Development • IT Support • Data Analysis",
        };
      } else {
        // Fallback if record is not a valid object
        return {
          name: "Isaac Maina",
          title: "Web Developer • IT Support • Data Analyst",
          about: "I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.",
          image: "/me.png",
          skills: ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
          location: "Kenya",
          phone: "+254758302725",
          careerFocus: "Web Development • IT Support • Data Analysis",
        };
      }
    }

    // Fallback to default data if no profile exists
    return {
      name: "Isaac Maina",
      title: "Web Developer • IT Support • Data Analyst",
      about: "I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.",
      image: "/me.png",
      skills: ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
      location: "Kenya",
      phone: "+254758302725",
      careerFocus: "Web Development • IT Support • Data Analysis",
    };
  },
  ['home-data'], // Cache key
  {
    tags: ['home'], // Tag for cache invalidation
    revalidate: 30 // Revalidate every 30 seconds
  }
);

export async function GET(request: NextRequest) {
  try {
    // Fetch the cached data
    const data = await getCachedHomeData();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching home data:', error);
    return Response.json({
      error: 'Failed to fetch home data'
    }, { status: 500 });
  }
}

// POST, PUT, DELETE methods for updating
export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    // Update the user profile
    const result = await db
      .update(userProfiles)
      .set({
        ...body,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, 1)) // Assuming you're updating the first user
      .returning();

    // Invalidate the cache after update
    revalidateTag('home');

    return Response.json({
      message: 'Home data updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating home data:', error);
    return Response.json({
      error: 'Failed to update home data'
    }, { status: 500 });
  }
}