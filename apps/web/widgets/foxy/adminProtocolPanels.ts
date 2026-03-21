export type AdminProtocolPanel = {
  id: string;
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  quote?: string;
  code?: string[];
};

export const ADMIN_PROTOCOL_PANELS: AdminProtocolPanel[] = [
  {
    id: "title",
    title: "Пролог истории",
    subtitle: "MetaHunt — город скрытых войн.",
    imageSrc: "/prolog/1-prolog.png",
    imageAlt:
      "Cyberpunk city at night with a holographic network map above skyscrapers.",
    quote:
      "Админ открыл охоту. Город проснулся. Волк в ярости. Но в лоб Медведя не взять. Теперь ему придётся обратиться к тому, кому он меньше всего доверяет — Сове.",
  },
  {
    id: "network",
    title: "Мир фракций",
    subtitle: "В MetaHunt есть 4 фракции.",
    imageSrc: "/prolog/2-prolog.png",
    imageAlt: "Rooftop, neon reflections, holographic network map.",
    quote:
      "Каждая — это: свой стиль игры свои способности своя стратегия власти Выбор необратим. Админ фиксирует твой выбор.",
  },
  {
    id: "lesson",
    title: "Матрица противостояний",
    subtitle: "Баланс сил в городе:",
    imageSrc: "/prolog/3-prolog.png",
    imageAlt: "Holographic terminal with code lines ADAPT, SURVIVE, EVOLVE.",
    quote:
      "🦊 FOXY → контрит OXY 🐻 BEAR → контрит FOXY 🐺 OXY → контрит BEAR 🦉 OWL → продаёт компромат на всех  Иногда сила — это не атака. Иногда сила — информация.",
    code: ["ADAPT()", "SURVIVE()", "EVOLVE()"],
  },
  {
    id: "choice",
    title: "Фракция Волка (OXY)",
    subtitle: "🐺 OXY — Волк",
    imageSrc: "/prolog/4-prolog.png",
    imageAlt: "Terminal screen with META CORE ACCESS and SEED PHRASE DETECTED.",
    quote:
      "Архетип: одинокая месть и правда Цвет: Графит и серебро #8B949E  Сила: ⚔️ Прямой удар — списывает XP без комиссии Слабость: 💀 Уязвим к Золотому Щиту Медведя",
    code: ["META CORE ACCESS", "SEED PHRASE DETECTED"],
  },
  {
    id: "fracture",
    title: "Способности Волка",
    imageSrc: "/prolog/5-prolog.png",
    imageAlt: "Network core cracking on a holographic map, data shards flying.",
    quote: "«Иногда систему нужно сломать… чтобы она стала свободной.»",
    code: ["NETWORK FRACTURE"],
  },
  {
    id: "shards",
    title: "Осколки",
    imageSrc: "/prolog/6-prolog.png",
    imageAlt: "City covered with digital anomalies; SHARDS DETECTED.",
    quote: "«Теперь охота началась.»",
    code: ["SHARDS DETECTED"],
  },
  {
    id: "new-user",
    title: "Игрок",
    imageSrc: "/foxy-protocol/panel-06.svg",
    imageAlt: "Terminal screen: NEW USER CONNECTED.",
    quote: "«Админ видит тебя.»",
    code: ["NEW USER CONNECTED"],
  },
  {
    id: "protocol",
    title: "Admin Protocol",
    imageSrc: "/foxy-protocol/panel-07.svg",
    imageAlt: "Glitched terminal mantra with neon mark and flickering panels.",
    quote: "«TRUST = FALSE. SURVIVAL = TRUE.»",
    code: ["A D A P T", "A D A P T", "A D A P T"],
  },
  {
    id: "enter",
    title: "Enter The Hunt",
    imageSrc: "/foxy-protocol/panel-08.svg",
    imageAlt: "City horizon with a neon gateway.",
    quote: "«Если ты читаешь это — значит сеть уже нашла тебя.»",
  },
];
