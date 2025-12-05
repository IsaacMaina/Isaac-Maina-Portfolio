// src/app/api/admin/documents/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { getDb } from '@/lib/db-connector';
import { documents } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// Define a type alias for document without category for compatibility
type DocumentWithoutCategory = Omit<typeof documents.$inferInsert, 'id' | 'category' | 'createdAt' | 'updatedAt'>;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Get all documents from the database, using specific field selection to avoid issues
    const dbDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        file: documents.file,
        description: documents.description,
        orderIndex: documents.orderIndex,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        // Intentionally excluding 'category' to prevent errors if column doesn't exist
      })
      .from(documents)
      .orderBy(documents.orderIndex);

    // Add a default category to documents returned to the client for UI compatibility
    const documentsWithCategory = dbDocuments.map(doc => ({
      ...doc,
      category: doc.category || 'documents' // Add default category for UI
    }));

    return Response.json(documentsWithCategory);
  } catch (error) {
    console.error('Error fetching documents data:', error);
    return Response.json({ error: 'Failed to fetch documents data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const data = await request.json();

    // Delete all current documents
    await db.delete(documents);

    // Then insert the new ones, but without the category field if it doesn't exist in the DB
    if (data && Array.isArray(data)) {
      const documentsToInsert = data
        .filter(item => item.file) // Only insert items that have a file
        .map((item, index) => {
          return {
            title: item.title,
            file: item.file,
            description: item.description,
            orderIndex: index,
            createdAt: sql`NOW()`, // Always use NOW() to avoid type mismatches
            updatedAt: sql`NOW()`
            // Deliberately excluding category field to prevent DB error
          };
        });

      if (documentsToInsert.length > 0) {
        await db.insert(documents).values(documentsToInsert);
      }
    }

    return Response.json({ message: 'Documents updated successfully' });
  } catch (error) {
    console.error('Error updating documents:', error);
    // Log error details for more specific debugging
    if (error instanceof Error) {
      console.error('Detailed error:', error.message, error.stack);
    }
    return Response.json({ error: 'Failed to update documents', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, file } = await request.json();

    if (!id && !file) {
      return Response.json({ error: 'Either id or file is required' }, { status: 400 });
    }

    const db = getDb();

    // Delete from database
    let deletionResult;
    if (id) {
      deletionResult = await db.delete(documents).where(eq(documents.id, id));
    } else if (file) {
      deletionResult = await db.delete(documents).where(eq(documents.file, file));
    }

    return Response.json({
      message: 'Document deleted successfully',
      deletionResult
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return Response.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}