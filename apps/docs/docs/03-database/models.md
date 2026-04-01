---
id: db-models
title: Модели данных
sidebar_label: Модели и схемы
sidebar_position: 2
description: SQLAlchemy модели и Pydantic схемы (DTO) для B.L.Y.A.T.
tags: [postgresql, sqlalchemy, pydantic, dto, models]
---

# Модели данных

## Таблицы БД — обзор

| Таблица        | Назначение                                                     |
| -------------- | -------------------------------------------------------------- |
| `users`        | Пользователи: id, username, фракция, уровень, осколки, энергия |
| `factions`     | Настройки фракций: название, цвет, налоговая ставка            |
| `transactions` | История списания/начисления Осколков                           |
| `interactions` | Лог действий: кто, к кому, когда (для Совы)                    |
| `bans`         | Активные баны: кто, до когда, кем выдан                        |
| `invites`      | Инвайты: от кого, кому, статус                                 |
| `messages`     | Сообщения чата: отправитель, комната, текст, время             |

### Поля профиля пользователя

- `avatar` — URL аватара (строка, опционально)
- `bio` — короткое описание (строка, опционально)
- `privacy` — уровень видимости: `public`, `friends`, `private`

---

## models.py

```python
import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Side(str, enum.Enum):
    FOXY = "foxy"
    OXY  = "oxy"
    BEAR = "bear"
    OWL  = "owl"

class User(Base):
    __tablename__ = "users"

    id        = Column(String, primary_key=True)   # UUID
    username  = Column(String, unique=True, nullable=False)
    email     = Column(String, unique=True, nullable=False)
    password  = Column(String, nullable=False)      # bcrypt hash
    side      = Column(Enum(Side), nullable=False)
    level     = Column(Integer, default=1)
    shards    = Column(Integer, default=100)        # Валюта — Осколки
    energy    = Column(Integer, default=100)        # Лимит действий в день
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    from_user  = Column(String, ForeignKey("users.id"))
    to_user    = Column(String, ForeignKey("users.id"), nullable=True)
    amount     = Column(Integer, nullable=False)
    reason     = Column(String)                     # "tax", "skill", "quest"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Ban(Base):
    __tablename__ = "bans"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    target_id  = Column(String, ForeignKey("users.id"))
    issued_by  = Column(String, ForeignKey("users.id"))
    expires_at = Column(DateTime(timezone=True))
    reason     = Column(String, default="Bear tax enforcement")
```

---

## schemas.py (Pydantic DTO)

```python
from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime

class SideEnum(str, Enum):
    FOXY = "foxy"
    OXY  = "oxy"
    BEAR = "bear"
    OWL  = "owl"

# ── Входящие (от клиента) ──────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    side: SideEnum

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ── Исходящие (клиенту) ────────────────────────
class UserResponse(BaseModel):
    id: str
    username: str
    side: SideEnum
    level: int
    shards: int
    energy: int

    class Config:
        from_attributes = True

# ── Транзакции ─────────────────────────────────
class TransactionResponse(BaseModel):
    id: int
    from_user: str
    to_user: str | None
    amount: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True
```

---

## Что такое DTO и зачем

DTO (Data Transfer Object) — простой объект **только для переноса данных**.  
Никакой логики, только поля. Клиент никогда не получает `password` и внутренние поля.

```
БД → User (Model) → UserResponse (DTO) → Клиент
```

:::info Следующий шаг
Настрой [миграции через Alembic](./migrations) чтобы безопасно изменять схему в продакшне.
:::




