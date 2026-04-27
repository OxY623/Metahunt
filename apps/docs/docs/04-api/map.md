---
id: api-map
title: API — Карта и Гео
sidebar_label: Карта и Гео
sidebar_position: 4
description: Схемы эндпоинтов карты и гео‑событий
tags: [fastapi, api, map, geo]
---

# API — Карта и Гео

Карта — это слой тактики. Эндпоинты ниже дают контроль над тайлами, пингами и чек‑инами.

---

## Эндпоинты

| Метод | Путь                    | Описание               | Авторизация |
| ----- | ----------------------- | ---------------------- | ----------- |
| GET   | `/api/v1/map/tiles`     | Тайлы активности       | ✅ Bearer   |
| POST  | `/api/v1/map/checkin`   | Чек‑ин игрока          | ✅ Bearer   |
| POST  | `/api/v1/map/ping`      | Архетипный пинг        | ✅ Bearer   |

---

## Модель Tile

```json
{
  "tile_id": "x421y778",
  "intensity": 0.72,
  "dominant_archetype": "BEAR",
  "last_activity_at": "2026-04-14T10:10:00Z"
}
```

---

## GET /api/v1/map/tiles

**Query**
- `bbox` — границы карты, формат `minLat,minLng,maxLat,maxLng`
- `zoom` — уровень масштабирования

**Response 200**
```json
{
  "items": ["...Tile"],
  "mode": "strict"
}
```

---

## POST /api/v1/map/checkin

**Request**
```json
{
  "geo": { "lat": 53.902, "lng": 27.561 },
  "visibility": "approx"
}
```

**Response 200**
```json
{
  "tile_id": "x421y778",
  "visibility": "approx",
  "next_allowed_at": "2026-04-14T10:40:00Z",
  "energy_after": 97
}
```

**Ошибки**
- `409 cooldown`
- `403 energy_empty`

---

## POST /api/v1/map/ping

**Request**
```json
{
  "ping_type": "hunt",
  "tile_id": "x421y778"
}
```

**Response 200**
```json
{
  "ping_id": "uuid",
  "ping_type": "hunt",
  "tile_id": "x421y778",
  "effect_until": "2026-04-14T10:25:00Z",
  "shards_spent": 10,
  "shards_balance": 78
}
```

**Ошибки**
- `402 not_enough_shards`
- `409 cooldown`
- `403 energy_empty`

---

## UI интеграция (Leaflet)

На веб‑клиенте карта реализована через `Leaflet` (`react-leaflet`) и работает в двух слоях:

- heat‑слой (окружности по `intensity`),
- маркеры тайлов (кликабельные точки с popup).

Клик по маркеру выбирает `tile_id` для `POST /api/v1/map/ping`.

### Клиентская фильтрация

Фильтрация выполняется на фронтенде без отдельного API‑метода:

- по архетипу (`ALL | FOXY | OXY | BEAR | OWL`),
- по минимальной интенсивности (`intensity >= N`).

### Клиентский rate-limit запросов

Чтобы не спамить backend при движении карты, UI вводит локальные ограничения:

- обновление тайлов (`GET /map/tiles`) не чаще 1 раза в ~8 секунд,
- экшены карты (`checkin`, `ping`) не чаще 1 раза в ~5 секунд.

Ограничение на фронте не отменяет серверные кулдауны (`409 cooldown`).
