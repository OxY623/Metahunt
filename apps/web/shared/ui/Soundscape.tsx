"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Archetype } from "../../lib/api";
import { cn } from "../lib/cn";

type Props = {
  className?: string;
  archetype?: Archetype | null;
};

const STORAGE_KEY = "metahunt-soundscape";
const STORAGE_AMBIENCE = "metahunt-ambience";
const STORAGE_KEYS = "metahunt-keys";

const AMBIENCE_BY_ARCHETYPE: Record<Archetype, string> = {
  FOXY: "/audio/ambience-foxy.wav",
  OXY: "/audio/ambience-oxy.wav",
  BEAR: "/audio/ambience-bear.wav",
  OWL: "/audio/ambience-owl.wav",
};

const KEYS_BY_ARCHETYPE: Record<Archetype, string> = {
  FOXY: "/audio/key-foxy.wav",
  OXY: "/audio/key-oxy.wav",
  BEAR: "/audio/key-bear.wav",
  OWL: "/audio/key-owl.wav",
};

export function Soundscape({ className, archetype }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [ambienceVolume, setAmbienceVolume] = useState(25);
  const [keyVolume, setKeyVolume] = useState(20);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const clickPoolRef = useRef<HTMLAudioElement[]>([]);
  const clickIndexRef = useRef(0);

  const ambienceSrc = useMemo(() => {
    if (!archetype) return "/audio/ambience-oxy.wav";
    return AMBIENCE_BY_ARCHETYPE[archetype];
  }, [archetype]);

  const keySrc = useMemo(() => {
    if (!archetype) return "/audio/key-oxy.wav";
    return KEYS_BY_ARCHETYPE[archetype];
  }, [archetype]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setEnabled(stored === "on");
    const ambienceStored = window.localStorage.getItem(STORAGE_AMBIENCE);
    const keysStored = window.localStorage.getItem(STORAGE_KEYS);
    if (ambienceStored) setAmbienceVolume(Number(ambienceStored));
    if (keysStored) setKeyVolume(Number(keysStored));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  }, [enabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_AMBIENCE, String(ambienceVolume));
  }, [ambienceVolume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS, String(keyVolume));
  }, [keyVolume]);

  useEffect(() => {
    const ambience = ambienceRef.current;
    if (!ambience) return;
    ambience.volume = Math.min(1, Math.max(0, ambienceVolume / 100));
    if (enabled) {
      ambience.play().catch(() => {});
    }
  }, [enabled, ambienceVolume]);

  useEffect(() => {
    const ambience = ambienceRef.current;
    if (!ambience) return;
    ambience.src = ambienceSrc;
    ambience.load();
    if (enabled) {
      ambience.play().catch(() => {});
    }
  }, [ambienceSrc, enabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    clickPoolRef.current = Array.from({ length: 4 }, () => {
      const audio = new Audio(keySrc);
      audio.volume = Math.min(1, Math.max(0, keyVolume / 100));
      return audio;
    });

    const handleKey = (event: KeyboardEvent) => {
      if (!enabled) return;
      if (event.repeat) return;
      const pool = clickPoolRef.current;
      if (!pool.length) return;
      const audio = pool[clickIndexRef.current % pool.length];
      clickIndexRef.current += 1;
      audio.currentTime = 0;
      audio.volume = Math.min(1, Math.max(0, keyVolume / 100));
      audio.play().catch(() => {});
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enabled, keySrc, keyVolume]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next && ambienceRef.current) {
      ambienceRef.current.volume = Math.min(1, Math.max(0, ambienceVolume / 100));
      ambienceRef.current.play().catch(() => {});
    }
  };

  return (
    <div className={cn("soundscape", className)}>
      <audio ref={ambienceRef} src={ambienceSrc} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        className={cn("sound-toggle", enabled && "sound-toggle--active")}
      >
        {enabled ? "Sound On" : "Sound Off"}
      </button>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn("sound-toggle", "sound-toggle--ghost")}
      >
        Настройки
      </button>
      {open && (
        <div className="sound-panel">
          <div className="sound-row">
            <span>Ambience</span>
            <input
              type="range"
              min={0}
              max={100}
              value={ambienceVolume}
              onChange={(e) => setAmbienceVolume(Number(e.target.value))}
            />
            <span className="sound-value">{ambienceVolume}%</span>
          </div>
          <div className="sound-row">
            <span>Keys</span>
            <input
              type="range"
              min={0}
              max={100}
              value={keyVolume}
              onChange={(e) => setKeyVolume(Number(e.target.value))}
            />
            <span className="sound-value">{keyVolume}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
