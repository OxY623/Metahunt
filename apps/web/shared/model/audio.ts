import { useCallback, useEffect, useState } from "react";

const AUDIO_KEY = "metahunt_audio_enabled";

export function useAudioPreference() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(AUDIO_KEY);
    if (stored != null) setEnabled(stored === "1");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(AUDIO_KEY, next ? "1" : "0");
      }
      return next;
    });
  }, []);

  const set = useCallback((value: boolean) => {
    setEnabled(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUDIO_KEY, value ? "1" : "0");
    }
  }, []);

  return { enabled, toggle, set };
}
