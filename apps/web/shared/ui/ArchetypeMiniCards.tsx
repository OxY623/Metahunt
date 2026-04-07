import { Panel } from "./Panel";
import { cn } from "../lib/cn";

const MINI_CARDS = [
  {
    id: "OXY",
    label: "OXY",
    title: "Волк",
    summary: "Темп, давление, прямой удар.",
    tags: ["Контр: BEAR", "Ритм > сила", "Без щита"],
  },
  {
    id: "FOXY",
    label: "FOXY",
    title: "Лиса",
    summary: "Тень, скорость, социальный взлом.",
    tags: ["Контр: OXY", "Коротко", "Репутация"],
  },
  {
    id: "BEAR",
    label: "BEAR",
    title: "Медведь",
    summary: "Экономика, контроль, блокировки.",
    tags: ["Контр: FOXY", "Дистанция", "Комиссии"],
  },
  {
    id: "OWL",
    label: "OWL",
    title: "Сова",
    summary: "Информация, сделки, нейтралитет.",
    tags: ["Торг со всеми", "Тень", "Выход"],
  },
];

type Props = {
  className?: string;
};

export function ArchetypeMiniCards({ className }: Props) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {MINI_CARDS.map((card) => (
        <Panel
          key={card.id}
          data-archetype={card.id}
          className="archetype-mini"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-text-dim">
                {card.label}
              </div>
              <div className="text-sm font-semibold text-text-primary mt-1">
                {card.title}
              </div>
            </div>
            <span className="archetype-mini__pulse" />
          </div>
          <div className="mt-2 text-xs text-text-dim">{card.summary}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {card.tags.map((tag) => (
              <span key={tag} className="archetype-mini__tag">
                {tag}
              </span>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}