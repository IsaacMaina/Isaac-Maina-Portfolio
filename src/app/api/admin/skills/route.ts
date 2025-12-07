// src/app/api/admin/skills/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { getDb } from '@/lib/db-connector';
import { skillCategories, skills as dbSkills, additionalSkills as dbAdditionalSkills } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';

// Define the skill type
interface Skill {
  name: string;
  level: number;
}

// Define the skill category type
interface SkillCategory {
  title: string;
  skills: Skill[];
}

// Define the skills data structure
interface SkillsData {
  skillCategories: SkillCategory[];
  additionalSkills: string[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Get all skill categories ordered by their order index
    const dbSkillCategories = await db
      .select()
      .from(skillCategories)
      .orderBy(asc(skillCategories.orderIndex));

    // For each category, get its skills
    const categoriesWithSkills = await Promise.all(
      dbSkillCategories.map(async (category) => {
        const categorySkills = await db
          .select()
          .from(dbSkills)
          .where(eq(dbSkills.categoryId, category.id))
          .orderBy(asc(dbSkills.orderIndex));

        return {
          id: category.id,
          title: category.title,
          orderIndex: category.orderIndex,
          skills: categorySkills.map(skill => ({
            name: skill.name,
            level: skill.level
          }))
        };
      })
    );

    // Get additional skills
    const additionalSkillsList = await db
      .select()
      .from(dbAdditionalSkills)
      .orderBy(asc(dbAdditionalSkills.orderIndex));

    return Response.json({
      skillCategories: categoriesWithSkills,
      additionalSkills: additionalSkillsList.map(skill => skill.name)
    });
  } catch (error) {
    console.error('Error fetching skills data:', error);
    return Response.json({ error: 'Failed to fetch skills data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const data: SkillsData = await request.json();

    // Clear existing skill categories and skills
    await db.delete(dbSkills);
    await db.delete(skillCategories);
    await db.delete(dbAdditionalSkills);

    // Insert new skill categories and their skills
    if (data.skillCategories && Array.isArray(data.skillCategories)) {
      for (const [catIndex, category] of data.skillCategories.entries()) {
        // Insert the category first
        const [newCategory] = await db
          .insert(skillCategories)
          .values({
            title: category.title,
            orderIndex: catIndex,
            createdAt: sql`NOW()`,
            updatedAt: sql`NOW()`
          })
          .returning();

        // Insert skills for this category
        if (category.skills && Array.isArray(category.skills)) {
          for (const [skillIndex, skill] of category.skills.entries()) {
            await db.insert(dbSkills).values({
              name: skill.name,
              level: skill.level,
              categoryId: newCategory.id,
              orderIndex: skillIndex,
              createdAt: sql`NOW()`,
              updatedAt: sql`NOW()`
            });
          }
        }
      }
    }

    // Insert additional skills
    if (data.additionalSkills && Array.isArray(data.additionalSkills)) {
      for (const [index, skillName] of data.additionalSkills.entries()) {
        if (skillName.trim() !== '') {
          await db.insert(dbAdditionalSkills).values({
            name: skillName.trim(),
            orderIndex: index,
            createdAt: sql`NOW()`,
            updatedAt: sql`NOW()`
          });
        }
      }
    }

    // Cache invalidation after update
    revalidateTag('skills');
    return Response.json({ message: 'Skills updated successfully' });
  } catch (error) {
    console.error('Error updating skills:', error);
    return Response.json({ error: 'Failed to update skills' }, { status: 500 });
  }
}