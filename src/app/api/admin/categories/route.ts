// src/app/api/admin/categories/route.ts
import { NextRequest } from 'next/server';
import { getGalleryCategoriesFromStorage } from '@/lib/gallery-categories-service';

export async function GET(request: NextRequest) {
  try {
    const categories = await getGalleryCategoriesFromStorage();
    return Response.json(categories);
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    // Return an empty array if there's an error
    return Response.json([], { status: 500 });
  }
}