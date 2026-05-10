import { redirect, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Search, Server, Trash2, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { authApi, vmApi, type ListResponse, type VmRecord } from "@/lib/api";
import { authQueryOptions, vmListQueryOptions } from "@/lib/session";
import { useVmRealtime } from "@/components/vm/useVmRealtime";

export const Route = createFileRoute("/reports")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(authQueryOptions);
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: VmListPage,
});

function VmListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Encendida" | "Apagada" | "Suspendida">("all");
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

  const statusCounters = useMemo(() => {
    const base = { Encendida: 0, Apagada: 0, Suspendida: 0 };
    for (const vm of vms) {
      base[vm.status] += 1;
    }
    return base;
  }, [vms]);

  const filteredVms = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return vms.filter((vm) => {
      const matchesSearch =
        !normalized || [vm.name, vm.os, vm.status].some((value) => value.toLowerCase().includes(normalized));
      const matchesStatus = statusFilter === "all" || vm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, vms]);

  let statusDescriptionSuffix = "";
  if (statusFilter === "Encendida" || statusFilter === "Apagada" || statusFilter === "Suspendida") {
    statusDescriptionSuffix = ` · Estado: ${statusFilter}`;
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => vmApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["vms", "list"] });
      const previous = queryClient.getQueryData<ListResponse<VmRecord>>(["vms", "list"]);
      queryClient.setQueryData(["vms", "list"], (current: ListResponse<VmRecord> | undefined) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((vm) => vm.id !== id),
          total: Math.max(0, current.total - 1),
        };
      });
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vms", "list"], context.previous);
      }
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la VM");
    },
    onSuccess: () => {
      toast.success("VM eliminada");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vms", "list"] });
    },
  });

  const handleLogout = async () => {
    await authApi.logout();
    navigate({ to: "/login" });
  };

  if (authQuery.isPending) {
    return <VmListSkeleton />;
  }

  return (
    <AppShell user={user!} canManage={canManage} onLogout={handleLogout}>
      <section className="grid gap-6 pb-8">
        <div className="surface-panel rounded-[1.75rem] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <Server className="h-3.5 w-3.5" />
                Inventario de VMs
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Listado operativo</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Busca, revisa y administra las máquinas virtuales. Los clientes ven todo el inventario pero no los controles de modificación.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <FilterChip
                  label={`Todas (${vms.length})`}
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                />
                <FilterChip
                  label={`Encendidas (${statusCounters.Encendida})`}
                  active={statusFilter === "Encendida"}
                  onClick={() => setStatusFilter("Encendida")}
                />
                <FilterChip
                  label={`Apagadas (${statusCounters.Apagada})`}
                  active={statusFilter === "Apagada"}
                  onClick={() => setStatusFilter("Apagada")}
                />
                <FilterChip
                  label={`Suspendidas (${statusCounters.Suspendida})`}
                  active={statusFilter === "Suspendida"}
                  onClick={() => setStatusFilter("Suspendida")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative min-w-[280px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, OS o estado"
                  className="h-12 w-full rounded-2xl border border-border/80 bg-background/70 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_4px_rgba(56,189,248,0.08)]"
                />
              </label>
              {(search.trim() || statusFilter !== "all") ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : null}
              {canManage ? (
                <Link to="/report/new">
                  <Button size="sm" className="w-full sm:w-auto">
                    <Wrench className="h-4 w-4" />
                    Nueva VM
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>VMs registradas</CardTitle>
            <CardDescription>
              {filteredVms.length} resultados visibles{statusDescriptionSuffix}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vmQuery.isLoading ? <VmCardsSkeleton /> : null}
            {!vmQuery.isLoading && filteredVms.length === 0 ? <EmptyFilteredState search={search} statusFilter={statusFilter} canManage={canManage} /> : null}
            {!vmQuery.isLoading && filteredVms.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                {filteredVms.map((vm) => (
                  <VmRowCard key={vm.id} vm={vm} highlighted={highlightedVmId === vm.id} canManage={canManage} onDelete={(id) => deleteMutation.mutate(id)} deleting={deleteMutation.isPending && deleteMutation.variables === vm.id} />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: Readonly<{ label: string; active: boolean; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase transition ${
        active
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border/70 bg-background/55 text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function VmRowCard({
  vm,
  highlighted,
  canManage,
  onDelete,
  deleting,
}: Readonly<{
  vm: VmRecord;
  highlighted: boolean;
  canManage: boolean;
  onDelete: (id: string) => void;
  deleting: boolean;
}>) {
  return (
    <Card interactive className={`${highlighted ? "pulse-highlight border-primary/60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
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

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <MiniStat label="Cores" value={vm.cores} />
        <MiniStat label="RAM" value={`${vm.ram} GB`} />
        <MiniStat label="Disco" value={`${vm.disk} GB`} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{vm.updatedAt ? new Date(vm.updatedAt).toLocaleString() : "sin actualización"}</span>
        <ArrowRight className="h-4 w-4" />
      </div>

      {canManage ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/report/$id" params={{ id: vm.id }}>
            <Button variant="secondary" size="sm">
              Editar
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onDelete(vm.id)} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function MiniStat({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/40 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyFilteredState({
  search,
  statusFilter,
  canManage,
}: Readonly<{ search: string; statusFilter: "all" | "Encendida" | "Apagada" | "Suspendida"; canManage: boolean }>) {
  const hasFilters = search.trim() !== "" || statusFilter !== "all";
  let emptyMessage = "Aún no hay VMs visibles para esta cuenta.";
  if (hasFilters) {
    const normalizedSearch = search.trim();
    emptyMessage = "No encontramos VMs para los filtros actuales.";
    if (normalizedSearch) {
      emptyMessage = `No encontramos VMs para los filtros actuales (\u201c${normalizedSearch}\u201d).`;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/80 bg-background/40 px-6 py-14 text-center">
      <Search className="h-10 w-10 text-primary" />
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-foreground">No hay coincidencias</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {emptyMessage}
      </p>
      {canManage ? (
        <Link to="/report/new" className="mt-6">
          <Button size="sm">
            <Wrench className="h-4 w-4" />
            Crear VM
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

function VmCardsSkeleton() {
  const keys = ["a", "b", "c", "d", "e", "f"];
  return (
    <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {keys.map((key) => (
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

function VmListSkeleton() {
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
