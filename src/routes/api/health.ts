import { createFileRoute, redirect } from "@tanstack/react-router";

// Este endpoint era un proxy SSR. En modo SPA redirige al portal.
export const Route = createFileRoute("/api/health")({
  beforeLoad: () => {
    throw redirect({ to: "/portal" });
  },
});
