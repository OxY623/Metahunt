---
id: intro
slug: /
title: MetaHunt — Документация
sidebar_label: Введение
description: Городская MMO для поиска, участия в событиях и прокачки влияния
---

# MetaHunt

Городская MMO для поиска событий, участия в них и прокачки своего влияния в цифровом городе.

## Структура монорепо

| Приложение/Пакет | Технология | Порт | Описание |
|------------------|------------|------|----------|
| `apps/web`       | Next.js 16 + React 19 | 3000 | Фронтенд |
| `apps/api`       | FastAPI + Uvicorn    | 8000 | REST API |
| `apps/docs`      | Docusaurus           | 3001 | Документация |
| `packages/ui`    | React компоненты     | —    | Button, Card и др. |
| `packages/tailwind` | Tailwind v4       | —    | Общая конфигурация стилей |

## Быстрый старт

```bash
# Установка зависимостей
pnpm install

# Запуск API (FastAPI)
cd apps/api && pnpm dev

# Запуск фронтенда (Next.js)
cd apps/web && pnpm dev

# Запуск документации
cd apps/docs && pnpm start
```

Или из корня:
```bash
pnpm dev
```

## Переменные окружения

### apps/web
- `NEXT_PUBLIC_API_URL` — URL бэкенда (по умолчанию `http://localhost:8000`)

### apps/api
- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — JWT секрет
- `ALGORITHM` — HS256

## Документация API

Swagger UI: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)  
ReDoc: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)
