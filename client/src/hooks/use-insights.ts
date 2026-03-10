import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useInsights() {
  return useQuery({
    queryKey: [api.insights.list.path],
    queryFn: async () => {
      const res = await fetch(api.insights.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch insights");
      return api.insights.list.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateInsights() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (portfolioId?: number) => {
      const payload = portfolioId ? { portfolioId } : {};
      const res = await fetch(api.insights.generate.path, {
        method: api.insights.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.insights.generate.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to generate insights");
      }
      return api.insights.generate.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.insights.list.path] }),
  });
}
