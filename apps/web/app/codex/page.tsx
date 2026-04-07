import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Panel } from "../../shared/ui/Panel";
import { ArchetypeMiniCards } from "../../shared/ui/ArchetypeMiniCards";

const ARCHETYPE_CARDS = [
  {
    id: "OXY",
    label: "Волк (OXY)",
    role: "Стратегия и давление",
    variant: "cyan" as const,
    accent: "text-brand-cyan",
    purpose: "Ломает оборону и навязывает ритм. Играет в лоб по контр‑связи.",
    ui: "UI: холодный неон, резкие контуры, акцентные кнопки давления.",
    rules: [
      "Контр только против BEAR: не распыляйся.",
      "Выбирай момент, бей короткими окнами.",
      "Не входи в бой, когда активен Золотой Щит.",
    ],
    tips: [
      "Работай через разведку OWL.",
      "Дави темпом: быстрое решение — сильнее удара.",
    ],
    counter: "Контрит BEAR",
    weak: "Контрится FOXY",
  },
  {
    id: "FOXY",
    label: "Лиса (FOXY)",
    role: "Социальный взлом",
    variant: "pink" as const,
    accent: "text-brand-pink",
    purpose: "Режет доверие и логистику. Играет из тени и быстро.",
    ui: "UI: яркие вспышки, глитч‑эффекты, короткие уведомления.",
    rules: [
      "Контр только против OXY.",
      "Береги репутацию: ты живёшь на доверии.",
      "Действуй коротко и уходи в тень.",
    ],
    tips: [
      "Бери осколки там, где шум.",
      "Оставляй ложные следы и не повторяй паттерн.",
    ],
    counter: "Контрит OXY",
    weak: "Контрится BEAR",
  },
  {
    id: "BEAR",
    label: "Медведь (BEAR)",
    role: "Ресурсы и контроль",
    variant: "neutral" as const,
    accent: "text-yellow-400",
    purpose: "Держит экономику, блокирует доступ, навязывает правила.",
    ui: "UI: тяжёлые панели, золото и графит, устойчивые статусы.",
    rules: [
      "Контр только против FOXY.",
      "Игра от обороны и долгой дистанции.",
      "Дави комиссиями, а не спринтом.",
    ],
    tips: [
      "Фиксируй точки входа и окна уязвимости.",
      "Выжидай, когда противник откроется.",
    ],
    counter: "Контрит FOXY",
    weak: "Контрится OXY",
  },
  {
    id: "OWL",
    label: "Сова (OWL)",
    role: "Информация и сделки",
    variant: "neutral" as const,
    accent: "text-purple-300",
    purpose: "Торгует данными, держит нейтралитет, управляет риском.",
    ui: "UI: тёмные фоны, мягкие подсветки, скрытые метки.",
    rules: [
      "Ты не фронт — ты тень.",
      "Нейтралитет — твой ресурс.",
      "Не обещай, а продавай доступ точечно.",
    ],
    tips: [
      "Собирай много слабых связей.",
      "Всегда оставляй выход и запасной маршрут.",
    ],
    counter: "Торгует со всеми",
    weak: "Нет прямой защиты",
  },
];

const QUICK_HINTS = [
  {
    id: "OXY",
    label: "OXY",
    accent: "text-brand-cyan",
    lines: ["Контр: BEAR", "Темп важнее силы", "Не лезь под щит"],
  },
  {
    id: "FOXY",
    label: "FOXY",
    accent: "text-brand-pink",
    lines: ["Контр: OXY", "Коротко и скрытно", "Репутация — ресурс"],
  },
  {
    id: "BEAR",
    label: "BEAR",
    accent: "text-yellow-400",
    lines: ["Контр: FOXY", "Контроль > скорость", "Комиссии решают"],
  },
  {
    id: "OWL",
    label: "OWL",
    accent: "text-purple-300",
    lines: ["Торг со всеми", "Нейтралитет — сила", "Инфа = власть"],
  },
];

export default function CodexPage() {
  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <div className="page-shell pt-10 space-y-10">
        <section className="codex-hero aggressive-frame">
          <div className="codex-hero__inner">
            <div>
              <SectionHeading as="h1">Кодекс / Правила</SectionHeading>
              <p className="text-text-dim max-w-3xl mt-3">
                MetaHunt — антисоциальная игровая платформа. Здесь не
                самопрезентация, а решения. Не лайки, а влияние. Ты играешь в
                архетип, а город отвечает последствиями.
              </p>
            </div>
            <div className="codex-hero__tag">ANTI‑INSTA</div>
          </div>
          <div className="codex-hero__signal">SIGNAL: LIVE</div>
        </section>

        <section className="space-y-4">
          <SectionHeading as="h2">Мини‑карточки архетипов</SectionHeading>
          <ArchetypeMiniCards />
        </section>

        <section className="space-y-4">
          <SectionHeading as="h2">Короткие подсказки</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_HINTS.map((hint) => (
              <Panel key={hint.id} data-archetype={hint.id} className="codex-hint">
                <div className={`text-sm font-semibold ${hint.accent}`}>
                  {hint.label}
                </div>
                <ul className="mt-2 space-y-1 text-xs text-text-dim">
                  {hint.lines.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeading as="h2">Архетипы — карточки</SectionHeading>
          <div className="grid gap-6 lg:grid-cols-2">
            {ARCHETYPE_CARDS.map((card) => (
              <Panel
                key={card.id}
                data-archetype={card.id}
                variant={card.variant}
                className="archetype-card reveal-fade"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`text-sm uppercase tracking-wider ${card.accent}`}>
                      {card.label}
                    </div>
                    <div className="text-xs text-text-dim mt-1">{card.role}</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-text-dim">
                    Archetype
                  </div>
                </div>

                <div className="archetype-card__media">
                  PLACEHOLDER: иллюстрация/символ архетипа
                </div>

                <div className="text-sm text-text-primary">{card.purpose}</div>
                <div className="text-xs text-text-dim">{card.ui}</div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-text-dim">Правила</div>
                    <ul className="mt-2 space-y-2 text-xs text-text-dim">
                      {card.rules.map((rule) => (
                        <li key={rule}>• {rule}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-text-dim">Подсказки</div>
                    <ul className="mt-2 space-y-2 text-xs text-text-dim">
                      {card.tips.map((tip) => (
                        <li key={tip}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-text-dim">
                  <span className="archetype-card__chip">{card.counter}</span>
                  <span className="archetype-card__chip">{card.weak}</span>
                </div>
              </Panel>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}