export type FoxyProtocolPanel = {
  id: string;
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  quote?: string;
  code?: string[];
};

export const FOXY_PROTOCOL_PANELS: FoxyProtocolPanel[] = [
  {
    id: "title",
    title: "Пролог истории",
    subtitle: "MetaHunt — город скрытых войн.",
    imageSrc: "/prolog/1-prolog.png",
    imageAlt: "Cyberpunk city at night with a holographic network map above skyscrapers.",
    quote: "Лиса ушла от Волка к Медведю.\nНе по любви — по расчёту.\nВолк в ярости.\nНо он знает: в лоб Медведя не взять.\nТеперь ему придётся обратиться\nк тому, кому он меньше всего доверяет — Сове.",
  },
  {
    id: "network",
    title: "Мир фракций",
    subtitle:"В MetaHunt есть 4 фракции.",
    imageSrc: "/prolog/2-prolog.png",
    imageAlt: "Foxy on a rooftop, neon reflections on glass, holographic network map.",
    quote: "Каждая — это:\nсвой стиль игры\nсвои способности\nсвоя стратегия власти\nВыбор необратим.\nВыбирай, кем ты станешь в этой истории.",
  },
  {
    id: "lesson",
    title: "Матрица противостояний",
    subtitle:"Баланс сил в городе:",
    imageSrc: "/prolog/3-prolog.png",
    imageAlt: "Holographic terminal with code lines ADAPT, SURVIVE, EVOLVE.",
    quote: "🦊 FOXY → контрит OXY\n🐻 BEAR → контрит FOXY\n🐺 OXY → контрит BEAR\n🦉 OWL → продаёт компромат на всех\n\nИногда сила — это не атака.\nИногда сила — информация.",
    code: ["ADAPT()", "SURVIVE()", "EVOLVE()"],
  },
  {
    id: "choice",
    title: "Фракция Волка (OXY)",
    subtitle: "🐺 OXY — Волк",
    imageSrc: "/prolog/4-prolog.png",
    imageAlt: "Terminal screen with META CORE ACCESS and SEED PHRASE DETECTED; Foxy eyes glow orange.",
    quote: "Архетип: одинокая месть и правда\nЦвет:\nГрафит и серебро #8B949E\n\nСила:\n⚔️ Прямой удар — списывает XP без комиссии\nСлабость:\n💀 Уязвим к Золотому Щиту Медведя",
    code: ["META CORE ACCESS", "SEED PHRASE DETECTED"],
  },
  {
    id: "fracture",
    title: "Способности Волка",
    imageSrc: "/prolog/5-prolog.png",
    imageAlt: "Network core cracking on a holographic map, data shards flying.",
    quote: "«Иногда систему нужно сломать…\nчтобы она стала свободной.»",
    code: ["NETWORK FRACTURE"],
  },
  {
    id: "shards",
    title: "Осколки",
    imageSrc: "/prolog/6-prolog.png",
    imageAlt: "City covered with digital anomalies; new nodes appear; SHARDS DETECTED.",
    quote: "«Теперь охота началась.»",
    code: ["SHARDS DETECTED"],
  },
  {
    id: "new-user",
    title: "Игрок",
    imageSrc: "/foxy-protocol/panel-06.svg",
    imageAlt: "Terminal screen: NEW USER CONNECTED; Foxy turns toward the screen.",
    quote: "«Ну что…\nпосмотрим, на чьей ты стороне.»",
    code: ["NEW USER CONNECTED"],
  },
  {
    id: "protocol",
    title: "Foxy Protocol",
    imageSrc: "/foxy-protocol/panel-07.svg",
    imageAlt: "Glitched terminal mantra with neon fox mark and flickering panels.",
    quote: "«TRUST = FALSE.\nSURVIVAL = TRUE.»",
    code: ["A D A P T", "A D A P T", "A D A P T"],
  },
  {
    id: "enter",
    title: "Enter The Hunt",
    imageSrc: "/foxy-protocol/panel-08.svg",
    imageAlt: "City horizon with a neon gateway and a fox silhouette; call to enter the hunt.",
    quote: "«Если ты читаешь это — значит сеть уже нашла тебя.»",
  },
];
