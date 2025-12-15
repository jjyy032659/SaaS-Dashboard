import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function ensureUserProfile() {
  const userId = 'user_36mBFGlgXBs4oyzNQzOf5YDr25c';

  try {
    console.log('Checking if user profile exists for:', userId);

    // Check if profile exists
    const existingProfile = await sql`
      SELECT * FROM users_profile WHERE user_id = ${userId}
    `;

    if (existingProfile.length > 0) {
      console.log('✓ User profile already exists:', existingProfile[0]);
    } else {
      console.log('Creating user profile...');

      // Create a default profile
      const newProfile = await sql`
        INSERT INTO users_profile (user_id, calorie_goal, macro_protein_g, macro_fat_g, macro_carbs_g)
        VALUES (${userId}, 2500, 150, 70, 250)
        RETURNING *
      `;

      console.log('✓ User profile created:', newProfile[0]);
    }

    // Also check how many foods exist
    const foodCount = await sql`
      SELECT COUNT(*) as count FROM foods WHERE user_id = ${userId}
    `;
    console.log('Number of foods in database for this user:', foodCount[0].count);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

ensureUserProfile();
