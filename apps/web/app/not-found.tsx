import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen text-text-primary pb-24">
      <div className="scanlines" aria-hidden />

      <div className="pt-24 px-4 max-w-5xl mx-auto">
        <section className="flex flex-col items-center text-center py-16">
          <div className="cyber-card border border-meta-border rounded-2xl p-8 w-full max-w-xl overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.16),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,58,242,0.14),transparent_40%)]" />

            <div className="relative">
              <div className="text-[11px] tracking-[0.28em] uppercase text-text-muted">
                MetaHunt • 404
              </div>
              <h1 className="mt-3 font-display text-2xl tracking-[0.22em] uppercase neon-text-cyan glitchy">
                PAGE NOT FOUND
              </h1>
              <p className="text-text-muted text-sm mt-2">
                Узел не отвечает. Похоже, этой страницы нет в сети.
              </p>

              <div className="mt-8 border border-meta-border rounded-lg bg-meta-bg/50 p-4 text-left text-[12px] leading-6">
                <div className="text-text-dim">$ route.resolve()</div>
                <div className="text-brand-pink terminal-flicker">NOT_FOUND</div>
                <div className="text-text-dim">$ hint</div>
                <div className="text-brand-cyan terminal-flicker">TRUST = FALSE</div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="cyber-btn glitch-hover px-4 py-2 text-sm rounded border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10"
                >
                  GO HOME
                </Link>
                <Link
                  href="/chat"
                  className="cyber-btn px-4 py-2 text-sm rounded border border-meta-border text-text-muted hover:text-brand-cyan hover:border-brand-cyan/40"
                >
                  OPEN CHAT
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
