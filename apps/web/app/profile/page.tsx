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
      <div className="page-shell page-shell--narrow pt-10 space-y-6">
        <SectionHeading as="h1">Редактировать профиль</SectionHeading>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr] items-start">
          <Panel className="space-y-4 text-center">
            <div className="flex justify-center">
              <UserAvatar
                archetype={profile?.archetype ?? null}
                avatarUrl={user.avatar ?? null}
                size={120}
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm uppercase tracking-wider text-text-primary">
                {user.nickname ?? "Гость"}
              </div>
              <div className="text-xs text-text-muted">
                {user.email ?? "Почта не указана"}
              </div>
              <div className="text-xs text-brand-cyan">
                {profile?.archetype
                  ? ARCHETYPE_LABELS[profile.archetype]
                  : "Архетип не выбран"}
              </div>
            </div>
          </Panel>
          <ProfileForm token={token} user={user} />
        </div>
      </div>
    </main>
  );
}
