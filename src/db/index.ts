// Re-export from the db-connector to ensure proper initialization
export { getDb } from '@/lib/db-connector';

// For backward compatibility, we'll export the db as a getter function
// The actual database instance will be created when first accessed
export const db = {
  select: (...args: any[]) => getDb().select(...args),
  insert: (...args: any[]) => getDb().insert(...args),
  update: (...args: any[]) => getDb().update(...args),
  delete: (...args: any[]) => getDb().delete(...args),
  // Add other methods as needed
};