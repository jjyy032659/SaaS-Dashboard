import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    const migrationSQL = readFileSync(
      join(__dirname, 'drizzle', '0000_curly_justin_hammer.sql'),
      'utf-8'
    );

    console.log('Running migration...');
    console.log(migrationSQL);

    await sql.query(migrationSQL);

    console.log('✓ Migration completed successfully!');

    // Optional: Insert some sample data
    console.log('\nInserting sample data...');
    await sql.query(`
      INSERT INTO revenue (amount, month) VALUES
      (15000, 'January 2024'),
      (22000, 'February 2024'),
      (18500, 'March 2024'),
      (25000, 'April 2024'),
      (21000, 'May 2024'),
      (28000, 'June 2024')
    `);
    console.log('✓ Sample data inserted!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrate();
