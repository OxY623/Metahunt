"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { Panel } from "../../shared/ui/Panel";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";
import { useSession } from "../../shared/model/session";
import { useGameProfile } from "../../shared/model/game-profile";
import { ArchetypePicker } from "../../features/game/ui/ArchetypePicker";
import { ArchetypeActions } from "../../features/game/ui/ArchetypeActions";
import { ARCHETYPE_LABELS } from "../../entities/user/lib/archetypes";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, loading } = useSession();
  const { profile, refresh } = useGameProfile(token, Boolean(token));
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Перенаправление...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />

      <div className="page-shell pt-10 space-y-6">
        <SectionHeading as="h1" className={profile?.archetype ? "archetype-heading" : ""}>
          Панель управления
        </SectionHeading>

        <Panel className="space-y-4">
          <h2 className="text-brand-cyan text-sm uppercase tracking-wider">Профиль</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p>
              <span className="text-text-dim">ID:</span> {user.id}
            </p>
            <p>
              <span className="text-text-dim">Email:</span> {user.email}
            </p>
            <p>
              <span className="text-text-dim">Nick:</span> {user.nickname}
            </p>
            <p>
              <span className="text-text-dim">Role:</span> {user.role}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button variant="cyan" size="sm" onClick={() => router.push("/profile")}>Редактировать</Button>
            <Button variant="neutral" size="sm" onClick={() => router.push("/password")}>Сменить пароль</Button>
            <Button variant="neutral" size="sm" onClick={() => router.push("/codex")}>Кодекс / Правила</Button>
          </div>
        </Panel>

        <Panel variant="cyan" className="space-y-3">
          <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Быстрый доступ</div>
          <div className="flex flex-wrap gap-3">
            <Button variant="neutral" size="sm" onClick={() => router.push("/map")}>Карта</Button>
            <Button variant="neutral" size="sm" onClick={() => router.push("/posts")}>Посты</Button>
            <Button variant="neutral" size="sm" onClick={() => router.push("/invites")}>Инвайты</Button>
            <Button variant="neutral" size="sm" onClick={() => router.push("/chat")}>Чат</Button>
          </div>
        </Panel>

        {profile && (
          <Panel variant="pink" className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-sm uppercase tracking-wider archetype-heading">Игровой профиль</h2>
              {profile.archetype && <Badge tone="cyan">{ARCHETYPE_LABELS[profile.archetype]}</Badge>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <p>
                <span className="text-text-dim">Архетип:</span> {profile.archetype ?? "—"}
              </p>
              <p>
                <span className="text-text-dim">Уровень:</span> {profile.level}
              </p>
              <p>
                <span className="text-text-dim">XP:</span> {profile.xp} / {profile.xp_to_next}
              </p>
              <p>
                <span className="text-text-dim">Репутация:</span> {profile.reputation}
              </p>
              <p>
                <span className="text-text-dim">Сезон:</span> {profile.season_points}
              </p>
              <p>
                <span className="text-text-dim">Shards:</span> {profile.shards}
              </p>
              <p>
                <span className="text-text-dim">Энергия:</span> {profile.energy}
              </p>
            </div>

            {profile.stats && (
              <div className="pt-3 border-t border-meta-border">
                <p className="text-text-dim text-xs mb-2">Характеристики</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profile.stats).map(([k, v]) => (
                    <span key={k} className="px-2 py-1 bg-meta-surface/70 rounded text-xs">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        )}

        {!profile?.archetype && <ArchetypePicker token={token} onChosen={refresh} />}

        {profile?.archetype && (
          <ArchetypeActions
            token={token}
            archetype={profile.archetype}
            onDone={(msg) => {
              setActionMsg(msg);
              refresh();
            }}
          />
        )}

        {actionMsg && <div className="text-xs text-brand-cyan">{actionMsg}</div>}
      </div>
    </main>
  );
}
