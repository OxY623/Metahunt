---
id: tech-stack
title: Стек технологий
sidebar_label: Tech Stack
sidebar_position: 1
description: Полный стек B.L.Y.A.T. — от монорепо до деплоя
tags: [architecture, fastapi, nextjs, postgresql]
---

# Стек технологий

## Обзор

```
Клиент (Next.js) ──► FastAPI ──► PostgreSQL
                         │
                    Alembic (миграции)
```

---

## Полная таблица стека

| Слой | Технология | Назначение |
|------|-----------|------------|
| Монорепо | Turborepo | Единое хранилище для всех сервисов |
| Бэкенд | FastAPI + Python | REST API, бизнес-логика, расчёт XP |
| База данных | PostgreSQL | Хранение пользователей, фракций, осколков |
| ORM | SQLAlchemy (async) | Работа с БД из Python |
| Миграции | Alembic | Версионирование схемы БД |
| Фронтенд | Next.js + TypeScript | Пиксельный интерфейс, чат, профили |
| Стили | Tailwind CSS | Pixel-art режим |
| State | Zustand | Состояние игрока, фракции, осколков |
| Деплой | Docker + Docker Compose | Контейнеризация API + PostgreSQL |

---

## Зависимости Python (FastAPI)

```bash
pip install fastapi uvicorn sqlalchemy asyncpg alembic psycopg2-binary python-jose passlib
```

## Зависимости Node.js (Next.js)

```bash
npm install next react react-dom typescript tailwindcss zustand
npm install @types/react @types/node
```

---

## Переменные окружения

Создай `.env` в корне `/apps/api/`:

```env
DATABASE_URL=postgresql+asyncpg://myuser:mypassword@localhost:5432/blyatdb
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

:::danger Никогда не коммить `.env`
Добавь `.env` в `.gitignore` немедленно.
:::
