"use client";

import { useEffect, useMemo, useState } from "react";
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
import { UserAvatar } from "../../entities/user/ui/UserAvatar";
import {
  claimDailyLogin,
  claimQuestReward,
  getArchetypeTasks,
  getFactionPulse,
  getGameActivity,
  type ArchetypeTask,
  type FactionPulseResponse,
  type GameActivityItem,
} from "../../lib/api";

const QUICK_LINKS = [
  { href: "/map", label: "Карта", desc: "Пульс районов и check-in" },
  { href: "/posts", label: "Посты", desc: "Сигналы, истории и клатчи" },
  { href: "/invites", label: "Инвайты", desc: "Контроль доступа в сеть" },
  { href: "/chat", label: "Чат", desc: "Фракционный канал и DM" },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, loading } = useSession();
  const { profile, refresh } = useGameProfile(token, Boolean(token));
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [activity, setActivity] = useState<GameActivityItem[]>([]);
  const [tasks, setTasks] = useState<ArchetypeTask[]>([]);
  const [pulse, setPulse] = useState<FactionPulseResponse | null>(null);
  const [rewardLoading, setRewardLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  useEffect(() => {
    if (!token) return;
    Promise.all([getGameActivity(token), getArchetypeTasks(token), getFactionPulse(token)])
      .then(([activityItems, taskData, pulseData]) => {
        setActivity(activityItems);
        setTasks(taskData.recommended);
        setPulse(pulseData);
      })
      .catch(() => {
        setActivity([]);
        setTasks([]);
        setPulse(null);
      });
  }, [token, profile?.shards]);

  const refreshEconomy = async () => {
    await refresh();
    if (token) {
      const [items, taskData, pulseData] = await Promise.all([
        getGameActivity(token),
        getArchetypeTasks(token),
        getFactionPulse(token),
      ]);
      setActivity(items);
      setTasks(taskData.recommended);
      setPulse(pulseData);
    }
  };

  const claimReward = async (kind: "daily" | "quest", questKey = "first_move") => {
    if (!token) return;
    setRewardLoading(kind === "daily" ? "daily" : questKey);
    setActionMsg(null);
    try {
      const res =
        kind === "daily"
          ? await claimDailyLogin(token)
          : await claimQuestReward(token, questKey);
      setActionMsg(res.msg);
      await refreshEconomy();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Награда недоступна");
    } finally {
      setRewardLoading(null);
    }
  };

  const xpProgress = useMemo(() => {
    if (!profile || profile.xp_to_next <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((profile.xp / profile.xp_to_next) * 100)));
  }, [profile]);

  const pulseTask = useMemo(
    () =>
      pulse?.recommended_task_key
        ? tasks.find((task) => task.key === pulse.recommended_task_key) ?? null
        : null,
    [pulse?.recommended_task_key, tasks],
  );

  const openTask = async (task: ArchetypeTask) => {
    if (task.key === "daily_login") {
      await claimReward("daily");
      return;
    }
    const target = task.screen === "dashboard" ? "/dashboard" : `/${task.screen}`;
    router.push(target);
  };

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
          Оперативная панель
        </SectionHeading>

        <Panel className="aggressive-frame reveal-fade p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                archetype={profile?.archetype ?? null}
                avatarUrl={user.avatar ?? null}
                size={68}
              />
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-[0.25em] text-text-dim">Session Online</div>
                <div className="font-display text-xl tracking-[0.16em] text-text-primary uppercase">
                  {user.nickname}
                </div>
                <div className="text-xs text-text-dim">{user.email}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="muted">Role: {user.role}</Badge>
              <Badge tone={profile?.archetype ? "cyan" : "warning"}>
                {profile?.archetype ? ARCHETYPE_LABELS[profile.archetype] : "Архетип не выбран"}
              </Badge>
              <Badge tone="pink">Admin Watching</Badge>
            </div>
          </div>
        </Panel>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-6">
            {profile && (
              <Panel variant="cyan" className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Прогресс агента</div>
                  <div className="text-xs text-text-muted">XP {profile.xp} / {profile.xp_to_next}</div>
                </div>

                <div
                  role="progressbar"
                  aria-label="Прогресс до следующего уровня"
                  aria-valuenow={xpProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-3 rounded-full border border-meta-border bg-meta-bg/70 overflow-hidden"
                >
                  <div
                    className="h-full bg-linear-to-r from-brand-cyan via-brand-pink to-brand-cyan transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="preview-card">
                    <div className="preview-card__title">Уровень</div>
                    <div className="text-lg text-text-primary">{profile.level}</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card__title">Shards</div>
                    <div className="text-lg text-text-primary">{profile.shards}</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card__title">Энергия</div>
                    <div className="text-lg text-text-primary">{profile.energy}</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card__title">Репутация</div>
                    <div className="text-lg text-text-primary">{profile.reputation}</div>
                  </div>
                </div>

                {profile.stats && (
                  <div className="pt-2 border-t border-meta-border">
                    <div className="text-xs uppercase tracking-[0.2em] text-text-dim mb-2">Характеристики</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.stats).map(([k, v]) => (
                        <Badge key={k} tone="muted">{k}: {v}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {profile && (
              <Panel className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Задачи архетипа</div>
                  <Badge tone="cyan">Баланс: {profile.shards}</Badge>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-xs text-text-dim">
                    На сегодня явных задач нет. Иди в чат, карту или посты, чтобы двигать фракцию дальше.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {tasks.map((task) => (
                      <button
                        key={task.key}
                        type="button"
                        disabled={
                          rewardLoading === task.key ||
                          (task.key === "daily_login" && rewardLoading === "daily") ||
                          task.completed ||
                          task.locked
                        }
                        onClick={() => openTask(task)}
                        className="vibe-option disabled:opacity-50"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="vibe-option__title">{task.title}</span>
                          <span className="text-[11px] text-brand-cyan">
                            {task.progress}/{task.daily_limit} +{task.reward_shards}
                          </span>
                        </span>
                        <span className="vibe-option__desc">{task.description}</span>
                        <span className="vibe-option__desc">{task.next_hint}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Хроника игры</div>
                  {activity.length === 0 ? (
                    <div className="text-xs text-text-dim">Хроника пока пустая. Забери награду или сделай первый ход.</div>
                  ) : (
                    <div className="grid gap-2">
                      {activity.slice(0, 6).map((entry) => (
                        <div key={entry.id} className="preview-card flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="preview-card__title">{entry.title}</div>
                            <div className="preview-card__line">{entry.description}</div>
                            <div className="preview-card__line">
                              {entry.screen ?? entry.reason} · баланс после: {entry.balance_after}
                            </div>
                          </div>
                          <div className={entry.delta >= 0 ? "text-brand-cyan" : "text-brand-pink"}>
                            {entry.delta >= 0 ? "+" : ""}{entry.delta}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>
            )}

            <Panel className="space-y-4">
              <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Навигация по операциям</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => router.push(link.href)}
                    className="vibe-option"
                  >
                    <span className="vibe-option__title">{link.label}</span>
                    <span className="vibe-option__desc">{link.desc}</span>
                  </button>
                ))}
              </div>
            </Panel>

            {!profile?.archetype && <ArchetypePicker token={token} onChosen={refresh} />}

            {profile?.archetype && (
              <ArchetypeActions
                token={token}
                archetype={profile.archetype}
                onDone={(msg) => {
                  setActionMsg(msg);
                  refreshEconomy();
                }}
              />
            )}

            {actionMsg && (
              <div className="text-xs border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan rounded px-3 py-2">
                {actionMsg}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {pulse && (
              <Panel className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Фракционный пульс</div>
                  <Badge tone="muted">Игроков: {pulse.total_players}</Badge>
                </div>
                <div className="text-sm text-text-muted">{pulse.user_recommendation}</div>
                {pulseTask ? (
                  <button
                    type="button"
                    onClick={() => openTask(pulseTask)}
                    className="vibe-option"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="vibe-option__title">{pulseTask.title}</span>
                      <span className="text-[11px] text-brand-cyan">
                        {pulseTask.progress}/{pulseTask.daily_limit} +{pulseTask.reward_shards}
                      </span>
                    </span>
                    <span className="vibe-option__desc">{pulseTask.next_hint}</span>
                  </button>
                ) : pulse.recommended_task_key ? (
                  <div className="preview-card">
                    <div className="preview-card__title">Задача пульса закрыта</div>
                    <div className="preview-card__line">{pulse.recommended_task_key}</div>
                  </div>
                ) : null}
              </Panel>
            )}

            <Panel className="space-y-4">
              <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Управление аккаунтом</div>
              <div className="grid gap-3">
                <Button variant="cyan" size="md" onClick={() => router.push("/profile")}>Редактировать профиль</Button>
                <Button variant="neutral" size="md" onClick={() => router.push("/settings")}>Центр управления</Button>
                <Button variant="neutral" size="md" onClick={() => router.push("/password")}>Сменить пароль</Button>
                <Button variant="neutral" size="md" onClick={() => router.push("/codex")}>Кодекс и правила</Button>
              </div>
            </Panel>

            <Panel className="space-y-4">
              <div className="text-xs uppercase tracking-[0.24em] text-text-dim">Статус сессии</div>
              <div className="preview-card">
                <div className="preview-card__title">Core</div>
                <div className="preview-card__line">User ID: {user.id.slice(0, 8)}...</div>
                <div className="preview-card__line">Role: {user.role}</div>
                <div className="preview-card__line">
                  Archetype: {profile?.archetype ? ARCHETYPE_LABELS[profile.archetype] : "не выбран"}
                </div>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}
