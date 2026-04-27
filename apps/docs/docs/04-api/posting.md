---
id: api-posting
title: API — Постинг
sidebar_label: Постинг
sidebar_position: 5
description: Схемы эндпоинтов постинга и ленты
tags: [fastapi, api, posting, feed]
---

# API — Постинг

Постинг — это тактические дропы. Лента короткая, шум управляется ценой и лимитами.

---

## Эндпоинты

| Метод | Путь                 | Описание           | Авторизация |
| ----- | -------------------- | ------------------ | ----------- |
| GET   | `/api/v1/posts/feed` | Лента              | ✅ Bearer   |
| POST  | `/api/v1/posts`      | Создать пост       | ✅ Bearer   |
| GET   | `/api/v1/posts/{id}` | Получить пост      | ✅ Bearer   |

---

## Модель Post

```json
{
  "id": "uuid",
  "author": {
    "id": "uuid",
    "nickname": "oxyghost",
    "archetype": "OXY"
  },
  "post_type": "image",
  "text": "Ночной канал",
  "media": [
    { "url": "/media/1.png", "type": "image" }
  ],
  "is_anonymous": false,
  "geo_tile": "x421y778",
  "created_at": "2026-04-14T10:12:00Z",
  "stats": { "views": 120, "replies": 4 }
}
```

---

## GET /api/v1/posts/feed

**Query**
- `cursor` — пагинация
- `limit` — размер страницы (max 30)

**Response 200**
```json
{
  "items": ["...Post"],
  "next_cursor": "opaque",
  "mode": "strict"
}
```

---

## POST /api/v1/posts

**Request**
```json
{
  "post_type": "short",
  "text": "Дроп на 40 секунд",
  "media": [
    { "url": "/media/clip.mp4", "type": "video" }
  ],
  "is_anonymous": false,
  "geo_tile": "x421y778",
  "boost": true
}
```

**Response 201**
```json
{
  "post": { "...Post" },
  "shards_spent": 30,
  "shards_balance": 70,
  "energy_after": 98
}
```

**Ошибки**
- `402 not_enough_shards`
- `403 energy_empty`
- `409 daily_limit`
- `409 cooldown`

---

## GET /api/v1/posts/{id}

**Response 200**
```json
{ "...Post" }
```

**Ошибки**
- `404 not_found`
