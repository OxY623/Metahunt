"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";
import { useSession } from "../../shared/model/session";
import { useGameProfile } from "../../shared/model/game-profile";

const SETTINGS_KEY = "metahunt-ui-settings";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = Boolean(pathname);
  const { token } = useSession();
  const { profile } = useGameProfile(token, Boolean(token));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { compact?: boolean; reduceMotion?: boolean };
      document.documentElement.dataset.motion = parsed.reduceMotion
        ? "reduce"
        : "auto";
      document.documentElement.dataset.density = parsed.compact
        ? "compact"
        : "comfortable";
    } catch (_) {
      // ignore invalid storage
    }
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      data-archetype={profile?.archetype ?? undefined}
    >
      <div className="scanlines" aria-hidden />
      <div className="flex-1">{children}</div>
      {showFooter && <SiteFooter />}
    </div>
  );
}
