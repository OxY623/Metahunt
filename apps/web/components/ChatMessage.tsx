"use client";

import type { MessageResponse } from "../lib/api";

interface ChatMessageProps {
  message: MessageResponse;
  isOwn?: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const displayName = message.is_anonymous
    ? "???"
    : message.sender_nickname ?? "Аноним";

  return (
    <div
      className={`flex flex-col gap-0.5 max-w-[85%] ${
        isOwn ? "self-end items-end" : "self-start items-start"
      }`}
    >
      <div className="flex items-baseline gap-2">
        <span
          className={`text-xs uppercase tracking-wider ${
            message.is_anonymous ? "text-text-dim italic" : "text-brand-cyan"
          }`}
        >
          {displayName}
        </span>
        <span className="text-text-dim text-xs">{formatTime(message.created_at)}</span>
      </div>
      <div
        className={`
          px-4 py-2 rounded-lg break-words
          ${isOwn ? "cyber-border-pink bg-brand-pink/10" : "cyber-border bg-meta-surface"}
        `}
      >
        <p className="text-sm font-mono">{message.text}</p>
      </div>
    </div>
  );
}
