---
id: api-invites
title: API — Инвайты
sidebar_label: Инвайты
sidebar_position: 3
description: Схемы эндпоинтов инвайтов
tags: [fastapi, api, invites]
---

# API — Инвайты

Инвайты — это входной шлюз в MetaHunt и главный рычаг роста сообщества.

---

## Эндпоинты

| Метод | Путь                     | Описание                 | Авторизация |
| ----- | ------------------------ | ------------------------ | ----------- |
| GET   | `/api/v1/invites`         | Список инвайтов          | ✅ Bearer   |
| POST  | `/api/v1/invites`         | Создать инвайт           | ✅ Bearer   |
| POST  | `/api/v1/invites/redeem`  | Проверить/активировать   | ❌          |

---

## Модель Invite

```json
{
  "id": "uuid",
  "code": "MH-7H2K-9PQA",
  "status": "sent",
  "expires_at": "2026-04-14T10:00:00Z",
  "created_at": "2026-04-14T09:00:00Z",
  "creator": {
    "id": "uuid",
    "nickname": "foxylab",
    "archetype": "FOXY"
  }
}
```

---

## GET /api/v1/invites

Возвращает список текущих и архивных инвайтов игрока.

**Response 200**
```json
{
  "items": ["...Invite"],
  "limits": {
    "daily_total": 5,
    "daily_used": 2,
    "storage_cap": 10,
    "mode": "strict"
  }
}
```

---

## POST /api/v1/invites

Создаёт инвайт‑код и списывает 1 Инвайт‑осколок.

**Request**
```json
{
  "delivery": "link",
  "note": "Для входа в клуб"
}
```

**Response 201**
```json
{
  "invite": { "...Invite" },
  "balances": {
    "invite_balance": 3,
    "shards_balance": 86,
    "energy": 98
  }
}
```

**Ошибки**
- `409 invite_limit` — дневной лимит исчерпан.
- `402 invite_balance` — нет Инвайт‑осколков.
- `429 rate_limit` — слишком часто.

---

## POST /api/v1/invites/redeem

Проверяет код и активирует инвайт. В MVP это происходит на регистрации, но эндпоинт оставлен для будущего pre‑flight.

**Request**
```json
{
  "code": "MH-7H2K-9PQA",
  "device_fingerprint": "hash"
}
```

**Response 200**
```json
{
  "status": "redeemed",
  "inviter": {
    "id": "uuid",
    "archetype": "FOXY"
  },
  "reward": {
    "inviter_shards_delta": 14,
    "tax_to_bear": 2,
    "tax_to_fox": 0
  }
}
```

**Ошибки**
- `400 invalid_code`
- `410 invite_expired`
- `409 invite_used`
- `429 register_limit`
