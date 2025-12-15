import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sqlClient = neon(process.env.DATABASE_URL);
const db = drizzle(sqlClient);

async function dropOldTables() {
  try {
    console.log('Dropping old tables...');

    // Drop tables if they exist
    await db.execute(sql`DROP TABLE IF EXISTS meal_items CASCADE`);
    console.log('✓ Dropped meal_items table');

    await db.execute(sql`DROP TABLE IF EXISTS meals CASCADE`);
    console.log('✓ Dropped meals table');

    // Also drop serving_sizes if it exists
    await db.execute(sql`DROP TABLE IF EXISTS serving_sizes CASCADE`);
    console.log('✓ Dropped serving_sizes table (if existed)');

    console.log('\n✓ All old tables dropped successfully!');
    console.log('You can now run: npx drizzle-kit push');

  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

dropOldTables();
