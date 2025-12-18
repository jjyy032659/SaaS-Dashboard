// lib/db/schema.ts

import { pgTable, uuid, text, integer, timestamp, pgEnum, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUM for Document Status (AI Feature) ---
// Used to track the file processing workflow
export const documentStatusEnum = pgEnum('document_status', ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED']);

// --- ENUM for Meal Types ---
export const mealTypeEnum = pgEnum('meal_type', ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'SUPPLEMENT']);


// =========================================================================
// 1. Core Tables for Nutrition Tracking (Replacing Customers/Revenue)
// =========================================================================

/**
 * Stores the user's biometrics, activity level, and personalized goals.
 * Keyed by Clerk's userId (PK) for easy lookup and RLS.
 */
export const usersProfile = pgTable('users_profile', {
  // Primary Key linked directly to Clerk's user ID for RLS
  userId: text('user_id').primaryKey(),

  // Biometrics
  age: integer('age'),
  heightCm: integer('height_cm'),
  currentWeightKg: integer('current_weight_kg'),
  activityLevel: text('activity_level'),

  // Goals
  calorieGoal: integer('calorie_goal').notNull(), // Daily target (kcal)
  macroProteinG: integer('macro_protein_g').notNull(), // Protein target (grams)
  macroFatG: integer('macro_fat_g').notNull().default(0),
  macroCarbsG: integer('macro_carbs_g').notNull().default(0),

  // Subscription fields (Stripe integration)
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  stripeCurrentPeriodEnd: timestamp('stripe_current_period_end'),
  subscriptionStatus: text('subscription_status').default('free'), // 'free', 'active', 'canceled', 'past_due'

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserProfile = typeof usersProfile.$inferSelect;
export type InsertUserProfile = typeof usersProfile.$inferInsert;


/**
 * The main transactional table, storing every food item logged by the user.
 * RLS is enforced via the userId column.
 */
export const foodLog = pgTable('food_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Foreign Key to usersProfile (required for RLS)
  userId: text('user_id').notNull().references(() => usersProfile.userId), 
  
  mealType: mealTypeEnum('meal_type').notNull(), 
  description: text('description').notNull(), 
  
  // Nutritional Data (stored as integers)
  calories: integer('calories').notNull(),
  proteinG: integer('protein_g').notNull(),
  fatG: integer('fat_g').notNull(),
  carbsG: integer('carbs_g').notNull(),
  
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
});

export type FoodLog = typeof foodLog.$inferSelect;
export type InsertFoodLog = typeof foodLog.$inferInsert;


/**
 * Stores custom food items created by users for their personal food library.
 * Each food item represents nutritional values per 100g.
 */
export const foods = pgTable('foods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => usersProfile.userId),

  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  protein_g: real('protein_g').notNull().default(0),
  carbs_g: real('carbs_g').notNull().default(0),
  fat_g: real('fat_g').notNull().default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Food = typeof foods.$inferSelect;
export type InsertFood = typeof foods.$inferInsert;


// =========================================================================
// 2. Documents Table (For the AI Analysis Feature)
// =========================================================================

/**
 * Stores metadata for uploaded files (e.g., PDF reports) for AI analysis.
 */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  // RLS via userId
  userId: text("user_id").notNull().references(() => usersProfile.userId), 
  
  fileName: text("file_name").notNull(),
  s3Key: text("s3_key").notNull(), 
  
  status: documentStatusEnum("status").default('UPLOADED').notNull(),
  analysisSummary: text("analysis_summary"),
  
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;


// =========================================================================
// 3. Relations
// =========================================================================

// Defines the relationship between a user profile and their log entries/documents/foods
export const usersProfileRelations = relations(usersProfile, ({ many }) => ({
    foodLogs: many(foodLog),
    documents: many(documents),
    foods: many(foods),
}));

// Defines the relationship for a log entry belonging to a specific user
export const foodLogRelations = relations(foodLog, ({ one }) => ({
    user: one(usersProfile, {
        fields: [foodLog.userId],
        references: [usersProfile.userId],
    }),
}));

// Defines the relationship for a document belonging to a specific user
export const documentRelations = relations(documents, ({ one }) => ({
    user: one(usersProfile, {
        fields: [documents.userId],
        references: [usersProfile.userId],
    }),
}));

// Defines the relationship for a food item belonging to a specific user
export const foodsRelations = relations(foods, ({ one }) => ({
    user: one(usersProfile, {
        fields: [foods.userId],
        references: [usersProfile.userId],
    }),
}));