import { useSession, signOut } from "@/lib/auth-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const { data: session, isPending: isLoading } = useSession();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session?.user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
