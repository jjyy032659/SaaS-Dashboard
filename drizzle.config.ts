// drizzle.config.ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// 💡 This line is the fix: It loads variables from .env.local
dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // 💡 Ensure this matches the variable name in your .env.local file
    url: process.env.DATABASE_URL!,
  },
});