import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-bivi-border rounded-[14px] border p-[22px] backdrop-blur-md ${className}`}
      style={{ background: "color-mix(in oklab, var(--bivi-bg) 60%, transparent)" }}
    >
      <div className="mb-[18px] flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-bold text-bivi-text">{title}</div>
          {subtitle && (
            <div className="text-bivi-muted mt-[3px] text-[11px]">{subtitle}</div>
          )}
        </div>
        {actions && <div className="flex gap-1.5">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function ChartButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all ${
        active
          ? "bg-gradient-main border-transparent text-white"
          : "border-bivi-border-soft bg-bivi-bg-3 text-bivi-muted-2 hover:border-bivi-magenta hover:text-bivi-magenta"
      }`}
      style={{ fontFamily: "Sora, sans-serif" }}
    >
      {children}
    </button>
  );
}
