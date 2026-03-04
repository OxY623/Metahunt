# app/database.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
# asyncio = асинхронность. FastAPI работает асинхронно, поэтому и SQLAlchemy нужна асинхронная
# create_async_engine — создаёт подключение к БД
# AsyncSession — объект через который мы делаем запросы
# async_sessionmaker — фабрика для создания сессий

from sqlalchemy.orm import DeclarativeBase
# DeclarativeBase — базовый класс от которого наследуются все наши модели (таблицы)

from app.config import settings  # импортируем настройки с DATABASE_URL

# Создаём движок (engine) — это само подключение к PostgreSQL
# echo=True означает что все SQL запросы будут печататься в консоль
# Удобно при разработке, в продакшене ставят echo=False
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Фабрика сессий
# expire_on_commit=False — объекты не "протухают" после commit()
# Без этого пришлось бы заново запрашивать объект из БД после каждого сохранения
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base — от этого класса наследуются все модели
# SQLAlchemy смотрит на классы-наследники и создаёт таблицы
class Base(DeclarativeBase):
    pass

# Dependency для FastAPI
# async with AsyncSessionLocal() as session — открывает сессию
# yield session — передаёт сессию в эндпоинт
# после завершения запроса сессия автоматически закрывается
# Это называется паттерн "Unit of Work"
async def get_session():
    async with AsyncSessionLocal() as session:
        yield session           # yield — это генератор, FastAPI использует это для DI