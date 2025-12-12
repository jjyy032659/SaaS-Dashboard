// lib/db/schema.ts
// lib/db/schema.ts
import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

// 1. Existing Revenue Table
// lib/db/schema.ts

// Change 'revenue' to 'Revenue' to match the table with 4 items
export const revenue = pgTable('revenue', { 
  id: uuid('id').primaryKey().defaultRandom(),
  amount: integer('amount').notNull(),
  month: text('month').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Keep your customers table as is
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;