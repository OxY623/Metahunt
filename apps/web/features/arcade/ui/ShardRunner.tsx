"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitArcadeRun, type ArcadeRunResult } from "../../../lib/api";

type Drop = { x: number; y: number; bad: boolean; speed: number };
type Props = { token: string; onComplete: (result: ArcadeRunResult) => void };
const W = 320, H = 420, ROUND = 45;

export function ShardRunner({ token, onComplete }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<number | null>(null);
  const state = useRef({ x: 148, drops: [] as Drop[], score: 0, lives: 3, move: 0, start: 0, last: 0, spawn: 0, running: false });
  const [mode, setMode] = useState<"idle" | "running" | "over">("idle");
  const [hud, setHud] = useState({ score: 0, lives: 3, time: ROUND });
  const [saving, setSaving] = useState(false);

  const paint = useCallback(() => {
    const ctx = canvas.current?.getContext("2d"); if (!ctx) return;
    const g = state.current; ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#080d1a"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#102044"; for (let y = 42; y < H; y += 28) ctx.fillRect(0, y, W, 1);
    ctx.fillStyle = "#101b34"; ctx.fillRect(0, 382, W, 38);
    ctx.fillStyle = "#00f0ff"; for (let x = 0; x < W; x += 16) ctx.fillRect(x, 382, 8, 3);
    for (const d of g.drops) { if (d.bad) { ctx.fillStyle = "#ff3af2"; ctx.fillRect(d.x, d.y + 6, 18, 10); ctx.fillRect(d.x + 4, d.y + 2, 10, 18); ctx.fillStyle = "#080d1a"; ctx.fillRect(d.x + 4, d.y + 8, 3, 3); ctx.fillRect(d.x + 12, d.y + 8, 3, 3); } else { ctx.fillStyle = "#00f0ff"; ctx.fillRect(d.x + 5, d.y, 6, 4); ctx.fillRect(d.x + 2, d.y + 4, 12, 10); ctx.fillStyle = "#d8ffff"; ctx.fillRect(d.x + 5, d.y + 4, 3, 6); } }
    const x = Math.round(g.x); ctx.fillStyle = "#fbbf24"; ctx.fillRect(x + 5, 354, 14, 6); ctx.fillStyle = "#00f0ff"; ctx.fillRect(x + 2, 360, 20, 16); ctx.fillStyle = "#111827"; ctx.fillRect(x + 6, 363, 4, 4); ctx.fillRect(x + 14, 363, 4, 4); ctx.fillStyle = "#ff3af2"; ctx.fillRect(x + 3, 376, 6, 6); ctx.fillRect(x + 15, 376, 6, 6);
    ctx.fillStyle = "#dfeaff"; ctx.font = "10px monospace"; ctx.fillText(`SHARDS ${String(g.score).padStart(3, "0")}`, 12, 22); ctx.fillText(`LIVES ${"<3".repeat(g.lives)}`, 208, 22);
  }, []);

  const end = useCallback(async () => { const g = state.current; g.running = false; if (frame.current) cancelAnimationFrame(frame.current); setMode("over"); setSaving(true); try { onComplete(await submitArcadeRun(token, g.score, ROUND)); } finally { setSaving(false); } }, [onComplete, token]);
  const loop = useCallback((now: number) => { const g = state.current; if (!g.running) return; const elapsed = now - g.start, delta = Math.min(32, now - g.last || 16); g.last = now; const time = Math.max(0, ROUND - Math.ceil(elapsed / 1000)); if (elapsed >= ROUND * 1000 || g.lives <= 0) { void end(); return; } g.x = Math.max(0, Math.min(W - 24, g.x + g.move * delta * .22)); if (now - g.spawn > Math.max(340, 720 - elapsed / 75)) { g.spawn = now; g.drops.push({ x: 8 + Math.floor(Math.random() * 284), y: 42, bad: Math.random() < .3, speed: 1.4 + Math.random() * 1.2 }); } g.drops = g.drops.filter(d => { d.y += d.speed * delta * .08; const hit = d.y + 18 >= 354 && d.y <= 382 && d.x + 18 >= g.x && d.x <= g.x + 24; if (hit) { d.bad ? g.lives-- : g.score += 5; return false; } return d.y < H; }); setHud({ score: g.score, lives: g.lives, time }); paint(); frame.current = requestAnimationFrame(loop); }, [end, paint]);
  const start = useCallback(() => { const now = performance.now(); state.current = { x: 148, drops: [], score: 0, lives: 3, move: 0, start: now, last: now, spawn: now, running: true }; setHud({ score: 0, lives: 3, time: ROUND }); setMode("running"); frame.current = requestAnimationFrame(loop); }, [loop]);
  useEffect(() => { paint(); const down = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (k === "arrowleft" || k === "a") state.current.move = -1; if (k === "arrowright" || k === "d") state.current.move = 1; if (e.key === " " && !state.current.running) start(); }, up = () => { state.current.move = 0; }; window.addEventListener("keydown", down); window.addEventListener("keyup", up); return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); if (frame.current) cancelAnimationFrame(frame.current); }; }, [paint, start]);
  const nudge = (n: -1 | 1) => { state.current.move = n; window.setTimeout(() => { state.current.move = 0; }, 180); };
  return <div className="space-y-4"><div className="relative overflow-hidden border-2 border-brand-cyan bg-[#080d1a] p-2 shadow-[0_0_28px_rgba(0,240,255,.25)]"><canvas ref={canvas} width={W} height={H} className="mx-auto block h-auto w-full max-w-[640px] [image-rendering:pixelated]" />{mode !== "running" && <div className="absolute inset-0 grid place-items-center bg-[#080d1a]/85 p-6 text-center"><div className="space-y-4"><div className="font-display text-xl text-brand-cyan">{mode === "over" ? "RUN COMPLETE" : "SHARD RUNNER"}</div><p className="text-sm text-text-muted">{saving ? "Сохраняю результат..." : mode === "over" ? `Собрано: ${hud.score} осколков` : "Собирай Осколки. Избегай охотников."}</p><button type="button" disabled={saving} className="border border-brand-pink bg-brand-pink/15 px-5 py-3 text-xs uppercase tracking-[.18em] text-brand-pink hover:bg-brand-pink/25 disabled:opacity-50" onClick={start}>{mode === "over" ? "Еще забег" : "Начать игру"}</button></div></div>}</div><div className="grid grid-cols-3 gap-2 text-center text-xs uppercase tracking-wider text-text-dim"><div className="border border-meta-border p-3">Время<span className="mt-1 block text-text-primary">{hud.time}s</span></div><div className="border border-meta-border p-3">Счет<span className="mt-1 block text-brand-cyan">{hud.score}</span></div><div className="border border-meta-border p-3">Жизни<span className="mt-1 block text-brand-pink">{hud.lives}</span></div></div><div className="grid grid-cols-2 gap-3 sm:hidden"><button type="button" className="border border-brand-cyan bg-brand-cyan/10 py-4 text-brand-cyan" onPointerDown={() => nudge(-1)}>LEFT</button><button type="button" className="border border-brand-cyan bg-brand-cyan/10 py-4 text-brand-cyan" onPointerDown={() => nudge(1)}>RIGHT</button></div><p className="text-center text-xs text-text-dim">A/D или стрелки. Пробел запускает следующий забег.</p></div>;
}
