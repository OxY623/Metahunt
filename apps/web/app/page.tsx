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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen text-text-primary pb-16">
      <SiteHeader />

      <div className="pt-12 px-4 max-w-6xl mx-auto">
        <LandingHero />

        <section className="mt-12 grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-4">
            <SectionHeading
              as="h1"
              className={profile?.archetype ? "archetype-heading" : ""}
            >
              Вход В Систему
            </SectionHeading>
            <p className="text-text-muted text-sm">
              Охоться. Следи. Доминируй. Админ фиксирует каждый шаг.
            </p>
            <div className="text-xs text-text-dim uppercase tracking-[0.28em]">
              Trust = False • Survival = True
            </div>
          </div>

          {token && user ? (
            <Panel
              className="space-y-5 augmented-ui aggressive-frame reveal-fade"
              data-augmented-ui="tl-clip tr-clip bl-clip br-clip inlay"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-text-dim">
                Session Online
              </div>
              <div className="flex items-center gap-4">
                <UserAvatar archetype={profile?.archetype ?? null} size={64} />
                <div>
                  <div className="font-display text-2xl tracking-[0.22em] neon-text-cyan uppercase">
                    Добро пожаловать, {user.nickname}
                  </div>
                  <div className="text-xs text-text-muted uppercase tracking-[0.2em]">
                    Архетип: {profile?.archetype ?? "не выбран"}
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
                  Открыть Dashboard
                </Button>
                <Button
                  variant="neutral"
                  size="lg"
                  onClick={() => (window.location.href = "/chat")}
                >
                  Открыть Чат
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
          className="mt-10 text-text-dim text-xs hover:text-brand-cyan transition"
        >
          API DOCS →
        </button>
      </div>
    </main>
  );
}
