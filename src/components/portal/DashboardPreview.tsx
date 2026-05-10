import { Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";

const bars = [40, 60, 45, 75, 55, 90, 70, 100];

export function DashboardPreview() {
  return (
    <div
      className="bg-bivi-surface border-bivi-border relative mx-auto mt-16 max-w-[920px] overflow-hidden rounded-[20px] border shadow-card-hover"
    >
      {/* Topbar */}
      <div
        className="bg-bivi-bg-3 border-bivi-border flex items-center gap-2.5 border-b px-5 py-3"
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
        <span className="text-bivi-muted ml-2 text-[11px] font-semibold tracking-[0.5px]">
          BIVI CONNECT · Dashboard · Bebidas &amp; Snacks · Q1 2025
        </span>
      </div>

      {/* Body */}
      <div className="bg-bivi-surface grid grid-cols-2 gap-4 p-6 md:grid-cols-[repeat(4,1fr)_1.6fr]">
        <Kpi label="Ticket Promedio" value="$387" delta="↑ 12.4% vs mes ant." up />
        <Kpi label="Frecuencia Compra" value="3.2x" delta="↑ 8.1% semanal" up />
        <Kpi label="Lealtad a Marca" value="67%" delta="↓ 2.3% mensual" />
        <Kpi label="Abandono Categoría" value="18%" delta="↓ Mejorando" up />

        <div className="bg-bivi-bg-2 border-bivi-border flex flex-col rounded-[10px] border p-4">
          <div className="text-bivi-muted mb-3 text-[11px] font-semibold tracking-[0.5px]">
            VENTAS SEMANALES
          </div>
          <div className="flex h-[60px] flex-1 items-end gap-1.5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="bg-gradient-main flex-1 rounded-t-[4px] opacity-80 transition-opacity hover:opacity-100"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <div className="bg-bivi-bg-2 border-bivi-border rounded-[10px] border p-4">
            <div className="text-bivi-muted mb-2.5 text-[11px] font-semibold tracking-[0.5px]">
              TOP PRODUCTOS · MAYOR CONVERSIÓN
            </div>
            <Row name="Agua con gas · Botella 500ml" tag="+24%" tone="green" />
            <Row name="Energizante · Lata 355ml" tag="Estable" tone="blue" />
            <Row name="Jugo natural · 1L" tag="−8%" tone="red" />
            <Row name="Snack de maíz · 80g" tag="+31%" tone="green" last />
          </div>
          <Kpi
            label="Cross-selling"
            value="Snacks + Bebidas"
            valueClass="text-[15px] leading-[1.4]"
            delta="87% correlación"
            up
            centered
          />
          <Kpi
            label="Hora pico"
            value="12–14hs"
            delta="Lun–Vie"
            mutedDelta
            centered
          />
        </div>
      </div>

      {/* Lock overlay */}
      <div
        className="absolute inset-0 flex items-end justify-center rounded-[20px] pb-11"
        style={{
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,0.98) 100%)",
        }}
      >
        <div
          className="bg-bivi-surface border-bivi-border max-w-[400px] rounded-[18px] border px-11 py-8 text-center shadow-card-hover"
        >
          <div className="mb-3 text-[28px]" aria-hidden>
            🔒
          </div>
          <h3 className="text-bivi-text mb-2 text-[19px] font-bold">Vista previa del reporte</h3>
          <p className="text-bivi-body mb-5 text-[13px] leading-[1.65]">
            Desbloquea el dashboard completo con data actualizada, filtros por
            período y exportación CSV/PDF.
          </p>
          <Link to="/checkout">
            <Button variant="primary" size="md">
              Desbloquear este reporte →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  up,
  mutedDelta,
  centered,
  valueClass,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  mutedDelta?: boolean;
  centered?: boolean;
  valueClass?: string;
}) {
  return (
    <div
      className={cnLite(
        "bg-bivi-bg-2 border-bivi-border rounded-[10px] border p-4",
        centered && "flex flex-col justify-center",
      )}
    >
      <div className="text-bivi-muted text-[10px] font-semibold tracking-[1px] uppercase">
        {label}
      </div>
      <div
        className={cnLite(
          "text-bivi-text mt-2 text-[26px] font-bold",
          valueClass,
        )}
      >
        {value}
      </div>
      {delta && (
        <div
          className={cnLite(
            "mt-1.5 text-[11px] font-semibold",
            mutedDelta && "text-bivi-muted",
            !mutedDelta && (up ? "text-bivi-magenta" : "text-bivi-magenta-light"),
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

function Row({
  name,
  tag,
  tone,
  last,
}: {
  name: string;
  tag: string;
  tone: "green" | "blue" | "red";
  last?: boolean;
}) {
  const tones: Record<typeof tone, string> = {
    green: "bg-[rgba(34,197,94,0.12)] text-[#15803D]",
    blue: "bg-[rgba(99,102,241,0.12)] text-[#4F46E5]",
    red: "bg-[rgba(241,27,103,0.12)] text-bivi-magenta",
  };
  return (
    <div
      className={cnLite(
        "text-bivi-body flex items-center justify-between py-1.5 text-[12px]",
        !last && "border-bivi-border border-b",
      )}
    >
      <span>{name}</span>
      <span
        className={cnLite(
          "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
          tones[tone],
        )}
      >
        {tag}
      </span>
    </div>
  );
}

function cnLite(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}
