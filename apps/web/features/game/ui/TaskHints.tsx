"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getArchetypeTasks,
  type ArchetypeTask,
} from "../../../lib/api";
import { Badge } from "../../../shared/ui/Badge";
import { Panel } from "../../../shared/ui/Panel";

type Props = {
  token: string | null;
  screen: string;
  title?: string;
  refreshKey?: number;
  highlightKey?: string | null;
};

export function TaskHints({
  token,
  screen,
  title = "Задачи экрана",
  refreshKey = 0,
  highlightKey = null,
}: Props) {
  const [tasks, setTasks] = useState<ArchetypeTask[]>([]);

  useEffect(() => {
    if (!token) {
      setTasks([]);
      return;
    }
    getArchetypeTasks(token)
      .then((payload) => setTasks(payload.items))
      .catch(() => setTasks([]));
  }, [token, refreshKey]);

  const visibleTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.screen === screen && !task.locked && !task.completed)
        .sort((a, b) => {
          if (!highlightKey) return 0;
          if (a.key === highlightKey) return -1;
          if (b.key === highlightKey) return 1;
          return 0;
        })
        .slice(0, 3),
    [highlightKey, screen, tasks],
  );

  if (visibleTasks.length === 0) return null;

  return (
    <Panel className="space-y-3">
      <div className="text-xs uppercase tracking-[0.22em] text-text-dim">{title}</div>
      <div className="grid gap-2">
        {visibleTasks.map((task) => (
          <div key={task.key} className="preview-card">
            <div className="flex items-center justify-between gap-3">
              <div className="preview-card__title">{task.title}</div>
              <Badge tone="cyan">+{task.reward_shards}</Badge>
            </div>
            <div className="preview-card__line">{task.description}</div>
            <div className="preview-card__line">
              {task.progress}/{task.daily_limit} · {task.contributes_to}
            </div>
            <div className="preview-card__line">{task.next_hint}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
