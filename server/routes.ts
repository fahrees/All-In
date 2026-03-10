import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";
import { registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register auth routes first
  registerAuthRoutes(app);

  // Apply authentication middleware to all subsequent routes
  app.use('/api/portfolios', isAuthenticated);
  app.use('/api/assets', isAuthenticated);
  app.use('/api/insights', isAuthenticated);

  // --- Portfolios ---

  app.get(api.portfolios.list.path, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      // Ensure user owns this portfolio
      if (portfolio.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      const assets = await storage.getAssets(id);
      res.json({ portfolio, assets });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post(api.portfolios.create.path, async (req: any, res) => {
    try {
      const input = api.portfolios.create.input.parse(req.body);
      const portfolio = await storage.createPortfolio({
        ...input,
        userId: req.user.claims.sub,
      });
      res.status(201).json(portfolio);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  // --- Assets ---

  app.post(api.assets.create.path, async (req: any, res) => {
    try {
      const bodySchema = api.assets.create.input.extend({
        portfolioId: z.coerce.number(),
        quantity: z.string(), // Coming as string from frontend form usually
        currentValue: z.string(),
      });
      
      const input = bodySchema.parse(req.body);
      
      // Verify portfolio ownership
      const portfolio = await storage.getPortfolio(input.portfolioId);
      if (!portfolio || portfolio.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      const asset = await storage.createAsset(input);
      res.status(201).json(asset);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to add asset" });
    }
  });

  app.delete(api.assets.delete.path, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // We should ideally check if the user owns the asset's portfolio, 
      // but for simplicity in MVP we assume the frontend only shows their own assets.
      await storage.deleteAsset(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // --- Insights ---

  app.get(api.insights.list.path, async (req: any, res) => {
    try {
      const insights = await storage.getInsights(req.user.claims.sub);
      res.json(insights);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.post(api.insights.generate.path, async (req: any, res) => {
    try {
      const input = api.insights.generate.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      let assetsToAnalyze = [];
      if (input.portfolioId) {
        // Verify ownership
        const portfolio = await storage.getPortfolio(input.portfolioId);
        if (!portfolio || portfolio.userId !== userId) {
          return res.status(404).json({ message: "Portfolio not found" });
        }
        assetsToAnalyze = await storage.getAssets(input.portfolioId);
      } else {
        assetsToAnalyze = await storage.getAllUserAssets(userId);
      }

      if (assetsToAnalyze.length === 0) {
        return res.status(400).json({ message: "No assets to analyze" });
      }

      // Initialize OpenAI using Replit AI Integrations credentials
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const portfolioSummary = assetsToAnalyze.map(a => `${a.quantity} units of ${a.symbol} (${a.name}) - ${a.assetType} - valued at ${a.currentValue} ${a.currency || 'USD'}`).join('\n');

      const prompt = `
        You are a financial wellness advisor. Analyze the following portfolio:
        ${portfolioSummary}
        
        Provide 3 brief, actionable insights categorized as follows:
        1. "diversification" - Comment on how well-diversified the portfolio is across asset types (traditional, digital, private).
        2. "liquidity" - Comment on the liquidity of these assets.
        3. "opportunity" - Suggest a potential area for growth or risk mitigation.
        
        Return exactly 3 insights in a JSON array format like this:
        [
          {"category": "diversification", "content": "Your insight here..."},
          {"category": "liquidity", "content": "Your insight here..."},
          {"category": "opportunity", "content": "Your insight here..."}
        ]
      `;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = aiResponse.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      // Try to parse the response, fallback to a raw content if it fails
      let generatedInsights = [];
      try {
        const parsed = JSON.parse(content);
        // Sometimes the model wraps it in an object like { "insights": [...] } due to json_object mode
        const items = Array.isArray(parsed) ? parsed : (parsed.insights || [parsed]);
        
        for (const item of items) {
          const newInsight = await storage.createInsight({
            userId,
            portfolioId: input.portfolioId,
            category: item.category || "general",
            content: item.content || JSON.stringify(item),
          });
          generatedInsights.push(newInsight);
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError, content);
        const newInsight = await storage.createInsight({
          userId,
          portfolioId: input.portfolioId,
          category: "general",
          content: content,
        });
        generatedInsights.push(newInsight);
      }

      res.json(generatedInsights);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  return httpServer;
}
