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
| `game_profiles` | Игровой профиль: архетип, уровни, осколки, энергия, инвайты             |
| `messages`      | Сообщения чата: отправитель, комната, текст, анонимность, эффекты       |
| `shards_ledger` | Транзакции осколков: начисления, списания, налоги                       |
| `invites`       | Инвайты и их статусы                                                    |
| `posts`         | Посты: текст, медиа, тип, видимость                                     |
| `post_media`    | Файлы медиа для постов                                                  |
| `geo_events`    | Гео‑события: чек‑ин, пинг, подмена                                      |
| `geo_tiles`     | Агрегированная активность по тайлам                                     |

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
    invite_balance = Column(Integer, default=0)
    invite_daily_used = Column(Integer, default=0)
    geo_visibility = Column(String, default="approx")
    last_geo_tile = Column(String(16), nullable=True)

class Message(Base):
    __tablename__ = "messages"
    sender_id = Column(UUID, ForeignKey("users.id"))
    room = Column(String(64), default="general")
    text = Column(Text)
    is_anonymous = Column(Boolean, default=False)
    effect = Column(String(32), nullable=True)
    effect_payload = Column(Text, nullable=True)

class ShardLedger(Base):
    __tablename__ = "shards_ledger"
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    delta = Column(Integer)
    reason = Column(String(32))
    meta = Column(JSON, nullable=True)
    balance_after = Column(Integer)
    created_at = Column(DateTime, default=utcnow)

class Invite(Base):
    __tablename__ = "invites"
    id = Column(UUID, primary_key=True)
    code = Column(String(24), unique=True)
    creator_id = Column(UUID, ForeignKey("users.id"))
    redeemed_by = Column(UUID, ForeignKey("users.id"), nullable=True)
    status = Column(String(16), default="created")
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=utcnow)

class Post(Base):
    __tablename__ = "posts"
    id = Column(UUID, primary_key=True)
    author_id = Column(UUID, ForeignKey("users.id"))
    post_type = Column(String(16))
    text = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    geo_tile = Column(String(16), nullable=True)
    visibility = Column(String(16), default="public")
    created_at = Column(DateTime, default=utcnow)

class PostMedia(Base):
    __tablename__ = "post_media"
    id = Column(UUID, primary_key=True)
    post_id = Column(UUID, ForeignKey("posts.id"))
    media_url = Column(String)
    media_type = Column(String(16))

class GeoEvent(Base):
    __tablename__ = "geo_events"
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    event_type = Column(String(16))
    geo_tile = Column(String(16))
    created_at = Column(DateTime, default=utcnow)
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
    invite_balance: int

class ShardLedgerResponse(BaseModel):
    id: UUID
    delta: int
    reason: str
    balance_after: int
    created_at: datetime

class InviteResponse(BaseModel):
    id: UUID
    code: str
    status: str
    expires_at: datetime

class PostResponse(BaseModel):
    id: UUID
    author_id: UUID | None
    post_type: str
    text: str | None
    is_anonymous: bool
    geo_tile: str | None
    created_at: datetime

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
