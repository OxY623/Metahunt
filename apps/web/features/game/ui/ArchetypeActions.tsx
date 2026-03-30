"use client";

import { useState } from "react";
import type { Archetype } from "../../../lib/api";
import {
  banPort,
  directStrike,
  glitchScreen,
  goldenShield,
  interact,
  whisper,
} from "../../../lib/api";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Panel } from "../../../shared/ui/Panel";

const ACTION_TITLE: Record<Archetype, string> = {
  FOXY: "Скиллы архетипа",
  OXY: "Скиллы архетипа",
  BEAR: "Скиллы архетипа",
  OWL: "Скиллы архетипа",
};

type Props = {
  token: string;
  archetype: Archetype;
  onDone?: (msg: string) => void;
};

export function ArchetypeActions({ token, archetype, onDone }: Props) {
  const [targetId, setTargetId] = useState("");
  const [whisperText, setWhisperText] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async (fn: () => Promise<{ msg: string }>) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fn();
      setMsg(res.msg);
      onDone?.(res.msg);
      setTargetId("");
      setWhisperText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm uppercase tracking-wider archetype-heading">
          {ACTION_TITLE[archetype]}
        </h2>
        {msg && <span className="text-xs archetype-chip px-2 py-1">{msg}</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">
            Target ID
          </label>
          <Input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="uuid цели"
          />
        </div>
        {archetype === "OWL" && (
          <div className="space-y-2">
            <label className="text-xs text-text-muted uppercase tracking-wider">
              Whisper
            </label>
            <Input
              value={whisperText}
              onChange={(e) => setWhisperText(e.target.value)}
              placeholder="сообщение"
            />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {archetype === "FOXY" && (
          <Button
            variant="pink"
            disabled={loading || !targetId}
            onClick={() => run(() => glitchScreen(token, targetId))}
          >
            Глитч экрана (15 Shards)
          </Button>
        )}
        {archetype === "OXY" && (
          <>
            <Button
              variant="cyan"
              disabled={loading || !targetId}
              onClick={() => run(() => directStrike(token, targetId))}
            >
              Прямой удар (5 Shards)
            </Button>
            <Button
              variant="neutral"
              disabled={loading || !targetId}
              onClick={() => run(() => interact(token, targetId))}
            >
              Визит / налог (10 Shards)
            </Button>
          </>
        )}
        {archetype === "BEAR" && (
          <>
            <Button
              variant="warning"
              disabled={loading}
              onClick={() => run(() => goldenShield(token))}
            >
              Золотой щит (20 Shards)
            </Button>
            <Button
              variant="pink"
              disabled={loading || !targetId}
              onClick={() => run(() => banPort(token, targetId))}
            >
              Бан порта (30 Shards)
            </Button>
          </>
        )}
        {archetype === "OWL" && (
          <Button
            variant="neutral"
            disabled={loading || !targetId || !whisperText}
            onClick={() => run(() => whisper(token, targetId, whisperText))}
          >
            Шёпот (20 Shards)
          </Button>
        )}
      </div>
    </Panel>
  );
}
