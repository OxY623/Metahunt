---
id: api-setup
title: API — Запуск и настройка
sidebar_label: Setup
sidebar_position: 0
description: Запуск FastAPI и интеграция с фронтендом
tags: [fastapi, api, setup]
---

# API — Запуск и настройка

## Запуск

```bash
cd apps/api

# Первый запуск — создать venv и установить зависимости
pnpm setup

# Режим разработки
pnpm dev
```

API доступен на [http://localhost:8000](http://localhost:8000).

## Документация

- Swagger UI: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- ReDoc: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

## CORS

API настроен на запросы с `http://localhost:3000` (Next.js фронтенд).  
Для других origin измени `allow_origins` в `apps/api/main.py`.

## Интеграция с фронтендом

Фронтенд использует клиент из `apps/web/lib/api.ts`:

```ts
import { health, getMe, getGameProfile } from "@/lib/api";

// Health check (без авторизации)
const { status } = await health();

// Защищённые эндпоинты (нужен Bearer token)
const user = await getMe(token);
const profile = await getGameProfile(token);
```

Переменная `NEXT_PUBLIC_API_URL` задаёт базовый URL API (по умолчанию `http://localhost:8000`).
