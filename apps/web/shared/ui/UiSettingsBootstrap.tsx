"use client";

import { useEffect } from "react";

type StoredUiSettings = {
  compact?: boolean;
  reduceMotion?: boolean;
  vibe?: "neon" | "sunset" | "matrix";
};

const STORAGE_KEY = "metahunt-ui-settings";

export function UiSettingsBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredUiSettings;

      root.dataset.motion = parsed.reduceMotion ? "reduce" : "auto";
      root.dataset.density = parsed.compact ? "compact" : "comfortable";

      if (
        parsed.vibe === "neon" ||
        parsed.vibe === "sunset" ||
        parsed.vibe === "matrix"
      ) {
        root.dataset.vibe = parsed.vibe;
      }
    } catch {
      // ignore corrupted local storage payloads
    }
  }, []);

  return null;
}