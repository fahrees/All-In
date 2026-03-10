import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",         // ← use 'dialect' not 'driver'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
