---
id: db-setup
title: Настройка PostgreSQL
sidebar_label: Setup
sidebar_position: 1
description: Установка PostgreSQL и создание базы данных для B.L.Y.A.T.
tags: [postgresql, setup, database]
---

# Настройка PostgreSQL

## Установка

```bash
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

## Создание БД и пользователя

```sql
-- Войти в psql
sudo -u postgres psql

-- Создать базу и юзера
CREATE DATABASE blyatdb;
CREATE USER blyatuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE blyatdb TO blyatuser;

-- Проверка
\l    -- список баз
\q    -- выход
```

## Подключение (database.py)

```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = "postgresql+asyncpg://blyatuser:yourpassword@localhost:5432/blyatdb"

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

## Создание таблиц при старте

```python
# main.py
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

:::tip Используй Alembic для продакшна
`Base.metadata.create_all` удобен для разработки.  
Для продакшна смотри раздел [Миграции (Alembic)](./migrations).
:::
