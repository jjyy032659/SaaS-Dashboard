// lib/db/schema.ts

import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const revenue = pgTable('revenue', {
  id: uuid('id').primaryKey().defaultRandom(),
  amount: integer('amount').notNull(),
  month: text('month').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// We will export the type for use in app/page.tsx
export type Revenue = typeof revenue.$inferSelect;