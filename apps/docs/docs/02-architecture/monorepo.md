---
id: monorepo
title: Структура монорепо
sidebar_label: Monorepo (Turborepo)
sidebar_position: 2
description: Turborepo — организация кода для B.L.Y.A.T.
tags: [architecture, turborepo, monorepo]
---

# Структура монорепо (Turborepo)

С четырьмя фракциями и сложной логикой взаимодействий монорепо обязательно —  
иначе зависимости между фронтом и бэком превратятся в хаос.

---

## Дерево папок

```
/metahunt
├── apps/
│   ├── web/                  ← Next.js (фронтенд)
│   │   ├── app/
│   │   │   ├── page.tsx      ← Главная (выбор фракции)
│   │   │   ├── chat/         ← Общий чат
│   │   │   └── profile/      ← Профиль игрока
│   │   ├── components/
│   │   │   ├── FactionCard.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ShardBalance.tsx
│   │   └── tailwind.config.js
│   │
│   └── api/                  ← FastAPI (бэкенд)
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       └── routers/
│           ├── auth.py       ← Регистрация / JWT
│           ├── users.py      ← Профили
│           ├── factions.py   ← Логика фракций
│           ├── shards.py     ← Транзакции осколков
│           └── skills.py     ← Скиллы (налог, бан, глитч)
│
├── packages/
│   ├── ui/                   ← Переиспользуемые компоненты
│   │   ├── Button.tsx        ← Пиксельная кнопка
│   │   ├── GlitchText.tsx    ← Глитч-эффект
│   │   └── ShardBadge.tsx    ← Бейдж с балансом
│   │
│   └── logic/                ← Правила игры (TypeScript)
│       ├── counter-matrix.ts ← Кто кого контрит
│       ├── tax-calculator.ts ← Расчёт налогов
│       └── faction-types.ts  ← Типы фракций
│
├── turbo.json
├── package.json
└── .env
```

---

## `turbo.json` — минимальный конфиг

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

---

## Запуск всего сразу

```bash
# Установка зависимостей
npm install

# Запуск web + api одновременно
npx turbo dev
```

---

## Матрица зависимостей пакетов

| Пакет            | Зависит от                              |
| ---------------- | --------------------------------------- |
| `apps/web`       | `packages/ui`, `packages/logic`         |
| `apps/api`       | — (чистый Python)                       |
| `packages/ui`    | `packages/logic` (типы фракций)         |
| `packages/logic` | — (только TypeScript, без зависимостей) |
