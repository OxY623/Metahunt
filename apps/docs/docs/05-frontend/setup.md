---
id: frontend-setup
title: Фронтенд — Setup
sidebar_label: Setup & Pixel-Art
sidebar_position: 1
description: Next.js + Tailwind в пиксельном стиле
tags: [nextjs, tailwind, pixel-art, frontend]
---

# Фронтенд — Setup

## Tailwind — Pixel-Art режим

В `apps/web/tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "cursive"],
        gothic: ['"DotGothic16"', "sans-serif"],
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px rgba(0,0,0,1)",
        "pixel-colored": "4px 4px 0px 0px #00D9A3",
      },
      colors: {
        // Цвета фракций
        oxy: { DEFAULT: "#8B949E", dark: "#4A5568" },
        foxy: { DEFAULT: "#FF8C00", dark: "#CC7000" },
        bear: { DEFAULT: "#B8860B", dark: "#8B6508" },
        owl: { DEFAULT: "#9B59B6", dark: "#7D3C98" },
        // Базовые
        bg: "#0D1117",
        bg2: "#161B22",
        bg3: "#1C2330",
      },
    },
  },
};
```

Подключи шрифты в `app/layout.tsx`:

```tsx
import { Press_Start_2P, DotGothic16 } from "next/font/google";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"] });
const gothic = DotGothic16({ weight: "400", subsets: ["latin"] });
```

---

## Первый экран — выбор фракции

```tsx
// app/page.tsx
export default function Battleground() {
  return (
    <div className="bg-bg font-pixel min-h-screen text-white p-8">
      <div className="border-4 border-white shadow-pixel p-4 mb-4 bg-bg2">
        <h1 className="text-foxy animate-pulse">СИСТЕМА: КОНФЛИКТ В РАЗГАРЕ</h1>
        <p className="text-sm mt-2 font-gothic">
          Медведь захватил 40% трафика. Волк воет в консоли.
        </p>
      </div>

      <button
        className="
        bg-red-700 hover:bg-red-500
        border-b-8 border-red-900
        p-4 font-pixel text-xs
        active:border-b-0
        transition-all shadow-pixel
      "
      >
        [ ИСПОЛЬЗОВАТЬ ХИТРОСТЬ ]
      </button>
    </div>
  );
}
```

---

## Zustand — состояние игрока

```ts
// store/playerStore.ts
import { create } from "zustand";

type Side = "oxy" | "foxy" | "bear" | "owl";

interface PlayerState {
  id: string | null;
  username: string | null;
  side: Side | null;
  shards: number;
  energy: number;
  setPlayer: (data: Partial<PlayerState>) => void;
  spendShards: (amount: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  id: null,
  username: null,
  side: null,
  shards: 100,
  energy: 100,
  setPlayer: (data) => set((state) => ({ ...state, ...data })),
  spendShards: (amount) => set((state) => ({ shards: state.shards - amount })),
}));
```

---

## Цветовые темы по фракциям

```ts
// packages/logic/faction-types.ts
export const FACTION_THEME = {
  oxy: { primary: "#8B949E", bg: "#1C2330", label: "🐺 ОКСИ" },
  foxy: { primary: "#FF8C00", bg: "#2A1A00", label: "🦊 ФОКСИ" },
  bear: { primary: "#B8860B", bg: "#1A1400", label: "🐻 БЕР" },
  owl: { primary: "#9B59B6", bg: "#1A0D2E", label: "🦉 ОУЛ" },
} as const;
```
