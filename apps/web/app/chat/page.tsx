"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "../../components/ChatMessage";
import { getChatMessages, sendChatMessage, getMe, type MessageResponse } from "../../lib/api";

const POLL_INTERVAL_MS = 3000;

export default function ChatPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState("general");
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

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    fetchRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => {
      if (fetchRef.current) clearInterval(fetchRef.current);
    };
  }, [token, room, fetchMessages]);

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

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Перенаправление...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 flex flex-col">
      <div className="scanlines" aria-hidden />

      <header className="sticky top-0 z-50 cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-display text-lg tracking-widest neon-text-cyan">ЧАТ</span>
          <a
            href="/"
            className="cyber-btn px-4 py-2 text-sm text-text-muted hover:text-brand-cyan rounded"
          >
            ← НАЗАД
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        <div className="mb-4 flex gap-2">
          {["general", "foxy", "oxy", "bear", "owl"].map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              className={`cyber-btn px-3 py-1.5 text-xs rounded ${
                room === r ? "bg-brand-cyan/20 text-brand-cyan cyber-border" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

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
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Сообщение..."
            maxLength={4096}
            className="cyber-input flex-1 px-4 py-3 rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="cyber-btn px-6 py-3 bg-brand-cyan/20 text-brand-cyan cyber-border rounded hover:bg-brand-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "ОТПРАВИТЬ"}
          </button>
        </form>
      </footer>
    </main>
  );
}
