import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertAsset } from "@shared/schema";

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAsset) => {
      const validated = api.assets.create.input.parse(data);
      const res = await fetch(api.assets.create.path, {
        method: api.assets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.assets.create.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to add asset");
      }
      return api.assets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both portfolio lists and specific portfolio details
      queryClient.invalidateQueries({ queryKey: [api.portfolios.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.portfolios.get.path] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.assets.delete.path, { id });
      const res = await fetch(url, { 
        method: api.assets.delete.method,
        credentials: "include" 
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Asset not found");
        throw new Error("Failed to delete asset");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.portfolios.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.portfolios.get.path] });
    },
  });
}
