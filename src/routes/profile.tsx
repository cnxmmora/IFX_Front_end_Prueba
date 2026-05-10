import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, LogOut, Mail, ShieldCheck, User2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { authApi } from "@/lib/api";
import { authQueryOptions } from "@/lib/session";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(authQueryOptions);
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const authQuery = useQuery(authQueryOptions);
  const user = authQuery.data?.data;

  const handleLogout = async () => {
    await authApi.logout();
    navigate({ to: "/login" });
  };

  if (authQuery.isPending) {
    return <ProfileSkeleton />;
  }

  return (
    <AppShell user={user!} canManage={user?.role === "Administrador"} onLogout={handleLogout}>
      <section className="grid gap-6 pb-8">
        <div className="surface-panel rounded-[1.75rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Cuenta activa
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">Mi perfil</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Esta vista muestra la sesión actual. El token sigue viajando en cookie HttpOnly y el frontend solo consume el usuario autenticado.
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProfileStat icon={User2} label="Nombre" value={user?.nombre ?? "-"} />
          <ProfileStat icon={Mail} label="Correo" value={user?.email ?? "-"} />
          <ProfileStat icon={ShieldCheck} label="Rol" value={user?.role ?? "-"} />
          <ProfileStat icon={KeyRound} label="Estado" value={user?.status ?? "active"} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sesión y seguridad</CardTitle>
            <CardDescription>Resumen del estado de autenticación y del acceso al panel.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoRow label="JWT" value="Cookie HttpOnly, Secure, SameSite" />
            <InfoRow label="Inicio de sesión" value={user?.createdAt ? new Date(user.createdAt).toLocaleString() : "No disponible"} />
            <InfoRow label="Acceso en vivo" value="Socket.IO activo" />
            <InfoRow label="Última verificación" value="Consulta /api/auth/me" />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function ProfileStat({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}>) {
  const isEmail = label === "Correo" || value.includes("@");

  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/60 text-primary md:h-10 md:w-10">
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p
            className={[
              "mt-1 text-sm font-semibold leading-5 text-foreground md:text-base",
              isEmail ? "break-all font-mono text-[13px] font-medium md:text-sm" : "break-words",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="page-fade-in min-h-screen p-6 md:p-8 lg:p-10">
      <div className="surface-panel mx-auto flex min-h-[80vh] max-w-[1440px] items-center justify-center rounded-[2rem] p-8">
        <div className="grid gap-4 text-center">
          <div className="skeleton mx-auto h-12 w-12 rounded-2xl" />
          <div className="skeleton h-8 w-72 rounded-2xl" />
          <div className="skeleton h-5 w-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
