import { db } from "./db";
import { portfolios, assets, insights, type InsertPortfolio, type InsertAsset, type InsertInsight } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Portfolios
  getPortfolios(userId: string): Promise<typeof portfolios.$inferSelect[]>;
  getPortfolio(id: number): Promise<typeof portfolios.$inferSelect | undefined>;
  createPortfolio(portfolio: InsertPortfolio & { userId: string }): Promise<typeof portfolios.$inferSelect>;
  
  // Assets
  getAssets(portfolioId: number): Promise<typeof assets.$inferSelect[]>;
  getAllUserAssets(userId: string): Promise<typeof assets.$inferSelect[]>;
  createAsset(asset: InsertAsset): Promise<typeof assets.$inferSelect>;
  deleteAsset(id: number): Promise<void>;

  // Insights
  getInsights(userId: string): Promise<typeof insights.$inferSelect[]>;
  createInsight(insight: InsertInsight & { userId: string }): Promise<typeof insights.$inferSelect>;
}

export class DatabaseStorage implements IStorage {
  async getPortfolios(userId: string) {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolio(id: number) {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }

  async createPortfolio(portfolio: InsertPortfolio & { userId: string }) {
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return newPortfolio;
  }

  async getAssets(portfolioId: number) {
    return await db.select().from(assets).where(eq(assets.portfolioId, portfolioId));
  }

  async getAllUserAssets(userId: string) {
    // We join assets with portfolios to get assets for a specific user
    const result = await db.select({
      id: assets.id,
      portfolioId: assets.portfolioId,
      symbol: assets.symbol,
      name: assets.name,
      assetType: assets.assetType,
      quantity: assets.quantity,
      currentValue: assets.currentValue,
      currency: assets.currency,
      updatedAt: assets.updatedAt,
    })
    .from(assets)
    .innerJoin(portfolios, eq(assets.portfolioId, portfolios.id))
    .where(eq(portfolios.userId, userId));
    
    return result;
  }

  async createAsset(asset: InsertAsset) {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async deleteAsset(id: number) {
    await db.delete(assets).where(eq(assets.id, id));
  }

  async getInsights(userId: string) {
    return await db.select().from(insights).where(eq(insights.userId, userId));
  }

  async createInsight(insight: InsertInsight & { userId: string }) {
    const [newInsight] = await db.insert(insights).values(insight).returning();
    return newInsight;
  }
}

export const storage = new DatabaseStorage();
