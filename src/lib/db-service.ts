import { getDb } from '@/db';
import { users, userProfiles, projects, documents, galleryItems, skillCategories, skills, education, experience, certifications, additionalSkills } from '@/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';
import { cache } from 'react';

// Get database instance when needed
const db = getDb();

// User profile service
export const getUserProfile = async () => {
  try {
    // Get the first user profile joined with user data
    const result = await db
      .select({
        // User profile fields
        profileId: userProfiles.id,
        profileName: userProfiles.name,
        title: userProfiles.title,
        about: userProfiles.about,
        image: userProfiles.image,
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
      .limit(1);

    if (result.length > 0) {
      const record = result[0];

      // Parse skills if it's stored as JSON string
      let skills: string[] = [];
      if (record.skills) {
        if (Array.isArray(record.skills)) {
          skills = record.skills as string[];
        } else if (typeof record.skills === 'string') {
          try {
            skills = JSON.parse(record.skills);
          } catch (e) {
            skills = [record.skills];
          }
        } else if (typeof record.skills === 'object') {
          skills = record.skills as string[];
        }
      }

      // Prioritize profile name over user name if available
      const name = record.profileName || record.userName || null;

      // Process the image URL for proper Supabase handling
      let imageUrl = record.image || "/me.jpg";
      if (record.image && typeof record.image === 'string' && record.image !== "/me.jpg") {
        // Check if the image is a Supabase file path that needs to be converted
        if (record.image.startsWith('profile-images/') || record.image.includes('/')) {
          // This is a Supabase file path - it will be handled by the client component
          imageUrl = record.image;
        } else {
          // It's already a valid public URL or local path
          imageUrl = record.image;
        }
      }

      return {
        name: name || null,
        title: record.title || null,
        about: record.about || null,
        image: imageUrl,
        skills: skills,
        location: record.location || null,
        phone: record.phone || null,
        careerFocus: record.careerFocus || null,
      };
    }

    // Return null values if no data found in DB
    return {
      name: null,
      title: null,
      about: null,
      image: "/me.jpg",
      skills: [],
      location: null,
      phone: null,
      careerFocus: null,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return minimal data with error fallback
    return {
      name: null,
      title: null,
      about: null,
      image: "/me.jpg",
      skills: [],
      location: null,
      phone: null,
      careerFocus: null,
    };
  }
};

// Projects service
export const getProjects = cache(async () => {
  try {
    const projectList = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.orderIndex));

    return projectList;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
});

// Documents service
export const getDocuments = cache(async () => {
  try {
    const documentList = await db
      .select()
      .from(documents)
      .orderBy(asc(documents.orderIndex));

    return documentList;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
});

// Gallery service
export const getGalleryItems = cache(async () => {
  try {
    const galleryList = await db
      .select()
      .from(galleryItems)
      .orderBy(asc(galleryItems.orderIndex));

    return galleryList;
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return [];
  }
});

// Skills service
export const getSkillsData = cache(async () => {
  try {
    // Get skill categories
    const categories = await db
      .select()
      .from(skillCategories)
      .orderBy(asc(skillCategories.orderIndex));

    // For each category, get its skills
    const skillCategoriesWithSkills = await Promise.all(
      categories.map(async (category) => {
        const categorySkills = await db
          .select()
          .from(skills)
          .where(eq(skills.categoryId, category.id))
          .orderBy(asc(skills.orderIndex));

        return {
          ...category,
          skills: categorySkills
        };
      })
    );

    // Get additional skills
    const additionalSkillsList = await db
      .select()
      .from(additionalSkills)
      .orderBy(asc(additionalSkills.orderIndex));

    return {
      skillCategories: skillCategoriesWithSkills,
      additionalSkills: additionalSkillsList.map(skill => skill.name)
    };
  } catch (error) {
    console.error('Error fetching skills data:', error);
    return {
      skillCategories: [],
      additionalSkills: []
    };
  }
});

// About page data service
export const getAboutData = async () => {
  try {
    // Get profile
    const profile = await getUserProfile();

    // Get education
    const educationList = await db
      .select()
      .from(education)
      .orderBy(asc(education.orderIndex));

    // Get experience
    const experienceList = await db
      .select()
      .from(experience)
      .orderBy(asc(experience.orderIndex));

    // Get certifications
    const certificationList = await db
      .select()
      .from(certifications)
      .orderBy(asc(certifications.orderIndex));

    return {
      profile,
      education: educationList,
      experiences: experienceList,
      certifications: certificationList
    };
  } catch (error) {
    console.error('Error fetching about data:', error);
    const profile = await getUserProfile();
    return {
      profile,
      education: [],
      experiences: [],
      certifications: []
    };
  }
}


// Authentication service
export async function getUserByEmail(email: string) {
  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
      
    return userResult.length > 0 ? userResult[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}