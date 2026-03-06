# MetaHunt 🏙️

Городская MMO для поиска, участия в событиях и прокачки влияния в цифровом городе.

## Структура монорепо

| Путь | Описание |
|------|----------|
| `apps/web` | Next.js 16 + React 19 фронтенд (Tailwind v4, @repo/ui) |
| `apps/api` | FastAPI бэкенд |
| `apps/docs` | Docusaurus документация |
| `packages/ui` | UI-компоненты (Button, Card, Code) |
| `packages/tailwind` | Tailwind v4 конфигурация для монорепо |

## Быстрый старт

```bash
pnpm install

# Запуск API (порт 8000)
cd apps/api && pnpm setup && pnpm dev

# Запуск фронтенда (порт 3000)
cd apps/web && pnpm dev

# Документация (порт 3001)
cd apps/docs && pnpm start
```

Или из корня:

```bash
pnpm dev
```

## Переменные окружения

### apps/web
- `NEXT_PUBLIC_API_URL` — URL API (по умолчанию `http://localhost:8000`)

### apps/api
- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — JWT секрет
- `ALGORITHM` — HS256

## API

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- Health: GET /health

## Документация

Запуск: `cd apps/docs && pnpm start` → http://localhost:3001
