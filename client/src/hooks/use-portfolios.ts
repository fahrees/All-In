import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type PortfolioListResponse, type PortfolioGetResponse } from "@shared/routes";
import type { InsertPortfolio } from "@shared/schema";

export function usePortfolios() {
  return useQuery({
    queryKey: [api.portfolios.list.path],
    queryFn: async () => {
      const res = await fetch(api.portfolios.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch portfolios");
      return api.portfolios.list.responses[200].parse(await res.json());
    },
  });
}

export function usePortfolio(id: number) {
  return useQuery({
    queryKey: [api.portfolios.get.path, id],
    queryFn: async () => {
      if (isNaN(id)) throw new Error("Invalid ID");
      const url = buildUrl(api.portfolios.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return api.portfolios.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id) && id > 0,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPortfolio) => {
      const validated = api.portfolios.create.input.parse(data);
      const res = await fetch(api.portfolios.create.path, {
        method: api.portfolios.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.portfolios.create.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to create portfolio");
      }
      return api.portfolios.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.portfolios.list.path] }),
  });
}
