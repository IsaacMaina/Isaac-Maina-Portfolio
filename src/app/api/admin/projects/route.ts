// src/app/api/admin/projects/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { getDb } from '@/lib/db-connector';
import { projects as projectsSchema } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';

// Define the project structure that matches the database schema
interface Project {
  id: number;
  title: string;
  description: string;
  link: string;
  stack: string[];
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Fetch all projects from the database ordered by orderIndex
    const dbProjects = await db
      .select()
      .from(projectsSchema)
      .orderBy(asc(projectsSchema.orderIndex));

    // Process projects to handle stack field which might be stored as JSON string
    const processedProjects: Project[] = dbProjects.map(project => {
      // Handle stack field - it might be stored as an array or as a JSON string
      let stackArray: string[] = [];
      if (project.stack) {
        if (Array.isArray(project.stack)) {
          stackArray = project.stack as string[];
        } else if (typeof project.stack === 'string') {
          try {
            stackArray = JSON.parse(project.stack);
          } catch (e) {
            // If it's not valid JSON, try splitting by commas or fallback to empty array
            stackArray = project.stack.split(',').map(item => item.trim()).filter(item => item);
          }
        } else if (typeof project.stack === 'object') {
          // If it's already an object, cast it
          stackArray = project.stack as string[];
        }
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        link: project.link,
        stack: stackArray,
        category: project.category,
        orderIndex: project.orderIndex,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    });

    return Response.json(processedProjects);
  } catch (error) {
    console.error('Error fetching projects data:', error);
    return Response.json({ error: 'Failed to fetch projects data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const incomingProjects: Project[] = await request.json();

    // Clear all existing projects first
    await db.delete(projectsSchema);

    // Insert updated projects (let the database auto-generate IDs)
    if (incomingProjects && Array.isArray(incomingProjects)) {
      // First, clear existing projects
      await db.delete(projectsSchema);

      // Then insert the new ones
      for (const [index, project] of incomingProjects.entries()) {
        // Convert stack array to JSON string if it's an array, otherwise pass as is
        let stackValue: string | string[] = project.stack || [];

        if (Array.isArray(stackValue)) {
          stackValue = JSON.stringify(stackValue);
        }

        await db.insert(projectsSchema).values({
          title: project.title,
          description: project.description,
          link: project.link,
          stack: stackValue,
          category: project.category,
          orderIndex: index,
          createdAt: sql`NOW()`,
          updatedAt: sql`NOW()`
        });
      }
    }

    // Cache invalidation after update
    revalidateTag('projects');
    return Response.json({ message: 'Projects updated successfully' });
  } catch (error) {
    console.error('Error updating projects:', error);
    return Response.json({ error: 'Failed to update projects' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Delete the project from the database
    await db
      .delete(projectsSchema)
      .where(eq(projectsSchema.id, id));

    // Cache invalidation after deletion
    revalidateTag('projects');
    return Response.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}