"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../../shared/model/session";
import { useApiHealth } from "../../shared/model/api-health";
import { useGameProfile } from "../../shared/model/game-profile";
import { Soundscape } from "../../shared/ui/Soundscape";

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
  const { profile } = useGameProfile(token, Boolean(token));

  return (
    <header className="sticky top-0 z-50 cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm flex justify-center px-4">
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-lg tracking-widest neon-text-cyan hover:opacity-90 hover:!text-brand-cyan transition-colors transition-opacity duration-300 ease-out"
          >
            <svg className="inline-block size-5 mr-1" id="Layer_1" enableBackground="new 0 0 480 480" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><linearGradient id="SVGID_1_" gradientTransform="matrix(1 0 0 -1 0 482)" gradientUnits="userSpaceOnUse" x1="155.1" x2="324.9" y1="361.1" y2="191.3"><stop offset="0" stopColor="#8dcf23" /><stop offset="1" stopColor="#00a552" /></linearGradient><g><g id="_22.V_"><path d="m141 135h52.5l46.5 154.5 46.5-154.5h52.5l-68.4 210h-61.2z" fill="url(#SVGID_1_)" /></g></g></svg>
            METAHUNT
          </Link>
          <span
            className={`inline-flex shrink-2 h-2.5 w-2.5 rounded-full ${status === "ok"
              ? "bg-state-success animate-pulse"
              : status === "error"
                ? "bg-state-danger"
                : "bg-state-warning"
              }`}
            title={`API: ${status}`}
          />
          <span className="text-xs uppercase tracking-[0.2em] text-text-dim hover:text-brand-pink/80 transition-colors duration-300 ease-out">
            Admin Watching
          </span>
          <Soundscape className="ml-2" archetype={profile?.archetype ?? null} />
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                `nav-link ${pathname === item.href
                  ? "nav-link--active"
                  : "!text-text-muted hover:!text-brand-cyan"}`
              }
            >
              {item.label}
            </Link>
          ))}
          {token && user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="nav-link !text-brand-pink hover:!text-brand-pink/80"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
