import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { users, sessions, accounts } from "@shared/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,        // ← map "user" → your users table
      session: sessions,  // ← map "session" → your sessions table
      account: accounts,  // ← map "account" → your accounts table
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.SESSION_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
});
