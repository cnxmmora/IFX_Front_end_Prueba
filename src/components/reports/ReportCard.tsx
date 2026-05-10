import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export type Badge = { kind: "hot" | "new" | "premium"; label: string };

export type ReportCardData = {
  id: string;
  icon: string;
  category: string;
  title: string;
  description: string;
  date: string;
  views: string;
  frequency: string;
  price: string;
  badge?: Badge;
  preview: ReactNode;
};

const badgeStyles: Record<Badge["kind"], string> = {
  hot: "bg-bivi-magenta/85 text-white",
  new: "bg-indigo-500/85 text-white",
  premium: "bg-purple-500/85 text-white",
};

export function ReportCard({ report }: { readonly report: ReportCardData }) {
  return (
    <Link
      to="/report/$id"
      params={{ id: report.id }}
      className="group bg-bivi-bg/60 border-bivi-border relative block overflow-hidden rounded-[14px] border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-bivi-magenta/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
    >
      <div className="border-bivi-border-soft bg-bivi-bg-3 relative h-[140px] overflow-hidden border-b">
        <div className="bg-bivi-bg-3/90 border-bivi-border absolute left-3 top-3 z-10 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border text-base backdrop-blur-md">
          {report.icon}
        </div>
        {report.badge && (
          <div className="absolute right-3 top-3 z-10">
            <span
              className={`rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-wide ${badgeStyles[report.badge.kind]}`}
            >
              {report.badge.label}
            </span>
          </div>
        )}
        {report.preview}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bivi-bg/90" />
      </div>

      <div className="px-5 py-[18px]">
        <div className="text-bivi-muted mb-1.5 text-[10px] font-semibold uppercase tracking-[1.2px]">
          {report.category}
        </div>
        <h3 className="mb-2 line-clamp-2 text-[15px] font-bold leading-[1.35]">
          {report.title}
        </h3>
        <p className="text-bivi-muted-2 mb-3.5 line-clamp-2 text-[12.5px] leading-[1.65]">
          {report.description}
        </p>

        <div className="border-bivi-border-soft mb-4 flex flex-wrap gap-3 border-b pb-4">
          <span className="text-bivi-muted flex items-center gap-1 text-[11px]">
            📅 {report.date}
          </span>
          <span className="text-bivi-muted flex items-center gap-1 text-[11px]">
            👁 {report.views}
          </span>
          <span className="text-bivi-muted flex items-center gap-1 text-[11px]">
            ⚡ {report.frequency}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold leading-none">{report.price}</div>
            <div className="text-bivi-muted text-[11px]">USD/mes</div>
          </div>
          <span className="text-bivi-magenta rounded-full border-[1.5px] border-bivi-magenta/40 px-3.5 py-1.5 text-[12px] font-semibold transition-all group-hover:border-bivi-magenta group-hover:bg-bivi-magenta/10">
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
  );
}
