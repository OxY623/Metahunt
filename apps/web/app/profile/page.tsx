"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { useSession } from "../../shared/model/session";
import { ProfileForm } from "../../features/profile/ui/ProfileForm";
import { useGameProfile } from "../../shared/model/game-profile";
import { Panel } from "../../shared/ui/Panel";
import { UserAvatar } from "../../entities/user/ui/UserAvatar";
import { ARCHETYPE_LABELS } from "../../entities/user/lib/archetypes";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, loading } = useSession();
  const { profile } = useGameProfile(token, Boolean(token));

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
          Профиль агента
        </SectionHeading>

        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr] items-start">
          <div className="space-y-6">
            <Panel className="space-y-4 text-center reveal-fade">
              <div className="flex justify-center">
                <UserAvatar
                  archetype={profile?.archetype ?? null}
                  avatarUrl={user.avatar ?? null}
                  size={120}
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Identity</div>
                <div className="text-base font-display tracking-[0.14em] uppercase">{user.nickname ?? "Гость"}</div>
                <div className="text-xs text-text-muted">{user.email ?? "Почта не указана"}</div>
              </div>

              <div className="flex justify-center flex-wrap gap-2">
                <Badge tone={profile?.archetype ? "cyan" : "warning"}>
                  {profile?.archetype
                    ? ARCHETYPE_LABELS[profile.archetype]
                    : "Архетип не выбран"}
                </Badge>
                <Badge tone="muted">Role: {user.role}</Badge>
              </div>

              {user.bio && (
                <div className="text-sm text-text-muted border border-meta-border rounded-lg px-3 py-3 bg-meta-bg/40 text-left">
                  {user.bio}
                </div>
              )}
            </Panel>

            <Panel className="space-y-4">
              <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Быстрые переходы</div>
              <div className="grid gap-3">
                <Button variant="neutral" size="md" onClick={() => router.push("/dashboard")}>Вернуться в Dashboard</Button>
                <Button variant="neutral" size="md" onClick={() => router.push("/settings")}>Центр управления</Button>
                <Button variant="neutral" size="md" onClick={() => router.push("/password")}>Смена пароля</Button>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel className="space-y-3">
              <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Редактор профиля</div>
              <div className="text-sm text-text-muted">
                Обнови ник, аватар, bio и приватность. После сохранения ты вернёшься в Dashboard.
              </div>
            </Panel>

            <ProfileForm token={token} user={user} />
          </div>
        </div>
      </div>
    </main>
  );
}