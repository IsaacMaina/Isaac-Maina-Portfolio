// src/app/documents/[category]/page.tsx
import { notFound } from 'next/navigation';
import { getDocumentsByCategory } from '@/lib/supabase/documents-storage-service';
import DocumentCategoryClient from './DocumentCategoryClient';

interface Params {
  params: {
    category: string;
  };
}

export default async function DocumentCategoryPage({ params }: Params) {
  const { category } = params;
  
  // Decode the category name (was encoded when navigating from the parent page)
  const decodedCategory = decodeURIComponent(category);
  
  // Get all documents organized by category
  const allDocuments = await getDocumentsByCategory();
  
  // Find the specific category
  const categoryData = allDocuments.find(
    album => album.name.toLowerCase().replace(/\s+/g, '-') === decodedCategory
  );
  
  if (!categoryData) {
    notFound(); // Show 404 if category doesn't exist
  }

  return (
    <DocumentCategoryClient 
      categoryName={categoryData.name} 
      documents={categoryData.items} 
    />
  );
}