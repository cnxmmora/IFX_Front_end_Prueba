import { queryOptions } from "@tanstack/react-query";
import { authApi, vmApi, type VmUser } from "@/lib/api";

export const authQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => authApi.me(),
  staleTime: 60_000,
  retry: false,
});

export const vmListQueryOptions = queryOptions({
  queryKey: ["vms", "list"],
  queryFn: async () => vmApi.list(),
  staleTime: 15_000,
  retry: false,
});

export const vmSummaryQueryOptions = queryOptions({
  queryKey: ["vms", "summary"],
  queryFn: async () => vmApi.summary(),
  staleTime: 15_000,
  retry: false,
});

export type AuthUser = VmUser;

export function isAdmin(user?: AuthUser | null) {
  return user?.role === "Administrador";
}
