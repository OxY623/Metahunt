"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Panel } from "../../shared/ui/Panel";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { useSession } from "../../shared/model/session";
import { useGameProfile } from "../../shared/model/game-profile";
import { logout, updateProfile } from "../../lib/api";
import { UserAvatar } from "../../entities/user/ui/UserAvatar";
import { ARCHETYPE_LABELS } from "../../entities/user/lib/archetypes";

const STORAGE_KEY = "metahunt-ui-settings";

const DEFAULT_SETTINGS = {
  compact: false,
  reduceMotion: false,
  notifications: true,
  autoJoinChat: true,
};

const PRIVACY_OPTIONS = [
  { value: "public", label: "Публичный" },
  { value: "friends", label: "Только друзья" },
  { value: "private", label: "Скрытый" },
];

type Settings = typeof DEFAULT_SETTINGS;

type ProfileDraft = {
  nickname: string;
  avatar: string;
  bio: string;
  privacy: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const { token, user, clear, setUser } = useSession();
  const { profile } = useGameProfile(token, Boolean(token));
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({
    nickname: "",
    avatar: "",
    bio: "",
    privacy: "public",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setProfileDraft({
      nickname: user.nickname ?? "",
      avatar: user.avatar ?? "",
      bio: user.bio ?? "",
      privacy: user.privacy ?? "public",
    });
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<Settings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (_) {
        // ignore invalid storage
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.documentElement.dataset.motion = settings.reduceMotion
      ? "reduce"
      : "auto";
    document.documentElement.dataset.density = settings.compact
      ? "compact"
      : "comfortable";
  }, [settings]);

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    // eslint-disable-next-line no-empty
    } catch (_) {}
    clear();
    router.push("/");
  };

  const handleProfileSave = async () => {
    if (!token) return;
    setProfileSaving(true);
    setProfileError(null);
    try {
      const updated = await updateProfile(token, {
        nickname: profileDraft.nickname || undefined,
        avatar: profileDraft.avatar || undefined,
        bio: profileDraft.bio || undefined,
        privacy: profileDraft.privacy || undefined,
      });
      setUser(updated);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <main className="min-h-screen text-text-primary pb-16">
      <SiteHeader />

      <div className="page-shell pt-10 space-y-8">
        <div className="space-y-2">
          <SectionHeading as="h1">Настройки</SectionHeading>
          <p className="text-text-muted text-sm">
            Локальные параметры интерфейса и аккаунта. Изменения применяются
            сразу.
          </p>
        </div>

        {!token || !user ? (
          <Panel className="space-y-4">
            <div className="text-sm text-text-muted">
              Нужно войти, чтобы управлять профилем и безопасностью.
            </div>
            <Button variant="cyan" size="lg" onClick={() => router.push("/")}
            >
              Вернуться на главную
            </Button>
          </Panel>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Panel className="space-y-5">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    archetype={profile?.archetype ?? null}
                    avatarUrl={user.avatar ?? null}
                    size={64}
                  />
                  <div>
                    <div className="text-xs uppercase tracking-[0.26em] text-text-dim">
                      Аккаунт
                    </div>
                    <div className="text-lg font-display tracking-[0.18em]">
                      {user.nickname}
                    </div>
                    <div className="text-xs text-text-muted">
                      {user.email}
                    </div>
                    {profile?.archetype && (
                      <div className="text-xs text-brand-cyan mt-1">
                        {ARCHETYPE_LABELS[profile.archetype]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-text-dim">
                      Никнейм
                    </div>
                    <Input
                      value={profileDraft.nickname}
                      onChange={(e) =>
                        setProfileDraft((prev) => ({
                          ...prev,
                          nickname: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-text-dim">
                      Email
                    </div>
                    <Input value={user.email} readOnly />
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim">
                    Avatar URL
                  </div>
                  <Input
                    value={profileDraft.avatar}
                    onChange={(e) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        avatar: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim">
                    Bio
                  </div>
                  <textarea
                    rows={4}
                    value={profileDraft.bio}
                    onChange={(e) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
                    placeholder="Короткое описание..."
                  />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim">
                    Приватность
                  </div>
                  <select
                    value={profileDraft.privacy}
                    onChange={(e) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        privacy: e.target.value,
                      }))
                    }
                    className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
                  >
                    {PRIVACY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {profileError && (
                  <div className="text-xs text-brand-pink border border-brand-pink/40 px-3 py-2 rounded">
                    {profileError}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="cyan"
                    size="md"
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                  >
                    {profileSaving ? "..." : "Сохранить профиль"}
                  </Button>
                  <Button variant="neutral" size="md" onClick={() => router.push("/password")}>
                    Сменить пароль
                  </Button>
                  <Button variant="warning" size="md" onClick={handleLogout}>
                    Выйти
                  </Button>
                </div>
              </Panel>

              <Panel className="space-y-4">
                <div className="text-xs uppercase tracking-[0.26em] text-text-dim">
                  Интерфейс
                </div>

                <label className="flex items-center justify-between gap-4 border border-meta-border rounded-lg px-4 py-3">
                  <div>
                    <div className="text-sm uppercase tracking-wider">
                      Компактный режим
                    </div>
                    <div className="text-xs text-text-dim">
                      Меньше отступов и плотнее контент.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compact}
                    onChange={() => toggle("compact")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 border border-meta-border rounded-lg px-4 py-3">
                  <div>
                    <div className="text-sm uppercase tracking-wider">
                      Уменьшить анимации
                    </div>
                    <div className="text-xs text-text-dim">
                      Снижает интенсивность эффектов для комфорта.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={() => toggle("reduceMotion")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 border border-meta-border rounded-lg px-4 py-3">
                  <div>
                    <div className="text-sm uppercase tracking-wider">
                      Уведомления
                    </div>
                    <div className="text-xs text-text-dim">
                      Показывать важные сигналы и системные события.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => toggle("notifications")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 border border-meta-border rounded-lg px-4 py-3">
                  <div>
                    <div className="text-sm uppercase tracking-wider">
                      Авто-вход в чат
                    </div>
                    <div className="text-xs text-text-dim">
                      Открывать общий канал после входа.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoJoinChat}
                    onChange={() => toggle("autoJoinChat")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <Button variant="neutral" size="md" onClick={handleReset}>
                    Сбросить настройки
                  </Button>
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel className="space-y-4">
                <div className="text-xs uppercase tracking-[0.26em] text-text-dim">
                  Системное состояние
                </div>
                <div className="text-sm text-text-muted">
                  Настройки хранятся локально и не влияют на серверную
                  статистику. Для полноценного профиля используйте разделы
                  профиля и пароля.
                </div>
                <div className="text-xs text-text-dim">
                  Совет: включите уменьшение анимаций, если запускаете
                  приложение на слабых устройствах.
                </div>
              </Panel>

              <Panel className="space-y-4">
                <div className="text-xs uppercase tracking-[0.26em] text-text-dim">
                  Быстрые действия
                </div>
                <div className="grid gap-3">
                  <Button variant="cyan" size="md" onClick={() => router.push("/dashboard")}>
                    Перейти в Dashboard
                  </Button>
                  <Button variant="neutral" size="md" onClick={() => router.push("/chat")}>
                    Открыть чат
                  </Button>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
