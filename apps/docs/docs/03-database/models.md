---
id: db-models
title: РњРѕРґРµР»Рё РґР°РЅРЅС‹С…
sidebar_label: РњРѕРґРµР»Рё Рё СЃС…РµРјС‹
sidebar_position: 2
description: SQLAlchemy РјРѕРґРµР»Рё Рё Pydantic СЃС…РµРјС‹ (DTO) РґР»СЏ B.L.Y.A.T.
tags: [postgresql, sqlalchemy, pydantic, dto, models]
---

# РњРѕРґРµР»Рё РґР°РЅРЅС‹С…

## РўР°Р±Р»РёС†С‹ Р‘Р” вЂ” РѕР±Р·РѕСЂ

| РўР°Р±Р»РёС†Р°        | РќР°Р·РЅР°С‡РµРЅРёРµ                                                     |
| -------------- | -------------------------------------------------------------- |
| `users`        | РџРѕР»СЊР·РѕРІР°С‚РµР»Рё: id, username, С„СЂР°РєС†РёСЏ, СѓСЂРѕРІРµРЅСЊ, РѕСЃРєРѕР»РєРё, СЌРЅРµСЂРіРёСЏ |
| `factions`     | РќР°СЃС‚СЂРѕР№РєРё С„СЂР°РєС†РёР№: РЅР°Р·РІР°РЅРёРµ, С†РІРµС‚, РЅР°Р»РѕРіРѕРІР°СЏ СЃС‚Р°РІРєР°            |
| `transactions` | РСЃС‚РѕСЂРёСЏ СЃРїРёСЃР°РЅРёСЏ/РЅР°С‡РёСЃР»РµРЅРёСЏ РћСЃРєРѕР»РєРѕРІ                           |
| `interactions` | Р›РѕРі РґРµР№СЃС‚РІРёР№: РєС‚Рѕ, Рє РєРѕРјСѓ, РєРѕРіРґР° (РґР»СЏ РЎРѕРІС‹)                    |
| `bans`         | РђРєС‚РёРІРЅС‹Рµ Р±Р°РЅС‹: РєС‚Рѕ, РґРѕ РєРѕРіРґР°, РєРµРј РІС‹РґР°РЅ                        |
| `invites`      | РРЅРІР°Р№С‚С‹: РѕС‚ РєРѕРіРѕ, РєРѕРјСѓ, СЃС‚Р°С‚СѓСЃ                                 |
| `messages`     | РЎРѕРѕР±С‰РµРЅРёСЏ С‡Р°С‚Р°: РѕС‚РїСЂР°РІРёС‚РµР»СЊ, РєРѕРјРЅР°С‚Р°, С‚РµРєСЃС‚, РІСЂРµРјСЏ             |

### Поля профиля пользователя`n`n- `avatar` — URL аватара (строка, опционально)`n- `bio` — короткое описание (строка, опционально)`n- `privacy` — уровень видимости: `public`, `friends`, `private``n`n---

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
    shards    = Column(Integer, default=100)        # Р’Р°Р»СЋС‚Р° вЂ” РћСЃРєРѕР»РєРё
    energy    = Column(Integer, default=100)        # Р›РёРјРёС‚ РґРµР№СЃС‚РІРёР№ РІ РґРµРЅСЊ
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

# в”Ђв”Ђ Р’С…РѕРґСЏС‰РёРµ (РѕС‚ РєР»РёРµРЅС‚Р°) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    side: SideEnum

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# в”Ђв”Ђ РСЃС…РѕРґСЏС‰РёРµ (РєР»РёРµРЅС‚Сѓ) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
class UserResponse(BaseModel):
    id: str
    username: str
    side: SideEnum
    level: int
    shards: int
    energy: int

    class Config:
        from_attributes = True

# в”Ђв”Ђ РўСЂР°РЅР·Р°РєС†РёРё в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

## Р§С‚Рѕ С‚Р°РєРѕРµ DTO Рё Р·Р°С‡РµРј

DTO (Data Transfer Object) вЂ” РїСЂРѕСЃС‚РѕР№ РѕР±СЉРµРєС‚ **С‚РѕР»СЊРєРѕ РґР»СЏ РїРµСЂРµРЅРѕСЃР° РґР°РЅРЅС‹С…**.  
РќРёРєР°РєРѕР№ Р»РѕРіРёРєРё, С‚РѕР»СЊРєРѕ РїРѕР»СЏ. РљР»РёРµРЅС‚ РЅРёРєРѕРіРґР° РЅРµ РїРѕР»СѓС‡Р°РµС‚ `password` Рё РІРЅСѓС‚СЂРµРЅРЅРёРµ РїРѕР»СЏ.

```
Р‘Р” в†’ User (Model) в†’ UserResponse (DTO) в†’ РљР»РёРµРЅС‚
```

:::info РЎР»РµРґСѓСЋС‰РёР№ С€Р°Рі
РќР°СЃС‚СЂРѕР№ [РјРёРіСЂР°С†РёРё С‡РµСЂРµР· Alembic](./migrations) С‡С‚РѕР±С‹ Р±РµР·РѕРїР°СЃРЅРѕ РёР·РјРµРЅСЏС‚СЊ СЃС…РµРјСѓ РІ РїСЂРѕРґР°РєС€РЅРµ.
:::

