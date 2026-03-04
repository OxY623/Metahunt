---
id: api-overview
title: API — Обзор
sidebar_label: Обзор
sidebar_position: 1
description: FastAPI эндпоинты B.L.Y.A.T.
tags: [fastapi, api, rest]
---

# API — Обзор

## Запуск

```bash
cd apps/api
uvicorn main:app --reload
```

Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)  
ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Эндпоинты — карта

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/auth/register` | Регистрация + выбор фракции | ❌ |
| POST | `/auth/login` | Получить JWT токен | ❌ |
| GET | `/users/me` | Мой профиль | ✅ |
| GET | `/users/{id}` | Профиль другого игрока | ✅ |
| POST | `/interact` | Визит к игроку (триггер налога) | ✅ |
| POST | `/skills/{skill_name}` | Использовать скилл | ✅ |
| GET | `/shards/history` | История транзакций | ✅ |
| POST | `/invites/send` | Отправить инвайт | ✅ |
| GET | `/chat/{room}` | Получить сообщения комнаты | ✅ |
| POST | `/chat/{room}` | Отправить сообщение | ✅ |

---

## main.py

```python
from fastapi import FastAPI
from database import engine, Base
from routers import auth, users, skills, shards, chat

app = FastAPI(title="B.L.Y.A.T. API", version="0.1.0")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router,   prefix="/auth",   tags=["auth"])
app.include_router(users.router,  prefix="/users",  tags=["users"])
app.include_router(skills.router, prefix="/skills", tags=["skills"])
app.include_router(shards.router, prefix="/shards", tags=["shards"])
app.include_router(chat.router,   prefix="/chat",   tags=["chat"])

@app.get("/")
async def root():
    return {"status": "СИСТЕМА: КОНФЛИКТ В РАЗГАРЕ"}
```

---

## Структура ответа — стандарт

Все ответы возвращают либо DTO объект, либо:

```json
{
  "msg": "Медведь взял налог за вход. Ты обеднел.",
  "shards_lost": 10
}
```

Ошибки:

```json
{
  "detail": "User not found"
}
```
