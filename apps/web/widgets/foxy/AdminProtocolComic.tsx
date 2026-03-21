"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ADMIN_PROTOCOL_PANELS,
  type AdminProtocolPanel,
} from "./adminProtocolPanels";
import { Button } from "../../shared/ui/Button";

type Props = {
  onComplete: () => void;
  className?: string;
};

export default function AdminProtocolComic({ onComplete, className }: Props) {
  const panels = useMemo(() => ADMIN_PROTOCOL_PANELS, []);
  const [index, setIndex] = useState(0);

  const panel: AdminProtocolPanel = panels[index]!;
  const isFirst = index === 0;
  const isLast = index === panels.length - 1;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(panels.length - 1, i + 1));

  return (
    <div className={["w-full max-w-4xl", className ?? ""].join(" ")}>
      <div className="cyber-card border border-meta-border rounded-xl overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={panel.imageSrc}
            alt={panel.imageAlt}
            fill
            priority
            className="object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-meta-bg/85 via-meta-bg/10 to-transparent" />
          <div className="absolute left-4 right-4 bottom-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="font-display text-xl tracking-[0.2em] neon-text-cyan uppercase">
                  {panel.title}
                </div>
                {panel.subtitle && (
                  <div className="text-[11px] tracking-[0.24em] uppercase text-text-muted mt-1">
                    {panel.subtitle}
                  </div>
                )}
              </div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-text-dim">
                {index + 1}/{panels.length}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 grid gap-4">
          {panel.quote && (
            <div className="text-sm text-text-primary whitespace-pre-line">
              <span className="text-brand-pink">ADMIN:</span>{" "}
              <span className="glitchy">{panel.quote}</span>
            </div>
          )}

          {panel.code?.length ? (
            <div className="border border-meta-border rounded-lg bg-meta-bg/50 p-4 text-[12px] leading-6">
              {panel.code.map((l) => (
                <div
                  key={`${l}-${index}`}
                  className="text-brand-cyan terminal-flicker"
                >
                  {l}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={goPrev}
              disabled={isFirst}
            >
              Назад
            </Button>

            <div className="flex items-center gap-2">
              {panels.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={[
                    "h-2 w-2 rounded-full border",
                    i === index
                      ? "bg-brand-pink border-brand-pink shadow-[0_0_10px_rgba(255,58,242,0.55)]"
                      : "border-meta-border hover:border-brand-cyan/60",
                  ].join(" ")}
                  aria-label={`Panel ${i + 1}`}
                />
              ))}
            </div>

            {!isLast ? (
              <Button type="button" variant="pink" size="sm" onClick={goNext}>
                Далее
              </Button>
            ) : (
              <Button
                type="button"
                variant="cyan"
                size="sm"
                onClick={onComplete}
              >
                Войти в охоту
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
