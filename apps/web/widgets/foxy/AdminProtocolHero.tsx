import Image from "next/image";
import AdminGlitchTerminal from "./AdminGlitchTerminal";

type Props = {
  className?: string;
};

export default function AdminProtocolHero({ className }: Props) {
  return (
    <section
      className={["w-full max-w-6xl mx-auto", className ?? ""].join(" ")}
    >
      <div className="relative overflow-hidden rounded-2xl border border-meta-border cyber-card">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{ backgroundImage: "var(--meta-hero-image)" }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: "var(--hero-halo)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-meta-bg/85 via-meta-bg/70 to-meta-bg/95" />
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.25),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,58,242,0.2),transparent_45%)]" />
        </div>

        <div className="relative px-6 py-10 md:px-12 md:py-16 grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-5">
            <div className="text-[11px] tracking-[0.3em] uppercase text-text-muted">
              MetaHunt • Admin Protocol
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative w-28 h-28 md:w-36 md:h-36 flex justify-center">
                <Image
                  src="/logotype/logo-circle-metahunt.png"
                  alt="MetaHunt логотип"
                  fill
                  sizes="112px"
                  className="object-cover rounded-full drop-shadow-[0_0_22px_rgba(0,240,255,0.55)]"
                  priority
                />
              </div>
              <div>
                <h1 className="font-display text-4xl md:text-5xl tracking-[0.22em] neon-text-cyan uppercase leading-tight">
                  METAHUNT
                </h1>
                <p className="text-text-muted text-sm mt-2 max-w-md">
                  Админ наблюдает. Сеть всегда видит, кто ты и на чьей ты
                  стороне.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-[12px] tracking-[0.2em] uppercase text-brand-pink glitchy">
                TRUST = FALSE
              </div>
              <div className="text-[12px] tracking-[0.2em] uppercase text-brand-cyan">
                SURVIVAL = TRUE
              </div>
            </div>
          </div>

          <AdminGlitchTerminal
            title="ADMIN / HANDSHAKE"
            lines={[
              "NEW USER CONNECTED",
              "ADMIN WATCHING",
              "TRUST = FALSE",
              "SURVIVAL = TRUE",
            ]}
            className="md:justify-self-end w-full"
          />
        </div>
      </div>
    </section>
  );
}
