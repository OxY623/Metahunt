"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShardRunner } from "../../features/arcade/ui/ShardRunner";
import { getArcadeOverview, type ArcadeOverviewResponse, type ArcadeRunResult } from "../../lib/api";
import { useSession } from "../../shared/model/session";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Panel } from "../../shared/ui/Panel";
import LoadingScreen from "../../shared/ui/LoadingScreen";

export default function ArcadePage() {
  const router = useRouter(); const { token, loading } = useSession();
  const [overview, setOverview] = useState<ArcadeOverviewResponse | null>(null);
  const [result, setResult] = useState<ArcadeRunResult | null>(null);
  const refresh = useCallback(() => { if (token) getArcadeOverview(token).then(setOverview).catch(() => setOverview(null)); }, [token]);
  useEffect(() => { if (!loading && !token) router.replace("/"); }, [loading, router, token]);
  useEffect(() => { refresh(); }, [refresh]);
  if (loading || !token) return <LoadingScreen />;
  const complete = (next: ArcadeRunResult) => { setResult(next); refresh(); };
  return <main className="min-h-screen pb-12"><SiteHeader /><div className="page-shell pt-8 space-y-6"><div><SectionHeading as="h1" className="neon-text-cyan">8-BIT ARCADE</SectionHeading><p className="mt-2 text-sm text-text-muted">Сигнал потерян. Собери Осколки до того, как охотники закроют канал.</p></div><section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] items-start"><Panel className="p-3 sm:p-5"><ShardRunner token={token} onComplete={complete} /></Panel><div className="space-y-6"><Panel className="space-y-4"><div className="text-xs uppercase tracking-[.24em] text-text-dim">Результат сети</div><div className="text-lg text-text-primary">Личный рекорд: <span className="text-brand-cyan">{overview?.best_score ?? 0}</span></div>{result ? <div className="border border-brand-cyan/40 bg-brand-cyan/10 p-3 text-sm text-text-primary"><div>Забег: {result.score}</div><div>Лучший: {result.best_score}</div><div className="mt-2 text-brand-cyan">{result.reward_shards ? `+${result.reward_shards} Осколков за ежедневный забег` : "Ежедневная награда уже получена"}</div></div> : <p className="text-sm leading-6 text-text-muted">Первый завершенный забег дня дает 12 Осколков.</p>}</Panel><Panel className="space-y-3"><div className="text-xs uppercase tracking-[.24em] text-text-dim">Лидерборд</div>{overview?.leaderboard.length ? overview.leaderboard.map((entry) => <div key={`${entry.rank}-${entry.nickname}`} className="flex items-center justify-between border-b border-meta-border/70 pb-2 text-sm last:border-0"><div><span className="mr-2 text-text-dim">#{entry.rank}</span>{entry.nickname}<span className="ml-2 text-xs text-text-dim">{entry.archetype ?? "NONE"}</span></div><span className="text-brand-cyan">{entry.score}</span></div>) : <p className="text-sm text-text-dim">Рейтинг ждет первый сохраненный забег.</p>}</Panel></div></section></div></main>;
}
