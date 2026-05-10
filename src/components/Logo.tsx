import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  asLink?: boolean;
  className?: string;
};

const sizes = {
  sm: { icon: "h-8 w-8 rounded-xl", svg: "h-4 w-4", name: "text-[15px]", sub: "text-[9px] tracking-[2.4px]" },
  md: { icon: "h-9 w-9 rounded-xl", svg: "h-5 w-5", name: "text-[18px]", sub: "text-[10px] tracking-[2.8px]" },
  lg: { icon: "h-11 w-11 rounded-[1rem]", svg: "h-[22px] w-[22px]", name: "text-[20px]", sub: "text-[11px] tracking-[3.2px]" },
};

export function Logo({
  size = "md",
  showWordmark = true,
  asLink = true,
  className,
}: Readonly<LogoProps>) {
  const s = sizes[size];

  const content = (
    <>
      <span
        className={cn(
          "surface-glow flex shrink-0 items-center justify-center bg-primary",
          s.icon,
        )}
        aria-hidden
      >
        <svg
          className={s.svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7h7.5A3.5 3.5 0 0 1 16 10.5v0A3.5 3.5 0 0 1 12.5 14H5V7Zm0 0v10h8.2A3.8 3.8 0 0 0 17 13.2v0A3.8 3.8 0 0 0 13.2 9.4"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn("font-extrabold tracking-[-0.04em]", s.name)}
          >
            TestFX
          </span>
          <span
            className={cn("text-muted-foreground font-medium uppercase", s.sub)}
          >
            VM CONTROL
          </span>
        </span>
      )}
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-2.5 no-underline",
    className,
  );

  if (asLink) {
    return (
      <Link to="/portal" className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
