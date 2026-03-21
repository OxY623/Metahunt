import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/legal/privacy", label: "Защита персональных данных" },
  { href: "/legal/terms", label: "Пользовательское соглашение" },
  { href: "/", label: "Главная" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Чат" },
  { href: "/profile", label: "Профиль" },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 py-6 text-center text-text-dim text-xs border-t border-meta-border bg-meta-bg/90">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4">
        <span>© 2026 METAHUNT — DIGITAL DOMINANCE</span>
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-brand-cyan"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
