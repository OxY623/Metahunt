"use client";

import { useEffect, useRef } from "react";
import { useAudioPreference } from "../../shared/model/audio";
import { Button } from "../../shared/ui/Button";

export function AudioController() {
  const { enabled, toggle } = useAudioPreference();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!enabled) {
      audio.pause();
      return;
    }
    // Autoplay can be blocked; user interaction via toggle unlocks it.
    audio.play().catch(() => {});
  }, [enabled]);

  return (
    <div className="space-y-2">
      <audio ref={audioRef} src="/intro/intro.mp3" loop />
      <Button
        variant={enabled ? "cyan" : "neutral"}
        size="md"
        className="w-full"
        onClick={toggle}
      >
        {enabled ? "Музыка: On" : "Музыка: Off"}
      </Button>
    </div>
  );
}
