"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../../shared/model/session";
import { useApiHealth } from "../../shared/model/api-health";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Чат" },
  { href: "/profile", label: "Профиль" },
  { href: "/intro", label: "Пролог" },
  { href: "/legal/privacy", label: "Персональные данные" },
  { href: "/legal/terms", label: "Соглашение" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { token, user } = useSession();
  const status = useApiHealth();

  return (
    <header className="sticky top-0 z-50 cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-lg tracking-widest neon-text-cyan"
          >
            METAHUNT
          </Link>
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              status === "ok"
                ? "bg-state-success animate-pulse"
                : status === "error"
                  ? "bg-state-danger"
                  : "bg-state-warning"
            }`}
            title={`API: ${status}`}
          />
          <span className="text-xs uppercase tracking-[0.2em] text-text-dim">
            Admin Watching
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-brand-cyan"
                  : "text-text-muted hover:text-brand-cyan"
              }
            >
              {item.label}
            </Link>
          ))}
          {token && user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-brand-pink hover:text-brand-pink/80"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
