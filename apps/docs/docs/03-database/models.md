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

| Таблица         | Назначение                                                             |
| --------------- | ---------------------------------------------------------------------- |
| `users`         | Пользователи: email, nickname, роль, профиль                           |
| `game_profiles` | Игровой профиль: архетип, уровни, осколки, энергия, характеристики      |
| `messages`      | Сообщения чата: отправитель, комната, текст, анонимность, эффекты       |

:::note Про эффекты
Эффекты (`glitch`, `ban`, `shield`) сейчас живут в памяти сервера. Для прода
и нескольких инстансов — вынести в Redis (TTL‑ключи или Sorted Set по времени).
:::

---

## models.py (упрощённо)

```python
class User(Base):
    __tablename__ = "users"
    id = Column(UUID, primary_key=True)
    email = Column(String, unique=True)
    nickname = Column(String, unique=True)
    role = Column(Enum(Role))
    avatar = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    privacy = Column(String, default="public")

class GameProfile(Base):
    __tablename__ = "game_profiles"
    user_id = Column(UUID, ForeignKey("users.id"), unique=True)
    archetype = Column(Enum(Archetype), nullable=True)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    shards = Column(Integer, default=100)
    energy = Column(Integer, default=100)

class Message(Base):
    __tablename__ = "messages"
    sender_id = Column(UUID, ForeignKey("users.id"))
    room = Column(String(64), default="general")
    text = Column(Text)
    is_anonymous = Column(Boolean, default=False)
    effect = Column(String(32), nullable=True)
    effect_payload = Column(Text, nullable=True)
```

---

## DTO (Pydantic)

```python
class GameProfileResponse(BaseModel):
    id: UUID
    archetype: Archetype | None
    level: int
    xp: int
    shards: int
    energy: int

class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID | None
    sender_nickname: str | None
    sender_archetype: Archetype | None
    room: str
    text: str
    is_anonymous: bool
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
