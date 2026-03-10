import { z } from 'zod';
import { insertPortfolioSchema, insertAssetSchema, insertInsightSchema, portfolios, assets, insights } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  portfolios: {
    list: {
      method: 'GET' as const,
      path: '/api/portfolios' as const,
      responses: {
        200: z.array(z.custom<typeof portfolios.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/portfolios/:id' as const,
      responses: {
        200: z.object({
          portfolio: z.custom<typeof portfolios.$inferSelect>(),
          assets: z.array(z.custom<typeof assets.$inferSelect>()),
        }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/portfolios' as const,
      input: insertPortfolioSchema,
      responses: {
        201: z.custom<typeof portfolios.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  assets: {
    create: {
      method: 'POST' as const,
      path: '/api/assets' as const,
      input: insertAssetSchema,
      responses: {
        201: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/assets/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  insights: {
    list: {
      method: 'GET' as const,
      path: '/api/insights' as const,
      responses: {
        200: z.array(z.custom<typeof insights.$inferSelect>()),
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/insights/generate' as const,
      input: z.object({
        portfolioId: z.number().optional(), // If not provided, generates for all user assets
      }),
      responses: {
        200: z.array(z.custom<typeof insights.$inferSelect>()),
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type PortfolioListResponse = z.infer<typeof api.portfolios.list.responses[200]>;
export type PortfolioGetResponse = z.infer<typeof api.portfolios.get.responses[200]>;
export type InsightListResponse = z.infer<typeof api.insights.list.responses[200]>;
