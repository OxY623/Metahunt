"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  title?: string;
  lines: string[];
  className?: string;
  speedMs?: number;
  startDelayMs?: number;
  onDone?: () => void;
};

export default function FoxyGlitchTerminal({
  title = "FOXY / TERMINAL",
  lines,
  className,
  speedMs = 18,
  startDelayMs = 200,
  onDone,
}: Props) {
  const [cursor, setCursor] = useState({ line: 0, ch: 0, done: false });
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const safeLines = useMemo(() => (lines.length ? lines : ["..."]), [lines]);

  useEffect(() => {
    setCursor({ line: 0, ch: 0, done: false });
  }, [safeLines]);

  useEffect(() => {
    if (cursor.done) return;

    const startTimer = setTimeout(() => {
      const tick = () => {
        setCursor((prev) => {
          if (prev.done) return prev;
          const lineText = safeLines[prev.line] ?? "";
          if (prev.ch < lineText.length) return { ...prev, ch: prev.ch + 1 };
          const nextLine = prev.line + 1;
          if (nextLine >= safeLines.length) return { ...prev, done: true };
          return { line: nextLine, ch: 0, done: false };
        });
      };

      const interval = setInterval(tick, Math.max(10, speedMs));
      return () => clearInterval(interval);
    }, Math.max(0, startDelayMs));

    return () => clearTimeout(startTimer);
  }, [cursor.done, safeLines, speedMs, startDelayMs]);

  useEffect(() => {
    if (!cursor.done) return;
    onDoneRef.current?.();
  }, [cursor.done]);

  return (
    <div
      className={[
        "cyber-card border border-meta-border rounded-lg overflow-hidden",
        "shadow-[0_0_20px_rgba(255,58,242,0.08)]",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-meta-border bg-meta-bg/60">
        <div className="text-[11px] tracking-[0.24em] uppercase text-brand-pink glitchy">
          {title}
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase text-text-dim">
          TRUST = FALSE
        </div>
      </div>

      <div className="relative p-4">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(255,58,242,0.25),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(0,240,255,0.20),transparent_40%)]" />
        <div className="relative font-mono text-[13px] leading-6">
          {safeLines.map((line, idx) => {
            const isActive = idx === cursor.line;
            const isPast = idx < cursor.line;
            const text = isPast ? line : isActive ? line.slice(0, cursor.ch) : "";
            return (
              <div key={`${idx}-${line}`} className="whitespace-pre-wrap">
                <span className="text-text-dim select-none">$ </span>
                <span
                  className={[
                    "inline-block",
                    isActive ? "text-brand-cyan terminal-flicker" : "text-text-primary",
                  ].join(" ")}
                >
                  {text}
                </span>
                {isActive && (
                  <span className="inline-block w-[8px] ml-[2px] align-baseline text-brand-pink animate-pulse">
                    ▌
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
