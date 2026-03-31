---
id: api-overview
title: API вЂ” РћР±Р·РѕСЂ
sidebar_label: РћР±Р·РѕСЂ
sidebar_position: 1
description: FastAPI СЌРЅРґРїРѕРёРЅС‚С‹ MetaHunt
tags: [fastapi, api, rest]
---

# API вЂ” РћР±Р·РѕСЂ

## Р—Р°РїСѓСЃРє

```bash
cd apps/api
pnpm dev
```

Swagger UI: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)  
ReDoc: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

---

## Р­РЅРґРїРѕРёРЅС‚С‹ вЂ” РєР°СЂС‚Р°

| РњРµС‚РѕРґ | РџСѓС‚СЊ                     | РћРїРёСЃР°РЅРёРµ                   | РђРІС‚РѕСЂРёР·Р°С†РёСЏ |
| ----- | ------------------------ | -------------------------- | ----------- |
| GET   | `/health`                | Health check               | вќЊ          |
| GET   | `/api/v1/users/me`       | РњРѕР№ РїСЂРѕС„РёР»СЊ                | вњ… Bearer   |
| PATCH | `/api/v1/users/profile`  | РћР±РЅРѕРІРёС‚СЊ РїСЂРѕС„РёР»СЊ           | вњ… Bearer   |
| PATCH | `/api/v1/users/password` | РЎРјРµРЅРёС‚СЊ РїР°СЂРѕР»СЊ             | вњ… Bearer   |
| GET   | `/api/v1/game/profile`   | РРіСЂРѕРІРѕР№ РїСЂРѕС„РёР»СЊ            | вњ… Bearer   |
| POST  | `/api/v1/game/archetype` | Р’С‹Р±СЂР°С‚СЊ Р°СЂС…РµС‚РёРї (FOXY/OXY) | вњ… Bearer   |

---

## РЎС‚СЂСѓРєС‚СѓСЂР° РѕС‚РІРµС‚Р°

РЈСЃРїРµС€РЅС‹Р№ РѕС‚РІРµС‚ РІРѕР·РІСЂР°С‰Р°РµС‚ DTO (Pydantic schema).  
РћС€РёР±РєРё:

```json
{
  "detail": "РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ"
}
```

401 вЂ” РЅСѓР¶РµРЅ Р·Р°РіРѕР»РѕРІРѕРє `Authorization: Bearer <token>`.

