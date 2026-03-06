---
id: api-overview
title: API — Обзор
sidebar_label: Обзор
sidebar_position: 1
description: FastAPI эндпоинты MetaHunt
tags: [fastapi, api, rest]
---

# API — Обзор

## Запуск

```bash
cd apps/api
pnpm dev
```

Swagger UI: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)  
ReDoc: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

---

## Эндпоинты — карта

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| GET | `/health` | Health check | ❌ |
| GET | `/api/v1/users/me` | Мой профиль | ✅ Bearer |
| PATCH | `/api/v1/users/profile` | Обновить профиль | ✅ Bearer |
| PATCH | `/api/v1/users/password` | Сменить пароль | ✅ Bearer |
| GET | `/api/v1/game/profile` | Игровой профиль | ✅ Bearer |
| POST | `/api/v1/game/archetype` | Выбрать архетип (FOXY/OXY) | ✅ Bearer |

---

## Структура ответа

Успешный ответ возвращает DTO (Pydantic schema).  
Ошибки:

```json
{
  "detail": "Не авторизован"
}
```

401 — нужен заголовок `Authorization: Bearer <token>`.
