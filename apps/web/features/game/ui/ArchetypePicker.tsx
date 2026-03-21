"use client";

import type { Archetype } from "../../../lib/api";
import { chooseArchetype } from "../../../lib/api";
import { Button } from "../../../shared/ui/Button";
import { Panel } from "../../../shared/ui/Panel";
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_DESC,
} from "../../../entities/user/lib/archetypes";

const ARCHETYPES: Archetype[] = ["FOXY", "OXY", "BEAR", "OWL"];

type Props = {
  token: string;
  onChosen?: () => void;
};

export function ArchetypePicker({ token, onChosen }: Props) {
  const handlePick = async (type: Archetype) => {
    await chooseArchetype(token, type);
    onChosen?.();
  };

  return (
    <Panel>
      <h2 className="text-brand-cyan text-sm uppercase tracking-wider">
        Выбери архетип
      </h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {ARCHETYPES.map((type) => (
          <Button
            key={type}
            variant="neutral"
            className="text-left px-4 py-4 flex flex-col gap-2"
            onClick={() => handlePick(type)}
          >
            <div className="text-sm font-semibold text-text-primary">
              {ARCHETYPE_LABELS[type]}
            </div>
            <div className="text-xs text-text-muted">
              {ARCHETYPE_DESC[type]}
            </div>
          </Button>
        ))}
      </div>
    </Panel>
  );
}
