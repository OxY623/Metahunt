"use client";

import Image from "next/image";
import FoxyGlitchTerminal from "./FoxyGlitchTerminal";

type Props = {
  className?: string;
};

export default function FoxyProtocolHero({ className }: Props) {
  return (
    <section className={["w-full max-w-5xl mx-auto", className ?? ""].join(" ")}>
      <div className="relative overflow-hidden rounded-2xl border border-meta-border cyber-card">
        <div className="absolute inset-0">
          <Image
            src="/foxy-protocol/hero.svg"
            alt="Cyberpunk city hero scene with Foxy and a holographic network overlay."
            fill
            priority
            className="object-cover opacity-80 animate-[bgFloat_12s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-meta-bg/85 via-meta-bg/40 to-meta-bg/80" />
        </div>

        <div className="relative px-6 py-10 md:px-10 md:py-14 grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <div className="text-[11px] tracking-[0.28em] uppercase text-text-muted">
              MetaHunt • Game Protocol
            </div>
            <h1 className="font-display text-3xl md:text-4xl tracking-[0.22em] neon-text-cyan uppercase leading-tight">
              The Network
              <br />
              Is Broken
            </h1>
            <p className="text-text-muted text-sm leading-6 max-w-md">
              Только охотники выживают. ADMIN уже в сети — и она смотрит прямо на тебя.
            </p>

            <div className="flex items-center gap-3">
              <div className="text-[12px] tracking-[0.2em] uppercase text-brand-pink glitchy">
                TRUST = FALSE
              </div>
              <div className="text-[12px] tracking-[0.2em] uppercase text-brand-cyan">
                SURVIVAL = TRUE
              </div>
            </div>
          </div>

          <FoxyGlitchTerminal
            title="ADMIN / HANDSHAKE"
            lines={["NEW USER CONNECTED", "A D A P T", "TRUST = FALSE", "SURVIVAL = TRUE"]}
            className="md:justify-self-end w-full"
          />
        </div>
      </div>
    </section>
  );
}

