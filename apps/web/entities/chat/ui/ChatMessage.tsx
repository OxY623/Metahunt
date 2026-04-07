"use client";

import type { MessageResponse, Archetype } from "../../../lib/api";

interface ChatMessageProps {
  message: MessageResponse;
  isOwn?: boolean;
  onSelectTarget?: (target: {
    id: string;
    nickname: string | null;
    archetype?: Archetype | null;
  }) => void;
  isSelected?: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatMessage({
  message,
  isOwn,
  onSelectTarget,
  isSelected,
}: ChatMessageProps) {
  const displayName = message.is_anonymous
    ? "???"
    : (message.sender_nickname ?? "Аноним");

  const effect = message.effect ? ` • ${message.effect}` : "";

  const isSelectable =
    Boolean(onSelectTarget) && Boolean(message.sender_id) && !message.is_anonymous;

  const handleSelect = () => {
    if (!isSelectable || !message.sender_id) return;
    onSelectTarget?.({
      id: message.sender_id,
      nickname: message.sender_nickname ?? "Аноним",
      archetype: message.sender_archetype ?? null,
    });
  };

  return (
    <div
      className={`flex flex-col gap-0.5 max-w-[85%] ${
        isOwn ? "self-end items-end" : "self-start items-start"
      }`}
    >
      <div className="flex items-baseline gap-2">
        {isSelectable ? (
          <button
            type="button"
            onClick={handleSelect}
            className={`text-xs uppercase tracking-wider transition ${
              isSelected
                ? "text-brand-pink"
                : "text-brand-cyan hover:text-brand-pink"
            }`}
          >
            {displayName}
          </button>
        ) : (
          <span
            className={`text-xs uppercase tracking-wider ${
              message.is_anonymous ? "text-text-dim italic" : "text-brand-cyan"
            }`}
          >
            {displayName}
          </span>
        )}
        {message.sender_archetype && !message.is_anonymous && (
          <span className="text-[10px] uppercase tracking-wider text-text-dim border border-meta-border px-1.5 py-0.5 rounded">
            {message.sender_archetype}
          </span>
        )}
        <span className="text-text-dim text-xs">
          {formatTime(message.created_at)}
          {effect}
        </span>
      </div>
      <div
        className={`
          px-4 py-2 rounded-lg break-words
          ${
            isOwn
              ? "cyber-border-pink bg-brand-pink/10"
              : "cyber-border bg-meta-surface"
          }
        `}
      >
        <p className="text-sm font-mono">{message.text}</p>
      </div>
    </div>
  );
}
