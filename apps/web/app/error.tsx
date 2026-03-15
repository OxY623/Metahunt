"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen text-text-primary pb-24">
      <div className="scanlines" aria-hidden />

      <div className="pt-24 px-4 max-w-5xl mx-auto">
        <section className="flex flex-col items-center text-center py-16">
          <div className="cyber-card border border-brand-pink/40 rounded-2xl p-8 w-full max-w-xl overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,58,242,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(0,240,255,0.12),transparent_40%)]" />

            <div className="relative">
              <div className="text-[11px] tracking-[0.28em] uppercase text-text-muted">
                MetaHunt • System Error
              </div>

              <h1 className="mt-3 font-display text-2xl tracking-[0.22em] uppercase neon-text-pink glitchy">
                NETWORK FAILURE
              </h1>
              <p className="text-text-muted text-sm mt-2">
                Сигнал оборвался. Попробуй перезапустить соединение.
              </p>

              {error?.digest && (
                <div className="mt-4 text-[11px] tracking-[0.22em] uppercase text-text-dim">
                  digest: <span className="text-brand-cyan">{error.digest}</span>
                </div>
              )}

              <div className="mt-8 border border-meta-border rounded-lg bg-meta-bg/50 p-4 text-left text-[12px] leading-6">
                <div className="text-text-dim">$ network.status()</div>
                <div className="text-brand-pink terminal-flicker">ERROR</div>
                <div className="text-text-dim">$ shards.recover()</div>
                <div className="text-brand-cyan terminal-flicker">RETRYING…</div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="cyber-btn glitch-hover px-4 py-2 text-sm rounded border border-brand-pink/60 text-brand-pink hover:bg-brand-pink/10"
                >
                  RETRY
                </button>
                <Link
                  href="/"
                  className="cyber-btn glitch-hover px-4 py-2 text-sm rounded border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10"
                >
                  HOME
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
