// src/app/api/documents/[category]/route.ts
import { NextRequest } from 'next/server';
import { getDocumentsByCategory } from '@/lib/supabase/documents-storage-service';

interface Params {
  params: {
    category: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { category } = params;
    
    // Decode the category to handle spaces and special characters
    const decodedCategory = decodeURIComponent(category);
    
    // Get all documents organized by category
    const allDocuments = await getDocumentsByCategory();
    
    // Find the specific category
    const categoryData = allDocuments.find(
      album => album.name.toLowerCase().replace(/\s+/g, '-') === decodedCategory.toLowerCase()
    );
    
    if (!categoryData) {
      // If category not found, return 404 equivalent
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    return Response.json(categoryData);
  } catch (error) {
    console.error('Error fetching documents by category:', error);
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}