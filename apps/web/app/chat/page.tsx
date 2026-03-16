"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "../../components/ChatMessage";
import {
  getChatMessages,
  sendChatMessage,
  getMe,
  type MessageResponse,
  getGameProfile,
  glitchScreen,
  directStrike,
  goldenShield,
  banPort,
  whisper,
  getChatEffects,
  type ChatEffect,
  type GameProfileResponse,
  type Archetype,
} from "../../lib/api";

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

export default function ChatPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<(typeof ROOMS)[number]>("general");
  const [profile, setProfile] = useState<GameProfileResponse | null>(null);
  const [effects, setEffects] = useState<ChatEffect[]>([]);
  const [targetId, setTargetId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("metahunt_token") : null;
    if (!t) {
      router.replace("/");
      return;
    }
    setToken(t);
    getMe(t).then((u) => setCurrentUserId(u.id)).catch(() => {});
    getGameProfile(t).then(setProfile).catch(() => {});
  }, [router]);

  const fetchMessages = useCallback(async () => {
    const t = localStorage.getItem("metahunt_token");
    if (!t) return;
    try {
      const list = await getChatMessages(t, { room, limit: 100, offset: 0 });
      setMessages(list.reverse());
    } catch (_) {
      setError("Не удалось загрузить сообщения");
    }
  }, [room]);

  const fetchEffects = useCallback(async () => {
    const t = localStorage.getItem("metahunt_token");
    if (!t) return;
    try {
      const data = await getChatEffects(t);
      setEffects(data.effects);
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    fetchEffects();
    fetchRef.current = setInterval(() => {
      fetchMessages();
      fetchEffects();
    }, POLL_INTERVAL_MS);
    return () => {
      if (fetchRef.current) clearInterval(fetchRef.current);
    };
  }, [token, room, fetchMessages, fetchEffects]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = localStorage.getItem("metahunt_token");
    if (!t || !input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const sent = await sendChatMessage(t, { text: input.trim(), room });
      setMessages((prev) => [...prev, sent]);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  const isGlitched = effects.some((e) => e.effect === "glitch");
  const isBanned = effects.some((e) => e.effect === "ban");

  const handleSkill = async (skill: "glitch" | "strike" | "shield" | "ban" | "whisper") => {
    if (!token || !profile?.archetype) return;
    if ((skill === "glitch" || skill === "strike" || skill === "ban" || skill === "whisper") && !targetId) {
      setError("Нужен ID цели");
      return;
    }
    setError(null);
    try {
      if (skill === "glitch") await glitchScreen(token, targetId);
      if (skill === "strike") await directStrike(token, targetId);
      if (skill === "shield") await goldenShield(token);
      if (skill === "ban") await banPort(token, targetId);
      if (skill === "whisper") await whisper(token, targetId, input.trim() || "...");
      await fetchEffects();
      await fetchMessages();
      setTargetId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка навыка");
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Перенаправление...</p>
      </main>
    );
  }

  const theme = profile?.archetype ? ARCHETYPE_THEME[profile.archetype] : null;

  return (
    <main className="min-h-screen pb-24 flex flex-col">
      <div className="scanlines" aria-hidden />

      <header className="sticky top-0 z-50 cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className={`font-display text-lg tracking-widest ${theme?.accent ?? "neon-text-cyan"}`}>
            ЧАТ
          </span>
          <a
            href="/"
            className="cyber-btn px-4 py-2 text-sm text-text-muted hover:text-brand-cyan rounded"
          >
            ← НАЗАД
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        {profile?.archetype && (
          <div className={`mb-4 cyber-card rounded-lg p-3 border ${theme?.border ?? "border-meta-border"}`}>
            <div className="text-xs uppercase tracking-wider text-text-dim">Твоя фракция</div>
            <div className={`text-sm ${theme?.accent ?? "text-text-primary"}`}>{profile.archetype}</div>
            <div className="text-xs text-text-dim mt-1">
              Осколки: <span className="text-text-primary">{profile.shards}</span> | Энергия: <span className="text-text-primary">{profile.energy}</span>
            </div>
          </div>
        )}

        {isGlitched && (
          <div className="mb-4 cyber-border-pink bg-brand-pink/10 text-brand-pink px-3 py-2 rounded text-xs">
            Экран заглючен: 30 секунд помех.
          </div>
        )}
        {isBanned && (
          <div className="mb-4 cyber-border-pink bg-brand-pink/10 text-brand-pink px-3 py-2 rounded text-xs">
            Порт заблокирован на 1 минуту.
          </div>
        )}

        <div className="mb-4 flex gap-2">
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              className={`cyber-btn px-3 py-1.5 text-xs rounded ${
                room === r ? "bg-brand-cyan/20 text-brand-cyan cyber-border" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {FACTION_LABELS[r]}
            </button>
          ))}
        </div>

        {profile?.archetype && (
          <div className="mb-4 cyber-card rounded-lg p-3 border border-meta-border">
            <div className="text-xs uppercase tracking-wider text-text-dim">Фракционные навыки</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.archetype === "FOXY" && (
                <button
                  className="cyber-btn px-3 py-1 text-xs rounded border border-brand-pink/60 text-brand-pink"
                  onClick={() => handleSkill("glitch")}
                >
                  Глитч экрана
                </button>
              )}
              {profile.archetype === "OXY" && (
                <button
                  className="cyber-btn px-3 py-1 text-xs rounded border border-brand-cyan/60 text-brand-cyan"
                  onClick={() => handleSkill("strike")}
                >
                  Прямой удар
                </button>
              )}
              {profile.archetype === "BEAR" && (
                <>
                  <button
                    className="cyber-btn px-3 py-1 text-xs rounded border border-yellow-400/40 text-yellow-400"
                    onClick={() => handleSkill("shield")}
                  >
                    Золотой щит
                  </button>
                  <button
                    className="cyber-btn px-3 py-1 text-xs rounded border border-yellow-400/40 text-yellow-400"
                    onClick={() => handleSkill("ban")}
                  >
                    Блокировка порта
                  </button>
                </>
              )}
              {profile.archetype === "OWL" && (
                <button
                  className="cyber-btn px-3 py-1 text-xs rounded border border-purple-300/50 text-purple-300"
                  onClick={() => handleSkill("whisper")}
                >
                  Шёпот (DM)
                </button>
              )}
            </div>
            {(profile.archetype === "FOXY" || profile.archetype === "OXY" || profile.archetype === "BEAR" || profile.archetype === "OWL") && (
              <div className="mt-2">
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="ID цели"
                  className="cyber-input w-full px-3 py-2 rounded text-xs"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {messages.length === 0 && !error && (
            <p className="text-text-dim text-sm text-center py-8">
              Нет сообщений. Напиши первым.
            </p>
          )}
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              isOwn={!m.is_anonymous && !!currentUserId && m.sender_id === currentUserId}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="fixed top-20 left-4 right-4 max-w-3xl mx-auto cyber-border-pink bg-brand-pink/10 text-brand-pink px-4 py-3 rounded text-sm z-50">
          {error}
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 cyber-border-t border-meta-border bg-meta-bg/95 backdrop-blur-sm py-4 px-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Сообщение..."
            maxLength={4096}
            className="cyber-input flex-1 px-4 py-3 rounded"
            disabled={loading || isBanned}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || isBanned}
            className="cyber-btn px-6 py-3 bg-brand-cyan/20 text-brand-cyan cyber-border rounded hover:bg-brand-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "ОТПРАВИТЬ"}
          </button>
        </form>
      </footer>
    </main>
  );
}
