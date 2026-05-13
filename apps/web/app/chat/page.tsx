"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "../../entities/chat/ui/ChatMessage";
import {
  getChatMessages,
  sendChatMessage,
  getGameProfile,
  getFactionPulse,
  glitchScreen,
  directStrike,
  goldenShield,
  banPort,
  whisper,
  owlDeal,
  getChatEffects,
  type ChatEffect,
  type GameProfileResponse,
  type FactionPulseResponse,
  type Archetype,
  type MessageResponse,
} from "../../lib/api";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";
import { Panel } from "../../shared/ui/Panel";
import { useSession } from "../../shared/model/session";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import {
  getArchetypeRelation,
  type RelationType,
} from "../../entities/user/lib/archetypes";

const POLL_INTERVAL_MS = 3000;

const ROOMS = ["general", "foxy", "oxy", "bear", "owl"] as const;

const FACTION_LABELS: Record<(typeof ROOMS)[number], string> = {
  general: "GENERAL",
  foxy: "FOXY",
  oxy: "OXY",
  bear: "BEAR",
  owl: "OWL",
};

const ARCHETYPE_THEME: Record<Archetype, { accent: string; border: string }> = {
  FOXY: { accent: "text-brand-pink", border: "border-brand-pink/50" },
  OXY: { accent: "text-brand-cyan", border: "border-brand-cyan/50" },
  BEAR: { accent: "text-yellow-400", border: "border-yellow-400/40" },
  OWL: { accent: "text-purple-300", border: "border-purple-300/40" },
};

const RELATION_LABELS: Record<RelationType, string> = {
  ally: "Союз",
  counter: "Контр",
  neutral: "Нейтрал",
  trade: "Торг",
};

const QUICK_SNIPPETS = [
  "Нужна помощь на тайле",
  "Вижу активность в секторе",
  "Координируем атаку",
  "Проверяю статус канала",
] as const;

type SelectedTarget = {
  id: string;
  nickname: string | null;
  archetype?: Archetype | null;
};

export default function ChatPage() {
  const router = useRouter();
  const { token, user, loading: sessionLoading } = useSession();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [room, setRoom] = useState<(typeof ROOMS)[number]>("general");
  const [profile, setProfile] = useState<GameProfileResponse | null>(null);
  const [pulse, setPulse] = useState<FactionPulseResponse | null>(null);
  const [effects, setEffects] = useState<ChatEffect[]>([]);
  const [target, setTarget] = useState<SelectedTarget | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionLoading && !token) {
      router.replace("/");
      return;
    }
    if (token)
      getGameProfile(token)
        .then(setProfile)
        .catch(() => {});
  }, [router, token, sessionLoading]);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const list = await getChatMessages(token, {
        room,
        limit: 100,
        offset: 0,
      });
      setMessages(list.reverse());
      setError(null);
    } catch {
      setError("Не удалось загрузить сообщения");
    }
  }, [room, token]);

  const fetchEffects = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getChatEffects(token);
      setEffects(data.effects);
    } catch {
      // ignore
    }
  }, [token]);

  const fetchPulse = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getFactionPulse(token);
      setPulse(data);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    fetchEffects();
    fetchPulse();
    fetchRef.current = setInterval(() => {
      fetchMessages();
      fetchEffects();
      fetchPulse();
    }, POLL_INTERVAL_MS);
    return () => {
      if (fetchRef.current) clearInterval(fetchRef.current);
    };
  }, [token, room, fetchMessages, fetchEffects, fetchPulse]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !input.trim()) return;
    setSendLoading(true);
    setError(null);
    setInfo(null);
    try {
      const sent = await sendChatMessage(token, { text: input.trim(), room });
      setMessages((prev) => [...prev, sent]);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSendLoading(false);
    }
  };

  const isGlitched = effects.some((e) => e.effect === "glitch");
  const isBanned = effects.some((e) => e.effect === "ban");
  const isShielded = effects.some((e) => e.effect === "shield");

  const targetRelation = getArchetypeRelation(
    profile?.archetype ?? null,
    target?.archetype ?? null,
  );

  const canTarget = Boolean(target?.id);
  const canGlitch =
    profile?.archetype === "FOXY" &&
    target?.archetype === "OXY" &&
    targetRelation === "counter";
  const canStrike =
    profile?.archetype === "OXY" &&
    target?.archetype === "BEAR" &&
    targetRelation === "counter";
  const canBan =
    profile?.archetype === "BEAR" &&
    target?.archetype === "FOXY" &&
    targetRelation === "counter";
  const canWhisper = profile?.archetype === "OWL" && canTarget;

  const handleSkill = async (
    skill: "glitch" | "strike" | "shield" | "ban" | "whisper" | "owl_deal",
  ) => {
    if (!token || !profile?.archetype) return;
    if ((skill === "glitch" || skill === "strike" || skill === "ban") && !canTarget) {
      setError("Выбери цель кликом по сообщению");
      return;
    }
    if (skill === "whisper" && (!canTarget || !input.trim())) {
      setError("Нужны цель и текст для шёпота");
      return;
    }
    if (skill === "owl_deal" && !canTarget) {
      setError("Выбери цель для сделки");
      return;
    }
    setError(null);
    setInfo(null);
    try {
      let result: { msg: string; shards_spent?: number; shards_rewarded?: number } | null = null;
      if (skill === "glitch" && target) result = await glitchScreen(token, target.id);
      if (skill === "strike" && target) result = await directStrike(token, target.id);
      if (skill === "shield") result = await goldenShield(token);
      if (skill === "ban" && target) result = await banPort(token, target.id);
      if (skill === "whisper" && target)
        result = await whisper(token, target.id, input.trim(), room);
      if (skill === "owl_deal" && target) result = await owlDeal(token, target.id);
      await fetchEffects();
      await fetchMessages();
      const nextProfile = await getGameProfile(token);
      setProfile(nextProfile);
      if (skill !== "shield") setTarget(null);
      if (skill === "whisper") setInput("");
      setInfo(
        result
          ? `${result.msg}${result.shards_spent ? ` -${result.shards_spent} Shards` : ""}${result.shards_rewarded ? `, +${result.shards_rewarded} Shards` : ""}.`
          : "Навык применён успешно.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка навыка");
    }
  };

  const effectBadges = useMemo(() => {
    const arr: Array<{ label: string; tone: "pink" | "cyan" | "warning" }> = [];
    if (isGlitched) arr.push({ label: "GLITCH 30s", tone: "pink" });
    if (isBanned) arr.push({ label: "BAN 60s", tone: "pink" });
    if (isShielded) arr.push({ label: "SHIELD 5m", tone: "warning" });
    return arr;
  }, [isGlitched, isBanned, isShielded]);

  if (sessionLoading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Перенаправление...</p>
      </main>
    );
  }

  const theme = profile?.archetype ? ARCHETYPE_THEME[profile.archetype] : null;

  return (
    <main className="min-h-screen pb-10">
      <SiteHeader />

      <div className="page-shell pt-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SectionHeading as="h1" className={theme?.accent ?? "neon-text-cyan"}>
            Командный чат
          </SectionHeading>
          <div className="flex gap-2">
            <Button variant="neutral" size="sm" onClick={() => router.push("/dashboard")}>
              Назад
            </Button>
            <Button variant="neutral" size="sm" onClick={() => router.push("/settings")}>
              Настройки
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone="muted">Комната: {FACTION_LABELS[room]}</Badge>
          <Badge tone="muted">Сообщений: {messages.length}</Badge>
          {profile?.archetype && <Badge tone="cyan">Архетип: {profile.archetype}</Badge>}
          {profile && <Badge tone="warning">Shards: {profile.shards}</Badge>}
          {profile && <Badge tone="muted">Energy: {profile.energy}</Badge>}
          {effectBadges.map((e) => (
            <Badge key={e.label} tone={e.tone}>{e.label}</Badge>
          ))}
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] items-start">
          <Panel className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {ROOMS.map((r) => (
                <Button
                  key={r}
                  variant={room === r ? "cyan" : "neutral"}
                  size="sm"
                  onClick={() => setRoom(r)}
                >
                  {FACTION_LABELS[r]}
                </Button>
              ))}
            </div>

            <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
              {messages.length === 0 && !error && (
                <p className="text-text-dim text-sm text-center py-8">
                  Нет сообщений. Напиши первым.
                </p>
              )}
              {messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  isOwn={!m.is_anonymous && m.sender_id === user.id}
                  onSelectTarget={(t) => setTarget(t)}
                  isSelected={target?.id === m.sender_id}
                />
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="space-y-2 border-t border-meta-border pt-3">
              <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Быстрые шаблоны</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SNIPPETS.map((snippet) => (
                  <button
                    key={snippet}
                    type="button"
                    className="vibe-option px-3 py-2"
                    onClick={() => setInput((prev) => (prev ? `${prev} ${snippet}` : snippet))}
                  >
                    <span className="vibe-option__desc">{snippet}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Сообщение..."
                maxLength={4096}
                disabled={sendLoading || isBanned}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="cyan"
                size="lg"
                disabled={sendLoading || !input.trim() || isBanned}
              >
                {sendLoading ? "..." : "Отправить"}
              </Button>
            </form>
          </Panel>

          <div className="space-y-6">
            {profile?.archetype && (
              <Panel className={`space-y-4 border ${theme?.border ?? "border-meta-border"}`}>
                <div className="text-xs uppercase tracking-[0.22em] text-text-dim">Фракционные навыки</div>
                <div className="grid gap-2">
                  {profile.archetype === "FOXY" && (
                    <Button variant="pink" size="sm" onClick={() => handleSkill("glitch")} disabled={!canGlitch}>
                      Глитч -20 / +12
                    </Button>
                  )}
                  {profile.archetype === "OXY" && (
                    <Button variant="cyan" size="sm" onClick={() => handleSkill("strike")} disabled={!canStrike}>
                      Прямой удар -7 / +14
                    </Button>
                  )}
                  {profile.archetype === "BEAR" && (
                    <>
                      <Button variant="warning" size="sm" onClick={() => handleSkill("shield")}>
                        Золотой щит -20
                      </Button>
                      <Button variant="warning" size="sm" onClick={() => handleSkill("ban")} disabled={!canBan}>
                        Блокировка порта -39 / +12
                      </Button>
                    </>
                  )}
                  {profile.archetype === "OWL" && (
                    <>
                      <Button variant="neutral" size="sm" onClick={() => handleSkill("whisper")} disabled={!canWhisper || !input.trim()}>
                        Шёпот -26
                      </Button>
                      <Button variant="cyan" size="sm" onClick={() => handleSkill("owl_deal")} disabled={!canWhisper}>
                        Сделка +20
                      </Button>
                    </>
                  )}
                </div>

                {target ? (
                  <div className="preview-card">
                    <div className="preview-card__title">Выбранная цель</div>
                    <div className="preview-card__line">{target.nickname ?? "Аноним"}</div>
                    {target.archetype && <div className="preview-card__line">Архетип: {target.archetype}</div>}
                    <div className="preview-card__line">Связь: {RELATION_LABELS[targetRelation]}</div>
                    <div className="pt-2">
                      <Button variant="neutral" size="sm" onClick={() => setTarget(null)}>
                        Сбросить цель
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-text-dim">
                    Нажми на имя пользователя в сообщении, чтобы выбрать цель для навыка.
                  </div>
                )}
              </Panel>
            )}

            <Panel className="space-y-3">
              <div className="text-xs uppercase tracking-[0.22em] text-text-dim">Состояние канала</div>
              <div className="text-sm text-text-muted">
                Частота обновления: каждые {Math.floor(POLL_INTERVAL_MS / 1000)} сек. Для быстрого реагирования держи активной нужную комнату.
              </div>
            </Panel>

            {pulse && (
              <Panel className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs uppercase tracking-[0.22em] text-text-dim">Фракционный пульс</div>
                  <Badge tone="muted">Игроков: {pulse.total_players}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pulse.factions.map((faction) => (
                    <div key={faction.archetype} className="preview-card">
                      <div className="preview-card__title">{faction.archetype}</div>
                      <div className="text-lg text-text-primary">{faction.count}</div>
                      <div className="preview-card__line">{Math.round(faction.share * 100)}% сети</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {pulse.edges.slice(0, 6).map((edge) => (
                    <div key={`${edge.source}-${edge.target}`} className="preview-card">
                      <div className="preview-card__title">
                        {edge.source} -&gt; {edge.target} · {edge.relation}
                      </div>
                      <div className="preview-card__line">
                        Активных пар: {edge.active_pairs}
                      </div>
                      <div className="preview-card__line">{edge.opportunity}</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-text-muted">{pulse.user_recommendation}</div>
              </Panel>
            )}
          </div>
        </section>

        {error && (
          <div className="text-xs border border-brand-pink/45 bg-brand-pink/10 text-brand-pink rounded px-3 py-2">
            {error}
          </div>
        )}
        {info && (
          <div className="text-xs border border-brand-cyan/45 bg-brand-cyan/10 text-brand-cyan rounded px-3 py-2">
            {info}
          </div>
        )}
      </div>
    </main>
  );
}
