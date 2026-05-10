import { Link } from "@tanstack/react-router";
import { Bell, LayoutDashboard, LogOut, Menu, MoonStar, Plus, Server, SunMedium, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AuthUser } from "@/lib/session";

export type AppShellProps = {
  user: AuthUser;
  canManage: boolean;
  onLogout: () => void;
  children: React.ReactNode;
};

const navigation = [
  { label: "Dashboard", to: "/portal", icon: LayoutDashboard },
  { label: "VMs", to: "/reports", icon: Server },
  { label: "Perfil", to: "/profile", icon: UserCircle2 },
];

export function AppShell({ user, canManage, onLogout, children }: Readonly<AppShellProps>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const quickAction = useMemo(
    () => (canManage ? { label: "Crear VM", to: "/report/new" } : null),
    [canManage],
  );

  return (
    <div className="page-fade-in min-h-screen text-foreground">
      <div className="bg-accent-mesh fixed inset-0 opacity-70" aria-hidden />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 p-4 md:p-6 lg:p-8">
        <aside className="surface-panel hidden w-[300px] shrink-0 flex-col overflow-hidden rounded-[1.75rem] p-5 shadow-2xl shadow-black/10 xl:flex">
          <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-5">
            <Logo size="lg" />
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-control inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              <span>{theme === "dark" ? "Claro" : "Oscuro"}</span>
            </button>
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-border/70 bg-background/40 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sesión activa</p>
            <h2 className="mt-2 text-lg font-semibold leading-tight">{user.nombre}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 inline-flex rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-medium">
              {user.role}
            </div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-2">
            {navigation.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                activeProps={{ className: "bg-primary/15 text-primary border-primary/30" }}
                className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-border/70 hover:bg-muted/60 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-[1.25rem] border border-border/70 bg-background/45 p-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Bell className="h-4 w-4 text-primary" />
              <span>Actualizaciones en tiempo real activas</span>
            </div>
            {quickAction ? (
              <Link to={quickAction.to} className="mt-4 block">
                <Button size="sm" className="w-full" variant="primary">
                  <Plus className="h-4 w-4" />
                  {quickAction.label}
                </Button>
              </Link>
            ) : null}
          </div>

          <Button type="button" variant="ghost" className="mt-4 justify-start" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="surface-panel flex items-center justify-between rounded-[1.5rem] px-4 py-4 md:px-6 xl:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/60"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Logo size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-control inline-flex h-11 min-w-24 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium text-muted-foreground"
                aria-label="Cambiar tema"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                <span>{theme === "dark" ? "Claro" : "Oscuro"}</span>
              </button>
              <Button type="button" size="sm" variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {mobileOpen ? (
            <div className="surface-panel xl:hidden rounded-[1.5rem] p-4 soft-slide-up">
              <div className="grid gap-2">
                {navigation.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    activeProps={{ className: "bg-primary/15 text-primary border-primary/30" }}
                    className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-border/70 hover:bg-muted/60 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
                {quickAction ? (
                  <Link to={quickAction.to} onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="mt-2 w-full" variant="primary">
                      <Plus className="h-4 w-4" />
                      {quickAction.label}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
