import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
  showHomeLink?: boolean;
};

export default function CyberLoading({
  title = "SYNCING…",
  subtitle = "Connecting to Meta Core",
  showHomeLink = false,
}: Props) {
  return (
    <main className="min-h-screen text-text-primary pb-24">
      <div className="scanlines" aria-hidden />

      <div className="pt-24 px-4 max-w-5xl mx-auto">
        <section className="flex flex-col items-center text-center py-16">
          <div className="cyber-card border border-meta-border rounded-2xl p-8 w-full max-w-xl overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,58,242,0.16),transparent_40%)]" />

            <div className="relative">
              <div className="text-[11px] tracking-[0.28em] uppercase text-text-muted">
                MetaHunt • Loading
              </div>

              <h1 className="mt-3 font-display text-2xl tracking-[0.22em] neon-text-cyan uppercase glitchy">
                {title}
              </h1>
              <p className="text-text-muted text-sm mt-2">{subtitle}</p>

              <div className="mt-8">
                <div className="h-2 w-full rounded bg-meta-bg/60 border border-meta-border overflow-hidden">
                  <div className="h-full w-1/3 bg-brand-cyan/70 animate-[bgFloat_2.4s_ease-in-out_infinite]" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase">
                  <span className="text-brand-pink terminal-flicker">TRUST = FALSE</span>
                  <span className="text-brand-cyan terminal-flicker">SURVIVAL = TRUE</span>
                </div>
              </div>

              <div className="mt-8 border border-meta-border rounded-lg bg-meta-bg/50 p-4 text-left text-[12px] leading-6">
                <div className="text-text-dim">$ handshake --init</div>
                <div className="text-brand-cyan terminal-flicker">NEW SESSION</div>
                <div className="text-text-dim">$ network.scan()</div>
                <div className="text-brand-cyan terminal-flicker">SHARDS DETECTED</div>
                <div className="text-text-dim">$ adapt()</div>
                <div className="text-brand-pink terminal-flicker">A D A P T</div>
              </div>

              {showHomeLink && (
                <div className="mt-8">
                  <Link
                    href="/"
                    className="cyber-btn glitch-hover inline-flex px-4 py-2 text-sm rounded border border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10"
                  >
                    HOME
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
