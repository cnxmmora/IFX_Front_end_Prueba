import { redirect, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Cpu, HardDrive, LayoutGrid, RefreshCcw, Server, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { authApi, type VmRecord } from "@/lib/api";
import { authQueryOptions, vmListQueryOptions } from "@/lib/session";
import { useVmRealtime } from "@/components/vm/useVmRealtime";

export const Route = createFileRoute("/portal")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(authQueryOptions);
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: PortalPage,
});

function PortalPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [highlightedVmId, setHighlightedVmId] = useState<string | null>(null);

  const authQuery = useQuery(authQueryOptions);
  const vmQuery = useQuery(vmListQueryOptions);

  const user = authQuery.data?.data;
  const canManage = user?.role === "Administrador";
  const vms = vmQuery.data?.data ?? [];

  useVmRealtime(queryClient, {
    onEvent: (_eventName, vm) => {
      setHighlightedVmId(vm.id);
    },
  });

  useEffect(() => {
    if (!highlightedVmId) return;
    const timeoutId = globalThis.setTimeout(() => setHighlightedVmId(null), 1200);
    return () => globalThis.clearTimeout(timeoutId);
  }, [highlightedVmId]);

  const activeVms = useMemo(() => vms.filter((vm) => vm.status === "Encendida"), [vms]);
  const totals = useMemo(
    () =>
      activeVms.reduce(
        (accumulator, vm) => ({
          cores: accumulator.cores + vm.cores,
          ram: accumulator.ram + vm.ram,
          disk: accumulator.disk + vm.disk,
        }),
        { cores: 0, ram: 0, disk: 0 },
      ),
    [activeVms],
  );

  const statusCounts = useMemo(() => {
    const counts = { Encendida: 0, Apagada: 0, Suspendida: 0 };
    for (const vm of vms) {
      counts[vm.status] += 1;
    }
    return counts;
  }, [vms]);

  const chartData = useMemo(
    () => [
      { name: "Cores", value: totals.cores },
      { name: "RAM", value: totals.ram },
      { name: "Disco", value: totals.disk },
    ],
    [totals],
  );

  useEffect(() => {
    if (!authQuery.isError) return;
    toast.error("No se pudo validar tu sesión");
  }, [authQuery.isError]);

  useEffect(() => {
    if (!vmQuery.isError) return;
    toast.error(vmQuery.error instanceof Error ? vmQuery.error.message : "No se pudieron cargar las VMs");
  }, [vmQuery.error, vmQuery.isError]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate({ to: "/login" });
  };

  const handleRefresh = async () => {
    try {
      const result = await vmQuery.refetch();
      if (result.error) {
        throw result.error;
      }
      toast.success("Datos actualizados");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron actualizar las VMs");
    }
  };

  if (authQuery.isPending) {
    return <PortalSkeleton />;
  }

  return (
    <AppShell user={user!} canManage={canManage} onLogout={handleLogout}>
      <section className="premium-shell grid gap-6 pb-8">
        <div className="surface-panel premium-hero rounded-[1.75rem] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {canManage ? "Modo administrador" : "Modo cliente"}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                {canManage ? "Controla el inventario de VMs en tiempo real." : "Visualiza el estado de las VMs activas."}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Este panel se sincroniza por Socket.IO, usa optimismo en las mutaciones y mantiene la autenticación con cookie HttpOnly.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-border/70 bg-background/65 px-3 py-1 text-xs font-medium text-muted-foreground">Dark Mode nativo</span>
                <span className="rounded-full border border-border/70 bg-background/65 px-3 py-1 text-xs font-medium text-muted-foreground">Live updates</span>
                <span className="rounded-full border border-border/70 bg-background/65 px-3 py-1 text-xs font-medium text-muted-foreground">Diseño premium</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {canManage ? (
                <Link to="/report/new">
                  <Button size="sm">
                    <LayoutGrid className="h-4 w-4" />
                    Crear VM
                  </Button>
                </Link>
              ) : null}
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCcw className={`h-4 w-4 ${vmQuery.isFetching ? "animate-spin" : ""}`} />
                Refrescar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="VMs activas" value={activeVms.length} icon={Activity} accent="cyan" subtitle={`${statusCounts.Encendida} encendidas, ${statusCounts.Apagada} apagadas`} />
          <MetricCard title="Cores asignados" value={totals.cores} icon={Cpu} accent="violet" subtitle="solo VMs encendidas" />
          <MetricCard title="RAM asignada" value={`${totals.ram} GB`} icon={Server} accent="emerald" subtitle="memoria consumida en línea" />
          <MetricCard title="Disco asignado" value={`${totals.disk} GB`} icon={HardDrive} accent="amber" subtitle="capacidad total activa" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Uso total de recursos</CardTitle>
              <CardDescription>Suma de cores, RAM y disco de todas las VMs activas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(56, 189, 248, 0.08)" }}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 16,
                        color: "var(--foreground)",
                      }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="url(#barGradient)" />
                    <defs>
                      <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgb(56,189,248)" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado por categoría</CardTitle>
              <CardDescription>Distribución actual del parque de máquinas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <StatusRow label="Encendidas" value={statusCounts.Encendida} tone="text-emerald-400" />
              <StatusRow label="Apagadas" value={statusCounts.Apagada} tone="text-amber-400" />
              <StatusRow label="Suspendidas" value={statusCounts.Suspendida} tone="text-cyan-400" />
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
                {canManage ? "Los administradores pueden crear, editar y eliminar VMs desde esta misma interfaz." : "Los clientes ven el catálogo completo, pero los controles de modificación están ocultos."}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>Tarjetas resaltadas automáticamente cuando cambian por Socket.IO.</CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Tiempo real activo
            </div>
          </CardHeader>
          <CardContent>
            {vmQuery.isLoading ? <VmSkeletonGrid /> : null}
            {!vmQuery.isLoading && vmQuery.isError ? <VmErrorState onRetry={handleRefresh} /> : null}
            {!vmQuery.isLoading && vms.length === 0 ? <EmptyVmState canManage={canManage} /> : null}
            {!vmQuery.isLoading && !vmQuery.isError && vms.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                {vms.map((vm) => (
                  <VmCard key={vm.id} vm={vm} canManage={canManage} highlighted={highlightedVmId === vm.id} />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
}: Readonly<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "cyan" | "violet" | "emerald" | "amber";
}>) {
  const accentClass = {
    cyan: "from-cyan-500/24 to-cyan-500/6 text-cyan-300",
    violet: "from-indigo-500/22 to-indigo-500/5 text-indigo-300",
    emerald: "from-emerald-500/24 to-emerald-500/6 text-emerald-300",
    amber: "from-amber-500/24 to-amber-500/6 text-amber-300",
  }[accent];

  return (
    <Card className={`premium-metric bg-gradient-to-br ${accentClass} border-border/70`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/60">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function StatusRow({ label, value, tone }: Readonly<{ label: string; value: number; tone: string }>) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${tone}`}>{value}</span>
    </div>
  );
}

function VmCard({
  vm,
  canManage,
  highlighted,
}: Readonly<{
  vm: VmRecord;
  canManage: boolean;
  highlighted: boolean;
}>) {
  const navigate = useNavigate();
  return (
    <Card interactive className={`premium-metric relative ${highlighted ? "pulse-highlight border-primary/60" : ""}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {vm.status}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-foreground">{vm.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{vm.os}</p>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/60 text-primary">
          <Server className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <InfoChip label="Cores" value={vm.cores} />
        <InfoChip label="RAM" value={`${vm.ram} GB`} />
        <InfoChip label="Disco" value={`${vm.disk} GB`} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>Creada por {vm.createdBy ?? "sistema"}</span>
        <span>{vm.updatedAt ? new Date(vm.updatedAt).toLocaleDateString() : "sin fecha"}</span>
      </div>

      {canManage ? (
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate({ to: "/report/$id", params: { id: vm.id } })}>
            Editar
          </Button>
          <Link to="/report/$id" params={{ id: vm.id }} className="hidden" />
        </div>
      ) : null}
    </Card>
  );
}

function InfoChip({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/40 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function VmSkeletonGrid() {
  const skeletonKeys = ["one", "two", "three", "four", "five", "six"];
  return (
    <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {skeletonKeys.map((key) => (
        <Card key={key} className="space-y-4">
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-7 w-3/4 rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            <div className="skeleton h-20 rounded-2xl" />
            <div className="skeleton h-20 rounded-2xl" />
            <div className="skeleton h-20 rounded-2xl" />
          </div>
          <div className="skeleton h-9 w-full rounded-xl" />
        </Card>
      ))}
    </div>
  );
}

function EmptyVmState({ canManage }: Readonly<{ canManage: boolean }>) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/80 bg-background/40 px-6 py-14 text-center">
      <TriangleAlert className="h-10 w-10 text-primary" />
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-foreground">No hay VMs cargadas</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {canManage
          ? "Crea la primera VM para empezar a ver métricas, tarjetas en tiempo real y CRUD optimista."
          : "Cuando existan máquinas activas, aquí verás el inventario y sus métricas resumidas."}
      </p>
      {canManage ? (
        <Link to="/report/new" className="mt-6">
          <Button>
            <LayoutGrid className="h-4 w-4" />
            Crear primera VM
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

function VmErrorState({ onRetry }: Readonly<{ onRetry: () => Promise<void> }>) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/80 bg-background/40 px-6 py-14 text-center">
      <TriangleAlert className="h-10 w-10 text-destructive" />
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-foreground">Error al cargar VMs</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Hubo un problema obteniendo los datos del dashboard. Intenta nuevamente.
      </p>
      <Button className="mt-6" variant="outline" onClick={onRetry}>
        <RefreshCcw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}

function PortalSkeleton() {
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
