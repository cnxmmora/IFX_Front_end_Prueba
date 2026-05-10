import { useEffect, useState } from "react";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "https://ifx-brack-end-prueba.onrender.com";

type Check = {
  name: string;
  status: "ok" | "fail" | "skipped";
  detail?: string;
  ms?: number;
};

type HealthResponse = {
  status: string;
  timestamp: string;
  uptime?: number;
  checks?: Check[];
};

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthResponse }
  | { kind: "error"; data?: HealthResponse; message: string };

/**
 * Badge flotante que consulta /health del backend y muestra estado simple.
 * - Verde: backend OK
 * - Ámbar: degraded (algún check skipped)
 * - Rojo: algún check failed o el endpoint no responde
 *
 * Click sobre el badge despliega el detalle de cada check.
 */
export function HealthBadge() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [open, setOpen] = useState(false);

  const load = async () => {
    setState({ kind: "loading" });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${API_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = (await res.json()) as HealthResponse;
      if (res.ok) setState({ kind: "ok", data });
      else
        setState({
          kind: "error",
          data,
          message: `HTTP ${res.status}`,
        });
    } catch (err) {
      clearTimeout(timeout);
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "request failed",
      });
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  let tone: "loading" | "error" | "ok" = "ok";
  if (state.kind === "loading") tone = "loading";
  else if (state.kind === "error") tone = "error";

  let dotClass = "bg-bivi-muted animate-pulse";
  if (tone === "ok") dotClass = "bg-emerald-500";
  else if (tone === "error") dotClass = "bg-red-500";

  let label = "Comprobando…";
  if (tone === "ok") label = "Backend OK";
  else if (tone === "error") label = "Backend error";

  const checks = state.kind === "loading" ? [] : (state.data?.checks ?? []);

  return (
    <div className="fixed bottom-5 left-5 z-[60] flex flex-col items-start gap-2">
      {open && (
        <div className="bg-bivi-surface border-bivi-border w-[280px] rounded-xl border p-3 shadow-lg">
          <div className="text-bivi-text mb-2 text-[12px] font-semibold">
            Estado del backend
          </div>
          <ul className="space-y-1.5">
            {checks.map((c) => (
              (() => {
                let statusClass = "bg-red-100 text-red-700";
                if (c.status === "ok") statusClass = "bg-emerald-100 text-emerald-700";
                else if (c.status === "skipped") statusClass = "bg-amber-100 text-amber-700";
                return (
              <li
                key={c.name}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="text-bivi-body font-medium">{c.name}</span>
                <span
                  className={"rounded-full px-2 py-0.5 font-semibold " + statusClass}
                  title={c.detail}
                >
                  {c.status}
                  {typeof c.ms === "number" ? ` · ${c.ms}ms` : ""}
                </span>
              </li>
                );
              })()
            ))}
            {state.kind === "error" && (
              <li className="text-[11px] text-red-600">{state.message}</li>
            )}
          </ul>
          <button
            type="button"
            onClick={load}
            className="text-bivi-magenta mt-3 text-[11px] font-semibold hover:underline"
          >
            Volver a comprobar
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={label}
        className="border-bivi-border bg-white text-bivi-body hover:border-bivi-magenta hover:text-bivi-magenta flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-medium shadow-md transition-all"
      >
        <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden />
        {label}
      </button>
    </div>
  );
}
