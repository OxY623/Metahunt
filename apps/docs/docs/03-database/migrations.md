---
id: migrations
title: Миграции (Alembic)
sidebar_label: Alembic
sidebar_position: 3
description: Версионирование схемы PostgreSQL через Alembic
tags: [alembic, migrations, postgresql]
---

# Миграции (Alembic)

## Инициализация

```bash
pip install alembic
alembic init alembic
```

## Настройка alembic.ini

```ini
sqlalchemy.url = postgresql+asyncpg://blyatuser:yourpassword@localhost:5432/blyatdb
```

## alembic/env.py — подключить модели

```python
from database import Base
import models  # важно — импортировать все модели

target_metadata = Base.metadata
```

## Основные команды

```bash
# Создать миграцию автоматически
alembic revision --autogenerate -m "create users table"

# Применить все миграции
alembic upgrade head

# Откатить последнюю
alembic downgrade -1

# История миграций
alembic history
```

:::tip Правило
Каждый раз когда меняешь `models.py` — создавай новую миграцию.  
Никогда не редактируй уже применённые миграции.
:::
