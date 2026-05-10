import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

const sectionLinks = [
  { href: "#how", label: "Cómo funciona" },
  { href: "#marketplace", label: "Marketplace" },
  { href: "#categories", label: "Categorías" },
  { href: "#pricing", label: "Planes" },
];

export function PortalNav() {
  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between border-b px-6 md:px-12"
      style={{
        background: "color-mix(in oklab, white 80%, transparent)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "var(--bivi-border)",
      }}
    >
      <Logo size="md" />

      <ul className="hidden items-center gap-8 md:flex">
        {sectionLinks.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-bivi-body hover:text-bivi-magenta text-[13px] font-medium transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Link to="/login">
          <Button variant="ghost" size="md">
            Iniciar sesión
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="primary" size="md">
            Acceder como marca →
          </Button>
        </Link>
      </div>
    </nav>
  );
}
