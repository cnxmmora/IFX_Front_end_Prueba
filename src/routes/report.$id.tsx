import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, ServerCog, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { authApi, vmApi, type ListResponse, type VmCreatePayload, type VmRecord } from "@/lib/api";
import { authQueryOptions, vmListQueryOptions } from "@/lib/session";
import { useVmRealtime } from "@/components/vm/useVmRealtime";

const vmSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre no puede superar 60 caracteres")
    .regex(/^[A-Za-z0-9][A-Za-z0-9 _-]*[A-Za-z0-9]$/, "El nombre solo puede usar letras, números, espacios, guiones y guiones bajos"),
  cores: z.coerce.number().int("Los cores deben ser enteros").min(1, "Los cores deben ser mayores a 0").max(128, "Los cores superan el máximo soportado"),
  ram: z.coerce.number().int("La RAM debe ser entera").min(1, "La RAM debe ser mayor a 0").max(2048, "La RAM supera el máximo soportado"),
  disk: z.coerce.number().int("El disco debe ser entero").min(1, "El disco debe ser mayor a 0").max(50000, "El disco supera el máximo soportado"),
  os: z.string().trim().min(2, "El sistema operativo es obligatorio").max(40, "El sistema operativo es demasiado largo"),
  status: z.enum(["Encendida", "Apagada", "Suspendida"]),
});

type VmFormValues = z.infer<typeof vmSchema>;

export const Route = createFileRoute("/report/$id")({
  beforeLoad: async ({ context }) => {
    let response;
    try {
      response = await context.queryClient.ensureQueryData(authQueryOptions);
    } catch {
      throw redirect({ to: "/login" });
    }

    if (response.data?.role !== "Administrador") {
      throw redirect({ to: "/portal" });
    }
  },
  component: VmEditorPage,
});

function VmEditorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = Route.useParams();
  const vmId = params.id;
  const isNew = vmId === "new";
  const [highlightedVmId, setHighlightedVmId] = useState<string | null>(null);

  const authQuery = useQuery(authQueryOptions);
  const vmQuery = useQuery(vmListQueryOptions);
  const user = authQuery.data?.data;
  const currentVm = useMemo(
    () => vmQuery.data?.data.find((vm) => vm.id === vmId) ?? null,
    [vmQuery.data?.data, vmId],
  );

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

  const form = useForm<VmFormValues>({
    resolver: zodResolver(vmSchema),
    mode: "onChange",
    defaultValues: currentVm
      ? {
          name: currentVm.name,
          cores: currentVm.cores,
          ram: currentVm.ram,
          disk: currentVm.disk,
          os: currentVm.os,
          status: currentVm.status,
        }
      : {
          name: "",
          cores: 2,
          ram: 4,
          disk: 80,
          os: "Ubuntu 22.04",
          status: "Apagada",
        },
  });

  useEffect(() => {
    if (!currentVm || !isNew) {
      return;
    }
    form.reset({
      name: currentVm.name,
      cores: currentVm.cores,
      ram: currentVm.ram,
      disk: currentVm.disk,
      os: currentVm.os,
      status: currentVm.status,
    });
  }, [currentVm, form, isNew]);

  const createMutation = useMutation({
    mutationFn: async (payload: VmCreatePayload) => vmApi.create(payload),
    onMutate: async (payload: VmCreatePayload) => {
      await queryClient.cancelQueries({ queryKey: ["vms", "list"] });
      const previous = queryClient.getQueryData<ListResponse<VmRecord>>(["vms", "list"]);
      const optimisticVm: VmRecord = {
        id: `temp-${Date.now()}`,
        name: String(payload.name),
        cores: Number(payload.cores),
        ram: Number(payload.ram),
        disk: Number(payload.disk),
        os: payload.os,
        status: payload.status,
        createdBy: user?.id ?? null,
        updatedBy: user?.id ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData(["vms", "list"], (current: ListResponse<VmRecord> | undefined) => {
        if (!current) return current;
        return {
          ...current,
          data: [optimisticVm, ...current.data],
          total: current.total + 1,
        };
      });
      return { previous, optimisticId: optimisticVm.id };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vms", "list"], context.previous);
      }
      toast.error(error instanceof Error ? error.message : "No se pudo crear la VM");
    },
    onSuccess: (result, _payload, context) => {
      const createdVm = result?.data;
      if (context?.optimisticId && createdVm) {
        queryClient.setQueryData(["vms", "list"], (current: ListResponse<VmRecord> | undefined) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((vm) => (vm.id === context.optimisticId ? createdVm : vm)),
          };
        });
      }
      toast.success("VM creada");
      navigate({ to: "/reports" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: VmFormValues }) => vmApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["vms", "list"] });
      const previous = queryClient.getQueryData<ListResponse<VmRecord>>(["vms", "list"]);
      queryClient.setQueryData(["vms", "list"], (current: ListResponse<VmRecord> | undefined) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((vm) =>
            vm.id === id ? { ...vm, ...payload, updatedAt: new Date().toISOString() } : vm,
          ),
        };
      });
      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vms", "list"], context.previous);
      }
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la VM");
    },
    onSuccess: () => {
      toast.success("VM actualizada");
      navigate({ to: "/reports" });
    },
  });

  const handleLogout = async () => {
    await authApi.logout();
    navigate({ to: "/login" });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (isNew) {
      await createMutation.mutateAsync(values);
      return;
    }

    await updateMutation.mutateAsync({ id: vmId, payload: values });
  });

  if (authQuery.isPending || vmQuery.isLoading) {
    return <EditorSkeleton />;
  }

  if (vmQuery.isError) {
    return (
      <AppShell user={user!} canManage onLogout={handleLogout}>
        <EditorErrorState
          onRetry={() => vmQuery.refetch()}
          message={vmQuery.error instanceof Error ? vmQuery.error.message : "No se pudo cargar la VM"}
        />
      </AppShell>
    );
  }

  if (!isNew && !currentVm) {
    return (
      <AppShell user={user!} canManage onLogout={handleLogout}>
        <EditorNotFoundState onBack={() => navigate({ to: "/reports" })} />
      </AppShell>
    );
  }

  return (
    <AppShell user={user!} canManage onLogout={handleLogout}>
      <section className="grid gap-6 pb-8">
        <div className="surface-panel rounded-[1.75rem] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {isNew ? "Crear VM" : "Editar VM"}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                {isNew ? "Alta de máquina virtual" : currentVm?.name ?? "Edición de VM"}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                El formulario valida en tiempo real y aplica optimismo al guardar para que la interfaz responda de inmediato.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate({ to: "/reports" })}>
                <ArrowLeft className="h-4 w-4" />
                Volver al listado
              </Button>
              <Button onClick={onSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="h-4 w-4" />
                {isNew ? "Crear VM" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{isNew ? "Nueva máquina virtual" : "Datos de la VM"}</CardTitle>
              <CardDescription>Solo el administrador puede acceder a esta pantalla.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
                <Field
                  label="Nombre"
                  error={form.formState.errors.name?.message}
                  input={<input {...form.register("name")} placeholder="core-api-01" className={inputClass} />}
                />
                <Field
                  label="Sistema operativo"
                  error={form.formState.errors.os?.message}
                  input={<input {...form.register("os")} placeholder="Ubuntu 22.04" className={inputClass} />}
                />
                <Field
                  label="Cores"
                  error={form.formState.errors.cores?.message}
                  input={<input {...form.register("cores")} type="number" min={1} max={128} className={inputClass} />}
                />
                <Field
                  label="RAM (GB)"
                  error={form.formState.errors.ram?.message}
                  input={<input {...form.register("ram")} type="number" min={1} max={2048} className={inputClass} />}
                />
                <Field
                  label="Disco (GB)"
                  error={form.formState.errors.disk?.message}
                  input={<input {...form.register("disk")} type="number" min={1} max={50000} className={inputClass} />}
                />
                <Field
                  label="Estado"
                  error={form.formState.errors.status?.message}
                  input={
                    <select {...form.register("status")} className={inputClass}>
                      <option value="Encendida">Encendida</option>
                      <option value="Apagada">Apagada</option>
                      <option value="Suspendida">Suspendida</option>
                    </select>
                  }
                />
              </form>
            </CardContent>
          </Card>

          <Card className={highlightedVmId ? "pulse-highlight" : ""}>
            <CardHeader>
              <CardTitle>Vista previa</CardTitle>
              <CardDescription>La tarjeta se sincroniza con los cambios que llegan por socket.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[1.4rem] border border-border/70 bg-background/50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{form.watch("status")}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{form.watch("name") || "Nombre de la VM"}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{form.watch("os") || "Sistema operativo"}</p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/60 text-primary">
                    <ServerCog className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <MiniStat label="Cores" value={form.watch("cores") || 0} />
                  <MiniStat label="RAM" value={`${form.watch("ram") || 0} GB`} />
                  <MiniStat label="Disco" value={`${form.watch("disk") || 0} GB`} />
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
                Las validaciones ocurren en vivo. Si algo falla en el servidor, el estado optimista se revierte automáticamente.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  error,
  input,
}: Readonly<{
  label: string;
  error?: string;
  input: import("react").ReactNode;
}>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {input}
      {error ? <span className="text-sm text-destructive md:col-span-2">{error}</span> : null}
    </label>
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

function EditorSkeleton() {
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

function EditorNotFoundState({ onBack }: Readonly<{ onBack: () => void }>) {
  return (
    <section className="grid gap-6 pb-8">
      <div className="surface-panel flex flex-col items-center justify-center rounded-[1.75rem] px-6 py-16 text-center">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">La VM no existe</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Puede haber sido eliminada o el enlace es incorrecto.
        </p>
        <Button className="mt-6" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Button>
      </div>
    </section>
  );
}

function EditorErrorState({
  onRetry,
  message,
}: Readonly<{
  onRetry: () => Promise<unknown>;
  message: string;
}>) {
  return (
    <section className="grid gap-6 pb-8">
      <div className="surface-panel flex flex-col items-center justify-center rounded-[1.75rem] px-6 py-16 text-center">
        <ServerCog className="h-10 w-10 text-destructive" />
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">No se pudo cargar la vista</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
        <Button className="mt-6" variant="outline" onClick={() => void onRetry()}>
          Reintentar
        </Button>
      </div>
    </section>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-border/80 bg-background/70 px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_4px_rgba(56,189,248,0.08)]";
