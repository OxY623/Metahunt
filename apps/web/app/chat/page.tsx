"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "../../entities/chat/ui/ChatMessage";
import {
  getChatMessages,
  sendChatMessage,
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
  type MessageResponse,
} from "../../lib/api";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { useSession } from "../../shared/model/session";
import LoadingScreen from "../../shared/ui/LoadingScreen";

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
  const { token, user, loading: sessionLoading } = useSession();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<(typeof ROOMS)[number]>("general");
  const [profile, setProfile] = useState<GameProfileResponse | null>(null);
  const [effects, setEffects] = useState<ChatEffect[]>([]);
  const [targetId, setTargetId] = useState("");
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
    } catch (_) {
      setError("Не удалось загрузить сообщения");
    }
  }, [room, token]);

  const fetchEffects = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getChatEffects(token);
      setEffects(data.effects);
    } catch (_) {
      // ignore
    }
  }, [token]);

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
    if (!token || !input.trim()) return;
    setSendLoading(true);
    setError(null);
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

  const handleSkill = async (
    skill: "glitch" | "strike" | "shield" | "ban" | "whisper",
  ) => {
    if (!token || !profile?.archetype) return;
    if (
      (skill === "glitch" ||
        skill === "strike" ||
        skill === "ban" ||
        skill === "whisper") &&
      !targetId
    ) {
      setError("Нужен ID цели");
      return;
    }
    setError(null);
    try {
      if (skill === "glitch") await glitchScreen(token, targetId);
      if (skill === "strike") await directStrike(token, targetId);
      if (skill === "shield") await goldenShield(token);
      if (skill === "ban") await banPort(token, targetId);
      if (skill === "whisper")
        await whisper(token, targetId, input.trim() || "...");
      await fetchEffects();
      await fetchMessages();
      setTargetId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка навыка");
    }
  };

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
    <main className="min-h-screen pb-24 flex flex-col">
      <header className="sticky top-0 z-50 cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span
            className={`font-display text-lg tracking-widest ${theme?.accent ?? "neon-text-cyan"}`}
          >
            ЧАТ
          </span>
          <Button
            variant="neutral"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            ← Назад
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        {profile?.archetype && (
          <div
            className={`mb-4 cyber-card archetype-panel rounded-lg p-3 border ${theme?.border ?? "border-meta-border"}`}
          >
            <div className="text-xs uppercase tracking-wider text-text-dim">
              Твоя фракция
            </div>
            <div className={`text-sm ${theme?.accent ?? "text-text-primary"}`}>
              {profile.archetype}
            </div>
            <div className="text-xs text-text-dim mt-1">
              Осколки:{" "}
              <span className="text-text-primary">{profile.shards}</span> |
              Энергия:{" "}
              <span className="text-text-primary">{profile.energy}</span>
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

        <div className="mb-4 flex gap-2 flex-wrap">
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

        {profile?.archetype && (
          <div className="mb-4 cyber-card archetype-panel rounded-lg p-3 border border-meta-border">
            <div className="text-xs uppercase tracking-wider text-text-dim">
              Фракционные навыки
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.archetype === "FOXY" && (
                <Button
                  variant="pink"
                  size="sm"
                  onClick={() => handleSkill("glitch")}
                >
                  Глитч экрана
                </Button>
              )}
              {profile.archetype === "OXY" && (
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => handleSkill("strike")}
                >
                  Прямой удар
                </Button>
              )}
              {profile.archetype === "BEAR" && (
                <>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleSkill("shield")}
                  >
                    Золотой щит
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleSkill("ban")}
                  >
                    Блокировка порта
                  </Button>
                </>
              )}
              {profile.archetype === "OWL" && (
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => handleSkill("whisper")}
                >
                  Шёпот (DM)
                </Button>
              )}
            </div>
            <div className="mt-2">
              <Input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="ID цели"
                className="text-xs"
              />
            </div>
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
              isOwn={!m.is_anonymous && m.sender_id === user.id}
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
      </footer>
    </main>
  );
}
