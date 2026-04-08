---
id: tech-stack
title: РЎС‚РµРє С‚РµС…РЅРѕР»РѕРіРёР№
sidebar_label: Tech Stack
sidebar_position: 1
description: РџРѕР»РЅС‹Р№ СЃС‚РµРє B.L.Y.A.T. вЂ” РѕС‚ РјРѕРЅРѕСЂРµРїРѕ РґРѕ РґРµРїР»РѕСЏ
tags: [architecture, fastapi, nextjs, postgresql]
---

# РЎС‚РµРє С‚РµС…РЅРѕР»РѕРіРёР№

## РћР±Р·РѕСЂ

```
РљР»РёРµРЅС‚ (Next.js) в”Ђв”Ђв–є FastAPI в”Ђв”Ђв–є PostgreSQL
                         в”‚
                    Alembic (РјРёРіСЂР°С†РёРё)
```

---

## РџРѕР»РЅР°СЏ С‚Р°Р±Р»РёС†Р° СЃС‚РµРєР°

| РЎР»РѕР№        | РўРµС…РЅРѕР»РѕРіРёСЏ              | РќР°Р·РЅР°С‡РµРЅРёРµ                                |
| ----------- | ----------------------- | ----------------------------------------- |
| РњРѕРЅРѕСЂРµРїРѕ    | Turborepo               | Р•РґРёРЅРѕРµ С…СЂР°РЅРёР»РёС‰Рµ РґР»СЏ РІСЃРµС… СЃРµСЂРІРёСЃРѕРІ        |
| Р‘СЌРєРµРЅРґ      | FastAPI + Python        | REST API, Р±РёР·РЅРµСЃ-Р»РѕРіРёРєР°, СЂР°СЃС‡С‘С‚ XP        |
| Р‘Р°Р·Р° РґР°РЅРЅС‹С… | PostgreSQL              | РҐСЂР°РЅРµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№, С„СЂР°РєС†РёР№, РѕСЃРєРѕР»РєРѕРІ |
| ORM         | SQLAlchemy (async)      | Р Р°Р±РѕС‚Р° СЃ Р‘Р” РёР· Python                     |
| РњРёРіСЂР°С†РёРё    | Alembic                 | Р’РµСЂСЃРёРѕРЅРёСЂРѕРІР°РЅРёРµ СЃС…РµРјС‹ Р‘Р”                  |
| Р¤СЂРѕРЅС‚РµРЅРґ    | Next.js + TypeScript    | РџРёРєСЃРµР»СЊРЅС‹Р№ РёРЅС‚РµСЂС„РµР№СЃ, С‡Р°С‚, РїСЂРѕС„РёР»Рё        |
| РЎС‚РёР»Рё       | Tailwind CSS            | Pixel-art СЂРµР¶РёРј                           |
| State       | Zustand                 | РЎРѕСЃС‚РѕСЏРЅРёРµ РёРіСЂРѕРєР°, С„СЂР°РєС†РёРё, РѕСЃРєРѕР»РєРѕРІ       |
| Р”РµРїР»РѕР№      | Docker + Docker Compose | РљРѕРЅС‚РµР№РЅРµСЂРёР·Р°С†РёСЏ API + PostgreSQL          |

---

## Р—Р°РІРёСЃРёРјРѕСЃС‚Рё Python (FastAPI)

```bash
pip install fastapi uvicorn sqlalchemy asyncpg alembic psycopg2-binary python-jose passlib
```

## Р—Р°РІРёСЃРёРјРѕСЃС‚Рё Node.js (Next.js)

```bash
npm install next react react-dom typescript tailwindcss zustand
npm install @types/react @types/node
```

## Web Testing

- Vitest (jsdom) + Testing Library
- Run: `pnpm -C apps/web test`

---

## РџРµСЂРµРјРµРЅРЅС‹Рµ РѕРєСЂСѓР¶РµРЅРёСЏ

РЎРѕР·РґР°Р№ `.env` РІ РєРѕСЂРЅРµ `/apps/api/`:

```env
DATABASE_URL=postgresql+asyncpg://myuser:mypassword@localhost:5432/blyatdb
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

:::danger РќРёРєРѕРіРґР° РЅРµ РєРѕРјРјРёС‚СЊ `.env`
Р”РѕР±Р°РІСЊ `.env` РІ `.gitignore` РЅРµРјРµРґР»РµРЅРЅРѕ.
:::

