"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "../../lib/api";
import { useSession } from "../../shared/model/session";
import { useApiHealth } from "../../shared/model/api-health";
import { useGameProfile } from "../../shared/model/game-profile";
import { Soundscape } from "../../shared/ui/Soundscape";
import { UserAvatar } from "../../entities/user/ui/UserAvatar";
import { ARCHETYPE_LABELS } from "../../entities/user/lib/archetypes";
import { Button } from "../../shared/ui/Button";
import { AudioController } from "./AudioController";

const PRIMARY_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/dashboard", label: "Панель" },
  { href: "/map", label: "Карта" },
  { href: "/posts", label: "Посты" },
  { href: "/chat", label: "Чат" },
  { href: "/codex", label: "Кодекс" },
  { href: "/settings", label: "Настройки" },
];

const SECONDARY_LINKS = [
  { href: "/invites", label: "Инвайты" },
  { href: "/profile", label: "Профиль" },
  { href: "/password", label: "Пароль" },
  { href: "/intro?force=1", label: "Пролог" },
  { href: "/legal/privacy", label: "Персональные данные" },
  { href: "/legal/terms", label: "Соглашение" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, clear } = useSession();
  const status = useApiHealth();
  const { profile } = useGameProfile(token, Boolean(token));
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      // eslint-disable-next-line no-empty
    } catch (_) {}
    clear();
    setMenuOpen(false);
    router.push("/");
  };

  const goTo = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  const menuOverlay = menuOpen ? (
    <div className="fixed inset-0 z-[9999]" aria-hidden={!menuOpen}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setMenuOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Меню пользователя"
        className="absolute right-0 top-0 h-full w-[320px] max-w-[90vw] bg-meta-bg/95 backdrop-blur border-l border-meta-border shadow-[0_0_24px_rgba(0,240,255,0.18)] overflow-y-auto z-[10000]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-text-dim">
              Системное меню
            </div>
            <Button size="sm" variant="neutral" onClick={() => setMenuOpen(false)}>
              Закрыть
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <UserAvatar
              archetype={profile?.archetype ?? null}
              avatarUrl={user?.avatar ?? null}
              size={56}
            />
            <div>
              <div className="text-sm uppercase tracking-wider text-text-primary">
                {user?.nickname ?? "Гость"}
              </div>
              <div className="text-xs text-text-dim">
                {user?.email ?? "Вход не выполнен"}
              </div>
              {profile?.archetype && (
                <div className="text-xs text-brand-cyan mt-1">
                  {ARCHETYPE_LABELS[profile.archetype]}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.28em] text-text-dim">
              Навигация
            </div>
            <div className="grid gap-2">
              {[...PRIMARY_LINKS, ...SECONDARY_LINKS].map((item) => (
                <Button
                  key={item.href}
                  variant={item.href === "/codex" ? "pink" : pathname === item.href ? "cyan" : "neutral"}
                  size="md"
                  className="w-full justify-start"
                  onClick={() => goTo(item.href)}
                >
                  {item.label}
                </Button>
              ))}
              {token && user?.role === "ADMIN" && (
                <Button
                  variant="pink"
                  size="md"
                  className="w-full justify-start"
                  onClick={() => goTo("/admin")}
                >
                  Admin Panel
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.28em] text-text-dim">
              Настройки
            </div>
            <Soundscape archetype={profile?.archetype ?? null} />
            <AudioController />
          </div>

          <div className="space-y-2">
            {token ? (
              <Button
                variant="warning"
                size="md"
                className="w-full"
                onClick={handleLogout}
              >
                Выйти
              </Button>
            ) : (
              <Button
                variant="cyan"
                size="md"
                className="w-full"
                onClick={() => goTo("/")}
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-[120] cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm flex justify-center">
        <div className="page-shell py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-display text-lg tracking-widest neon-text-cyan hover:opacity-90 hover:!text-brand-cyan transition-colors transition-opacity duration-300 ease-out"
            >
              <svg className="inline-block size-5 mr-1" id="Layer_1" enableBackground="new 0 0 480 480" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><linearGradient id="SVGID_1_" gradientTransform="matrix(1 0 0 -1 0 482)" gradientUnits="userSpaceOnUse" x1="155.1" x2="324.9" y1="361.1" y2="191.3"><stop offset="0" stopColor="#8dcf23" /><stop offset="1" stopColor="#00a552" /></linearGradient><g><g id="_22.V_"><path d="m141 135h52.5l46.5 154.5 46.5-154.5h52.5l-68.4 210h-61.2z" fill="url(#SVGID_1_)" /></g></g></svg>
              METAHUNT
            </Link>
            <span
              className={`inline-flex shrink-0 h-2.5 w-2.5 rounded-full ${status === "ok"
                ? "bg-state-success animate-pulse"
                : status === "error"
                  ? "bg-state-danger"
                  : "bg-state-warning"
                }`}
              title={`API: ${status}`}
            />
            <span className="hidden md:inline text-xs uppercase tracking-[0.2em] text-text-dim hover:text-brand-pink/80 transition-colors duration-300 ease-out">
              Админ наблюдает
            </span>
          </div>

          <nav className="hidden lg:flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  `nav-link ${pathname === item.href
                    ? "nav-link--active"
                    : item.href === "/codex"
                      ? "nav-link--codex"
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

          <div className="flex items-center gap-2">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setMenuOpen(true)}
            >
              Меню
            </Button>
          </div>
        </div>
      </header>
      {mounted && menuOverlay ? createPortal(menuOverlay, document.body) : null}
    </>
  );
}

