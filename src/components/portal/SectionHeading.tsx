import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  className,
}: Props) {
  const isCenter = align === "center";
  return (
    <div className={cn(isCenter && "text-center", className)}>
      <span
        className={cn(
          "text-gradient-main inline-flex items-center gap-2 text-[11px] font-semibold tracking-[2.5px] uppercase",
          isCenter && "justify-center",
        )}
      >
        <span
          className="bg-gradient-main inline-block h-[2px] w-[18px] shrink-0 rounded-sm"
          aria-hidden
        />
        {label}
      </span>
      <h2 className="mt-3.5 text-[clamp(28px,4vw,50px)] leading-[1.1] font-extrabold tracking-[-1.5px]">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-bivi-muted-2 mt-4 max-w-[520px] text-base leading-[1.8] font-normal",
            isCenter && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
