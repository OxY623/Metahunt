"use client";

import { useEffect, useMemo, useState } from "react";
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

type InterfaceVibe = "neon" | "sunset" | "matrix";

type Settings = {
  compact: boolean;
  reduceMotion: boolean;
  notifications: boolean;
  autoJoinChat: boolean;
  vibe: InterfaceVibe;
};

const DEFAULT_SETTINGS: Settings = {
  compact: false,
  reduceMotion: false,
  notifications: true,
  autoJoinChat: true,
  vibe: "neon",
};

const PRIVACY_OPTIONS = [
  { value: "public", label: "Публичный" },
  { value: "friends", label: "Только друзья" },
  { value: "private", label: "Скрытый" },
];

const VIBE_OPTIONS: Array<{ value: InterfaceVibe; title: string; desc: string }> = [
  {
    value: "neon",
    title: "Neon Pulse",
    desc: "Классический cyber-неон с акцентом на сигналы.",
  },
  {
    value: "sunset",
    title: "Sunset Grid",
    desc: "Теплее и мягче: закатные градиенты для долгих сессий.",
  },
  {
    value: "matrix",
    title: "Matrix Ops",
    desc: "Контрастный tactical-режим с изумрудным свечением.",
  },
];

type ProfileDraft = {
  nickname: string;
  avatar: string;
  bio: string;
  privacy: string;
};

function isInterfaceVibe(value: unknown): value is InterfaceVibe {
  return value === "neon" || value === "sunset" || value === "matrix";
}

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

  const bioLeft = 280 - profileDraft.bio.length;
  const hasProfileChanges = useMemo(() => {
    if (!user) return false;
    return (
      (profileDraft.nickname ?? "") !== (user.nickname ?? "") ||
      (profileDraft.avatar ?? "") !== (user.avatar ?? "") ||
      (profileDraft.bio ?? "") !== (user.bio ?? "") ||
      (profileDraft.privacy ?? "public") !== (user.privacy ?? "public")
    );
  }, [profileDraft, user]);

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
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<Settings>;
      setSettings((prev) => ({
        compact: typeof parsed.compact === "boolean" ? parsed.compact : prev.compact,
        reduceMotion:
          typeof parsed.reduceMotion === "boolean"
            ? parsed.reduceMotion
            : prev.reduceMotion,
        notifications:
          typeof parsed.notifications === "boolean"
            ? parsed.notifications
            : prev.notifications,
        autoJoinChat:
          typeof parsed.autoJoinChat === "boolean"
            ? parsed.autoJoinChat
            : prev.autoJoinChat,
        vibe: isInterfaceVibe(parsed.vibe) ? parsed.vibe : prev.vibe,
      }));
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.documentElement.dataset.motion = settings.reduceMotion ? "reduce" : "auto";
    document.documentElement.dataset.density = settings.compact ? "compact" : "comfortable";
    document.documentElement.dataset.vibe = settings.vibe;
  }, [settings]);

  const toggle = (key: "compact" | "reduceMotion" | "notifications" | "autoJoinChat") => {
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
    } catch {}
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
        <div className="space-y-3">
          <SectionHeading as="h1">Центр управления</SectionHeading>
          <p className="text-text-muted text-sm">
            Настрой интерфейс под себя: визуальный режим, плотность, эффекты и профиль.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-text-dim">
            <span className="rounded-full border border-meta-border px-2 py-1">Vibe: {settings.vibe}</span>
            <span className="rounded-full border border-meta-border px-2 py-1">
              Density: {settings.compact ? "compact" : "comfortable"}
            </span>
            <span className="rounded-full border border-meta-border px-2 py-1">
              Motion: {settings.reduceMotion ? "reduce" : "full"}
            </span>
          </div>
        </div>

        {!token || !user ? (
          <Panel className="space-y-4">
            <div className="text-sm text-text-muted">
              Нужно войти, чтобы управлять профилем и персональными параметрами интерфейса.
            </div>
            <Button variant="cyan" size="lg" onClick={() => router.push("/")}>Вернуться на главную</Button>
          </Panel>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Panel className="space-y-5">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    archetype={profile?.archetype ?? null}
                    avatarUrl={profileDraft.avatar || user.avatar || null}
                    size={68}
                  />
                  <div>
                    <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Аккаунт</div>
                    <div className="text-lg font-display tracking-[0.18em]">{user.nickname}</div>
                    <div className="text-xs text-text-muted">{user.email}</div>
                    {profile?.archetype && (
                      <div className="text-xs text-brand-cyan mt-1">{ARCHETYPE_LABELS[profile.archetype]}</div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Никнейм</div>
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
                    <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Email</div>
                    <Input value={user.email} readOnly />
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Avatar URL</div>
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
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Bio</div>
                  <textarea
                    rows={4}
                    maxLength={280}
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
                  <div className="mt-1 text-right text-xs text-text-dim">Осталось: {bioLeft}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Приватность</div>
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
                    disabled={profileSaving || !hasProfileChanges}
                  >
                    {profileSaving ? "Сохранение..." : "Сохранить профиль"}
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
                <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Интерфейс</div>

                <div className="grid gap-3 md:grid-cols-3">
                  {VIBE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, vibe: option.value }))}
                      className={`vibe-option ${settings.vibe === option.value ? "vibe-option--active" : ""}`}
                    >
                      <span className="vibe-option__title">{option.title}</span>
                      <span className="vibe-option__desc">{option.desc}</span>
                    </button>
                  ))}
                </div>

                <label className="settings-row">
                  <div>
                    <div className="settings-row__title">Компактный режим</div>
                    <div className="settings-row__desc">Меньше отступов и плотнее контент.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compact}
                    onChange={() => toggle("compact")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <label className="settings-row">
                  <div>
                    <div className="settings-row__title">Уменьшить анимации</div>
                    <div className="settings-row__desc">Снижает интенсивность эффектов для комфорта.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={() => toggle("reduceMotion")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <label className="settings-row">
                  <div>
                    <div className="settings-row__title">Уведомления</div>
                    <div className="settings-row__desc">Показывать важные сигналы и системные события.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => toggle("notifications")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <label className="settings-row">
                  <div>
                    <div className="settings-row__title">Авто-вход в чат</div>
                    <div className="settings-row__desc">Открывать общий канал после входа.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoJoinChat}
                    onChange={() => toggle("autoJoinChat")}
                    className="h-5 w-5 accent-cyan-400"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <Button variant="neutral" size="md" onClick={handleReset}>Сбросить настройки</Button>
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel className="space-y-4">
                <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Live Preview</div>
                <div className="preview-card">
                  <div className="preview-card__title">UI / {settings.vibe.toUpperCase()}</div>
                  <div className="preview-card__line">Density: {settings.compact ? "compact" : "comfortable"}</div>
                  <div className="preview-card__line">Motion: {settings.reduceMotion ? "reduced" : "dynamic"}</div>
                  <div className="preview-card__line">Notifications: {settings.notifications ? "enabled" : "disabled"}</div>
                </div>
                <div className="text-xs text-text-dim">
                  Здесь видно, как выбранный стиль влияет на акценты и контраст.
                </div>
              </Panel>

              <Panel className="space-y-4">
                <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Быстрые действия</div>
                <div className="grid gap-3">
                  <Button variant="cyan" size="md" onClick={() => router.push("/dashboard")}>Перейти в Dashboard</Button>
                  <Button variant="neutral" size="md" onClick={() => router.push("/chat")}>Открыть чат</Button>
                  <Button variant="neutral" size="md" onClick={() => router.push("/posts")}>Открыть постинг</Button>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}