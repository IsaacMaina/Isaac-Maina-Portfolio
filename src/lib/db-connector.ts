// src/lib/db-connector.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }
    
    const sql = neon(databaseUrl);
    dbInstance = drizzle(sql);
  }
  
  return dbInstance;
}

export async function ensureDbConnection() {
  getDb(); // This will establish the connection if not already done
}