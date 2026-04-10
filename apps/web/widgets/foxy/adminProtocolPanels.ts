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
    id: "purpose",
    title: "Пролог: зачем это всё",
    subtitle: "MetaHunt — антисоциальная игровая платформа, контр‑инста.",
    imageSrc: "/prolog/01-prolog.png",
    imageAlt:
      "Cyberpunk city at night with a holographic network map above skyscrapers.",
    quote:
      "Здесь не собирают лайки и не строят витрины. Здесь строят влияние, связи и реальную силу. MetaHunt — игра про выбор, риск и последствия.",
  },
  {
    id: "story",
    title: "История города",
    subtitle: "Старый протокол сгорел. Остались люди и правила.",
    imageSrc: "/prolog/02-prolog.png",
    imageAlt: "Rooftop, neon reflections, holographic network map.",
    quote:
      "Город стал сетью закрытых комнат и коротких встреч. Админ не правит напрямую — он задаёт рамки, остальное решают игроки. Ты входишь как гость. Архетип выбираешь, когда готов.",
  },
  {
    id: "anti-social",
    title: "Контр‑инста: как устроено",
    subtitle: "Меньше шума — больше смысла.",
    imageSrc: "/prolog/03-prolog.png",
    imageAlt: "Holographic terminal with code lines ADAPT, SURVIVE, EVOLVE.",
    quote:
      "Нет ленты для самопрезентации. Есть события, комнаты и решения. Репутация — это поступки. Валюта — Shards. Ошибка — это потеря доступа.",
  },
  {
    id: "matrix",
    title: "Матрица противостояний",
    subtitle: "Баланс сил в городе:",
    imageSrc: "/prolog/04-prolog.png",
    imageAlt: "Terminal screen with META CORE ACCESS and SEED PHRASE DETECTED.",
    quote:
      "🦊 FOXY → контрит OXY  🐻 BEAR → контрит FOXY  🐺 OXY → контрит BEAR  🦉 OWL → торгует данными со всеми. Сила — это не только атака, иногда сила — информация.",
    code: ["ADAPT()", "SURVIVE()", "EVOLVE()"],
  },
  {
    id: "oxy",
    title: "Архетип: Волк (OXY)",
    subtitle: "Стратегия, давление, прямой удар.",
    imageSrc: "/prolog/05-prolog.png",
    imageAlt: "Network core cracking on a holographic map, data shards flying.",
    quote:
      "Правила: 1) Играешь в лоб, но только по контр‑связи. 2) Сила — в темпе: навязывай ритм. 3) Не лезь под Золотой Щит Медведя. Подсказки: выбирай цели с низкой защитой и короткими окнами. Работай парой с Совами, чтобы видеть риск заранее.",
    code: ["PRESSURE", "TIMING", "COUNTER"],
  },
  {
    id: "foxy",
    title: "Архетип: Лиса (FOXY)",
    subtitle: "Социальный взлом, хитрость, скорость.",
    imageSrc: "/prolog/06-prolog.png",
    imageAlt: "City covered with digital anomalies; SHARDS DETECTED.",
    quote:
      "Правила: 1) Работаешь из тени, контришь OXY. 2) Не сжигай репутацию — ты живёшь на доверии. 3) Собирай осколки там, где шум. Подсказки: действуй быстро и коротко, используй анонимные входы, всегда имей план отхода.",
    code: ["STEALTH", "SPEED", "TRUST"],
  },
  {
    id: "bear",
    title: "Архетип: Медведь (BEAR)",
    subtitle: "Ресурсы, блокировки, контроль.",
    imageSrc: "/prolog/07-prolog.png",
    imageAlt: "Terminal screen: NEW USER CONNECTED.",
    quote:
      "Правила: 1) Играешь от экономики — кто платит, тот живёт. 2) Контришь FOXY, но не гонись за скоростью. 3) Держи оборону и не распыляйся. Подсказки: фиксируй точки входа, навязывай комиссии, выжидай, когда враг откроется.",
    code: ["CONTROL", "TAX", "HOLD"],
  },
  {
    id: "owl",
    title: "Архетип: Сова (OWL)",
    subtitle: "Информация, сделки, нейтралитет.",
    imageSrc: "/prolog/08-prolog.png",
    imageAlt: "Glitched terminal mantra with neon mark and flickering panels.",
    quote:
      "Правила: 1) Ты не фронт — ты тень. 2) Торгуй данными, не давай обещаний. 3) Нейтралитет — это ресурс. Подсказки: держи много слабых связей, продавай доступ точечно, всегда оставляй выход.",
    code: ["INTEL", "DEAL", "NEUTRAL"],
  },
  {
    id: "entry",
    title: "Вход в охоту",
    subtitle: "Выбор архетипа — точка невозврата.",
    imageSrc: "/prolog/09-prolog.png",
    imageAlt: "City horizon with a neon gateway.",
    quote:
      "Если ты читаешь это — сеть уже нашла тебя. Пролог закончен. Дальше — твои решения.",
  },
];
