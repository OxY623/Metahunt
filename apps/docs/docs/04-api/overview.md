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

## Эндпоинты — авторизация

| Метод | Путь                    | Описание                  | Авторизация |
| ----- | ----------------------- | ------------------------- | ----------- |
| POST  | `/api/v1/auth/register` | Регистрация по инвайту    | ❌          |
| POST  | `/api/v1/auth/login`    | Логин и JWT               | ❌          |
| GET   | `/api/v1/users/me`      | Мой профиль               | ✅ Bearer   |
| PATCH | `/api/v1/users/profile` | Обновить профиль          | ✅ Bearer   |
| PATCH | `/api/v1/users/password`| Сменить пароль            | ✅ Bearer   |

---

## Эндпоинты — игра

| Метод | Путь                         | Описание                         | Авторизация |
| ----- | ---------------------------- | -------------------------------- | ----------- |
| GET   | `/api/v1/game/profile`       | Игровой профиль                  | ✅ Bearer   |
| POST  | `/api/v1/game/archetype`     | Выбрать архетип                  | ✅ Bearer   |
| POST  | `/api/v1/game/interact`      | Визит/взаимодействие             | ✅ Bearer   |
| POST  | `/api/v1/game/skills/glitch` | FOXY: глитч экрана               | ✅ Bearer   |
| POST  | `/api/v1/game/skills/direct_strike` | OXY: прямой удар           | ✅ Bearer   |
| POST  | `/api/v1/game/skills/golden_shield` | BEAR: золотой щит          | ✅ Bearer   |
| POST  | `/api/v1/game/skills/ban`    | BEAR: блокировка порта           | ✅ Bearer   |
| POST  | `/api/v1/game/skills/whisper`| OWL: анонимный шёпот             | ✅ Bearer   |

---

## Эндпоинты — инвайты

| Метод | Путь                          | Описание                    | Авторизация |
| ----- | ----------------------------- | --------------------------- | ----------- |
| GET   | `/api/v1/invites`             | Список инвайтов             | ✅ Bearer   |
| POST  | `/api/v1/invites`             | Создать инвайт              | ✅ Bearer   |
| POST  | `/api/v1/invites/redeem`      | Активировать инвайт         | ❌          |

---

## Эндпоинты — осколки

| Метод | Путь                          | Описание                    | Авторизация |
| ----- | ----------------------------- | --------------------------- | ----------- |
| GET   | `/api/v1/shards/balance`      | Баланс осколков             | ✅ Bearer   |
| GET   | `/api/v1/shards/ledger`       | История транзакций          | ✅ Bearer   |

---

## Эндпоинты — постинг

| Метод | Путь                          | Описание                    | Авторизация |
| ----- | ----------------------------- | --------------------------- | ----------- |
| GET   | `/api/v1/posts/feed`          | Лента                       | ✅ Bearer   |
| POST  | `/api/v1/posts`               | Создать пост                | ✅ Bearer   |
| GET   | `/api/v1/posts/{id}`          | Получить пост               | ✅ Bearer   |

---

## Эндпоинты — карта

| Метод | Путь                          | Описание                    | Авторизация |
| ----- | ----------------------------- | --------------------------- | ----------- |
| GET   | `/api/v1/map/tiles`           | Тайлы активности            | ✅ Bearer   |
| POST  | `/api/v1/map/checkin`         | Отметиться                  | ✅ Bearer   |
| POST  | `/api/v1/map/ping`            | Гео‑пинг                    | ✅ Bearer   |

---

## Эндпоинты — чат

| Метод | Путь                     | Описание                         | Авторизация |
| ----- | ------------------------ | -------------------------------- | ----------- |
| GET   | `/api/v1/chat/messages`  | Получить сообщения               | ✅ Bearer   |
| POST  | `/api/v1/chat/messages`  | Отправить сообщение              | ✅ Bearer   |
| GET   | `/api/v1/chat/effects`   | Активные эффекты игрока          | ✅ Bearer   |

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
