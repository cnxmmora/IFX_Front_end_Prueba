import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "surface" | "soft" | "outline";
  interactive?: boolean;
};

const variants = {
  surface: "surface-panel",
  soft: "surface-panel bg-accent-mesh",
  outline: "bg-transparent border border-border/70",
};

export function Card({
  className,
  variant = "surface",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] p-6 transition-all duration-200",
        variants[variant],
        interactive && "cursor-pointer hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-xl",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />;
}

export function CardTitle({
  className,
  children,
  ...props
}: Readonly<PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>>) {
  return (
    <h3
      className={cn("text-foreground text-lg font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn("text-muted-foreground text-sm leading-relaxed", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("text-muted-foreground", className)} {...props} />;
}
