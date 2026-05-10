import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Botón flotante para revalidar caché del cliente.
 *
 * Útil cuando se actualiza el layout raíz o el bundle SSR y el navegador
 * sigue mostrando una versión vieja. Hace lo siguiente:
 *  1. Invalida el router de TanStack (re-ejecuta loaders).
 *  2. Borra Cache Storage (Service Worker / PWA caches).
 *  3. Desregistra Service Workers activos.
 *  4. Recarga la página con un cache-bust en la URL.
 */
export function RevalidateCacheButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  let buttonLabel = "Revalidar caché";
  if (done) buttonLabel = "Recargando…";
  else if (busy) buttonLabel = "Revalidando…";

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // 1. Router cache
      await router.invalidate();

      // 2. Cache Storage API
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // 3. Service workers
      if (
        typeof navigator !== "undefined" &&
        "serviceWorker" in navigator
      ) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }

      setDone(true);

      // 4. Hard reload con cache-bust
      const url = new URL(globalThis.location.href);
      url.searchParams.set("_r", Date.now().toString());
      globalThis.location.replace(url.toString());
    } catch (err) {
      console.error("[revalidate-cache] failed", err);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title="Limpia caches del navegador y vuelve a cargar la página"
      className="border-bivi-border bg-white text-bivi-body hover:border-bivi-magenta hover:text-bivi-magenta fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium shadow-md transition-all disabled:opacity-60"
    >
      <svg
        className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
      {buttonLabel}
    </button>
  );
}
