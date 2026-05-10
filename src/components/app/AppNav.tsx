import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { authApi } from "@/lib/api";

type NavLink = { to: string; label: string };

const links: NavLink[] = [
  { to: "/reports", label: "Explorar" },
  { to: "/reports", label: "Mis reportes" },
  { to: "/reports", label: "Industrias" },
  { to: "/reports", label: "Soporte" },
];

export function AppNav({
  initials = "DC",
  name = "Daniel C.",
}: {
  readonly initials?: string;
  readonly name?: string;
}) {
  const { data } = useQuery({
    queryKey: ["portal-auth-me"],
    queryFn: () => authApi.me(),
    staleTime: 60_000,
    retry: false,
  });

  const userName = data?.data
    ? `${data.data.nombre} ${data.data.apellido}`
    : name;

  const userInitials = data?.data
    ? `${data.data.nombre?.[0] ?? ""}${data.data.apellido?.[0] ?? ""}`.toUpperCase()
    : initials;

  return (
    <nav
      className="sticky top-0 z-50 flex h-[66px] items-center justify-between border-b px-5 md:px-10"
      style={{
        background: "color-mix(in oklab, var(--bivi-bg) 92%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--bivi-border)",
      }}
    >
      <Link to="/portal" className="flex items-center">
        <Logo size="md" />
      </Link>

      <ul className="hidden items-center gap-7 md:flex">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-bivi-muted-2 hover:text-bivi-text text-[13px] font-medium transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="border-bivi-border-soft bg-bivi-bg-3 hover:border-bivi-magenta flex cursor-pointer items-center gap-2.5 rounded-full border py-1.5 pr-3.5 pl-1.5 transition-colors"
        >
          <span className="bg-gradient-main flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold text-white">
            {userInitials}
          </span>
          <span className="text-bivi-text hidden text-[13px] sm:inline">
            {userName}
          </span>
        </Link>
      </div>
    </nav>
  );
}
