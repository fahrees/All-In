import { pgTable, serial, text, numeric, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Re-export auth models from separate file
export { users, sessions } from "./models/auth";
export type { User, UpsertUser } from "./models/auth";

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(),
  quantity: numeric("quantity").notNull(),
  currentValue: numeric("current_value").notNull(), 
  currency: text("currency").default("USD"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, updatedAt: true });
export const insertInsightSchema = createInsertSchema(insights).omit({ id: true, createdAt: true });

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
