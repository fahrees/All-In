import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";
import { registerAuthRoutes } from "./replit_integrations/auth";


async function seedDatabase() {
  try {
    const existingPortfolios = await storage.getPortfolios("demo-user");
    if (existingPortfolios.length === 0) {
      console.log("🌱 Seeding database with sample data...");
      const portfolio1 = await storage.createPortfolio({ userId: "demo-user", name: "Tech Growth Portfolio" });
      const portfolio2 = await storage.createPortfolio({ userId: "demo-user", name: "Diversified Income" });
      await storage.createAsset({ portfolioId: portfolio1.id, symbol: "AAPL", name: "Apple Inc.", assetType: "traditional", quantity: "50", currentValue: "230.50", currency: "USD" });
      await storage.createAsset({ portfolioId: portfolio1.id, symbol: "MSFT", name: "Microsoft Corporation", assetType: "traditional", quantity: "30", currentValue: "445.75", currency: "USD" });
      await storage.createAsset({ portfolioId: portfolio1.id, symbol: "BTC", name: "Bitcoin", assetType: "digital", quantity: "0.5", currentValue: "98500", currency: "USD" });
      await storage.createAsset({ portfolioId: portfolio2.id, symbol: "JNJ", name: "Johnson & Johnson", assetType: "traditional", quantity: "100", currentValue: "160.25", currency: "USD" });
      await storage.createAsset({ portfolioId: portfolio2.id, symbol: "REAL-ESTATE", name: "Real Estate Investment Trust", assetType: "private", quantity: "25", currentValue: "75", currency: "USD" });
      await storage.createAsset({ portfolioId: portfolio2.id, symbol: "ETH", name: "Ethereum", assetType: "digital", quantity: "3", currentValue: "3850", currency: "USD" });
      console.log("✅ Database seeded successfully!");
    }
  } catch (error) {
    console.log("Database seeding skipped or error occurred (this is normal in production)");
  }
}


export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  registerAuthRoutes(app);
  await seedDatabase();

  app.use('/api/portfolios', isAuthenticated);
  app.use('/api/assets', isAuthenticated);
  app.use('/api/insights', isAuthenticated);


  // --- Portfolios ---
  app.get(api.portfolios.list.path, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const portfolios = await storage.getPortfolios(userId);
      res.json(portfolios);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.get(api.portfolios.get.path, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(id);
      if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });
      if (portfolio.userId !== req.user.id) return res.status(404).json({ message: "Portfolio not found" });
      const assets = await storage.getAssets(id);
      res.json({ portfolio, assets });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post(api.portfolios.create.path, async (req: any, res) => {
    try {
      const input = api.portfolios.create.input.parse(req.body);
      const portfolio = await storage.createPortfolio({ ...input, userId: req.user.id });
      res.status(201).json(portfolio);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });


  // --- Assets ---
  app.post(api.assets.create.path, async (req: any, res) => {
    try {
      const bodySchema = api.assets.create.input.extend({ portfolioId: z.coerce.number(), quantity: z.string(), currentValue: z.string() });
      const input = bodySchema.parse(req.body);
      const portfolio = await storage.getPortfolio(input.portfolioId);
      if (!portfolio || portfolio.userId !== req.user.id) return res.status(404).json({ message: "Portfolio not found" });
      const asset = await storage.createAsset(input);
      res.status(201).json(asset);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to add asset" });
    }
  });

  app.delete(api.assets.delete.path, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAsset(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });


  // --- Insights ---
  app.get(api.insights.list.path, async (req: any, res) => {
    try {
      const insights = await storage.getInsights(req.user.id);
      res.json(insights);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.post(api.insights.generate.path, async (req: any, res) => {
    try {
      const input = api.insights.generate.input.parse(req.body);
      const userId = req.user.id;

      let assetsToAnalyze = [];
      if (input.portfolioId) {
        const portfolio = await storage.getPortfolio(input.portfolioId);
        if (!portfolio || portfolio.userId !== userId) return res.status(404).json({ message: "Portfolio not found" });
        assetsToAnalyze = await storage.getAssets(input.portfolioId);
      } else {
        assetsToAnalyze = await storage.getAllUserAssets(userId);
      }
      if (assetsToAnalyze.length === 0) return res.status(400).json({ message: "No assets to analyze" });

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const portfolioSummary = assetsToAnalyze
        .map(a => `${a.quantity} units of ${a.symbol} (${a.name}) - ${a.assetType} - valued at ${a.currentValue} ${a.currency || 'USD'}`)
        .join('\n');

      // ✅ Fixed prompt: tell AI to use provided values only, never return errors
      const prompt = `
You are a financial wellness advisor. Analyze the following portfolio and provide actionable advice.

Portfolio:
${portfolioSummary}

Rules:
- Use ONLY the values provided above. Do NOT reference real-time prices or external market data.
- Do NOT return error messages or disclaimers about missing data.
- Always return exactly 3 insights, no matter what.
- Base all analysis purely on the asset types, quantities, and values given.

Return ONLY a valid JSON array with exactly 3 items, like this:
[
  {"category": "diversification", "content": "Your insight here..."},
  {"category": "liquidity", "content": "Your insight here..."},
  {"category": "opportunity", "content": "Your insight here..."}
]`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = aiResponse.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      let generatedInsights = [];
      try {
        const parsed = JSON.parse(content);

        // ✅ Guard: reject if AI returned an error object instead of insights
        if (parsed.error) {
          return res.status(500).json({ message: "AI returned an error. Please try again." });
        }

        const items = Array.isArray(parsed) ? parsed : (parsed.insights || []);
        if (items.length === 0) {
          return res.status(500).json({ message: "AI returned no insights. Please try again." });
        }

        for (const item of items) {
          const newInsight = await storage.createInsight({
            userId,
            portfolioId: input.portfolioId,
            category: item.category || "general",
            content: item.content || JSON.stringify(item),
          });
          generatedInsights.push(newInsight);
        }
      } catch {
        const newInsight = await storage.createInsight({
          userId,
          portfolioId: input.portfolioId,
          category: "general",
          content,
        });
        generatedInsights.push(newInsight);
      }

      res.json(generatedInsights);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  return httpServer;
}
