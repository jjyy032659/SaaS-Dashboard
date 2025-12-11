// lib/db/db.ts
    
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

// Define the connection and assign it to a unique temporary variable
const drizzleDb = drizzle(sql);

// Export the unique variable under the name 'db'
export const db = drizzleDb;