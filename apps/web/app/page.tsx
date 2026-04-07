"use client";

import { SiteHeader } from "../widgets/site/SiteHeader";
import { LandingHero } from "../widgets/landing/LandingHero";
import { AuthPanel } from "../widgets/landing/AuthPanel";
import { SectionHeading } from "../shared/ui/SectionHeading";
import { useSession } from "../shared/model/session";
import LoadingScreen from "../shared/ui/LoadingScreen";
import { Button } from "../shared/ui/Button";
import { Panel } from "../shared/ui/Panel";
import { UserAvatar } from "../entities/user/ui/UserAvatar";
import { useGameProfile } from "../shared/model/game-profile";
import AdminGlitchTerminal from "../widgets/foxy/AdminGlitchTerminal";

export default function HomePage() {
  const { token, user, loading } = useSession();
  const { profile } = useGameProfile(token, Boolean(token));
  const isAuthed = Boolean(token && user);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen text-text-primary pb-16">
      <SiteHeader />

      <div className="page-shell pt-12 space-y-10">
        {!isAuthed ? (
          <LandingHero />
        ) : (
          <Panel className="aggressive-frame reveal-fade p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-text-dim">
              Session Online
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-display text-2xl tracking-[0.2em] neon-text-cyan uppercase">
                  Добро пожаловать, {user?.nickname}
                </div>
                <div className="text-xs text-text-muted uppercase tracking-[0.2em] mt-2">
                  Архетип: {profile?.archetype ?? "не выбран"}
                </div>
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-brand-pink glitchy">
                Admin Watching
              </div>
            </div>
          </Panel>
        )}

        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-4">
            <SectionHeading
              as="h1"
              className={profile?.archetype ? "archetype-heading" : ""}
            >
              {isAuthed ? "Сессия активна" : "Вход в систему"}
            </SectionHeading>
            <p className="text-text-muted text-sm">
              {isAuthed
                ? "Ты уже в сети. Открой панель, выбери архетип и двигайся дальше."
                : "Охоться. Следи. Доминируй. Админ фиксирует каждый шаг."}
            </p>
            <div className="text-xs text-text-dim uppercase tracking-[0.28em]">
              {isAuthed ? "Signal = Live • Admin Watching" : "Trust = False • Survival = True"}
            </div>

            {isAuthed && (
              <Panel className="mt-6 p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-text-dim">
                  Быстрый доступ
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button variant="cyan" size="sm" onClick={() => (window.location.href = "/dashboard")}>
                    Панель
                  </Button>
                  <Button variant="neutral" size="sm" onClick={() => (window.location.href = "/chat")}>
                    Чат
                  </Button>
                  <Button variant="neutral" size="sm" onClick={() => (window.location.href = "/codex")}>
                    Кодекс / Правила
                  </Button>
                  <Button variant="neutral" size="sm" onClick={() => (window.location.href = "/profile")}>
                    Профиль
                  </Button>
                </div>
              </Panel>
            )}
          </div>

          {isAuthed && user ? (
            <Panel className="space-y-5 aggressive-frame reveal-fade">
              <div className="text-xs uppercase tracking-[0.3em] text-text-dim">
                Live Feed
              </div>
              <div className="flex items-center gap-4">
                <UserAvatar archetype={profile?.archetype ?? null} avatarUrl={user.avatar ?? null} size={64} />
                <div>
                  <div className="font-display text-2xl tracking-[0.22em] neon-text-cyan uppercase">
                    Охота активна
                  </div>
                  <div className="text-xs text-text-muted uppercase tracking-[0.2em]">
                    Готов к действиям
                  </div>
                </div>
              </div>

              <div className="text-sm text-text-muted">
                Админ наблюдает за твоими действиями. Сеть стабилизирована.
                Готов к следующей охоте?
              </div>

              <AdminGlitchTerminal
                title="ADMIN / LIVE FEED"
                lines={[
                  "$ admin.status --live",
                  "LINK: STABLE",
                  "$ shards.scan --silent",
                  "TARGETS FOUND",
                  `// user: ${user.nickname}`,
                  "SURVIVAL = TRUE",
                ]}
                className="reveal-pop"
                speedMs={14}
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="cyan"
                  size="lg"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Открыть панель
                </Button>
                <Button
                  variant="neutral"
                  size="lg"
                  onClick={() => (window.location.href = "/chat")}
                >
                  Открыть чат
                </Button>
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-brand-pink glitchy">
                Admin Watching
              </div>
            </Panel>
          ) : (
            <AuthPanel />
          )}
        </section>

        <button
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/docs`,
              "_blank",
            )
          }
          className={`text-text-dim text-xs hover:text-brand-cyan transition ${isAuthed ? "hidden" : ""}`}
        >
          API DOCS →
        </button>
      </div>
    </main>
  );
}